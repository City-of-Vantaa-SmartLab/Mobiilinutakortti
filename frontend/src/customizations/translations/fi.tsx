import { Translations } from '../types'

export const translations: Translations = {
  addToHomescreen: <>Klikkaa <i/>-kuvaketta ja valitse ”Lisää Koti-valikkoon” lisätäksesi sovelluksen</>,
  login: {
    title: 'Nutakortti',
    label: 'Puhelinnumerosi',
    placeholder: 'Ex: 05051190912',
    submit: 'Lähetä uusi kirjautumislinkki',
    errorMessage: 'Tarkista, että antamasi puhelinnumero on oikein',
    authMessages: {
      authFail: "Kirjautuminen epäonnistui. Syötä puhelinnumerosi saadaksesi uuden kirjautumislinkin",
      linkRequestSuccess: "Uusi linkki lähetettiin syöttämääsi numeroon",
      linkRequestFail: "Linkin lähetys epäonnistui, ole hyvä ja yritä uudelleen myöhemmin",
    }
  },
  logout: {
    title: 'Nutakortti-hakemus',
    heading: 'Kiitos!',
    message: 'Olet nyt kirjautunut ulos. Kiitos palvelun käytöstä!'
  },
  parentRedirect: {
    title: 'Nutakortin hakeminen',
    ingress: 'Nutakortti on maksuton mobiililaitteella toimiva Vantaan nuorisotilojen jäsenkortti, jonka avulla nuori kirjautuu sisään nuorisotilaan.',
    description: (
      <p>
        Tällä lomakkeella voit huoltajana hakea lapsellesi tai nuorellesi Vantaan
        kaupungin nuorisopalveluiden jäsenkorttia. Nutakortti uusitaan
        toimintakausittain saman lomakkeen kautta. Kirjaudu sisään pankkitunnuksilla,
        mobiilivarmenteella tai sirullisella henkilökortilla ja täytä pyydetyt tiedot.
        <br/><br/>
        Kun hakemus on vastaanotettu, soitamme sinulle ja lähetämme nuorelle
        tekstiviestillä henkilökohtaisen kirjautumislinkin palveluun.
        <br/><br/>
        Käsittelemme hakemuksia jatkuvasti, mutta ruuhka-aikana käsittelyssä saattaa olla viivettä.
        Nuorisotilalla voi kuitenkin käydä heti hakemuksen täyttämisen jälkeen.
      </p>
    ),
    submit: 'Täytä hakemus',
    privacyPolicy: {
      title: 'Tietosuojaseloste',
      href: 'https://www.vantaa.fi/fi/kaupunki-ja-paatoksenteko/selosteet-oikeudet-ja-tietosuoja/henkilotietojen-kasittely/henkilotietojen-kasittely-nuorisotyossa-ja-toiminnassa'
    }
  },
  parentRegistration: {
    logout: 'Kirjaudu ulos',
    title: 'Nutakortti-hakemus',
    form: {
      juniorHeading: 'Nuoren tiedot',
      juniorFirstName: 'Etunimi',
      juniorLastName: 'Sukunimi',
      juniorNickName: 'Kutsumanimi',
      juniorBirthday: 'Syntymäaika',
      juniorBirthdayPlaceholder: 'pp.kk.vvvv',
      juniorPhoneNumber: 'Puhelinnumero',
      postCode: 'Postinumero',
      school: 'Koulun nimi',
      class: 'Luokka',
      juniorGender: 'Sukupuoli',
      juniorGenderOptions: {
        f: 'Tyttö',
        m: 'Poika',
        o: 'Muu',
        '-': 'En halua määritellä',
      },
      photoPermission: 'Kuvauslupa',
      photoPermissionDescription: 'Valokuvaamme ja videoimme ajoittain toimintaamme ja nuoria viestintää varten. Kuvia voidaan käyttää Nuorisopalveluiden julkaisuissa (esim. sosiaalisessa mediassa, nettisivuilla ja esitteissä). \nLapseni kuvaa saa käyttää lapsen asuinkaupungin viestinnässä.',
      photoPermissionOptions: {
        y: 'Kyllä',
        n: 'Ei',
      },

      parentHeading: 'Huoltajan tiedot',
      parentFirstName: 'Etunimi',
      parentLastName: 'Sukunimi',
      parentPhoneNumber: 'Puhelinnumero',
      parentsEmail: 'Sähköpostiosoite',
      additionalContactInformation: 'Toisen yhteyshenkilön tiedot tai vaihtoehtoinen puhelinnumero (esim. työpuhelin)',

      announcements: {
        title: "Tiedotus",
        description: "Saat ilmoituksia liittyen kotinuorisotilaasi tai niihin nuorisotiloihin, joilla olet vieraillut. Jos et halua saada valinnaisia infoviestejä enää, ole yhteydessä nuorisotyöntekijään.",
        emailPermission: 'Infosähköpostit',
        emailPermissionParent: 'Sähköpostiviestejä saa lähettää huoltajalle',
        smsPermissionJunior: 'Tekstiviestejä saa lähettää nuorelle',
        smsPermission: 'Infotekstiviestit',
        smsPermissionParent: 'Tekstiviestejä saa lähettää huoltajalle',
        permissionOptions: {
          ok: 'Kyllä',
          notOk: 'Ei',
        },
      },

      youthClubHeading: 'Kotinuorisotila',
      youthClubDefault: 'Valitse nuorisotila',
      youthClubDescription: 'Valitse nuorisotila, jossa lapsesi tai nuoresi yleensä käy.',

      communicationsLanguage: 'Kommunikaatiokieli',
      communicationsLanguageDefault: 'Valitse kieli',
      communicationsLanguageDescription: 'Kieli, jota järjestelmä käytettää viestinnässä nuoren kanssa (esim. tekstiviestit)',

      termsOfUse: (
        <>
          Annan suostumukseni tietojen käsittelylle Nutakortti-palvelun yhteydessä ja hyväksyn&nbsp;<a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/sites/default/files/document/Mobiilinutakortin%20k%C3%A4ytt%C3%B6ehdot.pdf'>käyttöehdot</a>.
        </>
      ),
      correctNote: 'Varmistathan, että täyttämäsi tiedot ovat oikein ennen hakemuksen lähettämistä.',
      submit: 'Lähetä hakemus',
      privacyPolicy: {
        title: 'Lue tarkemmin, kuinka käsittelemme tietojasi.',
        href: 'https://www.vantaa.fi/fi/kaupunki-ja-paatoksenteko/selosteet-oikeudet-ja-tietosuoja/henkilotietojen-kasittely/henkilotietojen-kasittely-nuorisotyossa-ja-toiminnassa',
      }
    },
    errors: {
      required: 'Täytä tiedot',
      birthdayFormat: 'Anna syntymäaika muodossa pp.kk.vvvv',
      phoneNumberFormat: 'Tarkista, että antamasi puhelinnumero on oikein',
      postCodeFormat: 'Tarkista, että antamasi postinumero on oikein',
      emailFormat: 'Tarkista, että antamasi sähköpostiosoite on oikein',
      selectYouthClub: 'Valitse kotinuorisotila valikosta',
      selectLanguage: 'Valitse kieli valikosta',
      acceptTermsOfUse: 'Hyväksy käyttöehdot jatkaaksesi',
    },
    confirmation: {
      heading: 'Kiitos hakemuksestasi!',
      message: (logoutLink, startOverLink) => (
        <p>Kun nuoren jäsenkorttihakemus on käsitelty, hänelle lähetetään tekstiviestillä henkilökohtainen
          kirjautumislinkki palveluun.
          <br/><br/>
          Käsittelemme hakemuksia jatkuvasti, mutta ruuhka-aikana käsittelyssä saattaa olla viivettä.
          Nuorisotilalla voi kuitenkin käydä heti hakemuksen täyttämisen jälkeen.
          <br/><br/>
          Voit nyt{' '}{logoutLink('kirjautua ulos')} tai{' '}{startOverLink('aloittaa alusta')} rekisteröidäksesi
          nutakortin toiselle lapselle.
        </p>
      )
    },
    error: {
      message: (<>Jokin meni pieleen. Jos virhe toistuu useasti, ole yhteydessä <a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/fi/palveluhakemisto/palvelu/nuorisotilatoiminta#tab-units'>lähinuorisotilaasi</a> tai Mobiilinutakortin yhteyshenkilöön p. +358 400 662739 (virka-aikana).</>),
      alternativeMessage: (<>Jokin meni pieleen. Jos virhe toistuu useasti, ole yhteydessä <a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/fi/palveluhakemisto/palvelu/nuorisotilatoiminta#tab-units'>lähinuorisotilaasi</a>.</>),
      back: 'Takaisin',
    }
  },
  qrPage: {
    codeExpired: "Edellinen kausi",
    codeValid: "Kuluva kausi",
    login: 'Kirjaudu',
    instruction: (
      <p>
        Näytä QR-koodi lukulaitteelle saapuessasi nuorisotilaan.
        <br/>
        Voit myös ottaa tästä sivusta kuvakaappauksen ja käyttää sitä kirjautuessasi.
      </p>
    )
  },
  languages: {
    fi: 'suomi',
    sv: 'ruotsi',
    en: 'englanti'
  }
}
