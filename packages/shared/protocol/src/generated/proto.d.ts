import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace graphwiz. */
export namespace graphwiz {

    /** Namespace core. */
    namespace core {

        /** Properties of a Message. */
        interface IMessage {

            /** Message messageId */
            messageId?: (string|null);

            /** Message timestamp */
            timestamp?: (number|Long|null);

            /** Message type */
            type?: (graphwiz.core.MessageType|null);

            /** Message clientHello */
            clientHello?: (graphwiz.core.IClientHello|null);

            /** Message serverHello */
            serverHello?: (graphwiz.core.IServerHello|null);

            /** Message positionUpdate */
            positionUpdate?: (graphwiz.core.IPositionUpdate|null);

            /** Message voiceData */
            voiceData?: (graphwiz.core.IVoiceData|null);

            /** Message entitySpawn */
            entitySpawn?: (graphwiz.core.IEntitySpawn|null);

            /** Message entityUpdate */
            entityUpdate?: (graphwiz.core.IEntityUpdate|null);

            /** Message entityDespawn */
            entityDespawn?: (graphwiz.core.IEntityDespawn|null);

            /** Message chatMessage */
            chatMessage?: (graphwiz.core.IChatMessage|null);

            /** Message presenceEvent */
            presenceEvent?: (graphwiz.core.IPresenceEvent|null);
        }

        /** Represents a Message. */
        class Message implements IMessage {

            /**
             * Constructs a new Message.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IMessage);

            /** Message messageId. */
            public messageId: string;

            /** Message timestamp. */
            public timestamp: (number|Long);

            /** Message type. */
            public type: graphwiz.core.MessageType;

            /** Message clientHello. */
            public clientHello?: (graphwiz.core.IClientHello|null);

            /** Message serverHello. */
            public serverHello?: (graphwiz.core.IServerHello|null);

            /** Message positionUpdate. */
            public positionUpdate?: (graphwiz.core.IPositionUpdate|null);

            /** Message voiceData. */
            public voiceData?: (graphwiz.core.IVoiceData|null);

            /** Message entitySpawn. */
            public entitySpawn?: (graphwiz.core.IEntitySpawn|null);

            /** Message entityUpdate. */
            public entityUpdate?: (graphwiz.core.IEntityUpdate|null);

            /** Message entityDespawn. */
            public entityDespawn?: (graphwiz.core.IEntityDespawn|null);

            /** Message chatMessage. */
            public chatMessage?: (graphwiz.core.IChatMessage|null);

            /** Message presenceEvent. */
            public presenceEvent?: (graphwiz.core.IPresenceEvent|null);

            /** Message payload. */
            public payload?: ("clientHello"|"serverHello"|"positionUpdate"|"voiceData"|"entitySpawn"|"entityUpdate"|"entityDespawn"|"chatMessage"|"presenceEvent");

            /**
             * Creates a new Message instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Message instance
             */
            public static create(properties?: graphwiz.core.IMessage): graphwiz.core.Message;

            /**
             * Encodes the specified Message message. Does not implicitly {@link graphwiz.core.Message.verify|verify} messages.
             * @param message Message message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Message message, length delimited. Does not implicitly {@link graphwiz.core.Message.verify|verify} messages.
             * @param message Message message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Message message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Message
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.Message;

            /**
             * Decodes a Message message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Message
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.Message;

            /**
             * Verifies a Message message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Message message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Message
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.Message;

            /**
             * Creates a plain object from a Message message. Also converts values to other types if specified.
             * @param message Message
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.Message, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Message to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Message
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** MessageType enum. */
        enum MessageType {
            UNKNOWN = 0,
            CLIENT_HELLO = 1,
            SERVER_HELLO = 2,
            POSITION_UPDATE = 10,
            VOICE_DATA = 11,
            ENTITY_SPAWN = 20,
            ENTITY_UPDATE = 21,
            ENTITY_DESPAWN = 22,
            CHAT_MESSAGE = 30,
            PRESENCE_JOIN = 40,
            PRESENCE_LEAVE = 41,
            PRESENCE_UPDATE = 42
        }

        /** Properties of a Vector3. */
        interface IVector3 {

            /** Vector3 x */
            x?: (number|null);

            /** Vector3 y */
            y?: (number|null);

            /** Vector3 z */
            z?: (number|null);
        }

        /** Represents a Vector3. */
        class Vector3 implements IVector3 {

            /**
             * Constructs a new Vector3.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IVector3);

            /** Vector3 x. */
            public x: number;

            /** Vector3 y. */
            public y: number;

            /** Vector3 z. */
            public z: number;

            /**
             * Creates a new Vector3 instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Vector3 instance
             */
            public static create(properties?: graphwiz.core.IVector3): graphwiz.core.Vector3;

            /**
             * Encodes the specified Vector3 message. Does not implicitly {@link graphwiz.core.Vector3.verify|verify} messages.
             * @param message Vector3 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IVector3, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Vector3 message, length delimited. Does not implicitly {@link graphwiz.core.Vector3.verify|verify} messages.
             * @param message Vector3 message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IVector3, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Vector3 message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Vector3
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.Vector3;

            /**
             * Decodes a Vector3 message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Vector3
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.Vector3;

            /**
             * Verifies a Vector3 message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Vector3 message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Vector3
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.Vector3;

            /**
             * Creates a plain object from a Vector3 message. Also converts values to other types if specified.
             * @param message Vector3
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.Vector3, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Vector3 to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Vector3
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Quaternion. */
        interface IQuaternion {

            /** Quaternion x */
            x?: (number|null);

            /** Quaternion y */
            y?: (number|null);

            /** Quaternion z */
            z?: (number|null);

            /** Quaternion w */
            w?: (number|null);
        }

