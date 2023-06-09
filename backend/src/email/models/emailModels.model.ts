export interface Destination {
    ToAddresses?: string[],
    CcAddresses?: string[],
    BccAddresses: string[],
}

export interface TextContent {
    Data: string,
    Charset?: string
}

export interface Body {
    Text: TextContent,
    Html?: TextContent,
}

export interface Text {
    ToAddresses?: string[],
    CcAddresses?: string[],
    BccAddresses: string[],
}

export interface Destination {
    ToAddresses?: string[],
    CcAddresses?: string[],
}

export interface MessageContent {
    Subject: TextContent,
    Body: Body,
}

export interface Tag {
    Name: string
    Value: string
}

export interface EmailContentConfig {
  Source: string,
  Destination: Destination,
  Message: MessageContent,
  ReplyToAddresses?: string[],
  ReturnPath?: string,
  SourceArn?: string,
  ReturnPathArn?: string,
  Tags?: Tag[],
  ConfigurationSetName?:  string,
}

export interface EmailBatchItem {
    to: string[],
    title: string,
    message: string,
}
