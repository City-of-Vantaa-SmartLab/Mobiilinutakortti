import React from 'react'
import { Translations } from '../types'

export const translations: Translations = {
  addToHomescreen: <>Klicka på ikonen <i/> och välj ”Lägg till på startskärmen” för att lägga till appen</>,
  login: {
    title: 'Nutakort',
    label: 'Ditt telefonnummer',
    placeholder: 'T.ex. 05051190912',
    submit: 'Skicka en ny inloggningslänk',
    errorMessage: 'Kontrollera att telefonnumret är giltigt',
    authMessages: {
      authFail: 'Inloggningen misslyckades. Ange ditt telefonnummer för att få en ny inloggningslänk',
      linkRequestSuccess: 'En ny länk skickades till numret du angav',
      linkRequestFail: 'Länksändningen misslyckades, försök igen',
    }
  },
  logout: {
    title: 'Nutakortansökan',
    heading: 'Tack!',
    message: 'Du har nu loggat ut. Tack för att du använder tjänsten!'
  },
  parentRedirect: {
    title: 'Ansökning om Nuta kort',
    ingress: 'Nutakortet är ett gratis medlemskort för Vanda ungdomsklubbar som fungerar i mobila enheter. Din ungdom använder det för att logga in på ungdomsklubben.',
    description: (
      <p>
        Med det här formuläret kan du ansöka om ett medlemskort för ungdomstjänsten i Vanda stads medlem för din ungdom.
        Kortet förnyas med samma formulär för varje aktivitetstermin. Logga in med nätbankskoder,
        mobilcertifikat eller identitetskort och fyll i den begärda informationen.
        <br/><br/>
        När ansökan har kommit in ringer vi dig och skickar undomen en personlig inloggningslänk till tjänsten via SMS.
      </p>
    ),
    submit: 'Fylla i ansökan',
    privacyPolicy: {
      title: 'Integritetspolicy',
      href: 'https://www.vantaa.fi/fi/kaupunki-ja-paatoksenteko/selosteet-oikeudet-ja-tietosuoja/henkilotietojen-kasittely/henkilotietojen-kasittely-nuorisotyossa-ja-toiminnassa'
    }
  },
  parentRegistration: {
    logout: 'Logga ut',
    title: 'Nutakortansökan',
    form: {
      juniorHeading: 'Ungdomens information',
      juniorFirstName: 'Förnamn',
      juniorLastName: 'Efternamn',
      juniorNickName: 'Smeknamn',
      juniorBirthday: 'Födelsedatum',
      juniorBirthdayPlaceholder: 'dd.mm.åååå',
      juniorPhoneNumber: 'Telefonnummer',
      postCode: 'Postnummer',
      school: 'Skolnamn',
      class: 'Klass',
      juniorGender: 'Kön',
      juniorGenderOptions: {
        f: 'Flicka',
        m: 'Pojke',
        o: 'Annan',
        '-': 'Jag vill inte specificera',
      },
      photoPermission: 'Fotograferingstillstånd',
      photoPermissionDescription: 'Vi fotograferar och filmar vår verksamhet då och då för offentlig kommunikation. Bilder kan användas i ungdomstjänstens publikationer (t.ex. i sociala medier, webbsidor och broschyrer).\n' +
        'Bilden av min ungdom kan användas i offentlig kommunikation av deras hemstad.',
      photoPermissionOptions: {
        y: 'Ja',
        n: 'Nej',
      },

      parentHeading: 'Vårdnadshavares information',
      parentFirstName: 'Förnamn',
      parentLastName: 'Efternamn',
      parentPhoneNumber: 'Telefonnummer',
      parentsEmail: 'E-postadress',
      additionalContactInformation: 'Information om en annan kontaktperson eller ett alternativt telefonnummer (t.ex. jobbtelefon)',

      announcements: {
        title: 'Info meddelande',
        description: 'Du kommer att få meddelanden om din hemungdomsanläggning eller de ungdomsanläggningar du har besökt. Om du inte inte vill ta emot valfria info-sms längre, hör av dig till en ungdomsarbetare.',
        emailPermission: 'Info emails',
        emailPermissionParent: 'Lov för emails till vårdnadshavare',
        smsPermissionJunior: 'Lov för sms meddelande till junior',
        smsPermission: 'Info sms',
        smsPermissionParent: 'Lov för sms meddelande till vårdnadshavare',
        permissionOptions: {
          ok: 'Ja',
          notOk: 'Nej',
        },
      },

      youthClubHeading: 'Hemungdomskulbb',
      youthClubDefault: 'Välj ungdomskulbb',
      youthClubDescription: 'Välj den ungdomsklubb din ungdom brukar besöka.',

      communicationsLanguage: 'Kommunikationsspråk',
      communicationsLanguageDefault: 'Välj språk',
      communicationsLanguageDescription: 'Språk som systemet använder för meddelanden som skickas till ungdomen (t.ex. SMS-meddelanden)',

      termsOfUse: (
        <>
          Jag godkänner&nbsp;<a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/sites/default/files/document/Mobiilinutakortin%20k%C3%A4ytt%C3%B6ehdot.pdf'>användarvillkoren</a>
        </>
      ),
      correctNote: 'Var så god och se till att informationen du har lämnat är korrekt innan du skickar ansökan.',
      submit: 'Skicka ansökan',
      privacyPolicy: {
        title: 'Läs hur vi hanterar dina personuppgifter.',
        href: 'https://www.vantaa.fi/fi/kaupunki-ja-paatoksenteko/selosteet-oikeudet-ja-tietosuoja/henkilotietojen-kasittely/henkilotietojen-kasittely-nuorisotyossa-ja-toiminnassa',
      }
    },
    errors: {
      required: 'Fyll i informationen',
      birthdayFormat: 'Ange födelsedatum i formatet dd.mm.åååå',
      phoneNumberFormat: 'Kontrollera att telefonnumret du angav är korrekt',
      postCodeFormat: 'Kontrollera att postnumret du angav är korrekt',
      emailFormat: 'Kontrollera att e-postadress du angav är korrekt',
      selectYouthClub: 'Välj en ungdomsklubb från menyn',
      selectLanguage: 'Välj ett språk från menyn',
      acceptTermsOfUse: 'Acceptera villkoren för att fortsätta',
    },
    confirmation: {
      heading: 'Tack för ansökan',
      message: (logoutLink, startOverLink) => (
        <p>
          När ungdomens medlemskortsansökan har behandlats får han eller hon en personlig inloggningslänk via sms. Du kan
          nu {logoutLink('logga ut')} eller {startOverLink('börja om')} för att ansöka om kort för en annan ungdom.
        </p>
      )
    },
    error: {
      message: (<>Något gick fel. Om felet återkommer ofta, kontakta din <a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/fi/palveluhakemisto/palvelu/nuorisotilatoiminta#tab-units'>närmaste ungdomsklubb</a> eller Nutakortets kontaktperson, tel. +358 400 662739 (mån-fre 8-16).</>),
      back: 'Tillbaka',
    }
  },
  qrPage: {
    codeExpired: "FÖREGÅENDE SÄSONG",
    codeValid: "NUVARANDE SÄSONG",
    login: 'Logga in',
    instruction: 'Visa QR-kod för en läsare vid inträde i ungdomsklubben.',
  },
  languages: {
    fi: 'finska',
    sv: 'svenska',
    en: 'engelska'
  }
}