        /** Represents a Quaternion. */
        class Quaternion implements IQuaternion {

            /**
             * Constructs a new Quaternion.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IQuaternion);

            /** Quaternion x. */
            public x: number;

            /** Quaternion y. */
            public y: number;

            /** Quaternion z. */
            public z: number;

            /** Quaternion w. */
            public w: number;

            /**
             * Creates a new Quaternion instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Quaternion instance
             */
            public static create(properties?: graphwiz.core.IQuaternion): graphwiz.core.Quaternion;

            /**
             * Encodes the specified Quaternion message. Does not implicitly {@link graphwiz.core.Quaternion.verify|verify} messages.
             * @param message Quaternion message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IQuaternion, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Quaternion message, length delimited. Does not implicitly {@link graphwiz.core.Quaternion.verify|verify} messages.
             * @param message Quaternion message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IQuaternion, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Quaternion message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Quaternion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.Quaternion;

            /**
             * Decodes a Quaternion message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Quaternion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.Quaternion;

            /**
             * Verifies a Quaternion message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Quaternion message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Quaternion
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.Quaternion;

            /**
             * Creates a plain object from a Quaternion message. Also converts values to other types if specified.
             * @param message Quaternion
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.Quaternion, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Quaternion to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Quaternion
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PositionUpdate. */
        interface IPositionUpdate {

            /** PositionUpdate entityId */
            entityId?: (string|null);

            /** PositionUpdate position */
            position?: (graphwiz.core.IVector3|null);

            /** PositionUpdate rotation */
            rotation?: (graphwiz.core.IQuaternion|null);

            /** PositionUpdate sequenceNumber */
            sequenceNumber?: (number|null);
        }

        /** Represents a PositionUpdate. */
        class PositionUpdate implements IPositionUpdate {

            /**
             * Constructs a new PositionUpdate.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IPositionUpdate);

            /** PositionUpdate entityId. */
            public entityId: string;

            /** PositionUpdate position. */
            public position?: (graphwiz.core.IVector3|null);

            /** PositionUpdate rotation. */
            public rotation?: (graphwiz.core.IQuaternion|null);

            /** PositionUpdate sequenceNumber. */
            public sequenceNumber: number;

            /**
             * Creates a new PositionUpdate instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PositionUpdate instance
             */
            public static create(properties?: graphwiz.core.IPositionUpdate): graphwiz.core.PositionUpdate;

            /**
             * Encodes the specified PositionUpdate message. Does not implicitly {@link graphwiz.core.PositionUpdate.verify|verify} messages.
             * @param message PositionUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IPositionUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PositionUpdate message, length delimited. Does not implicitly {@link graphwiz.core.PositionUpdate.verify|verify} messages.
             * @param message PositionUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IPositionUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PositionUpdate message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PositionUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.PositionUpdate;

            /**
             * Decodes a PositionUpdate message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PositionUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.PositionUpdate;

            /**
             * Verifies a PositionUpdate message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PositionUpdate message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PositionUpdate
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.PositionUpdate;

            /**
             * Creates a plain object from a PositionUpdate message. Also converts values to other types if specified.
             * @param message PositionUpdate
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.PositionUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PositionUpdate to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PositionUpdate
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a VoiceData. */
        interface IVoiceData {

            /** VoiceData fromClientId */
            fromClientId?: (string|null);

            /** VoiceData audioData */
            audioData?: (Uint8Array|null);

            /** VoiceData sequenceNumber */
            sequenceNumber?: (number|null);

            /** VoiceData codec */
            codec?: (graphwiz.core.VoiceCodec|null);
        }

        /** Represents a VoiceData. */
        class VoiceData implements IVoiceData {

            /**
             * Constructs a new VoiceData.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IVoiceData);

            /** VoiceData fromClientId. */
            public fromClientId: string;

            /** VoiceData audioData. */
            public audioData: Uint8Array;

            /** VoiceData sequenceNumber. */
            public sequenceNumber: number;

            /** VoiceData codec. */
            public codec: graphwiz.core.VoiceCodec;

            /**
             * Creates a new VoiceData instance using the specified properties.
             * @param [properties] Properties to set
             * @returns VoiceData instance
             */
            public static create(properties?: graphwiz.core.IVoiceData): graphwiz.core.VoiceData;

            /**
             * Encodes the specified VoiceData message. Does not implicitly {@link graphwiz.core.VoiceData.verify|verify} messages.
             * @param message VoiceData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IVoiceData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified VoiceData message, length delimited. Does not implicitly {@link graphwiz.core.VoiceData.verify|verify} messages.
             * @param message VoiceData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IVoiceData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a VoiceData message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns VoiceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.VoiceData;

            /**
             * Decodes a VoiceData message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns VoiceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.VoiceData;

            /**
             * Verifies a VoiceData message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a VoiceData message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns VoiceData
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.VoiceData;

            /**
             * Creates a plain object from a VoiceData message. Also converts values to other types if specified.
             * @param message VoiceData
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.VoiceData, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this VoiceData to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for VoiceData
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** VoiceCodec enum. */
        enum VoiceCodec {
            OPUS = 0,
            PCMU = 1,
            PCMA = 2
        }

        /** Properties of an EntitySpawn. */
        interface IEntitySpawn {

            /** EntitySpawn entityId */
            entityId?: (string|null);

            /** EntitySpawn templateId */
            templateId?: (string|null);

            /** EntitySpawn ownerId */
            ownerId?: (string|null);

            /** EntitySpawn components */
            components?: ({ [k: string]: string }|null);
        }

        /** Represents an EntitySpawn. */
        class EntitySpawn implements IEntitySpawn {

