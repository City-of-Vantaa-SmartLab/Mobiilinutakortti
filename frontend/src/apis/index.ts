const baseURL = process.env.REACT_APP_ENDPOINT;


export const get = async (uri: string, token: string):Promise<any> => {
    // console.log(token);
    const url:string = `${baseURL}${uri}`;
    const init:RequestInit = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    // console.log(init);
    const response = await fetch(url, init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);
  
};

export const post = async (uri: string, params?: object):Promise<any> => {
    const url:string = `${baseURL}${uri}`;
    const init:RequestInit = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    };
    const response = await fetch(url, init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);
  
};
