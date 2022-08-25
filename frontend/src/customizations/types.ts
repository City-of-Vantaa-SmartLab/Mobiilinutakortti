import { ReactNode } from 'react'

export type Language = 'fi' | 'sv' | 'en'
export type CustomizableFormField =
  | 'juniorNickName'
  | 'postCode'
  | 'school'
  | 'class'
  | 'termsOfUse'

export interface Theme {
  pages: {
    login: {
      logo: ReactNode | null
      stripe1: string
      stripe2: string
      background: string
      languageSelectText: string
      headingText: string
      messageText: string
      errorText: string
      labelText: string
      buttonText: string
      buttonBackground: string
      bottomLogo: ReactNode | null
    }
    qr: {
      stripe: string
      background: string
      languageSelectText: string
      headingText: string
      qrBorder: string
      footerText: string
    }
    parentRedirect: {
      logo: ReactNode
      stripe1: string
      stripe2: string
      languageSelectText: string
      background: string
      headingText: string,
      ingressText: string,
      description: {
        background: string
        text: string
        buttonBackground: string
        buttonText: string
        bottomLogo: ReactNode | null
      }
    }
    registration: {
      stripe: string
      background: string
      languageSelectText: string
      headingText: string
      formTitleText: string
      footerBackground: string
      submitButtonBackground: string
      submitButtonText: string
      errorButtonBackground: string
      errorButtonText: string
      confirmationBackground: string
      confirmationTitle: string
      confirmationLink: string
      bottomLogo: ReactNode | null
    }
  }
  fonts: {
    heading: string
    body: string
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
    authMessages: {
      authFail: string
      linkRequestSuccess: string
      linkRequestFail: string
    }
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
