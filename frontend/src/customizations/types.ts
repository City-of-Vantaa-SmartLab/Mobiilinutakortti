import { ReactNode } from 'react'

export type Language = 'fi' | 'sv' | 'en'

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
      youthClubDefault: string,
      youthClubDescription: string,

      communicationsLanguage: string,
      communicationsLanguageDefault: string,
      communicationsLanguageDescription: string,

      termsOfUse: ReactNode,
      submit: ReactNode,
      privacyPolicy: {
        title: ReactNode,
        href: string,
      }
    },
    errors: {
      required: string,
      birthdayFormat: string,
      phoneNumberFormat: string,
      postCodeFormat: string,
      selectYouthClub: string,
      selectLanguage: string,
      acceptTermsOfUse: string,
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
  },
  languages: {
    fi: string,
    sv: string,
    en: string
  }
}