            /**
             * Constructs a new EntitySpawn.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IEntitySpawn);

            /** EntitySpawn entityId. */
            public entityId: string;

            /** EntitySpawn templateId. */
            public templateId: string;

            /** EntitySpawn ownerId. */
            public ownerId: string;

            /** EntitySpawn components. */
            public components: { [k: string]: string };

            /**
             * Creates a new EntitySpawn instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EntitySpawn instance
             */
            public static create(properties?: graphwiz.core.IEntitySpawn): graphwiz.core.EntitySpawn;

            /**
             * Encodes the specified EntitySpawn message. Does not implicitly {@link graphwiz.core.EntitySpawn.verify|verify} messages.
             * @param message EntitySpawn message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IEntitySpawn, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EntitySpawn message, length delimited. Does not implicitly {@link graphwiz.core.EntitySpawn.verify|verify} messages.
             * @param message EntitySpawn message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IEntitySpawn, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EntitySpawn message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EntitySpawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.EntitySpawn;

            /**
             * Decodes an EntitySpawn message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EntitySpawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.EntitySpawn;

            /**
             * Verifies an EntitySpawn message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EntitySpawn message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EntitySpawn
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.EntitySpawn;

            /**
             * Creates a plain object from an EntitySpawn message. Also converts values to other types if specified.
             * @param message EntitySpawn
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.EntitySpawn, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EntitySpawn to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EntitySpawn
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EntityUpdate. */
        interface IEntityUpdate {

            /** EntityUpdate entityId */
            entityId?: (string|null);

            /** EntityUpdate components */
            components?: ({ [k: string]: Uint8Array }|null);
        }

        /** Represents an EntityUpdate. */
        class EntityUpdate implements IEntityUpdate {

            /**
             * Constructs a new EntityUpdate.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IEntityUpdate);

            /** EntityUpdate entityId. */
            public entityId: string;

            /** EntityUpdate components. */
            public components: { [k: string]: Uint8Array };

            /**
             * Creates a new EntityUpdate instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EntityUpdate instance
             */
            public static create(properties?: graphwiz.core.IEntityUpdate): graphwiz.core.EntityUpdate;

            /**
             * Encodes the specified EntityUpdate message. Does not implicitly {@link graphwiz.core.EntityUpdate.verify|verify} messages.
             * @param message EntityUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IEntityUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EntityUpdate message, length delimited. Does not implicitly {@link graphwiz.core.EntityUpdate.verify|verify} messages.
             * @param message EntityUpdate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IEntityUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EntityUpdate message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EntityUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.EntityUpdate;

            /**
             * Decodes an EntityUpdate message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EntityUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.EntityUpdate;

            /**
             * Verifies an EntityUpdate message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EntityUpdate message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EntityUpdate
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.EntityUpdate;

            /**
             * Creates a plain object from an EntityUpdate message. Also converts values to other types if specified.
             * @param message EntityUpdate
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.EntityUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EntityUpdate to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EntityUpdate
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EntityDespawn. */
        interface IEntityDespawn {

            /** EntityDespawn entityId */
            entityId?: (string|null);
        }

        /** Represents an EntityDespawn. */
        class EntityDespawn implements IEntityDespawn {

            /**
             * Constructs a new EntityDespawn.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IEntityDespawn);

            /** EntityDespawn entityId. */
            public entityId: string;

            /**
             * Creates a new EntityDespawn instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EntityDespawn instance
             */
            public static create(properties?: graphwiz.core.IEntityDespawn): graphwiz.core.EntityDespawn;

            /**
             * Encodes the specified EntityDespawn message. Does not implicitly {@link graphwiz.core.EntityDespawn.verify|verify} messages.
             * @param message EntityDespawn message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IEntityDespawn, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EntityDespawn message, length delimited. Does not implicitly {@link graphwiz.core.EntityDespawn.verify|verify} messages.
             * @param message EntityDespawn message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IEntityDespawn, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EntityDespawn message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EntityDespawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.EntityDespawn;

            /**
             * Decodes an EntityDespawn message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EntityDespawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.EntityDespawn;

            /**
             * Verifies an EntityDespawn message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EntityDespawn message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EntityDespawn
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.EntityDespawn;

            /**
             * Creates a plain object from an EntityDespawn message. Also converts values to other types if specified.
             * @param message EntityDespawn
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.EntityDespawn, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EntityDespawn to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EntityDespawn
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ChatMessage. */
        interface IChatMessage {

            /** ChatMessage fromClientId */
            fromClientId?: (string|null);

            /** ChatMessage message */
            message?: (string|null);

            /** ChatMessage timestamp */
            timestamp?: (number|Long|null);

            /** ChatMessage type */
            type?: (graphwiz.core.ChatMessageType|null);
        }

        /** Represents a ChatMessage. */
        class ChatMessage implements IChatMessage {

            /**
             * Constructs a new ChatMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IChatMessage);

            /** ChatMessage fromClientId. */
            public fromClientId: string;

            /** ChatMessage message. */
            public message: string;

            /** ChatMessage timestamp. */
            public timestamp: (number|Long);

            /** ChatMessage type. */
            public type: graphwiz.core.ChatMessageType;

            /**
             * Creates a new ChatMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ChatMessage instance
             */
            public static create(properties?: graphwiz.core.IChatMessage): graphwiz.core.ChatMessage;

