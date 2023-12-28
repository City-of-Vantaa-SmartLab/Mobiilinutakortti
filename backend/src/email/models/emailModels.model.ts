export interface Destination {
    ToAddresses: string[],
    CcAddresses?: string[],
    BccAddresses?: string[],
}

export interface TextContent {
    Data: string,
    Charset?: string
}

export interface Body {
    Text: TextContent,
    Html?: TextContent,
}

export interface MessageContent {
    Subject: TextContent,
    Body: Body,
}

export interface Tag {
    Name: string
    Value: string
}

export interface EmailData {
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

export interface EmailAnnouncement {
    to: string[],
    title: string,
    message: string,
}
