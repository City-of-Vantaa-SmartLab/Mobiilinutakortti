# About certificates

## Terminology

* IdP: Identity provider, in this case the Suomi.fi Tunnistus service.
* SP: Service provider, or Vantaan Mobiilinutakortti (i.e. this application).
* SAML2: SAML 2.0, an XML-based protocol which is in this case used to pass information about the end user between the IdP and SP.
* X.509: a standard defining the format of public key certificates.
* CA: Certificate Authority, an entity that issues digital certificates.

## Why a certificate is needed

SAML2 messages sent from SP to IdP must be signed with the SP's private key. The SP's public key is known by the IdP because it is delivered as part of the service metadata when applying for usage rights to the IdP. Therefore, the IdP can be sure the messages are truly sent from the SP.

Likewise, messages from IdP are signed and must be checked against the IdP's public key.

The certificate used in SAML2 communication is different to the TLS certificate used to encrypt HTTPS web traffic.

## Production environment

For production environment, a certificate issued by a CA is needed. This is handled via the city of Vantaa and their agreements with a CA.

## Test environment

For the test environment, a self-signed certificate is used. The procedure for creating the certificate using OpenSSL is as follows:

1. Generate a 2048-bit RSA private key: `openssl genrsa -out nutakortti-test_private_key.pem 2048`
2. Create the Certificate Signing Request (CSR, see below for more details): `openssl req -new -key nutakortti-test_private_key.pem -out nutakortti-test.csr`
3. Generate the self-signed certificate (public key, valid for 5 years): `openssl x509 -req -days 1825 -in nutakortti-test.csr -signkey nutakortti-test_private_key.pem -out nutakortti-test.cer`

The CSR was created using this data:

    Country Name (2 letter code) [AU]:FI
    State or Province Name (full name) [Some-State]:Uusimaa
    Locality Name (eg, city) []:Vantaa
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:Vantaan kaupunki
    Organizational Unit Name (eg, section) []:Vantaan Nuorisopalvelut
    Common Name (e.g. server FQDN or YOUR name) []:nutakortti-test.vantaa.fi
    Email Address []:
    A challenge password []:
    An optional company name []:

Note: as the certificate is not used for TLS web traffic, the Common Name need not be a real URL. We use the one used to identify the Mobiilinutakortti service in IdP SAML2 metadata.

The CSR file is not needed anymore. The CER file is your public key, the certificate used in the IdP metadata; the file is public as the name implies. The PEM file is your private key *and should not be put into version control*. It is required by the backend to sign and possibly decrypt the SAML2 messages.
