export interface Credentials {
    accessKeyId: string;
    secretAccessKey: string;
}

export interface SesSettings {
    region: string;
    credentials: Credentials;
}

export interface EmailSettings {
    source: string;
    returnPath: string;
}