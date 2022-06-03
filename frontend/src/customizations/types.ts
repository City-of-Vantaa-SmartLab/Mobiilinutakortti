import React, { ReactNode } from 'react'

export interface Theme {
  pages: {
    login: {
      stripe1: string
      stripe2: string
      background: string
    }
    qr: {
      stripe: string
      background: string
    }
    parentRedirect: {
      stripe1: string
      stripe2: string
      background: string
      descriptionBackground: string
    }
    registration: {
      stripe: string
      background: string
      footerBackground: string
      confirmationBackground: string
    }
  }
}

export interface Translations {
  addToHomescreen: ReactNode
  login: {
    title: ReactNode
    label: ReactNode
    placeholder: string
    submit: ReactNode
    errorMessage: string
  }
  logout: {
    title: ReactNode
    heading: ReactNode
    message: ReactNode
  }
  parentRedirect: {
    title: ReactNode
    ingress: ReactNode
    description: ReactNode
    submit: ReactNode
    privacyPolicy: {
      title: ReactNode
      href: string
    }
  }
  parentRegistration: {
    logout: ReactNode
    title: ReactNode
    form: {
      juniorHeading: string,
      juniorFirstName: string,
      juniorLastName: string,
      juniorNickName: string,
      juniorBirthday: string,
      juniorBirthdayPlaceholder: string,
      juniorPhoneNumber: string,
      postCode: string,
      school: string,
      class: string,
      juniorGender: string,
      juniorGenderOptions: {
        f: string,
        m: string,
        o: string,
        '-': string,
      },
      photoPermission: string,
      photoPermissionDescription: string,
      photoPermissionOptions: {
        y: string,
        n: string,
      },
      
      parentHeading: string,
      parentFirstName: string,
      parentLastName: string,
      parentPhoneNumber: string,
      
      youthClubHeading: string,
      youthClub: string,
      youthClubDefault: string,
      youthClubDescription: string,
      
      termsOfUse: ReactNode,
      submit: ReactNode,
      privacyPolicy: {
        title: ReactNode,
        href: string,
      }
    },
    confirmation: {
      heading: ReactNode
      message: (logoutLink: (text: ReactNode) => ReactNode, startOverLink: (text: ReactNode) => ReactNode) => ReactNode,
    }
    error: {
      message: ReactNode
      back: ReactNode
    }
  },
  qrPage: {
    login: string,
    instruction: ReactNode
  }
}

/*
juniorHeading: 'Nuoren tiedot',
juniorFirstName: 'Etunimi',
juniorLastName: 'Sukunimi',
juniorNickName: 'Kutsumanimi',
juniorBirthday: 'Syntymäaika',
juniorBirthdcayPlaceholder: 'pp.kk.vvvv',
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
photoPermissionDesription: 'Valokuvaamme ja videoimme ajoittain toimintaamme ja nuoria viestintää varten. Kuvia voidaan käyttää Nuorisopalveluiden julkaisuissa (esim. sosiaalisessa mediassa, nettisivuilla ja esitteissä). \nLapseni kuvaa saa käyttää lapsen asuinkaupungin viestinnässä.',
photoPermissionOptions: {
  y: 'Kyllä',
  n: 'Ei',
},

parentHeading: 'Huoltajan tiedot',
parentFirstName: 'Etunimi',
parentLastName: 'Sukunimi',
parentPhoneNumber: 'Puhelinnumero',

youthClubHeading: 'Kotinuorisotila,
youthClub: 'Kotinuorisotila',
youthClubDefault: 'Valitse nuorisotila',
youthClubDescription: 'Valitse nuorisotila, jossa lapsesi tai nuoresi yleensä käy.',

termsOfUse: <>Hyväksyn&nbsp;<a target='_blank' rel="noopener noreferrer" href='https://www.vantaa.fi/instancedata/prime_product_julkaisu/vantaa/embeds/vantaawwwstructure/150593_Mobiilinutakortin_kayttoehdot.pdf'>käyttöehdot</a></>,
send: 'Lähetä hakemus',
privacyPolicy: {
  title: 'Lue tarkemmin, kuinka käsittelemme tietojasi.',
  href: 'https://www.vantaa.fi/hallinto_ja_talous/hallinto/henkilotietojen_kasittely/informointiasiakirjat/nuorisopalveluiden_informointiasiakirja',
}
 */
