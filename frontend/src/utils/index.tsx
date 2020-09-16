

export const saveTokenToStorage = (token: string) => {
    localStorage.setItem('token', token);
}

export const cacheToken = (token: string) => {
    fetch('/token', { method: "POST", body: JSON.stringify({ token: token })});
}


export const validatePhone = (number: string) => {
    if (number.match(/(^(\+358|0)\d{6,10})/)) {
        return true;
    }
    return false;
}

export const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
  }

export const isInStandaloneMode = () => {
    let nav:any = window.navigator;
    return ('standalone' in nav && nav.standalone);
}

export const messages = {
    authFail: "Kirjautuminen epäonnistui. Syötä puhelinnumerosi saadaksesi uuden kirjautumislinkin",
    linkRequestSuccess: "Uusi linkki lähetettiin syöttämääsi numeroon",
    linkRequestFail: "Linkin lähetys epäonnistui, ole hyvä ja yritä uudelleen"
}
