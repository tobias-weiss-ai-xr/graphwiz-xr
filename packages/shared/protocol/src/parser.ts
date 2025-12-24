/**
 * Message Parser for GraphWiz-XR protocol
 */

import type { Message } from './types.js';

export class MessageParser {
  /**
   * Parse a binary message buffer into a Message object
   */
  static parse(buffer: ArrayBuffer): Message {
    const view = new DataView(buffer);
    const offset = 0;

    // Read message header
    const messageIdLength = view.getUint8(offset);
    const messageId = this.readString(view, offset + 1, messageIdLength);
    const timestamp = view.getBigUint64(offset + 1 + messageIdLength);
    const type = view.getUint8(offset + 9 + messageIdLength);

    // Read payload based on type
    const payloadOffset = offset + 10 + messageIdLength;
    const payload = this.parsePayload(view, type, payloadOffset, buffer.byteLength - payloadOffset);

    return {
      messageId,
      timestamp: Number(timestamp),
      type,
      payload,
    };
  }

  /**
   * Serialize a Message object to binary buffer
   */
  static serialize(message: Message): ArrayBuffer {
    // Calculate size
    const messageIdBytes = new TextEncoder().encode(message.messageId).length;
    const payloadSize = this.calculatePayloadSize(message.payload);
    const totalSize = 1 + messageIdBytes + 8 + 1 + payloadSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;

    // Write message ID
    view.setUint8(offset, messageIdBytes);
    offset += 1;
    this.writeString(view, offset, message.messageId);
    offset += messageIdBytes;

    // Write timestamp
    view.setBigUint64(offset, BigInt(message.timestamp));
    offset += 8;

    // Write message type
    view.setUint8(offset, message.type);
    offset += 1;

    // Write payload
    this.writePayload(view, offset, message.payload);

    return buffer;
  }

  private static readString(view: DataView, offset: number, length: number): string {
    const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, length);
    return new TextDecoder().decode(bytes);
  }

  private static writeString(view: DataView, offset: number, str: string): void {
    const bytes = new TextEncoder().encode(str);
    new Uint8Array(view.buffer, view.byteOffset + offset, bytes.length).set(bytes);
  }

  private static parsePayload(
    view: DataView,
    type: number,
    offset: number,
    length: number
  ): Message['payload'] {
    // Payload parsing implementation based on message type
    // This is a simplified version - full implementation would handle all types
    return {} as Message['payload'];
  }

  private static calculatePayloadSize(payload: Message['payload']): number {
    // Calculate payload size for serialization
    return 0; // Placeholder
  }

  private static writePayload(view: DataView, offset: number, payload: Message['payload']): void {
    // Write payload data
    // Implementation depends on payload type
  }
}

/**
 * Validate a message object
 */
export function validateMessage(message: Message): boolean {
  if (!message.messageId || !message.type) {
    return false;
  }
  if (message.timestamp <= 0) {
    return false;
  }
  return true;
}
