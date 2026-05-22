import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { SAML } from '@node-saml/node-saml';
import type { Profile, SamlConfig } from '@node-saml/node-saml';
import * as fs from 'fs';
import { AcsDto, SecurityContextDto } from '../authentication/dto';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfigHandler } from '../configHandler';
import { toBase64UrlString } from '../common/helpers';

@Injectable()
export class SsoService {
  private readonly saml: SAML;
  private readonly entity_id: string;
  private readonly idpEntityId: string;
  private readonly logger = new Logger('SSO Service');

  constructor(
    private readonly authenticationService: AuthenticationService
  ) {
    // This is for local testing if you have the private key.
    let privateKey = '';
    if (fs.existsSync('./certs/nutakortti-test_private_key.pem')) {
      privateKey = fs.readFileSync('certs/nutakortti-test_private_key.pem').toString();
    }
    if (process.env.SP_PKEY) {
      privateKey = process.env.SP_PKEY.replace(/\\n/g, '\n');
    }

    // NOTE: Default configuration variables refers to Suomi.fi-tunnistus test environment.
    const cert_selection = process.env.CERT_SELECTION || 'test';
    this.entity_id = process.env.SP_ENTITY_ID || 'https://nutakortti-test.vantaa.fi';
    this.idpEntityId = process.env.IDP_ENTITY_ID || 'https://testi.apro.tunnistus.fi/idp1';

    const samlConfig: SamlConfig = {
      callbackUrl: process.env.SP_ASSERT_ENDPOINT || 'https://nutakortti-test.vantaa.fi/api/acs',
      issuer: this.entity_id,
      entryPoint: process.env.SSO_LOGIN_URL || 'https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SSO',
      logoutUrl: process.env.SSO_LOGOUT_URL || 'https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SLO',
      idpCert: [
        fs.readFileSync('certs/tunnistus-' + cert_selection + '-1.cer').toString(),
        fs.readFileSync('certs/tunnistus-' + cert_selection + '-2.cer').toString(),
      ],
      signatureAlgorithm: 'sha256',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      // Suomi.fi signs the whole response rather than individual assertions.
      wantAssertionsSigned: false,
      // Suomi.fi does not accept the default PasswordProtectedTransport value.
      disableRequestedAuthnContext: true,
    };

    // Private key is required for signing requests and decrypting encrypted assertions.
    if (privateKey) {
      samlConfig.privateKey = privateKey;
      samlConfig.publicCert = fs.readFileSync('certs/nutakortti-' + cert_selection + '.cer').toString();
      samlConfig.decryptionPvk = privateKey;
    }

    this.saml = new SAML(samlConfig);
  }

  async getLoginRequestUrl(res: Response): Promise<void> {
    this.logger.debug('Creating login request.');
    try {
      const loginUrl = await this.saml.getAuthorizeUrlAsync('', undefined, {});
      this.logger.log('Created login request URL.');
      res.send({ url: loginUrl });
    } catch (err) {
      this._handleError(err, res);
    }
  }

  async handleLoginResponse(req: Request, res: Response): Promise<void> {
    try {
      const { profile } = await this.saml.validatePostResponseAsync(req.body);
      if (!profile) {
        this._handleError(new Error('SAML response missing.'), res);
        return;
      }

      this.logger.log('Got login response, session index: ' + profile.sessionIndex);

      // For eIDAS logins the surname comes from a different attribute.
      const user_surname =
        this._getUserAttribute(profile, 'http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName') ||
        this._getUserAttribute(profile, 'urn:oid:2.5.4.4');

      const acs_data = {
        sessionIndex: profile.sessionIndex,
        nameId: profile.nameID,
        // Note: there might be several names, separated by spaces in a single string.
        firstName: this._getUserAttribute(profile, 'http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName'),
        lastName: user_surname,
        zipCode: this._getUserAttribute(profile, 'urn:oid:1.2.246.517.2002.2.6')
      } as AcsDto;

      const sc = this.authenticationService.generateSecurityContext(acs_data);
      const querystr = toBase64UrlString(Buffer.from(JSON.stringify(sc)));
      const redirectUrl = `${ConfigHandler.getFrontendUrl()}/hakemus?sc=${querystr}`;
      res.redirect(redirectUrl);
    } catch (err) {
      this._handleError(err, res);
    }
  }

