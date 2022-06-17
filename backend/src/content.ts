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
export const SMSSignature = "Vantaan nuorisopalvelut"
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
export const RegisteredSmsContent = (recipientName: string, link: string, signature: string) => `Hei ${recipientName}! Sinulle on luotu oma Nutakortti. Voit kirjautua palveluun kertakäyttöisen kirjautumislinkin avulla ${link}  - ${signature}`;
export const ExpiredSmsContent = (recipientName: string, period: string, expiredDate: string, link: string) => 'Hei\n\n'
  + `Nuoren ${recipientName} Mobiilinutakortti odottaa uusimista kaudelle ${period}. `
  + 'Alla olevasta linkistä pääset uusimaan nuoren hakemuksen ja päivittämään yhteystiedot. '
  + `Edellisen kauden QR-koodi lakkaa toimimasta ${expiredDate}.\n\n`
  + `${link}\n\n`
  + "Terveisin,\nVantaan Nuorisopalvelut"
