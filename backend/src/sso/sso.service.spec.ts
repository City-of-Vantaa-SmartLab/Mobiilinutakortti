import * as zlib from 'zlib';
import * as xmlbuilder from 'xmlbuilder2';

/**
 * SSO Service Tests
 *
 * These tests verify the XML building and SAML workflow used by the SSO service.
 *
 * Background on js-yaml dependency:
 * The xmlbuilder2 library (used by saml2-js) includes js-yaml as a dependency.
 * However, js-yaml is only used by xmlbuilder2's YAMLReader class, which is invoked
 * when parsing YAML files/strings into XML.
 *
 * Our SSO code never uses YAML - it exclusively uses xmlbuilder.create() with
 * JavaScript objects to build SAML XML structures. Therefore, js-yaml is never
 * actually invoked in the SSO workflow despite being in the dependency tree.
 *
 * This test suite verifies that:
 * 1. xmlbuilder2 correctly builds XML from JavaScript objects (our actual usage)
 * 2. The zlib compression/decompression cycle works (used for SAML requests)
 * 3. Complex SAML structures with namespaces and attributes build correctly
 *
 * These tests serve as a regression check if xmlbuilder2 or its dependencies
 * (including js-yaml) are updated, ensuring our SSO functionality continues to work.
 */
describe('SSO XML Building and Compression', () => {

  describe('xmlbuilder2 with JavaScript objects', () => {
    it('should create simple XML from JavaScript object', () => {
      const xml = xmlbuilder.create({
        'root': {
          '@attr': 'value',
          'child': 'text'
        }
      }).end();

      expect(xml).toContain('<root attr="value">');
      expect(xml).toContain('<child>text</child>');
    });

    it('should create SAML LogoutRequest structure with namespaces', () => {
      // This mirrors the structure used in samlhelper.ts
      const xml = xmlbuilder.create({
        'samlp:LogoutRequest': {
          '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
          '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
          '@ID': '_test123',
          '@Version': '2.0',
          '@IssueInstant': '2024-01-01T00:00:00Z',
          '@Destination': 'https://test.example.com',
          'saml:Issuer': 'https://issuer.example.com',
          'saml:NameID': {
            '@Format': 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
            '@NameQualifier': 'https://idp.example.com',
            '@SPNameQualifier': 'https://sp.example.com',
            '#text': 'testuser'
          },
          'samlp:SessionIndex': 'session123'
        }
      }).end();

      // Verify the XML contains all required SAML elements
      expect(xml).toContain('samlp:LogoutRequest');
      expect(xml).toContain('xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"');
      expect(xml).toContain('xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"');
      expect(xml).toContain('saml:NameID');
      expect(xml).toContain('Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient"');
      expect(xml).toContain('NameQualifier="https://idp.example.com"');
      expect(xml).toContain('SPNameQualifier="https://sp.example.com"');
      expect(xml).toContain('testuser');
      expect(xml).toContain('samlp:SessionIndex');
    });
  });

  describe('SAML deflate/inflate cycle', () => {
    it('should compress and decompress XML correctly', () => {
      // This mirrors the workflow in samlhelper.ts
      const originalXml = xmlbuilder.create({
        'samlp:LogoutRequest': {
          '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
          '@ID': '_test123',
          'saml:NameID': {
            '@Format': 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
            '#text': 'testuser'
          }
        }
      }).end();

      // Deflate (compress) like SSO does for SAML requests
      const deflated = zlib.deflateRawSync(originalXml);

      // Inflate (decompress) like SSO does when reading SAML requests
      const inflated = zlib.inflateRawSync(deflated).toString();

      // Verify the round-trip is lossless
      expect(inflated).toBe(originalXml);
      expect(deflated.length).toBeLessThan(originalXml.length);
    });

    it('should handle base64 encoding in the workflow', () => {
      const originalXml = xmlbuilder.create({
        'samlp:LogoutRequest': {
          '@ID': '_test456',
          '#text': 'content'
        }
      }).end();

      // Complete workflow: XML -> deflate -> base64 -> base64 decode -> inflate -> XML
      const deflated = zlib.deflateRawSync(originalXml);
      const base64Encoded = deflated.toString('base64');
      const base64Decoded = Buffer.from(base64Encoded, 'base64');
      const inflated = zlib.inflateRawSync(base64Decoded).toString();

      expect(inflated).toBe(originalXml);
    });
  });
});
