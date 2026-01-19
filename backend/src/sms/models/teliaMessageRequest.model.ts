/**
 * The entire documentation for the SMS REST API can be found at
 *
 * https://secure.lekab.com/restsms/swagger.html
 *
 * Telia is the service provider, but the service itself is produced
 * and maintained by Lekab.
 */

export interface TeliaMessageRequestBase {
    username: string;
    password: string;
    from: string;
}

/**
 * Model for sending a single message to multiple recipients. See entire documentation at
 *
 * https://secure.lekab.com/restsms/swagger.html#/send/sendPost
 */
export interface TeliaMessageRequest extends TeliaMessageRequestBase {
    message: string;
    to: string[];
}

/**
 * Model for sending multiple messages to multiple recipients. See entire documentation at
 *
 * https://secure.lekab.com/restsms/swagger.html#/batchsend/batchsendJson
 */
export interface TeliaBatchMessageRequest extends TeliaMessageRequestBase {
    batch: BatchItem[];
}

export interface BatchItem{
    t: string,
    m: string,
}
