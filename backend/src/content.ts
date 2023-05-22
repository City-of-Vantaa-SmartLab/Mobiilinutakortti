export type Language = 'fi' | 'sv' | 'en'

export const AdminAlreadyExists = "Käyttäjätili on jo luotu tällä sähköpostilla."
export const Created = (what: string) => `${what} luotu.`
export const Renew = (what: string) => `${what} uudistettu.`
export const ClubNotFound = "Kyseistä nuorisotilaa ei löydy."
export const DataNotChanged = "Tietoja ei muutettu."
export const IncorrectPassword = "Nykyinen salasana on väärä."
export const PasswordUpdated = "Salasana päivitetty."
export const FailedLogin = "Virheellinen käyttäjätunnus tai salasana."
export const NonProdFeature = "This feature is not available in production."
export const NoCheckins = "Kyseisenä päivänä ei kirjautumisia."
export const NotADate = "Väärä päivämäärä."
export const JuniorAlreadyExists = "Käyttäjätili on jo luotu tällä puhelinnumerolla."
export const JuniorNotExpiredOrPending = "Uusittava jäsenkortti ei ole tilassa \"tunnus vanhentunut\" tai \"kotisoitto tekemättä\"."
export const LockedOut = "Liian monta väärää yritystä."
export const Reset = "Palautuslinkki lähetetty."
export const Updated = "Päivitetty."
export const UserNotFound = "Käyttäjää ei löydy."
export const MessengerServiceNotAvailable = "Tekstiviestipalvelu on tilapäisesti pois käytöstä."
export const SMSNotAvailableButUserCreated = "SMS palvelu ei ole väliaikaisesti saatavilla, mutta käyttäjä on luotu."
export const SMSSender = "VantaaNuta"
export const Deleted = "Käyttäjä poistettu."
export const Routes = {
    api: "/api",
    admin: "/nuorisotyontekijat",
}
export const PhoneNumberNotValid = "Puhelinnumero on virheellinen"
export const ParentsPhoneNumberNotValid = "Huoltajan puhelinnumero on virheellinen"
export const SecurityContextNotValid = "Käyttäjätunnistuksessa tapahtui virhe, tunnistaudu Suomi.fi:n kautta uudelleen"
export const JuniorAccountNotConfirmedOrFound = "Käyttäjätiliä ei ole tai sitä ei ole vielä hyväksytty"
export const NewSeasonCreated = (count: number) => `Uusi kausi aloitettu. ${count} käyttäjää asetettu tilaan "tunnus vanhentunut"`
export const ExpiredUsersDeleted = (count: number) => `${count} vanhentunutta tunnusta poistettu`
export const ForbiddenToChangeExpiredStatus = "Tilaa \"tunnus vanhentunut\" ei voi muokata ilman pääkäyttäjän oikeuksia."
export const RegisteredSmsContent = {
  fi: (recipientName: string, link: string, clubSpecificMessage: string) => `Hei ${recipientName}! Sinulle on luotu oma Nutakortti. Voit kirjautua palveluun kertakäyttöisen kirjautumislinkin avulla: ${link}\n\n${clubSpecificMessage || 'Terveisin Vantaan nuorisopalvelut'}`,
  sv: (recipientName: string, link: string, clubSpecificMessage: string) => `Hej ${recipientName}! Ett Nutakort har skapats åt dig. Du kan logga in på tjänsten via denna engångsinloggningslänk: ${link}\n\n${clubSpecificMessage || 'Vänliga hälsningar, Vanda ungdomstjänster'}`,
  en: (recipientName: string, link: string, clubSpecificMessage: string) => `Hi ${recipientName}! A Nuta card has been created for you. You can log in to the service via this one-time login link: ${link}\n\n${clubSpecificMessage || 'Best regards, Vantaa youth services'}`,
}
export const ExpiredSmsContent = {
  fi: (recipientName: string, period: string, expiredDate: string, link: string) => 'Hei\n\n'
    + `Nuoren ${recipientName} Mobiilinutakortti odottaa uusimista kaudelle ${period}. `
    + 'Alla olevasta linkistä pääset uusimaan nuoren hakemuksen ja päivittämään yhteystiedot. '
    + `Edellisen kauden QR-koodi lakkaa toimimasta ${expiredDate}.\n\n`
    + `${link}\n\n`
    + 'Terveisin,\nVantaan Nuorisopalvelut',
  sv: (recipientName: string, period: string, expiredDate: string, link: string) => 'Hej\n\n'
     + `Nutakortet för barnet ${recipientName} väntar på förnyelse för säsongen ${period}. `
     + 'Genom att klicka på länken nedan kan du förnya barnets ansökan och uppdatera kontaktinformationen. '
     + `QR-koden för föregående säsong slutar fungera vid ${expiredDate}.\n\n`
     + `${link}\n\n`
     + 'Bästa hälsningar,\nVanda ungdomstjänster',
  en: (recipientName: string, period: string, expiredDate: string, link: string) => 'Hi\n\n'
    + `The Nuta card of child ${recipientName} awaits renewal for season ${period}. `
    + 'By clicking the link below you can renew the child\'s application and update the contact information. '
    + `The QR code for the previous season stops working at ${expiredDate}.\n\n`
    + `${link}\n\n`
    + 'Best regards,\nVantaa youth services',
}

// Valid values: 'nickName', 'postCode', 'school', 'class', 'communicationsLanguage'
export const hiddenJuniorFields = ['communicationsLanguage']