            /**
             * Encodes the specified ChatMessage message. Does not implicitly {@link graphwiz.core.ChatMessage.verify|verify} messages.
             * @param message ChatMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IChatMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ChatMessage message, length delimited. Does not implicitly {@link graphwiz.core.ChatMessage.verify|verify} messages.
             * @param message ChatMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IChatMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ChatMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ChatMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.ChatMessage;

            /**
             * Decodes a ChatMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ChatMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.ChatMessage;

            /**
             * Verifies a ChatMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ChatMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ChatMessage
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.ChatMessage;

            /**
             * Creates a plain object from a ChatMessage message. Also converts values to other types if specified.
             * @param message ChatMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.ChatMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ChatMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ChatMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** ChatMessageType enum. */
        enum ChatMessageType {
            NORMAL = 0,
            WHISPER = 1,
            SHOUT = 2
        }

        /** Properties of a PresenceEvent. */
        interface IPresenceEvent {

            /** PresenceEvent clientId */
            clientId?: (string|null);

            /** PresenceEvent eventType */
            eventType?: (graphwiz.core.PresenceEventType|null);

            /** PresenceEvent data */
            data?: (graphwiz.core.IPresenceData|null);
        }

        /** Represents a PresenceEvent. */
        class PresenceEvent implements IPresenceEvent {

            /**
             * Constructs a new PresenceEvent.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IPresenceEvent);

            /** PresenceEvent clientId. */
            public clientId: string;

            /** PresenceEvent eventType. */
            public eventType: graphwiz.core.PresenceEventType;

            /** PresenceEvent data. */
            public data?: (graphwiz.core.IPresenceData|null);

            /**
             * Creates a new PresenceEvent instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PresenceEvent instance
             */
            public static create(properties?: graphwiz.core.IPresenceEvent): graphwiz.core.PresenceEvent;

            /**
             * Encodes the specified PresenceEvent message. Does not implicitly {@link graphwiz.core.PresenceEvent.verify|verify} messages.
             * @param message PresenceEvent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IPresenceEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PresenceEvent message, length delimited. Does not implicitly {@link graphwiz.core.PresenceEvent.verify|verify} messages.
             * @param message PresenceEvent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IPresenceEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PresenceEvent message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PresenceEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.PresenceEvent;

            /**
             * Decodes a PresenceEvent message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PresenceEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.PresenceEvent;

            /**
             * Verifies a PresenceEvent message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PresenceEvent message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PresenceEvent
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.PresenceEvent;

            /**
             * Creates a plain object from a PresenceEvent message. Also converts values to other types if specified.
             * @param message PresenceEvent
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.PresenceEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PresenceEvent to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PresenceEvent
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** PresenceEventType enum. */
        enum PresenceEventType {
            JOIN = 0,
            LEAVE = 1,
            UPDATE = 2
        }

        /** Properties of a PresenceData. */
        interface IPresenceData {

            /** PresenceData displayName */
            displayName?: (string|null);

            /** PresenceData avatarUrl */
            avatarUrl?: (string|null);

            /** PresenceData position */
            position?: (graphwiz.core.IVector3|null);

            /** PresenceData rotation */
            rotation?: (graphwiz.core.IQuaternion|null);
        }

        /** Represents a PresenceData. */
        class PresenceData implements IPresenceData {

            /**
             * Constructs a new PresenceData.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IPresenceData);

            /** PresenceData displayName. */
            public displayName: string;

            /** PresenceData avatarUrl. */
            public avatarUrl: string;

            /** PresenceData position. */
            public position?: (graphwiz.core.IVector3|null);

            /** PresenceData rotation. */
            public rotation?: (graphwiz.core.IQuaternion|null);

            /**
             * Creates a new PresenceData instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PresenceData instance
             */
            public static create(properties?: graphwiz.core.IPresenceData): graphwiz.core.PresenceData;

            /**
             * Encodes the specified PresenceData message. Does not implicitly {@link graphwiz.core.PresenceData.verify|verify} messages.
             * @param message PresenceData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IPresenceData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PresenceData message, length delimited. Does not implicitly {@link graphwiz.core.PresenceData.verify|verify} messages.
             * @param message PresenceData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IPresenceData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PresenceData message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PresenceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.PresenceData;

            /**
             * Decodes a PresenceData message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PresenceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.PresenceData;

            /**
             * Verifies a PresenceData message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PresenceData message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PresenceData
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.PresenceData;

            /**
             * Creates a plain object from a PresenceData message. Also converts values to other types if specified.
             * @param message PresenceData
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.PresenceData, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PresenceData to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PresenceData
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ClientHello. */
        interface IClientHello {

            /** ClientHello clientId */
            clientId?: (string|null);

            /** ClientHello displayName */
            displayName?: (string|null);

            /** ClientHello authToken */
            authToken?: (string|null);

            /** ClientHello requestedRoom */
            requestedRoom?: (string|null);
        }

        /** Represents a ClientHello. */
        class ClientHello implements IClientHello {

            /**
             * Constructs a new ClientHello.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IClientHello);

            /** ClientHello clientId. */
            public clientId: string;

            /** ClientHello displayName. */
            public displayName: string;

            /** ClientHello authToken. */
            public authToken: string;

            /** ClientHello requestedRoom. */
            public requestedRoom: string;

            /**
             * Creates a new ClientHello instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ClientHello instance
             */
            public static create(properties?: graphwiz.core.IClientHello): graphwiz.core.ClientHello;

            /**
             * Encodes the specified ClientHello message. Does not implicitly {@link graphwiz.core.ClientHello.verify|verify} messages.
             * @param message ClientHello message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IClientHello, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ClientHello message, length delimited. Does not implicitly {@link graphwiz.core.ClientHello.verify|verify} messages.
             * @param message ClientHello message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IClientHello, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ClientHello message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ClientHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.ClientHello;

            /**
             * Decodes a ClientHello message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ClientHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.ClientHello;

            /**
             * Verifies a ClientHello message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ClientHello message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ClientHello
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.ClientHello;

            /**
             * Creates a plain object from a ClientHello message. Also converts values to other types if specified.
             * @param message ClientHello
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.ClientHello, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ClientHello to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ClientHello
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ServerHello. */
        interface IServerHello {

