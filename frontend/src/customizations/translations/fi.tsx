import React from 'react'
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
      linkRequestFail: "Linkin lähetys epäonnistui, ole hyvä ja yritä uudelleen",
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

      youthClubHeading: 'Kotinuorisotila',
      youthClubDefault: 'Valitse nuorisotila',
      youthClubDescription: 'Valitse nuorisotila, jossa lapsesi tai nuoresi yleensä käy.',

      communicationsLanguage: 'Kommunikaatiokieli',
      communicationsLanguageDefault: 'Valitse kieli',
      communicationsLanguageDescription: 'Kieli, jota järjestelmä käytettää viestinnässä nuoren kanssa (esim. tekstiviestit)',

      termsOfUse: (
        <>
          Hyväksyn&nbsp;<a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/sites/default/files/document/Mobiilinutakortin%20k%C3%A4ytt%C3%B6ehdot%202022pdf.pdf'>käyttöehdot</a>
        </>
      ),
      submit: 'Lähetä hakemus',
      privacyPolicy: {
        title: 'Lue tarkemmin, kuinka käsittelemme tietojasi.',
        href: 'https://www.vantaa.fi/hallinto_ja_talous/hallinto/henkilotietojen_kasittely/informointiasiakirjat/nuorisopalveluiden_informointiasiakirja',
      }
    },
    errors: {
      required: 'Täytä tiedot',
      birthdayFormat: 'Anna syntymäaika muodossa pp.kk.vvvv',
      phoneNumberFormat: 'Tarkista, että antamasi puhelinnumero on oikein',
      postCodeFormat: 'Tarkista, että antamasi postinumero on oikein',
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
      message: 'Jokin meni pieleen. Jos virhe toistuu useasti, ole yhteydessä lähinuorisotilaasi tai Mobiilinutakortin yhteyshenkilöön p. +358 400 662739 (arkisin 8–16).',
      back: 'Takaisin',
    }
  },
  qrPage: {
    login: 'Kirjaudu',
    instruction: 'Näytä QR-koodi lukulaitteelle saapuessasi nuorisotilaan.',
  },
  languages: {
    fi: 'suomi',
    sv: 'ruotsi',
    en: 'englanti'
  }
}
