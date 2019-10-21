export interface TeliaMessageRequest {
    username: string;
    password: string;
    from: string;
    to: string[];
    message: string;
}