            /** ServerHello serverVersion */
            serverVersion?: (string|null);

            /** ServerHello assignedClientId */
            assignedClientId?: (string|null);

            /** ServerHello roomId */
            roomId?: (string|null);

            /** ServerHello initialState */
            initialState?: (graphwiz.core.IWorldState|null);
        }

        /** Represents a ServerHello. */
        class ServerHello implements IServerHello {

            /**
             * Constructs a new ServerHello.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IServerHello);

            /** ServerHello serverVersion. */
            public serverVersion: string;

            /** ServerHello assignedClientId. */
            public assignedClientId: string;

            /** ServerHello roomId. */
            public roomId: string;

            /** ServerHello initialState. */
            public initialState?: (graphwiz.core.IWorldState|null);

            /**
             * Creates a new ServerHello instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServerHello instance
             */
            public static create(properties?: graphwiz.core.IServerHello): graphwiz.core.ServerHello;

            /**
             * Encodes the specified ServerHello message. Does not implicitly {@link graphwiz.core.ServerHello.verify|verify} messages.
             * @param message ServerHello message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IServerHello, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServerHello message, length delimited. Does not implicitly {@link graphwiz.core.ServerHello.verify|verify} messages.
             * @param message ServerHello message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IServerHello, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServerHello message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServerHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.ServerHello;

            /**
             * Decodes a ServerHello message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServerHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.ServerHello;

            /**
             * Verifies a ServerHello message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServerHello message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServerHello
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.ServerHello;

            /**
             * Creates a plain object from a ServerHello message. Also converts values to other types if specified.
             * @param message ServerHello
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.ServerHello, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServerHello to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ServerHello
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WorldState. */
        interface IWorldState {

            /** WorldState entities */
            entities?: (graphwiz.core.IEntitySnapshot[]|null);

            /** WorldState players */
            players?: (graphwiz.core.IPlayerSnapshot[]|null);

            /** WorldState lastUpdate */
            lastUpdate?: (number|Long|null);
        }

        /** Represents a WorldState. */
        class WorldState implements IWorldState {

            /**
             * Constructs a new WorldState.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IWorldState);

            /** WorldState entities. */
            public entities: graphwiz.core.IEntitySnapshot[];

            /** WorldState players. */
            public players: graphwiz.core.IPlayerSnapshot[];

            /** WorldState lastUpdate. */
            public lastUpdate: (number|Long);

            /**
             * Creates a new WorldState instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WorldState instance
             */
            public static create(properties?: graphwiz.core.IWorldState): graphwiz.core.WorldState;

            /**
             * Encodes the specified WorldState message. Does not implicitly {@link graphwiz.core.WorldState.verify|verify} messages.
             * @param message WorldState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IWorldState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WorldState message, length delimited. Does not implicitly {@link graphwiz.core.WorldState.verify|verify} messages.
             * @param message WorldState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IWorldState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WorldState message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WorldState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.WorldState;

            /**
             * Decodes a WorldState message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WorldState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.WorldState;

            /**
             * Verifies a WorldState message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WorldState message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WorldState
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.WorldState;

            /**
             * Creates a plain object from a WorldState message. Also converts values to other types if specified.
             * @param message WorldState
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.WorldState, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WorldState to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WorldState
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EntitySnapshot. */
        interface IEntitySnapshot {

            /** EntitySnapshot id */
            id?: (string|null);

            /** EntitySnapshot templateId */
            templateId?: (string|null);

            /** EntitySnapshot position */
            position?: (graphwiz.core.IVector3|null);

            /** EntitySnapshot rotation */
            rotation?: (graphwiz.core.IQuaternion|null);

            /** EntitySnapshot components */
            components?: ({ [k: string]: string }|null);
        }

        /** Represents an EntitySnapshot. */
        class EntitySnapshot implements IEntitySnapshot {

            /**
             * Constructs a new EntitySnapshot.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IEntitySnapshot);

            /** EntitySnapshot id. */
            public id: string;

            /** EntitySnapshot templateId. */
            public templateId: string;

            /** EntitySnapshot position. */
            public position?: (graphwiz.core.IVector3|null);

            /** EntitySnapshot rotation. */
            public rotation?: (graphwiz.core.IQuaternion|null);

            /** EntitySnapshot components. */
            public components: { [k: string]: string };

            /**
             * Creates a new EntitySnapshot instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EntitySnapshot instance
             */
            public static create(properties?: graphwiz.core.IEntitySnapshot): graphwiz.core.EntitySnapshot;

            /**
             * Encodes the specified EntitySnapshot message. Does not implicitly {@link graphwiz.core.EntitySnapshot.verify|verify} messages.
             * @param message EntitySnapshot message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IEntitySnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EntitySnapshot message, length delimited. Does not implicitly {@link graphwiz.core.EntitySnapshot.verify|verify} messages.
             * @param message EntitySnapshot message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IEntitySnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EntitySnapshot message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EntitySnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.EntitySnapshot;

            /**
             * Decodes an EntitySnapshot message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EntitySnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.EntitySnapshot;

            /**
             * Verifies an EntitySnapshot message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EntitySnapshot message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EntitySnapshot
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.EntitySnapshot;

            /**
             * Creates a plain object from an EntitySnapshot message. Also converts values to other types if specified.
             * @param message EntitySnapshot
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.EntitySnapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EntitySnapshot to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EntitySnapshot
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PlayerSnapshot. */
        interface IPlayerSnapshot {

            /** PlayerSnapshot clientId */
            clientId?: (string|null);

