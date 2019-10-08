const getHeaders = async () => {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    return headers;
};

const baseURL = window.location.protocol + '//' + window.location.host;

export const post = async (uri: string, params?: object):Promise<any> => {
    const url:URL = new URL(`${baseURL}${uri}`);
    const init = {
        method: 'POST',
        headers: await getHeaders(),
        body: params? JSON.stringify(params): undefined
    };
    const response = await fetch(url.toString(), init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);
};

