// Attempt to cache the token to the service worker, see src/public/sw.js
const cacheToken = async (token: string | null) => {
    try {
        await fetch('/token', { method: "POST", body: JSON.stringify({ token: token }) });
    } catch (err) {
        // Service worker not available
    }
}

export const saveToken = async (token: string, useCache = true) => {
    localStorage.setItem('token', token);
    if (useCache) {
        await cacheToken(token);
    }
}

export const deleteToken = async () => {
    localStorage.removeItem('token');
    await cacheToken(null);
}

export const validatePhone = (number: string) => {
    if (number.match(/(^(\+358|0)\d{6,10})/)) {
        return true;
    }
    return false;
}