            /** PlayerSnapshot displayName */
            displayName?: (string|null);

            /** PlayerSnapshot avatarUrl */
            avatarUrl?: (string|null);

            /** PlayerSnapshot position */
            position?: (graphwiz.core.IVector3|null);

            /** PlayerSnapshot rotation */
            rotation?: (graphwiz.core.IQuaternion|null);
        }

        /** Represents a PlayerSnapshot. */
        class PlayerSnapshot implements IPlayerSnapshot {

            /**
             * Constructs a new PlayerSnapshot.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IPlayerSnapshot);

            /** PlayerSnapshot clientId. */
            public clientId: string;

            /** PlayerSnapshot displayName. */
            public displayName: string;

            /** PlayerSnapshot avatarUrl. */
            public avatarUrl: string;

            /** PlayerSnapshot position. */
            public position?: (graphwiz.core.IVector3|null);

            /** PlayerSnapshot rotation. */
            public rotation?: (graphwiz.core.IQuaternion|null);

            /**
             * Creates a new PlayerSnapshot instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PlayerSnapshot instance
             */
            public static create(properties?: graphwiz.core.IPlayerSnapshot): graphwiz.core.PlayerSnapshot;

            /**
             * Encodes the specified PlayerSnapshot message. Does not implicitly {@link graphwiz.core.PlayerSnapshot.verify|verify} messages.
             * @param message PlayerSnapshot message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IPlayerSnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PlayerSnapshot message, length delimited. Does not implicitly {@link graphwiz.core.PlayerSnapshot.verify|verify} messages.
             * @param message PlayerSnapshot message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IPlayerSnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PlayerSnapshot message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PlayerSnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.PlayerSnapshot;

            /**
             * Decodes a PlayerSnapshot message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PlayerSnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.PlayerSnapshot;

            /**
             * Verifies a PlayerSnapshot message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PlayerSnapshot message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PlayerSnapshot
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.PlayerSnapshot;

            /**
             * Creates a plain object from a PlayerSnapshot message. Also converts values to other types if specified.
             * @param message PlayerSnapshot
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.PlayerSnapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PlayerSnapshot to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PlayerSnapshot
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace networking. */
    namespace networking {

        /** Represents a RoomService */
        class RoomService extends $protobuf.rpc.Service {

            /**
             * Constructs a new RoomService service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new RoomService service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): RoomService;

            /**
             * Calls ConnectToRoom.
             * @param request ClientMessage message or plain object
             * @param callback Node-style callback called with the error, if any, and ServerMessage
             */
            public connectToRoom(request: graphwiz.networking.IClientMessage, callback: graphwiz.networking.RoomService.ConnectToRoomCallback): void;

            /**
             * Calls ConnectToRoom.
             * @param request ClientMessage message or plain object
             * @returns Promise
             */
            public connectToRoom(request: graphwiz.networking.IClientMessage): Promise<graphwiz.networking.ServerMessage>;

            /**
             * Calls JoinRoom.
             * @param request JoinRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and JoinResponse
             */
            public joinRoom(request: graphwiz.networking.IJoinRequest, callback: graphwiz.networking.RoomService.JoinRoomCallback): void;

            /**
             * Calls JoinRoom.
             * @param request JoinRequest message or plain object
             * @returns Promise
             */
            public joinRoom(request: graphwiz.networking.IJoinRequest): Promise<graphwiz.networking.JoinResponse>;

            /**
             * Calls LeaveRoom.
             * @param request LeaveRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and LeaveResponse
             */
            public leaveRoom(request: graphwiz.networking.ILeaveRequest, callback: graphwiz.networking.RoomService.LeaveRoomCallback): void;

            /**
             * Calls LeaveRoom.
             * @param request LeaveRequest message or plain object
             * @returns Promise
             */
            public leaveRoom(request: graphwiz.networking.ILeaveRequest): Promise<graphwiz.networking.LeaveResponse>;

            /**
             * Calls WatchPresence.
             * @param request PresenceRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and PresenceEvent
             */
            public watchPresence(request: graphwiz.networking.IPresenceRequest, callback: graphwiz.networking.RoomService.WatchPresenceCallback): void;

            /**
             * Calls WatchPresence.
             * @param request PresenceRequest message or plain object
             * @returns Promise
             */
            public watchPresence(request: graphwiz.networking.IPresenceRequest): Promise<graphwiz.core.PresenceEvent>;
        }

        namespace RoomService {

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#connectToRoom}.
             * @param error Error, if any
             * @param [response] ServerMessage
             */
            type ConnectToRoomCallback = (error: (Error|null), response?: graphwiz.networking.ServerMessage) => void;

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#joinRoom}.
             * @param error Error, if any
             * @param [response] JoinResponse
             */
            type JoinRoomCallback = (error: (Error|null), response?: graphwiz.networking.JoinResponse) => void;

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#leaveRoom}.
             * @param error Error, if any
             * @param [response] LeaveResponse
             */
            type LeaveRoomCallback = (error: (Error|null), response?: graphwiz.networking.LeaveResponse) => void;

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#watchPresence}.
             * @param error Error, if any
             * @param [response] PresenceEvent
             */
            type WatchPresenceCallback = (error: (Error|null), response?: graphwiz.core.PresenceEvent) => void;
        }

        /** Properties of a ClientMessage. */
        interface IClientMessage {

            /** ClientMessage position */
            position?: (graphwiz.core.IPositionUpdate|null);

            /** ClientMessage voice */
            voice?: (graphwiz.core.IVoiceData|null);

            /** ClientMessage entity */
            entity?: (graphwiz.core.IEntityUpdate|null);

            /** ClientMessage chat */
            chat?: (graphwiz.core.IChatMessage|null);
        }

