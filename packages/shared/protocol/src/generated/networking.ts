/**
 * Generated stub for networking protocol types
 * This will be replaced with actual protobuf-generated code
 */

export interface Message {
  messageId: string;
  timestamp: number;
}

export interface ClientHello {
  clientId: string;
  displayName: string;
  authToken: string;
  requestedRoom: string;
}

export interface ServerHello {
  serverVersion: string;
  assignedClientId: string;
  roomId: string;
}
