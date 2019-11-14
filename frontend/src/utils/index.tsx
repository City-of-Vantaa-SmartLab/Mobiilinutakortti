
export const validatePhone = (number: string) => {
    if (number.match(/(^(\+358|0)\d{9})/)) {
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
  