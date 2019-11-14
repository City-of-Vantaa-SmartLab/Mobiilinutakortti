import openSocket from 'socket.io-client';
const baseURL = process.env.REACT_APP_ENDPOINT;

export async function subscribeToCheckIn(set:any) {
    const socket = openSocket(`${baseURL}?token=${localStorage.getItem('token')}`);
    await socket.on('check-in', (response: any) => set(null, response));
    socket.emit("check-in", "");
}

export const get = async (uri: string, token: string): Promise<any> => {
    const url: string = `${baseURL}${uri}`;
    const init: RequestInit = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    const response = await fetch(url, init);
    if (response.status === 200 || response.status === 201) {
        return response.json();
    } else throw new Error(response.statusText);

};

export const post = async (uri: string, params?: object): Promise<any> => {
    const url: string = `${baseURL}${uri}`;
    const init: RequestInit = {
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