        /** Represents a ClientMessage. */
        class ClientMessage implements IClientMessage {

            /**
             * Constructs a new ClientMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.IClientMessage);

            /** ClientMessage position. */
            public position?: (graphwiz.core.IPositionUpdate|null);

            /** ClientMessage voice. */
            public voice?: (graphwiz.core.IVoiceData|null);

            /** ClientMessage entity. */
            public entity?: (graphwiz.core.IEntityUpdate|null);

            /** ClientMessage chat. */
            public chat?: (graphwiz.core.IChatMessage|null);

            /** ClientMessage payload. */
            public payload?: ("position"|"voice"|"entity"|"chat");

            /**
             * Creates a new ClientMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ClientMessage instance
             */
            public static create(properties?: graphwiz.networking.IClientMessage): graphwiz.networking.ClientMessage;

            /**
             * Encodes the specified ClientMessage message. Does not implicitly {@link graphwiz.networking.ClientMessage.verify|verify} messages.
             * @param message ClientMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.IClientMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ClientMessage message, length delimited. Does not implicitly {@link graphwiz.networking.ClientMessage.verify|verify} messages.
             * @param message ClientMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.IClientMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ClientMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ClientMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.ClientMessage;

            /**
             * Decodes a ClientMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ClientMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.ClientMessage;

            /**
             * Verifies a ClientMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ClientMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ClientMessage
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.ClientMessage;

            /**
             * Creates a plain object from a ClientMessage message. Also converts values to other types if specified.
             * @param message ClientMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.ClientMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ClientMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ClientMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ServerMessage. */
        interface IServerMessage {

            /** ServerMessage worldState */
            worldState?: (graphwiz.core.IWorldState|null);

            /** ServerMessage presence */
            presence?: (graphwiz.core.IPresenceEvent|null);

            /** ServerMessage entitySpawn */
            entitySpawn?: (graphwiz.core.IEntitySpawn|null);

            /** ServerMessage entityUpdate */
            entityUpdate?: (graphwiz.core.IEntityUpdate|null);

            /** ServerMessage entityDespawn */
            entityDespawn?: (graphwiz.core.IEntityDespawn|null);

            /** ServerMessage chat */
            chat?: (graphwiz.core.IChatMessage|null);
        }

        /** Represents a ServerMessage. */
        class ServerMessage implements IServerMessage {

            /**
             * Constructs a new ServerMessage.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.IServerMessage);

            /** ServerMessage worldState. */
            public worldState?: (graphwiz.core.IWorldState|null);

            /** ServerMessage presence. */
            public presence?: (graphwiz.core.IPresenceEvent|null);

            /** ServerMessage entitySpawn. */
            public entitySpawn?: (graphwiz.core.IEntitySpawn|null);

            /** ServerMessage entityUpdate. */
            public entityUpdate?: (graphwiz.core.IEntityUpdate|null);

            /** ServerMessage entityDespawn. */
            public entityDespawn?: (graphwiz.core.IEntityDespawn|null);

            /** ServerMessage chat. */
            public chat?: (graphwiz.core.IChatMessage|null);

            /** ServerMessage payload. */
            public payload?: ("worldState"|"presence"|"entitySpawn"|"entityUpdate"|"entityDespawn"|"chat");

            /**
             * Creates a new ServerMessage instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServerMessage instance
             */
            public static create(properties?: graphwiz.networking.IServerMessage): graphwiz.networking.ServerMessage;

            /**
             * Encodes the specified ServerMessage message. Does not implicitly {@link graphwiz.networking.ServerMessage.verify|verify} messages.
             * @param message ServerMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.IServerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServerMessage message, length delimited. Does not implicitly {@link graphwiz.networking.ServerMessage.verify|verify} messages.
             * @param message ServerMessage message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.IServerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServerMessage message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServerMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.ServerMessage;

            /**
             * Decodes a ServerMessage message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServerMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.ServerMessage;

            /**
             * Verifies a ServerMessage message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServerMessage message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServerMessage
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.ServerMessage;

            /**
             * Creates a plain object from a ServerMessage message. Also converts values to other types if specified.
             * @param message ServerMessage
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.ServerMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServerMessage to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ServerMessage
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a JoinRequest. */
        interface IJoinRequest {

            /** JoinRequest roomId */
            roomId?: (string|null);

            /** JoinRequest authToken */
            authToken?: (string|null);

            /** JoinRequest displayName */
            displayName?: (string|null);
        }

        /** Represents a JoinRequest. */
        class JoinRequest implements IJoinRequest {

            /**
             * Constructs a new JoinRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.IJoinRequest);

            /** JoinRequest roomId. */
            public roomId: string;

            /** JoinRequest authToken. */
            public authToken: string;

            /** JoinRequest displayName. */
            public displayName: string;

            /**
             * Creates a new JoinRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinRequest instance
             */
            public static create(properties?: graphwiz.networking.IJoinRequest): graphwiz.networking.JoinRequest;

            /**
             * Encodes the specified JoinRequest message. Does not implicitly {@link graphwiz.networking.JoinRequest.verify|verify} messages.
             * @param message JoinRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.IJoinRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinRequest message, length delimited. Does not implicitly {@link graphwiz.networking.JoinRequest.verify|verify} messages.
             * @param message JoinRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.IJoinRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.JoinRequest;

            /**
             * Decodes a JoinRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.JoinRequest;

            /**
             * Verifies a JoinRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.JoinRequest;

            /**
             * Creates a plain object from a JoinRequest message. Also converts values to other types if specified.
             * @param message JoinRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.JoinRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for JoinRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a JoinResponse. */
        interface IJoinResponse {

            /** JoinResponse success */
            success?: (boolean|null);

