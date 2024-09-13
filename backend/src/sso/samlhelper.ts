import * as crypto from 'crypto';
import * as url from 'url';
import * as zlib from 'zlib';
import * as xmlbuilder from 'xmlbuilder2';
import * as XML from 'pixl-xml';

type SAMLQuery = {
  SAMLRequest: string,
  SigAlg: string,
  Signature: string
}

export class SAMLHelper {
  private_key: string;
  sso_logout_url: string;

  constructor(private_key: string, sso_logout_url: string) {
    this.private_key = private_key;
    this.sso_logout_url = sso_logout_url;
  }

  /*
  According to Suomi.fi documentation, the NameID element should have the following three attributes:

    Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient" (a constant)
    NameQualifier="https://testi.apro.tunnistus.fi/idp1" (the IdP)
    SPNameQualifier="https://nutakortti-test.vantaa.fi" (the EntityID)

  If these attributes are not provided, the StatusCode in the Response SAML will be erroneous.
  Saml2-js builds the XML using xmlbuilder but does not provide a way at the moment for giving extra attributes.
  We modify the contents manually and take care of base64 encoding, zlib deflating, modifying the XML, and signing.
  */
  fixMissingXMLAttributes(logout_url: string): string {
    // url parses %2B (ASCII code for '+') from the query string as spaces, so we replace them with +
    const old_saml_request = url
      .parse(decodeURIComponent(logout_url), true)
      .query.SAMLRequest.toString()
      .replace(/ /g, '+');
    const deflated = Buffer.from(old_saml_request, 'base64');
    const xml_string = zlib.inflateRawSync(deflated).toString();
    const xml_json = XML.parse(xml_string, { preserveAttributes: true }) as any;

    const fixed_xml = xmlbuilder
      .create({
        'samlp:LogoutRequest': {
          '@xmlns:samlp': xml_json._Attribs['xmlns:samlp'],
          '@xmlns:saml': xml_json._Attribs['xmlns:saml'],
          '@ID': xml_json._Attribs.ID,
          '@Version': xml_json._Attribs.Version,
          '@IssueInstant': xml_json._Attribs.IssueInstant,
          '@Destination': xml_json._Attribs.Destination,
          'saml:Issuer': xml_json['saml:Issuer'],
          'saml:NameID': {
            '@Format': 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
            '@NameQualifier':
              process.env.IDP_ENTITY_ID ||
              'https://testi.apro.tunnistus.fi/idp1',
            '@SPNameQualifier':
              process.env.SP_ENTITY_ID || 'https://nutakortti-test.vantaa.fi',
            '#text': xml_json['saml:NameID'],
          },
          'samlp:SessionIndex': xml_json['samlp:SessionIndex'],
        },
      })
      .end();

    const new_saml_request = zlib.deflateRawSync(fixed_xml).toString('base64');
    const new_logout_url = url.parse(this.sso_logout_url, true);

    const query = this._signSamlRequest(new_saml_request);
    new_logout_url.query.SAMLRequest = query.SAMLRequest;
    new_logout_url.query.SigAlg = query.SigAlg;
    new_logout_url.query.Signature = query.Signature;

    new_logout_url.search = null;
    return url.format(new_logout_url);
  }

  checkLogoutResponse(req_url: string): boolean {
    try {
      const response = url.parse(req_url, true).query.SAMLResponse;
      const deflated = Buffer.from(response.toString(), 'base64');
      const xml_string = zlib.inflateRawSync(deflated).toString();
      const xml_json = XML.parse(xml_string, { preserveAttributes: true });

      // The status is in an XML element attribute like this:
      // <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success" />
      const status_value =
        xml_json['saml2p:Status']['saml2p:StatusCode']._Attribs['Value'];
      const val_array = status_value.split(':');
      if (val_array[val_array.length - 1] === 'Success') {
        return true;
      }
    } catch {}
    return false;
  }

  getSAMLRequestId(saml_request: string): string {
    let id = '';
    try {
      const deflated = Buffer.from(saml_request, 'base64');
      const xml_string = zlib.inflateRawSync(deflated).toString();
      const xml_json = XML.parse(xml_string, { preserveAttributes: true }) as any;
      id = xml_json._Attribs['ID'];
    } catch {}
    return id;
  }

  private _signSamlRequest(saml_request: string): SAMLQuery {
    const saml_request_data = 'SAMLRequest=' + encodeURIComponent(saml_request);
    const sigalg_data =
      '&SigAlg=' +
      encodeURIComponent('http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(saml_request_data + sigalg_data);

    let samlQueryString: any = {}
    samlQueryString.SAMLRequest = saml_request;
    samlQueryString.SigAlg =
      'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
    samlQueryString.Signature = sign.sign(this.private_key, 'base64');
    return samlQueryString;
  }
}
