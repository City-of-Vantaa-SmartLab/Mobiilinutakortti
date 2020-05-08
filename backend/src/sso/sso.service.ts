import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as saml2 from 'saml2-js';
import * as fs from 'fs';
import * as url from 'url';
import { SAMLHelper } from './samlhelper';
import { AcsDto, SecurityContextDto } from '../authentication/dto';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class SsoService {
  private readonly entity_id: string;
  private readonly sp: saml2.ServiceProvider;
  private readonly idp: saml2.IdentityProvider;
  private readonly samlHelper;

  constructor(
    private readonly authenticationService: AuthenticationService
  ) {

    // This is for local testing if you have the private key.
    let pkey = '';
    if (fs.existsSync('./certs/nutakortti-test_private_key.pem')) {
      pkey = fs.readFileSync('certs/nutakortti-test_private_key.pem').toString();
    }

    // NOTE: Default configuration variables refer to AWS and Suomi.fi-tunnistus test environments.
    const cert_selection = process.env.CERT_SELECTION || 'test';
    this.entity_id = process.env.SP_ENTITY_ID || 'https://nutakortti-test.vantaa.fi';

    const sp_options = {
      entity_id: this.entity_id,
      private_key: process.env.SP_PKEY || pkey,
      certificate: fs.readFileSync('certs/nutakortti-' + cert_selection + '.cer').toString(),
      assert_endpoint: process.env.SP_ASSERT_ENDPOINT || 'https://api.mobiilinuta-admin-test.com/api/acs',
      sign_get_request: true,
      allow_unencrypted_assertion: false
    }
    this.sp = new saml2.ServiceProvider(sp_options);

    const idp_options = {
      sso_login_url: process.env.SSO_LOGIN_URL || 'https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SSO',
      sso_logout_url: process.env.SSO_LOGOUT_URL || 'https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SLO',
      certificates: [
        fs.readFileSync('certs/tunnistus-' + cert_selection + '-1.cer').toString(),
        fs.readFileSync('certs/tunnistus-' + cert_selection + '-2.cer').toString(),
      ],
    };
    this.idp = new saml2.IdentityProvider(idp_options);

    this.samlHelper = new SAMLHelper(sp_options.private_key, idp_options.sso_logout_url);
  }

  getLoginRequestUrl(res: Response) {
    this.sp.create_login_request_url(this.idp, {}, (err, login_url, request_id) => {
      console.log('Created login request, ID: ' + request_id);
      if (this._handleError(err, res))
        return;

      res.send({url: login_url});
    });
  }

  handleLoginResponse(req: Request, res: Response) {
    const options = { request_body: req.body };
    const response = this.sp.post_assert(this.idp, options, (err, saml_response) => {
      // If the user cancels the authentication or SAML response status is not success, there will be an error.
      if (this._handleError(err, res))
        return;

      console.log('Got login response, session index: ' + saml_response.user.session_index);

      // For eIDAS logins the surname comes from a different attribute.
      const user_surname =
        this._getUserAttribute(saml_response.user.attributes, 'http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName') ||
        this._getUserAttribute(saml_response.user.attributes, 'urn:oid:2.5.4.4');

      const acs_data = {
        sessionIndex: saml_response.user.session_index,
        nameId: saml_response.user.name_id,
        firstName: this._getUserAttribute(saml_response.user.attributes, 'http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName'),
        lastName: user_surname,
        zipCode: this._getUserAttribute(saml_response.user.attributes, 'urn:oid:1.2.246.517.2002.2.6')
      } as AcsDto;

      const sc = this.authenticationService.generateSecurityContext(acs_data);
      const querystr = Buffer.from(JSON.stringify(sc)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');

      // To decode (in validation):
      //function Base64DecodeUrl(str){
      // str = (str + '===').slice(0, str.length + (str.length % 4));
      // return str.replace(/-/g, '+').replace(/_/g, '/');
      // }

      const temp_page = '<html lang="en"><head><meta charset="utf-8"></head> <body> <script> location="http://localhost:3001/hakemus&QUERY"; </script> </body> </html>';
      res.send(temp_page.replace('QUERY', querystr));
    });
  }

  getLogoutRequestUrl(req: Request, res: Response) {
    const cookie = req.cookies[this.entity_id];
    if (!cookie) {
      this._handleError('Security context missing.', res);
      return;
    }
    const sc = {
      sessionIndex: cookie.sessionIndex,
      nameId: cookie.nameId,
      firstName: cookie.firstName,
      lastName: cookie.lastName,
      zipCode: cookie.zipCode,
      expiryTime: cookie.expiryTime,
      signedString: cookie.signedString
    } as SecurityContextDto;

    if (!this.authenticationService.validateSecurityContext(sc)) {
      this._handleError('Security context invalid.', res);
      return;
    }

    const options = {
      name_id: cookie.nameId,
      session_index: cookie.sessionIndex
    }

    this.sp.create_logout_request_url(this.idp, options, (err, logout_url) => {
      if (this._handleError(err, res))
        return;

      console.log('Created logout request URL, session index: ' + options.session_index);
      let fixed_url = '';
      try {
        fixed_url = this.samlHelper.fixMissingXMLAttributes(logout_url);
      }
      catch(ex) {
        this._handleError(ex.message, res);
        return;
      }

      // Suomi.fi documentation says the local session should be ended before SSO logout.
      res.clearCookie(this.entity_id);
      res.redirect(fixed_url);
    });
  }

  // When SP initiates a logout and response comes from IdP, request will have a SAMLResponse.
  // When IdP initiates a logout, request will have a SAMLRequest.
  handleLogout(req: Request, res: Response) {
    const query = url.parse(req.url, true).query;
    const idp_initiated = 'SAMLRequest' in query;

    // We have to respond to the request if IdP-initiated.
    if (idp_initiated) {

      const request_id = this.samlHelper.getSAMLRequestId(query.SAMLRequest.toString());
      const options = {
        in_response_to: request_id
      }
      this.sp.create_logout_response_url(this.idp, options, (err, response_url) => {
        console.log('Created logout response URL for request ID: ' + options.in_response_to);
        res.redirect(response_url);
      });

    } else {

      // NOTE: we don't probably have to care about nonsuccessful status at all but here goes anyway.
      if (!this.samlHelper.checkLogoutResponse(req.url)) {
        this._handleError('Suomi.fi returned nonsuccessful logout status.', res);
        return;
      }

      res.send("LOGOUT SUCCESSFUL");
      // TODO URL
      // res.redirect('http://localhost:3001/uloskirjaus');
    }
  }

  private _getUserAttribute(user_attributes: Array<Array<string>>, attribute: string): string {
    const val = attribute in user_attributes ? user_attributes[attribute] : [''];
    return Array.isArray(val) ? val.join(' ') : '';
  }

  private _handleError(err: string, res: Response): boolean {
    if (err != null) {
      console.log('Error: ' + err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
      res.end();
      return true;
    }
    return false;
  }
}