            /** JoinResponse roomId */
            roomId?: (string|null);

            /** JoinResponse assignedClientId */
            assignedClientId?: (string|null);

            /** JoinResponse initialState */
            initialState?: (graphwiz.core.IWorldState|null);
        }

        /** Represents a JoinResponse. */
        class JoinResponse implements IJoinResponse {

            /**
             * Constructs a new JoinResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.IJoinResponse);

            /** JoinResponse success. */
            public success: boolean;

            /** JoinResponse roomId. */
            public roomId: string;

            /** JoinResponse assignedClientId. */
            public assignedClientId: string;

            /** JoinResponse initialState. */
            public initialState?: (graphwiz.core.IWorldState|null);

            /**
             * Creates a new JoinResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinResponse instance
             */
            public static create(properties?: graphwiz.networking.IJoinResponse): graphwiz.networking.JoinResponse;

            /**
             * Encodes the specified JoinResponse message. Does not implicitly {@link graphwiz.networking.JoinResponse.verify|verify} messages.
             * @param message JoinResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.IJoinResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinResponse message, length delimited. Does not implicitly {@link graphwiz.networking.JoinResponse.verify|verify} messages.
             * @param message JoinResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.IJoinResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.JoinResponse;

            /**
             * Decodes a JoinResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.JoinResponse;

            /**
             * Verifies a JoinResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.JoinResponse;

            /**
             * Creates a plain object from a JoinResponse message. Also converts values to other types if specified.
             * @param message JoinResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.JoinResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for JoinResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a LeaveRequest. */
        interface ILeaveRequest {

            /** LeaveRequest roomId */
            roomId?: (string|null);

            /** LeaveRequest clientId */
            clientId?: (string|null);
        }

        /** Represents a LeaveRequest. */
        class LeaveRequest implements ILeaveRequest {

            /**
             * Constructs a new LeaveRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.ILeaveRequest);

            /** LeaveRequest roomId. */
            public roomId: string;

            /** LeaveRequest clientId. */
            public clientId: string;

            /**
             * Creates a new LeaveRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LeaveRequest instance
             */
            public static create(properties?: graphwiz.networking.ILeaveRequest): graphwiz.networking.LeaveRequest;

            /**
             * Encodes the specified LeaveRequest message. Does not implicitly {@link graphwiz.networking.LeaveRequest.verify|verify} messages.
             * @param message LeaveRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.ILeaveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LeaveRequest message, length delimited. Does not implicitly {@link graphwiz.networking.LeaveRequest.verify|verify} messages.
             * @param message LeaveRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.ILeaveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LeaveRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LeaveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.LeaveRequest;

            /**
             * Decodes a LeaveRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LeaveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.LeaveRequest;

            /**
             * Verifies a LeaveRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LeaveRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LeaveRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.LeaveRequest;

            /**
             * Creates a plain object from a LeaveRequest message. Also converts values to other types if specified.
             * @param message LeaveRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.LeaveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LeaveRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LeaveRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a LeaveResponse. */
        interface ILeaveResponse {

            /** LeaveResponse success */
            success?: (boolean|null);
        }

        /** Represents a LeaveResponse. */
        class LeaveResponse implements ILeaveResponse {

            /**
             * Constructs a new LeaveResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.ILeaveResponse);

            /** LeaveResponse success. */
            public success: boolean;

            /**
             * Creates a new LeaveResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LeaveResponse instance
             */
            public static create(properties?: graphwiz.networking.ILeaveResponse): graphwiz.networking.LeaveResponse;

            /**
             * Encodes the specified LeaveResponse message. Does not implicitly {@link graphwiz.networking.LeaveResponse.verify|verify} messages.
             * @param message LeaveResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.ILeaveResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LeaveResponse message, length delimited. Does not implicitly {@link graphwiz.networking.LeaveResponse.verify|verify} messages.
             * @param message LeaveResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.ILeaveResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LeaveResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LeaveResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.LeaveResponse;

            /**
             * Decodes a LeaveResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LeaveResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.LeaveResponse;

            /**
             * Verifies a LeaveResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LeaveResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LeaveResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.LeaveResponse;

            /**
             * Creates a plain object from a LeaveResponse message. Also converts values to other types if specified.
             * @param message LeaveResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.LeaveResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LeaveResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LeaveResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a PresenceRequest. */
        interface IPresenceRequest {

            /** PresenceRequest roomId */
            roomId?: (string|null);
        }

        /** Represents a PresenceRequest. */
        class PresenceRequest implements IPresenceRequest {

            /**
             * Constructs a new PresenceRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.networking.IPresenceRequest);

            /** PresenceRequest roomId. */
            public roomId: string;

            /**
             * Creates a new PresenceRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PresenceRequest instance
             */
            public static create(properties?: graphwiz.networking.IPresenceRequest): graphwiz.networking.PresenceRequest;

            /**
             * Encodes the specified PresenceRequest message. Does not implicitly {@link graphwiz.networking.PresenceRequest.verify|verify} messages.
             * @param message PresenceRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.networking.IPresenceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PresenceRequest message, length delimited. Does not implicitly {@link graphwiz.networking.PresenceRequest.verify|verify} messages.
             * @param message PresenceRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.networking.IPresenceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PresenceRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PresenceRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.networking.PresenceRequest;

            /**
             * Decodes a PresenceRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PresenceRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.networking.PresenceRequest;

            /**
             * Verifies a PresenceRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PresenceRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PresenceRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.networking.PresenceRequest;

            /**
             * Creates a plain object from a PresenceRequest message. Also converts values to other types if specified.
             * @param message PresenceRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.networking.PresenceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PresenceRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for PresenceRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
