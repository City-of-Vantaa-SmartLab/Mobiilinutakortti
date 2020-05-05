import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as saml2 from 'saml2-js';
import * as fs from 'fs';
import { SAMLHandler } from './samlhandler';
import { AcsDto, SecurityContextDto } from '../authentication/dto';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class SsoService {

  private readonly entity_id: string;
  private readonly sp: saml2.ServiceProvider;
  private readonly idp: saml2.IdentityProvider;
  private readonly samlhandler;

  constructor(
    private readonly authenticationService: AuthenticationService
  ) {

    // TODO make configs configurable per env
    this.entity_id = "https://nutakortti-test.vantaa.fi";

    const sp_options = {
      entity_id: this.entity_id,
      private_key: fs.readFileSync("certs/nutakortti-test_private_key.pem").toString(),
      certificate: fs.readFileSync("certs/nutakortti-test.cer").toString(),
      assert_endpoint: "https://api.mobiilinuta-admin-test.com/api/acs",
      sign_get_request: true,
      allow_unencrypted_assertion: false
    }
    this.sp = new saml2.ServiceProvider(sp_options);

    const idp_options = {
      sso_login_url: "https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SSO",
      sso_logout_url: "https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SLO",
      certificates: [fs.readFileSync("certs/tunnistus-test-1.cer").toString(), fs.readFileSync("certs/tunnistus-test-2.cer").toString()],
    };
    this.idp = new saml2.IdentityProvider(idp_options);

    this.samlhandler = new SAMLHandler(sp_options.private_key, idp_options.sso_logout_url);

  }

  getLoginRequestUrl(res: Response) {
    this.sp.create_login_request_url(this.idp, {}, (err, login_url, request_id) => {
      console.log("Created request, ID: " + request_id);
      if (this._handleError(err, res))
        return;

      console.log(login_url);
      res.redirect(login_url);
    });
  }

  handleLoginRequest(req: Request, res: Response) {
    const options = { request_body: req.body };
    const response = this.sp.post_assert(this.idp, options, (err, saml_response) => {
      if (this._handleError(err, res))
        return;

      console.log("Got login response, session index: " + saml_response.user.session_index);

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

      res.cookie(this.entity_id, sc);

      // TODO redirect back to the registration form page?
      // res.redirect(registration_url);
      res.send(sc);
    });
  }

  getLogoutRequestUrl(req: Request, res: Response) {

    const cookie = req.cookies[this.entity_id];
    // TODO: validate cookie

    const options = {
      name_id: cookie.nameId,
      session_index: cookie.sessionIndex
    }

    console.log("Got logout request, session index: " + options.session_index);

    this.sp.create_logout_request_url(this.idp, options, (err, logout_url) => {
      if (this._handleError(err, res))
        return;

      let fixed_url = "";
      try {
        fixed_url = this.samlhandler.fixMissingXMLAttributes(logout_url);
        console.log("XML-fixed request logout URL: " + fixed_url);
      }
      catch(ex) {
        this._handleError(ex.message, res);
        return;
      }

      // TODO: maybe do this only after successful Suomi.fi logout?
      res.clearCookie(this.entity_id);
      res.redirect(fixed_url);
    });
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