  async getLogoutRequestUrl(req: Request, res: Response): Promise<void> {
    let sc_token: Partial<SecurityContextDto> | null = null;
    const token = req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) {
      try {
        const b64sc = token.slice(7, token.length);
        const binsc = Buffer.from(b64sc, 'base64').toString();
        sc_token = JSON.parse(binsc) as Partial<SecurityContextDto>;
      } catch {
        sc_token = null;
      }
    }
    if (!sc_token || !sc_token.sessionIndex || !sc_token.nameId || !sc_token.firstName || !sc_token.lastName || !sc_token.zipCode || !sc_token.expiryTime || !sc_token.signedString) {
      this._handleError(new Error('Security context missing.'), res);
      return;
    }
    const sc = {
      sessionIndex: sc_token.sessionIndex,
      nameId: sc_token.nameId,
      firstName: sc_token.firstName,
      lastName: sc_token.lastName,
      zipCode: sc_token.zipCode,
      expiryTime: sc_token.expiryTime,
      signedString: sc_token.signedString
    } as SecurityContextDto;

    if (!this.authenticationService.validateSecurityContext(sc)) {
      this._handleError(new Error('Security context invalid.'), res);
      return;
    }

    try {
      // According to Suomi.fi documentation, the NameID element should have the following three attributes:
      //
      //   Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient" (a constant)
      //   NameQualifier="https://testi.apro.tunnistus.fi/idp1" (the IdP)
      //   SPNameQualifier="https://nutakortti-test.vantaa.fi" (the EntityID)
      //
      // If these attributes are not provided, the StatusCode in the Response SAML will be erroneous.
      const logoutUrl = await this.saml.getLogoutUrlAsync(
        {
          nameID: sc.nameId,
          nameIDFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
          nameQualifier: this.idpEntityId,
          spNameQualifier: this.entity_id,
          sessionIndex: sc.sessionIndex,
        } as Profile,
        '',
        {},
      );
      this.logger.log('Created logout request URL, session index: ' + sc.sessionIndex);
      res.send({ url: logoutUrl });
    } catch (err) {
      this._handleError(err, res);
    }
  }

  // When SP initiates a logout and response comes from IdP, request will have a SAMLResponse.
  // When IdP initiates a logout, request will have a SAMLRequest.
  async handleLogout(req: Request, res: Response): Promise<void> {
    const rawQuery = req.url.includes('?') ? req.url.split('?').slice(1).join('?') : '';
    const query = Object.fromEntries(new URLSearchParams(rawQuery));
    const idp_initiated = 'SAMLRequest' in query;

    try {
      const { profile, loggedOut } = await this.saml.validateRedirectAsync(query, rawQuery);

      if (idp_initiated) {
        // NOTE: if going strictly along the specs, we should also logout the client at this point.
        // However, since the login info is stored only on client side, we do nothing here except
        // respond to the request. The security vulnerability attack vector this implies is
        // negligible in this case, so it's not worth complicating the system with backend login info.
        const responseUrl = await this.saml.getLogoutResponseUrlAsync(
          profile ?? {} as Profile,
          '',
          {},
          true,
        );
        this.logger.log('Created logout response URL for IdP-initiated logout.');
        res.redirect(responseUrl);
      } else {
        if (!loggedOut) {
          this._handleError(new Error('Suomi.fi returned nonsuccessful logout status.'), res);
          return;
        }
        this.logger.log('SP-initiated logout completed.');
        res.redirect(`${ConfigHandler.getFrontendUrl()}/uloskirjaus`);
      }
    } catch (err) {
      this._handleError(err, res);
    }
  }

  private _getUserAttribute(profile: Profile, attribute: string): string {
    const val = profile[attribute];
    if (Array.isArray(val)) return (val as unknown[]).map(String).join(' ');
    if (typeof val === 'string') return val;
    return '';
  }

  private _handleError(err: unknown, res: Response): void {
    const errorMessage = err instanceof Error ? err.toString() : String(err);
    this.logger.log('Error: ' + errorMessage);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorMessage);
    res.end();
  }
}
