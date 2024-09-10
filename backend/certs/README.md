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

## Updating Suomi.fi SP certificates

This concerns the files: nutakortti-test.cer, nutakortti-prod.cer.

You will need the new certificate, its private key, and the Suomi.fi metadata file for Nutakortti. You'll find the metadata file stored in AWS S3 bucket if you don't have it.

Then follow these steps:

1. Update the new certificate to the metadata file.
2. Ensure the technical contact person in the metadata file is up-to-date.
3. Upload the new certificate to DVV. See note and detailed steps below.
4. Write the new certificate over the file `nutakortti-prod.cer`.
5. Update the private key to environment variable (`SP_PKEY`). See `README.md` for backend for more details.
6. Restart the service with the new certificate file (step 4).
7. Whatever the source for your metadata file was (S3 bucket or something else), remember to update it with the new version for next certificate update.

Note: The step 3 (Upload the new certificate to DVV) needs a person who has permission to use DVV's "Palveluhallinnan Tunnistus" service. Vantaa has normally had a couple of persons with the permission. They should do as follows:

1. Go to [DVV palveluhallinta](https://palveluhallinta.suomi.fi/fi/).
2. Go to "tunnistuksen hallintaliittymä".
3. Click on the service you would like to update, or "Lisää asiointipalvelu" if it's a new service.
4. Click on "Rekisteröi ympäristö".
5. Choose "käyttölupa" or fill in "käyttöluvan tiedot" (if it's a production environment metadata). If the use permission has been given before 2020, a text "vanha käyttölupa" instead of journal number is sufficient.
6. Upload the new metadata. Choose production as the environment (if it is the production environment you're updating).
7. Click on "Tallenna ympäristö". You will get a confirmation message (to the top right corner) if it's a success.

The metadata file will be processed during the next maintenance day, which is usually mid-week. After the processing date is known, a developer should continue the steps 4-6 to restart the service on that day.

## Updating Suomi.fi IdP certificates

This concerns the files: tunnistus-test-1.cer, tunnistus-test-2.cer, tunnistus-prod-1.cer, tunnistus-prod-2.cer.

Every other year Suomi.fi will release its new metadata file. There are two signing certificates in the file: first one is the new one, the second one is the previous one.

When a new metadata file is released, you may replace one of the certificates (e.g. tunnistus-test-1.cer or tunnistus-test-2.cer) with the new certificate from the metadata file. This way you will not have to keep track when the new certificate takes over, as both can be used. When IdP starts to use the new certificate, you may copy the new one over the old certificate.

Make the certificates a single line and remove any spaces.
