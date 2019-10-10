const getHeaders = async () => {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    return headers;
};

const baseURL = process.env.REACT_APP_ENDPOINT;

export const post = async (uri: string, params?: object):Promise<any> => {
    const url:string = `${baseURL}${uri}`;
    const init = {
        method: 'POST',
        headers: await getHeaders(),
        body: params? JSON.stringify(params): undefined
    };
    const response = await fetch(url, init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);
};

