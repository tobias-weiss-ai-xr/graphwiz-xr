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

        /** Properties of a Room. */
        interface IRoom {

            /** Room id */
            id?: (string|null);

            /** Room name */
            name?: (string|null);

            /** Room description */
            description?: (string|null);

            /** Room settings */
            settings?: (graphwiz.core.IRoomSettings|null);

            /** Room createdAt */
            createdAt?: (number|Long|null);

            /** Room updatedAt */
            updatedAt?: (number|Long|null);

            /** Room creatorId */
            creatorId?: (string|null);

            /** Room currentPlayers */
            currentPlayers?: (number|null);

            /** Room tags */
            tags?: (string[]|null);

            /** Room metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents a Room. */
        class Room implements IRoom {

            /**
             * Constructs a new Room.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IRoom);

            /** Room id. */
            public id: string;

            /** Room name. */
            public name: string;

            /** Room description. */
            public description: string;

            /** Room settings. */
            public settings?: (graphwiz.core.IRoomSettings|null);

            /** Room createdAt. */
            public createdAt: (number|Long);

            /** Room updatedAt. */
            public updatedAt: (number|Long);

            /** Room creatorId. */
            public creatorId: string;

            /** Room currentPlayers. */
            public currentPlayers: number;

            /** Room tags. */
            public tags: string[];

            /** Room metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new Room instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Room instance
             */
            public static create(properties?: graphwiz.core.IRoom): graphwiz.core.Room;

            /**
             * Encodes the specified Room message. Does not implicitly {@link graphwiz.core.Room.verify|verify} messages.
             * @param message Room message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IRoom, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Room message, length delimited. Does not implicitly {@link graphwiz.core.Room.verify|verify} messages.
             * @param message Room message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IRoom, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Room message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Room
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.Room;

            /**
             * Decodes a Room message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Room
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.Room;

            /**
             * Verifies a Room message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Room message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Room
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.Room;

            /**
             * Creates a plain object from a Room message. Also converts values to other types if specified.
             * @param message Room
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.Room, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Room to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Room
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RoomSettings. */
        interface IRoomSettings {

            /** RoomSettings maxPlayers */
            maxPlayers?: (number|null);

            /** RoomSettings isPublic */
            isPublic?: (boolean|null);

            /** RoomSettings allowVoiceChat */
            allowVoiceChat?: (boolean|null);

            /** RoomSettings allowTextChat */
            allowTextChat?: (boolean|null);

            /** RoomSettings allowInvites */
            allowInvites?: (boolean|null);

            /** RoomSettings maxSpectators */
            maxSpectators?: (number|null);

            /** RoomSettings requireApproval */
            requireApproval?: (boolean|null);
        }

        /** Represents a RoomSettings. */
        class RoomSettings implements IRoomSettings {

            /**
             * Constructs a new RoomSettings.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IRoomSettings);

            /** RoomSettings maxPlayers. */
            public maxPlayers: number;

            /** RoomSettings isPublic. */
            public isPublic: boolean;

            /** RoomSettings allowVoiceChat. */
            public allowVoiceChat: boolean;

            /** RoomSettings allowTextChat. */
            public allowTextChat: boolean;

            /** RoomSettings allowInvites. */
            public allowInvites: boolean;

            /** RoomSettings maxSpectators. */
            public maxSpectators: number;

            /** RoomSettings requireApproval. */
            public requireApproval: boolean;

            /**
             * Creates a new RoomSettings instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RoomSettings instance
             */
            public static create(properties?: graphwiz.core.IRoomSettings): graphwiz.core.RoomSettings;

            /**
             * Encodes the specified RoomSettings message. Does not implicitly {@link graphwiz.core.RoomSettings.verify|verify} messages.
             * @param message RoomSettings message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IRoomSettings, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RoomSettings message, length delimited. Does not implicitly {@link graphwiz.core.RoomSettings.verify|verify} messages.
             * @param message RoomSettings message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IRoomSettings, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RoomSettings message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RoomSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.RoomSettings;

            /**
             * Decodes a RoomSettings message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RoomSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.RoomSettings;

            /**
             * Verifies a RoomSettings message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RoomSettings message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RoomSettings
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.RoomSettings;

            /**
             * Creates a plain object from a RoomSettings message. Also converts values to other types if specified.
             * @param message RoomSettings
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.RoomSettings, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RoomSettings to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RoomSettings
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a User. */
        interface IUser {

            /** User id */
            id?: (string|null);

            /** User username */
            username?: (string|null);

            /** User displayName */
            displayName?: (string|null);

            /** User email */
            email?: (string|null);

            /** User avatarUrl */
            avatarUrl?: (string|null);

            /** User createdAt */
            createdAt?: (number|Long|null);

            /** User metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents a User. */
        class User implements IUser {

            /**
             * Constructs a new User.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IUser);

            /** User id. */
            public id: string;

            /** User username. */
            public username: string;

            /** User displayName. */
            public displayName: string;

            /** User email. */
            public email: string;

            /** User avatarUrl. */
            public avatarUrl: string;

            /** User createdAt. */
            public createdAt: (number|Long);

            /** User metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new User instance using the specified properties.
             * @param [properties] Properties to set
             * @returns User instance
             */
            public static create(properties?: graphwiz.core.IUser): graphwiz.core.User;

            /**
             * Encodes the specified User message. Does not implicitly {@link graphwiz.core.User.verify|verify} messages.
             * @param message User message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified User message, length delimited. Does not implicitly {@link graphwiz.core.User.verify|verify} messages.
             * @param message User message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a User message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns User
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.User;

            /**
             * Decodes a User message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns User
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.User;

            /**
             * Verifies a User message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a User message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns User
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.User;

            /**
             * Creates a plain object from a User message. Also converts values to other types if specified.
             * @param message User
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this User to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for User
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AuthToken. */
        interface IAuthToken {

            /** AuthToken token */
            token?: (string|null);

            /** AuthToken userId */
            userId?: (string|null);

            /** AuthToken expiresAt */
            expiresAt?: (number|Long|null);

            /** AuthToken permissions */
            permissions?: (string[]|null);
        }

        /** Represents an AuthToken. */
        class AuthToken implements IAuthToken {

            /**
             * Constructs a new AuthToken.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.core.IAuthToken);

            /** AuthToken token. */
            public token: string;

            /** AuthToken userId. */
            public userId: string;

            /** AuthToken expiresAt. */
            public expiresAt: (number|Long);

            /** AuthToken permissions. */
            public permissions: string[];

            /**
             * Creates a new AuthToken instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AuthToken instance
             */
            public static create(properties?: graphwiz.core.IAuthToken): graphwiz.core.AuthToken;

            /**
             * Encodes the specified AuthToken message. Does not implicitly {@link graphwiz.core.AuthToken.verify|verify} messages.
             * @param message AuthToken message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.core.IAuthToken, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AuthToken message, length delimited. Does not implicitly {@link graphwiz.core.AuthToken.verify|verify} messages.
             * @param message AuthToken message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.core.IAuthToken, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AuthToken message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AuthToken
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.core.AuthToken;

            /**
             * Decodes an AuthToken message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AuthToken
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.core.AuthToken;

            /**
             * Verifies an AuthToken message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AuthToken message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AuthToken
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.core.AuthToken;

            /**
             * Creates a plain object from an AuthToken message. Also converts values to other types if specified.
             * @param message AuthToken
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.core.AuthToken, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AuthToken to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AuthToken
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

    /** Namespace room. */
    namespace room {

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
             * Calls CreateRoom.
             * @param request CreateRoomRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and CreateRoomResponse
             */
            public createRoom(request: graphwiz.room.ICreateRoomRequest, callback: graphwiz.room.RoomService.CreateRoomCallback): void;

            /**
             * Calls CreateRoom.
             * @param request CreateRoomRequest message or plain object
             * @returns Promise
             */
            public createRoom(request: graphwiz.room.ICreateRoomRequest): Promise<graphwiz.room.CreateRoomResponse>;

            /**
             * Calls GetRoom.
             * @param request GetRoomRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and GetRoomResponse
             */
            public getRoom(request: graphwiz.room.IGetRoomRequest, callback: graphwiz.room.RoomService.GetRoomCallback): void;

            /**
             * Calls GetRoom.
             * @param request GetRoomRequest message or plain object
             * @returns Promise
             */
            public getRoom(request: graphwiz.room.IGetRoomRequest): Promise<graphwiz.room.GetRoomResponse>;

            /**
             * Calls UpdateRoom.
             * @param request UpdateRoomRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and UpdateRoomResponse
             */
            public updateRoom(request: graphwiz.room.IUpdateRoomRequest, callback: graphwiz.room.RoomService.UpdateRoomCallback): void;

            /**
             * Calls UpdateRoom.
             * @param request UpdateRoomRequest message or plain object
             * @returns Promise
             */
            public updateRoom(request: graphwiz.room.IUpdateRoomRequest): Promise<graphwiz.room.UpdateRoomResponse>;

            /**
             * Calls DeleteRoom.
             * @param request DeleteRoomRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and DeleteRoomResponse
             */
            public deleteRoom(request: graphwiz.room.IDeleteRoomRequest, callback: graphwiz.room.RoomService.DeleteRoomCallback): void;

            /**
             * Calls DeleteRoom.
             * @param request DeleteRoomRequest message or plain object
             * @returns Promise
             */
            public deleteRoom(request: graphwiz.room.IDeleteRoomRequest): Promise<graphwiz.room.DeleteRoomResponse>;

            /**
             * Calls ListRooms.
             * @param request ListRoomsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ListRoomsResponse
             */
            public listRooms(request: graphwiz.room.IListRoomsRequest, callback: graphwiz.room.RoomService.ListRoomsCallback): void;

            /**
             * Calls ListRooms.
             * @param request ListRoomsRequest message or plain object
             * @returns Promise
             */
            public listRooms(request: graphwiz.room.IListRoomsRequest): Promise<graphwiz.room.ListRoomsResponse>;

            /**
             * Calls SearchRooms.
             * @param request SearchRoomsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and SearchRoomsResponse
             */
            public searchRooms(request: graphwiz.room.ISearchRoomsRequest, callback: graphwiz.room.RoomService.SearchRoomsCallback): void;

            /**
             * Calls SearchRooms.
             * @param request SearchRoomsRequest message or plain object
             * @returns Promise
             */
            public searchRooms(request: graphwiz.room.ISearchRoomsRequest): Promise<graphwiz.room.SearchRoomsResponse>;

            /**
             * Calls JoinRoom.
             * @param request JoinRoomRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and JoinRoomResponse
             */
            public joinRoom(request: graphwiz.room.IJoinRoomRequest, callback: graphwiz.room.RoomService.JoinRoomCallback): void;

            /**
             * Calls JoinRoom.
             * @param request JoinRoomRequest message or plain object
             * @returns Promise
             */
            public joinRoom(request: graphwiz.room.IJoinRoomRequest): Promise<graphwiz.room.JoinRoomResponse>;

            /**
             * Calls LeaveRoom.
             * @param request LeaveRoomRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and LeaveRoomResponse
             */
            public leaveRoom(request: graphwiz.room.ILeaveRoomRequest, callback: graphwiz.room.RoomService.LeaveRoomCallback): void;

            /**
             * Calls LeaveRoom.
             * @param request LeaveRoomRequest message or plain object
             * @returns Promise
             */
            public leaveRoom(request: graphwiz.room.ILeaveRoomRequest): Promise<graphwiz.room.LeaveRoomResponse>;

            /**
             * Calls KickUser.
             * @param request KickUserRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and KickUserResponse
             */
            public kickUser(request: graphwiz.room.IKickUserRequest, callback: graphwiz.room.RoomService.KickUserCallback): void;

            /**
             * Calls KickUser.
             * @param request KickUserRequest message or plain object
             * @returns Promise
             */
            public kickUser(request: graphwiz.room.IKickUserRequest): Promise<graphwiz.room.KickUserResponse>;

            /**
             * Calls UpdateSettings.
             * @param request UpdateSettingsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and UpdateSettingsResponse
             */
            public updateSettings(request: graphwiz.room.IUpdateSettingsRequest, callback: graphwiz.room.RoomService.UpdateSettingsCallback): void;

            /**
             * Calls UpdateSettings.
             * @param request UpdateSettingsRequest message or plain object
             * @returns Promise
             */
            public updateSettings(request: graphwiz.room.IUpdateSettingsRequest): Promise<graphwiz.room.UpdateSettingsResponse>;

            /**
             * Calls GetPermissions.
             * @param request GetPermissionsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and GetPermissionsResponse
             */
            public getPermissions(request: graphwiz.room.IGetPermissionsRequest, callback: graphwiz.room.RoomService.GetPermissionsCallback): void;

            /**
             * Calls GetPermissions.
             * @param request GetPermissionsRequest message or plain object
             * @returns Promise
             */
            public getPermissions(request: graphwiz.room.IGetPermissionsRequest): Promise<graphwiz.room.GetPermissionsResponse>;

            /**
             * Calls UpdatePermissions.
             * @param request UpdatePermissionsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and UpdatePermissionsResponse
             */
            public updatePermissions(request: graphwiz.room.IUpdatePermissionsRequest, callback: graphwiz.room.RoomService.UpdatePermissionsCallback): void;

            /**
             * Calls UpdatePermissions.
             * @param request UpdatePermissionsRequest message or plain object
             * @returns Promise
             */
            public updatePermissions(request: graphwiz.room.IUpdatePermissionsRequest): Promise<graphwiz.room.UpdatePermissionsResponse>;
        }

        namespace RoomService {

            /**
             * Callback as used by {@link graphwiz.room.RoomService#createRoom}.
             * @param error Error, if any
             * @param [response] CreateRoomResponse
             */
            type CreateRoomCallback = (error: (Error|null), response?: graphwiz.room.CreateRoomResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#getRoom}.
             * @param error Error, if any
             * @param [response] GetRoomResponse
             */
            type GetRoomCallback = (error: (Error|null), response?: graphwiz.room.GetRoomResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#updateRoom}.
             * @param error Error, if any
             * @param [response] UpdateRoomResponse
             */
            type UpdateRoomCallback = (error: (Error|null), response?: graphwiz.room.UpdateRoomResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#deleteRoom}.
             * @param error Error, if any
             * @param [response] DeleteRoomResponse
             */
            type DeleteRoomCallback = (error: (Error|null), response?: graphwiz.room.DeleteRoomResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#listRooms}.
             * @param error Error, if any
             * @param [response] ListRoomsResponse
             */
            type ListRoomsCallback = (error: (Error|null), response?: graphwiz.room.ListRoomsResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#searchRooms}.
             * @param error Error, if any
             * @param [response] SearchRoomsResponse
             */
            type SearchRoomsCallback = (error: (Error|null), response?: graphwiz.room.SearchRoomsResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#joinRoom}.
             * @param error Error, if any
             * @param [response] JoinRoomResponse
             */
            type JoinRoomCallback = (error: (Error|null), response?: graphwiz.room.JoinRoomResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#leaveRoom}.
             * @param error Error, if any
             * @param [response] LeaveRoomResponse
             */
            type LeaveRoomCallback = (error: (Error|null), response?: graphwiz.room.LeaveRoomResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#kickUser}.
             * @param error Error, if any
             * @param [response] KickUserResponse
             */
            type KickUserCallback = (error: (Error|null), response?: graphwiz.room.KickUserResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#updateSettings}.
             * @param error Error, if any
             * @param [response] UpdateSettingsResponse
             */
            type UpdateSettingsCallback = (error: (Error|null), response?: graphwiz.room.UpdateSettingsResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#getPermissions}.
             * @param error Error, if any
             * @param [response] GetPermissionsResponse
             */
            type GetPermissionsCallback = (error: (Error|null), response?: graphwiz.room.GetPermissionsResponse) => void;

            /**
             * Callback as used by {@link graphwiz.room.RoomService#updatePermissions}.
             * @param error Error, if any
             * @param [response] UpdatePermissionsResponse
             */
            type UpdatePermissionsCallback = (error: (Error|null), response?: graphwiz.room.UpdatePermissionsResponse) => void;
        }

        /** Properties of a CreateRoomRequest. */
        interface ICreateRoomRequest {

            /** CreateRoomRequest name */
            name?: (string|null);

            /** CreateRoomRequest description */
            description?: (string|null);

            /** CreateRoomRequest settings */
            settings?: (graphwiz.room.IRoomSettings|null);

            /** CreateRoomRequest creatorId */
            creatorId?: (string|null);
        }

        /** Represents a CreateRoomRequest. */
        class CreateRoomRequest implements ICreateRoomRequest {

            /**
             * Constructs a new CreateRoomRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.ICreateRoomRequest);

            /** CreateRoomRequest name. */
            public name: string;

            /** CreateRoomRequest description. */
            public description: string;

            /** CreateRoomRequest settings. */
            public settings?: (graphwiz.room.IRoomSettings|null);

            /** CreateRoomRequest creatorId. */
            public creatorId: string;

            /**
             * Creates a new CreateRoomRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateRoomRequest instance
             */
            public static create(properties?: graphwiz.room.ICreateRoomRequest): graphwiz.room.CreateRoomRequest;

            /**
             * Encodes the specified CreateRoomRequest message. Does not implicitly {@link graphwiz.room.CreateRoomRequest.verify|verify} messages.
             * @param message CreateRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.ICreateRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateRoomRequest message, length delimited. Does not implicitly {@link graphwiz.room.CreateRoomRequest.verify|verify} messages.
             * @param message CreateRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.ICreateRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateRoomRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.CreateRoomRequest;

            /**
             * Decodes a CreateRoomRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.CreateRoomRequest;

            /**
             * Verifies a CreateRoomRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateRoomRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateRoomRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.CreateRoomRequest;

            /**
             * Creates a plain object from a CreateRoomRequest message. Also converts values to other types if specified.
             * @param message CreateRoomRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.CreateRoomRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateRoomRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateRoomRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateRoomResponse. */
        interface ICreateRoomResponse {

            /** CreateRoomResponse success */
            success?: (boolean|null);

            /** CreateRoomResponse roomId */
            roomId?: (string|null);

            /** CreateRoomResponse room */
            room?: (graphwiz.core.IRoom|null);
        }

        /** Represents a CreateRoomResponse. */
        class CreateRoomResponse implements ICreateRoomResponse {

            /**
             * Constructs a new CreateRoomResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.ICreateRoomResponse);

            /** CreateRoomResponse success. */
            public success: boolean;

            /** CreateRoomResponse roomId. */
            public roomId: string;

            /** CreateRoomResponse room. */
            public room?: (graphwiz.core.IRoom|null);

            /**
             * Creates a new CreateRoomResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateRoomResponse instance
             */
            public static create(properties?: graphwiz.room.ICreateRoomResponse): graphwiz.room.CreateRoomResponse;

            /**
             * Encodes the specified CreateRoomResponse message. Does not implicitly {@link graphwiz.room.CreateRoomResponse.verify|verify} messages.
             * @param message CreateRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.ICreateRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateRoomResponse message, length delimited. Does not implicitly {@link graphwiz.room.CreateRoomResponse.verify|verify} messages.
             * @param message CreateRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.ICreateRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateRoomResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.CreateRoomResponse;

            /**
             * Decodes a CreateRoomResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.CreateRoomResponse;

            /**
             * Verifies a CreateRoomResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateRoomResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateRoomResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.CreateRoomResponse;

            /**
             * Creates a plain object from a CreateRoomResponse message. Also converts values to other types if specified.
             * @param message CreateRoomResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.CreateRoomResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateRoomResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateRoomResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetRoomRequest. */
        interface IGetRoomRequest {

            /** GetRoomRequest roomId */
            roomId?: (string|null);
        }

        /** Represents a GetRoomRequest. */
        class GetRoomRequest implements IGetRoomRequest {

            /**
             * Constructs a new GetRoomRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IGetRoomRequest);

            /** GetRoomRequest roomId. */
            public roomId: string;

            /**
             * Creates a new GetRoomRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetRoomRequest instance
             */
            public static create(properties?: graphwiz.room.IGetRoomRequest): graphwiz.room.GetRoomRequest;

            /**
             * Encodes the specified GetRoomRequest message. Does not implicitly {@link graphwiz.room.GetRoomRequest.verify|verify} messages.
             * @param message GetRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IGetRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetRoomRequest message, length delimited. Does not implicitly {@link graphwiz.room.GetRoomRequest.verify|verify} messages.
             * @param message GetRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IGetRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetRoomRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.GetRoomRequest;

            /**
             * Decodes a GetRoomRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.GetRoomRequest;

            /**
             * Verifies a GetRoomRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetRoomRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetRoomRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.GetRoomRequest;

            /**
             * Creates a plain object from a GetRoomRequest message. Also converts values to other types if specified.
             * @param message GetRoomRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.GetRoomRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetRoomRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetRoomRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetRoomResponse. */
        interface IGetRoomResponse {

            /** GetRoomResponse success */
            success?: (boolean|null);

            /** GetRoomResponse room */
            room?: (graphwiz.core.IRoom|null);
        }

        /** Represents a GetRoomResponse. */
        class GetRoomResponse implements IGetRoomResponse {

            /**
             * Constructs a new GetRoomResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IGetRoomResponse);

            /** GetRoomResponse success. */
            public success: boolean;

            /** GetRoomResponse room. */
            public room?: (graphwiz.core.IRoom|null);

            /**
             * Creates a new GetRoomResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetRoomResponse instance
             */
            public static create(properties?: graphwiz.room.IGetRoomResponse): graphwiz.room.GetRoomResponse;

            /**
             * Encodes the specified GetRoomResponse message. Does not implicitly {@link graphwiz.room.GetRoomResponse.verify|verify} messages.
             * @param message GetRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IGetRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetRoomResponse message, length delimited. Does not implicitly {@link graphwiz.room.GetRoomResponse.verify|verify} messages.
             * @param message GetRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IGetRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetRoomResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.GetRoomResponse;

            /**
             * Decodes a GetRoomResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.GetRoomResponse;

            /**
             * Verifies a GetRoomResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetRoomResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetRoomResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.GetRoomResponse;

            /**
             * Creates a plain object from a GetRoomResponse message. Also converts values to other types if specified.
             * @param message GetRoomResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.GetRoomResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetRoomResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetRoomResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateRoomRequest. */
        interface IUpdateRoomRequest {

            /** UpdateRoomRequest roomId */
            roomId?: (string|null);

            /** UpdateRoomRequest name */
            name?: (string|null);

            /** UpdateRoomRequest description */
            description?: (string|null);

            /** UpdateRoomRequest settings */
            settings?: (graphwiz.room.IRoomSettings|null);
        }

        /** Represents an UpdateRoomRequest. */
        class UpdateRoomRequest implements IUpdateRoomRequest {

            /**
             * Constructs a new UpdateRoomRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IUpdateRoomRequest);

            /** UpdateRoomRequest roomId. */
            public roomId: string;

            /** UpdateRoomRequest name. */
            public name: string;

            /** UpdateRoomRequest description. */
            public description: string;

            /** UpdateRoomRequest settings. */
            public settings?: (graphwiz.room.IRoomSettings|null);

            /**
             * Creates a new UpdateRoomRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateRoomRequest instance
             */
            public static create(properties?: graphwiz.room.IUpdateRoomRequest): graphwiz.room.UpdateRoomRequest;

            /**
             * Encodes the specified UpdateRoomRequest message. Does not implicitly {@link graphwiz.room.UpdateRoomRequest.verify|verify} messages.
             * @param message UpdateRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IUpdateRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateRoomRequest message, length delimited. Does not implicitly {@link graphwiz.room.UpdateRoomRequest.verify|verify} messages.
             * @param message UpdateRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IUpdateRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateRoomRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.UpdateRoomRequest;

            /**
             * Decodes an UpdateRoomRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.UpdateRoomRequest;

            /**
             * Verifies an UpdateRoomRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateRoomRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateRoomRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.UpdateRoomRequest;

            /**
             * Creates a plain object from an UpdateRoomRequest message. Also converts values to other types if specified.
             * @param message UpdateRoomRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.UpdateRoomRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateRoomRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateRoomRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateRoomResponse. */
        interface IUpdateRoomResponse {

            /** UpdateRoomResponse success */
            success?: (boolean|null);

            /** UpdateRoomResponse room */
            room?: (graphwiz.core.IRoom|null);
        }

        /** Represents an UpdateRoomResponse. */
        class UpdateRoomResponse implements IUpdateRoomResponse {

            /**
             * Constructs a new UpdateRoomResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IUpdateRoomResponse);

            /** UpdateRoomResponse success. */
            public success: boolean;

            /** UpdateRoomResponse room. */
            public room?: (graphwiz.core.IRoom|null);

            /**
             * Creates a new UpdateRoomResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateRoomResponse instance
             */
            public static create(properties?: graphwiz.room.IUpdateRoomResponse): graphwiz.room.UpdateRoomResponse;

            /**
             * Encodes the specified UpdateRoomResponse message. Does not implicitly {@link graphwiz.room.UpdateRoomResponse.verify|verify} messages.
             * @param message UpdateRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IUpdateRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateRoomResponse message, length delimited. Does not implicitly {@link graphwiz.room.UpdateRoomResponse.verify|verify} messages.
             * @param message UpdateRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IUpdateRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateRoomResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.UpdateRoomResponse;

            /**
             * Decodes an UpdateRoomResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.UpdateRoomResponse;

            /**
             * Verifies an UpdateRoomResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateRoomResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateRoomResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.UpdateRoomResponse;

            /**
             * Creates a plain object from an UpdateRoomResponse message. Also converts values to other types if specified.
             * @param message UpdateRoomResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.UpdateRoomResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateRoomResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateRoomResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteRoomRequest. */
        interface IDeleteRoomRequest {

            /** DeleteRoomRequest roomId */
            roomId?: (string|null);

            /** DeleteRoomRequest requesterId */
            requesterId?: (string|null);
        }

        /** Represents a DeleteRoomRequest. */
        class DeleteRoomRequest implements IDeleteRoomRequest {

            /**
             * Constructs a new DeleteRoomRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IDeleteRoomRequest);

            /** DeleteRoomRequest roomId. */
            public roomId: string;

            /** DeleteRoomRequest requesterId. */
            public requesterId: string;

            /**
             * Creates a new DeleteRoomRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteRoomRequest instance
             */
            public static create(properties?: graphwiz.room.IDeleteRoomRequest): graphwiz.room.DeleteRoomRequest;

            /**
             * Encodes the specified DeleteRoomRequest message. Does not implicitly {@link graphwiz.room.DeleteRoomRequest.verify|verify} messages.
             * @param message DeleteRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IDeleteRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteRoomRequest message, length delimited. Does not implicitly {@link graphwiz.room.DeleteRoomRequest.verify|verify} messages.
             * @param message DeleteRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IDeleteRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteRoomRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.DeleteRoomRequest;

            /**
             * Decodes a DeleteRoomRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.DeleteRoomRequest;

            /**
             * Verifies a DeleteRoomRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteRoomRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteRoomRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.DeleteRoomRequest;

            /**
             * Creates a plain object from a DeleteRoomRequest message. Also converts values to other types if specified.
             * @param message DeleteRoomRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.DeleteRoomRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteRoomRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteRoomRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteRoomResponse. */
        interface IDeleteRoomResponse {

            /** DeleteRoomResponse success */
            success?: (boolean|null);
        }

        /** Represents a DeleteRoomResponse. */
        class DeleteRoomResponse implements IDeleteRoomResponse {

            /**
             * Constructs a new DeleteRoomResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IDeleteRoomResponse);

            /** DeleteRoomResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteRoomResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteRoomResponse instance
             */
            public static create(properties?: graphwiz.room.IDeleteRoomResponse): graphwiz.room.DeleteRoomResponse;

            /**
             * Encodes the specified DeleteRoomResponse message. Does not implicitly {@link graphwiz.room.DeleteRoomResponse.verify|verify} messages.
             * @param message DeleteRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IDeleteRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteRoomResponse message, length delimited. Does not implicitly {@link graphwiz.room.DeleteRoomResponse.verify|verify} messages.
             * @param message DeleteRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IDeleteRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteRoomResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.DeleteRoomResponse;

            /**
             * Decodes a DeleteRoomResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.DeleteRoomResponse;

            /**
             * Verifies a DeleteRoomResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteRoomResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteRoomResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.DeleteRoomResponse;

            /**
             * Creates a plain object from a DeleteRoomResponse message. Also converts values to other types if specified.
             * @param message DeleteRoomResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.DeleteRoomResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteRoomResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteRoomResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListRoomsRequest. */
        interface IListRoomsRequest {

            /** ListRoomsRequest pageSize */
            pageSize?: (number|null);

            /** ListRoomsRequest pageToken */
            pageToken?: (string|null);

            /** ListRoomsRequest filter */
            filter?: (graphwiz.room.IRoomFilter|null);
        }

        /** Represents a ListRoomsRequest. */
        class ListRoomsRequest implements IListRoomsRequest {

            /**
             * Constructs a new ListRoomsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IListRoomsRequest);

            /** ListRoomsRequest pageSize. */
            public pageSize: number;

            /** ListRoomsRequest pageToken. */
            public pageToken: string;

            /** ListRoomsRequest filter. */
            public filter?: (graphwiz.room.IRoomFilter|null);

            /**
             * Creates a new ListRoomsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListRoomsRequest instance
             */
            public static create(properties?: graphwiz.room.IListRoomsRequest): graphwiz.room.ListRoomsRequest;

            /**
             * Encodes the specified ListRoomsRequest message. Does not implicitly {@link graphwiz.room.ListRoomsRequest.verify|verify} messages.
             * @param message ListRoomsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IListRoomsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListRoomsRequest message, length delimited. Does not implicitly {@link graphwiz.room.ListRoomsRequest.verify|verify} messages.
             * @param message ListRoomsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IListRoomsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListRoomsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListRoomsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.ListRoomsRequest;

            /**
             * Decodes a ListRoomsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListRoomsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.ListRoomsRequest;

            /**
             * Verifies a ListRoomsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListRoomsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListRoomsRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.ListRoomsRequest;

            /**
             * Creates a plain object from a ListRoomsRequest message. Also converts values to other types if specified.
             * @param message ListRoomsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.ListRoomsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListRoomsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListRoomsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListRoomsResponse. */
        interface IListRoomsResponse {

            /** ListRoomsResponse rooms */
            rooms?: (graphwiz.core.IRoom[]|null);

            /** ListRoomsResponse nextPageToken */
            nextPageToken?: (string|null);

            /** ListRoomsResponse totalCount */
            totalCount?: (number|null);
        }

        /** Represents a ListRoomsResponse. */
        class ListRoomsResponse implements IListRoomsResponse {

            /**
             * Constructs a new ListRoomsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IListRoomsResponse);

            /** ListRoomsResponse rooms. */
            public rooms: graphwiz.core.IRoom[];

            /** ListRoomsResponse nextPageToken. */
            public nextPageToken: string;

            /** ListRoomsResponse totalCount. */
            public totalCount: number;

            /**
             * Creates a new ListRoomsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListRoomsResponse instance
             */
            public static create(properties?: graphwiz.room.IListRoomsResponse): graphwiz.room.ListRoomsResponse;

            /**
             * Encodes the specified ListRoomsResponse message. Does not implicitly {@link graphwiz.room.ListRoomsResponse.verify|verify} messages.
             * @param message ListRoomsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IListRoomsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListRoomsResponse message, length delimited. Does not implicitly {@link graphwiz.room.ListRoomsResponse.verify|verify} messages.
             * @param message ListRoomsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IListRoomsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListRoomsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListRoomsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.ListRoomsResponse;

            /**
             * Decodes a ListRoomsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListRoomsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.ListRoomsResponse;

            /**
             * Verifies a ListRoomsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListRoomsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListRoomsResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.ListRoomsResponse;

            /**
             * Creates a plain object from a ListRoomsResponse message. Also converts values to other types if specified.
             * @param message ListRoomsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.ListRoomsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListRoomsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListRoomsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SearchRoomsRequest. */
        interface ISearchRoomsRequest {

            /** SearchRoomsRequest query */
            query?: (string|null);

            /** SearchRoomsRequest limit */
            limit?: (number|null);

            /** SearchRoomsRequest filter */
            filter?: (graphwiz.room.IRoomFilter|null);
        }

        /** Represents a SearchRoomsRequest. */
        class SearchRoomsRequest implements ISearchRoomsRequest {

            /**
             * Constructs a new SearchRoomsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.ISearchRoomsRequest);

            /** SearchRoomsRequest query. */
            public query: string;

            /** SearchRoomsRequest limit. */
            public limit: number;

            /** SearchRoomsRequest filter. */
            public filter?: (graphwiz.room.IRoomFilter|null);

            /**
             * Creates a new SearchRoomsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SearchRoomsRequest instance
             */
            public static create(properties?: graphwiz.room.ISearchRoomsRequest): graphwiz.room.SearchRoomsRequest;

            /**
             * Encodes the specified SearchRoomsRequest message. Does not implicitly {@link graphwiz.room.SearchRoomsRequest.verify|verify} messages.
             * @param message SearchRoomsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.ISearchRoomsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SearchRoomsRequest message, length delimited. Does not implicitly {@link graphwiz.room.SearchRoomsRequest.verify|verify} messages.
             * @param message SearchRoomsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.ISearchRoomsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SearchRoomsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SearchRoomsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.SearchRoomsRequest;

            /**
             * Decodes a SearchRoomsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SearchRoomsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.SearchRoomsRequest;

            /**
             * Verifies a SearchRoomsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SearchRoomsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SearchRoomsRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.SearchRoomsRequest;

            /**
             * Creates a plain object from a SearchRoomsRequest message. Also converts values to other types if specified.
             * @param message SearchRoomsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.SearchRoomsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SearchRoomsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SearchRoomsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SearchRoomsResponse. */
        interface ISearchRoomsResponse {

            /** SearchRoomsResponse rooms */
            rooms?: (graphwiz.core.IRoom[]|null);

            /** SearchRoomsResponse totalResults */
            totalResults?: (number|null);
        }

        /** Represents a SearchRoomsResponse. */
        class SearchRoomsResponse implements ISearchRoomsResponse {

            /**
             * Constructs a new SearchRoomsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.ISearchRoomsResponse);

            /** SearchRoomsResponse rooms. */
            public rooms: graphwiz.core.IRoom[];

            /** SearchRoomsResponse totalResults. */
            public totalResults: number;

            /**
             * Creates a new SearchRoomsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SearchRoomsResponse instance
             */
            public static create(properties?: graphwiz.room.ISearchRoomsResponse): graphwiz.room.SearchRoomsResponse;

            /**
             * Encodes the specified SearchRoomsResponse message. Does not implicitly {@link graphwiz.room.SearchRoomsResponse.verify|verify} messages.
             * @param message SearchRoomsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.ISearchRoomsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SearchRoomsResponse message, length delimited. Does not implicitly {@link graphwiz.room.SearchRoomsResponse.verify|verify} messages.
             * @param message SearchRoomsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.ISearchRoomsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SearchRoomsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SearchRoomsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.SearchRoomsResponse;

            /**
             * Decodes a SearchRoomsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SearchRoomsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.SearchRoomsResponse;

            /**
             * Verifies a SearchRoomsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SearchRoomsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SearchRoomsResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.SearchRoomsResponse;

            /**
             * Creates a plain object from a SearchRoomsResponse message. Also converts values to other types if specified.
             * @param message SearchRoomsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.SearchRoomsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SearchRoomsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SearchRoomsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a JoinRoomRequest. */
        interface IJoinRoomRequest {

            /** JoinRoomRequest roomId */
            roomId?: (string|null);

            /** JoinRoomRequest userId */
            userId?: (string|null);

            /** JoinRoomRequest authToken */
            authToken?: (string|null);

            /** JoinRoomRequest displayName */
            displayName?: (string|null);
        }

        /** Represents a JoinRoomRequest. */
        class JoinRoomRequest implements IJoinRoomRequest {

            /**
             * Constructs a new JoinRoomRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IJoinRoomRequest);

            /** JoinRoomRequest roomId. */
            public roomId: string;

            /** JoinRoomRequest userId. */
            public userId: string;

            /** JoinRoomRequest authToken. */
            public authToken: string;

            /** JoinRoomRequest displayName. */
            public displayName: string;

            /**
             * Creates a new JoinRoomRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinRoomRequest instance
             */
            public static create(properties?: graphwiz.room.IJoinRoomRequest): graphwiz.room.JoinRoomRequest;

            /**
             * Encodes the specified JoinRoomRequest message. Does not implicitly {@link graphwiz.room.JoinRoomRequest.verify|verify} messages.
             * @param message JoinRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IJoinRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinRoomRequest message, length delimited. Does not implicitly {@link graphwiz.room.JoinRoomRequest.verify|verify} messages.
             * @param message JoinRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IJoinRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinRoomRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.JoinRoomRequest;

            /**
             * Decodes a JoinRoomRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.JoinRoomRequest;

            /**
             * Verifies a JoinRoomRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinRoomRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinRoomRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.JoinRoomRequest;

            /**
             * Creates a plain object from a JoinRoomRequest message. Also converts values to other types if specified.
             * @param message JoinRoomRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.JoinRoomRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinRoomRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for JoinRoomRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a JoinRoomResponse. */
        interface IJoinRoomResponse {

            /** JoinRoomResponse success */
            success?: (boolean|null);

            /** JoinRoomResponse roomId */
            roomId?: (string|null);

            /** JoinRoomResponse room */
            room?: (graphwiz.core.IRoom|null);

            /** JoinRoomResponse initialPlayers */
            initialPlayers?: (graphwiz.core.IPlayerSnapshot[]|null);
        }

        /** Represents a JoinRoomResponse. */
        class JoinRoomResponse implements IJoinRoomResponse {

            /**
             * Constructs a new JoinRoomResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IJoinRoomResponse);

            /** JoinRoomResponse success. */
            public success: boolean;

            /** JoinRoomResponse roomId. */
            public roomId: string;

            /** JoinRoomResponse room. */
            public room?: (graphwiz.core.IRoom|null);

            /** JoinRoomResponse initialPlayers. */
            public initialPlayers: graphwiz.core.IPlayerSnapshot[];

            /**
             * Creates a new JoinRoomResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinRoomResponse instance
             */
            public static create(properties?: graphwiz.room.IJoinRoomResponse): graphwiz.room.JoinRoomResponse;

            /**
             * Encodes the specified JoinRoomResponse message. Does not implicitly {@link graphwiz.room.JoinRoomResponse.verify|verify} messages.
             * @param message JoinRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IJoinRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinRoomResponse message, length delimited. Does not implicitly {@link graphwiz.room.JoinRoomResponse.verify|verify} messages.
             * @param message JoinRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IJoinRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinRoomResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.JoinRoomResponse;

            /**
             * Decodes a JoinRoomResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.JoinRoomResponse;

            /**
             * Verifies a JoinRoomResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinRoomResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinRoomResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.JoinRoomResponse;

            /**
             * Creates a plain object from a JoinRoomResponse message. Also converts values to other types if specified.
             * @param message JoinRoomResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.JoinRoomResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinRoomResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for JoinRoomResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a LeaveRoomRequest. */
        interface ILeaveRoomRequest {

            /** LeaveRoomRequest roomId */
            roomId?: (string|null);

            /** LeaveRoomRequest userId */
            userId?: (string|null);
        }

        /** Represents a LeaveRoomRequest. */
        class LeaveRoomRequest implements ILeaveRoomRequest {

            /**
             * Constructs a new LeaveRoomRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.ILeaveRoomRequest);

            /** LeaveRoomRequest roomId. */
            public roomId: string;

            /** LeaveRoomRequest userId. */
            public userId: string;

            /**
             * Creates a new LeaveRoomRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LeaveRoomRequest instance
             */
            public static create(properties?: graphwiz.room.ILeaveRoomRequest): graphwiz.room.LeaveRoomRequest;

            /**
             * Encodes the specified LeaveRoomRequest message. Does not implicitly {@link graphwiz.room.LeaveRoomRequest.verify|verify} messages.
             * @param message LeaveRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.ILeaveRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LeaveRoomRequest message, length delimited. Does not implicitly {@link graphwiz.room.LeaveRoomRequest.verify|verify} messages.
             * @param message LeaveRoomRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.ILeaveRoomRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LeaveRoomRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LeaveRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.LeaveRoomRequest;

            /**
             * Decodes a LeaveRoomRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LeaveRoomRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.LeaveRoomRequest;

            /**
             * Verifies a LeaveRoomRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LeaveRoomRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LeaveRoomRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.LeaveRoomRequest;

            /**
             * Creates a plain object from a LeaveRoomRequest message. Also converts values to other types if specified.
             * @param message LeaveRoomRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.LeaveRoomRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LeaveRoomRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LeaveRoomRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a LeaveRoomResponse. */
        interface ILeaveRoomResponse {

            /** LeaveRoomResponse success */
            success?: (boolean|null);
        }

        /** Represents a LeaveRoomResponse. */
        class LeaveRoomResponse implements ILeaveRoomResponse {

            /**
             * Constructs a new LeaveRoomResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.ILeaveRoomResponse);

            /** LeaveRoomResponse success. */
            public success: boolean;

            /**
             * Creates a new LeaveRoomResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LeaveRoomResponse instance
             */
            public static create(properties?: graphwiz.room.ILeaveRoomResponse): graphwiz.room.LeaveRoomResponse;

            /**
             * Encodes the specified LeaveRoomResponse message. Does not implicitly {@link graphwiz.room.LeaveRoomResponse.verify|verify} messages.
             * @param message LeaveRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.ILeaveRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LeaveRoomResponse message, length delimited. Does not implicitly {@link graphwiz.room.LeaveRoomResponse.verify|verify} messages.
             * @param message LeaveRoomResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.ILeaveRoomResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LeaveRoomResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LeaveRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.LeaveRoomResponse;

            /**
             * Decodes a LeaveRoomResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LeaveRoomResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.LeaveRoomResponse;

            /**
             * Verifies a LeaveRoomResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LeaveRoomResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LeaveRoomResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.LeaveRoomResponse;

            /**
             * Creates a plain object from a LeaveRoomResponse message. Also converts values to other types if specified.
             * @param message LeaveRoomResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.LeaveRoomResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LeaveRoomResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LeaveRoomResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a KickUserRequest. */
        interface IKickUserRequest {

            /** KickUserRequest roomId */
            roomId?: (string|null);

            /** KickUserRequest requesterId */
            requesterId?: (string|null);

            /** KickUserRequest targetUserId */
            targetUserId?: (string|null);

            /** KickUserRequest reason */
            reason?: (string|null);
        }

        /** Represents a KickUserRequest. */
        class KickUserRequest implements IKickUserRequest {

            /**
             * Constructs a new KickUserRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IKickUserRequest);

            /** KickUserRequest roomId. */
            public roomId: string;

            /** KickUserRequest requesterId. */
            public requesterId: string;

            /** KickUserRequest targetUserId. */
            public targetUserId: string;

            /** KickUserRequest reason. */
            public reason: string;

            /**
             * Creates a new KickUserRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KickUserRequest instance
             */
            public static create(properties?: graphwiz.room.IKickUserRequest): graphwiz.room.KickUserRequest;

            /**
             * Encodes the specified KickUserRequest message. Does not implicitly {@link graphwiz.room.KickUserRequest.verify|verify} messages.
             * @param message KickUserRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IKickUserRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KickUserRequest message, length delimited. Does not implicitly {@link graphwiz.room.KickUserRequest.verify|verify} messages.
             * @param message KickUserRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IKickUserRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KickUserRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KickUserRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.KickUserRequest;

            /**
             * Decodes a KickUserRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KickUserRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.KickUserRequest;

            /**
             * Verifies a KickUserRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KickUserRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KickUserRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.KickUserRequest;

            /**
             * Creates a plain object from a KickUserRequest message. Also converts values to other types if specified.
             * @param message KickUserRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.KickUserRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KickUserRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KickUserRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a KickUserResponse. */
        interface IKickUserResponse {

            /** KickUserResponse success */
            success?: (boolean|null);
        }

        /** Represents a KickUserResponse. */
        class KickUserResponse implements IKickUserResponse {

            /**
             * Constructs a new KickUserResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IKickUserResponse);

            /** KickUserResponse success. */
            public success: boolean;

            /**
             * Creates a new KickUserResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KickUserResponse instance
             */
            public static create(properties?: graphwiz.room.IKickUserResponse): graphwiz.room.KickUserResponse;

            /**
             * Encodes the specified KickUserResponse message. Does not implicitly {@link graphwiz.room.KickUserResponse.verify|verify} messages.
             * @param message KickUserResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IKickUserResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KickUserResponse message, length delimited. Does not implicitly {@link graphwiz.room.KickUserResponse.verify|verify} messages.
             * @param message KickUserResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IKickUserResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KickUserResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KickUserResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.KickUserResponse;

            /**
             * Decodes a KickUserResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KickUserResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.KickUserResponse;

            /**
             * Verifies a KickUserResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KickUserResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KickUserResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.KickUserResponse;

            /**
             * Creates a plain object from a KickUserResponse message. Also converts values to other types if specified.
             * @param message KickUserResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.KickUserResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KickUserResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KickUserResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateSettingsRequest. */
        interface IUpdateSettingsRequest {

            /** UpdateSettingsRequest roomId */
            roomId?: (string|null);

            /** UpdateSettingsRequest requesterId */
            requesterId?: (string|null);

            /** UpdateSettingsRequest settings */
            settings?: (graphwiz.room.IRoomSettings|null);
        }

        /** Represents an UpdateSettingsRequest. */
        class UpdateSettingsRequest implements IUpdateSettingsRequest {

            /**
             * Constructs a new UpdateSettingsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IUpdateSettingsRequest);

            /** UpdateSettingsRequest roomId. */
            public roomId: string;

            /** UpdateSettingsRequest requesterId. */
            public requesterId: string;

            /** UpdateSettingsRequest settings. */
            public settings?: (graphwiz.room.IRoomSettings|null);

            /**
             * Creates a new UpdateSettingsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateSettingsRequest instance
             */
            public static create(properties?: graphwiz.room.IUpdateSettingsRequest): graphwiz.room.UpdateSettingsRequest;

            /**
             * Encodes the specified UpdateSettingsRequest message. Does not implicitly {@link graphwiz.room.UpdateSettingsRequest.verify|verify} messages.
             * @param message UpdateSettingsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IUpdateSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateSettingsRequest message, length delimited. Does not implicitly {@link graphwiz.room.UpdateSettingsRequest.verify|verify} messages.
             * @param message UpdateSettingsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IUpdateSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateSettingsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.UpdateSettingsRequest;

            /**
             * Decodes an UpdateSettingsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.UpdateSettingsRequest;

            /**
             * Verifies an UpdateSettingsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateSettingsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateSettingsRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.UpdateSettingsRequest;

            /**
             * Creates a plain object from an UpdateSettingsRequest message. Also converts values to other types if specified.
             * @param message UpdateSettingsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.UpdateSettingsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateSettingsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateSettingsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateSettingsResponse. */
        interface IUpdateSettingsResponse {

            /** UpdateSettingsResponse success */
            success?: (boolean|null);

            /** UpdateSettingsResponse settings */
            settings?: (graphwiz.room.IRoomSettings|null);
        }

        /** Represents an UpdateSettingsResponse. */
        class UpdateSettingsResponse implements IUpdateSettingsResponse {

            /**
             * Constructs a new UpdateSettingsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IUpdateSettingsResponse);

            /** UpdateSettingsResponse success. */
            public success: boolean;

            /** UpdateSettingsResponse settings. */
            public settings?: (graphwiz.room.IRoomSettings|null);

            /**
             * Creates a new UpdateSettingsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateSettingsResponse instance
             */
            public static create(properties?: graphwiz.room.IUpdateSettingsResponse): graphwiz.room.UpdateSettingsResponse;

            /**
             * Encodes the specified UpdateSettingsResponse message. Does not implicitly {@link graphwiz.room.UpdateSettingsResponse.verify|verify} messages.
             * @param message UpdateSettingsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IUpdateSettingsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateSettingsResponse message, length delimited. Does not implicitly {@link graphwiz.room.UpdateSettingsResponse.verify|verify} messages.
             * @param message UpdateSettingsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IUpdateSettingsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateSettingsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateSettingsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.UpdateSettingsResponse;

            /**
             * Decodes an UpdateSettingsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateSettingsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.UpdateSettingsResponse;

            /**
             * Verifies an UpdateSettingsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateSettingsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateSettingsResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.UpdateSettingsResponse;

            /**
             * Creates a plain object from an UpdateSettingsResponse message. Also converts values to other types if specified.
             * @param message UpdateSettingsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.UpdateSettingsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateSettingsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateSettingsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetPermissionsRequest. */
        interface IGetPermissionsRequest {

            /** GetPermissionsRequest roomId */
            roomId?: (string|null);

            /** GetPermissionsRequest userId */
            userId?: (string|null);
        }

        /** Represents a GetPermissionsRequest. */
        class GetPermissionsRequest implements IGetPermissionsRequest {

            /**
             * Constructs a new GetPermissionsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IGetPermissionsRequest);

            /** GetPermissionsRequest roomId. */
            public roomId: string;

            /** GetPermissionsRequest userId. */
            public userId: string;

            /**
             * Creates a new GetPermissionsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetPermissionsRequest instance
             */
            public static create(properties?: graphwiz.room.IGetPermissionsRequest): graphwiz.room.GetPermissionsRequest;

            /**
             * Encodes the specified GetPermissionsRequest message. Does not implicitly {@link graphwiz.room.GetPermissionsRequest.verify|verify} messages.
             * @param message GetPermissionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IGetPermissionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetPermissionsRequest message, length delimited. Does not implicitly {@link graphwiz.room.GetPermissionsRequest.verify|verify} messages.
             * @param message GetPermissionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IGetPermissionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetPermissionsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetPermissionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.GetPermissionsRequest;

            /**
             * Decodes a GetPermissionsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetPermissionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.GetPermissionsRequest;

            /**
             * Verifies a GetPermissionsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetPermissionsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetPermissionsRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.GetPermissionsRequest;

            /**
             * Creates a plain object from a GetPermissionsRequest message. Also converts values to other types if specified.
             * @param message GetPermissionsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.GetPermissionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetPermissionsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetPermissionsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetPermissionsResponse. */
        interface IGetPermissionsResponse {

            /** GetPermissionsResponse success */
            success?: (boolean|null);

            /** GetPermissionsResponse permissions */
            permissions?: (graphwiz.room.IRoomPermissions|null);
        }

        /** Represents a GetPermissionsResponse. */
        class GetPermissionsResponse implements IGetPermissionsResponse {

            /**
             * Constructs a new GetPermissionsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IGetPermissionsResponse);

            /** GetPermissionsResponse success. */
            public success: boolean;

            /** GetPermissionsResponse permissions. */
            public permissions?: (graphwiz.room.IRoomPermissions|null);

            /**
             * Creates a new GetPermissionsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetPermissionsResponse instance
             */
            public static create(properties?: graphwiz.room.IGetPermissionsResponse): graphwiz.room.GetPermissionsResponse;

            /**
             * Encodes the specified GetPermissionsResponse message. Does not implicitly {@link graphwiz.room.GetPermissionsResponse.verify|verify} messages.
             * @param message GetPermissionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IGetPermissionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetPermissionsResponse message, length delimited. Does not implicitly {@link graphwiz.room.GetPermissionsResponse.verify|verify} messages.
             * @param message GetPermissionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IGetPermissionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetPermissionsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetPermissionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.GetPermissionsResponse;

            /**
             * Decodes a GetPermissionsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetPermissionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.GetPermissionsResponse;

            /**
             * Verifies a GetPermissionsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetPermissionsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetPermissionsResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.GetPermissionsResponse;

            /**
             * Creates a plain object from a GetPermissionsResponse message. Also converts values to other types if specified.
             * @param message GetPermissionsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.GetPermissionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetPermissionsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetPermissionsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdatePermissionsRequest. */
        interface IUpdatePermissionsRequest {

            /** UpdatePermissionsRequest roomId */
            roomId?: (string|null);

            /** UpdatePermissionsRequest requesterId */
            requesterId?: (string|null);

            /** UpdatePermissionsRequest permissions */
            permissions?: (graphwiz.room.IRoomPermissions|null);
        }

        /** Represents an UpdatePermissionsRequest. */
        class UpdatePermissionsRequest implements IUpdatePermissionsRequest {

            /**
             * Constructs a new UpdatePermissionsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IUpdatePermissionsRequest);

            /** UpdatePermissionsRequest roomId. */
            public roomId: string;

            /** UpdatePermissionsRequest requesterId. */
            public requesterId: string;

            /** UpdatePermissionsRequest permissions. */
            public permissions?: (graphwiz.room.IRoomPermissions|null);

            /**
             * Creates a new UpdatePermissionsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdatePermissionsRequest instance
             */
            public static create(properties?: graphwiz.room.IUpdatePermissionsRequest): graphwiz.room.UpdatePermissionsRequest;

            /**
             * Encodes the specified UpdatePermissionsRequest message. Does not implicitly {@link graphwiz.room.UpdatePermissionsRequest.verify|verify} messages.
             * @param message UpdatePermissionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IUpdatePermissionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdatePermissionsRequest message, length delimited. Does not implicitly {@link graphwiz.room.UpdatePermissionsRequest.verify|verify} messages.
             * @param message UpdatePermissionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IUpdatePermissionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdatePermissionsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdatePermissionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.UpdatePermissionsRequest;

            /**
             * Decodes an UpdatePermissionsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdatePermissionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.UpdatePermissionsRequest;

            /**
             * Verifies an UpdatePermissionsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdatePermissionsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdatePermissionsRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.UpdatePermissionsRequest;

            /**
             * Creates a plain object from an UpdatePermissionsRequest message. Also converts values to other types if specified.
             * @param message UpdatePermissionsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.UpdatePermissionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdatePermissionsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdatePermissionsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdatePermissionsResponse. */
        interface IUpdatePermissionsResponse {

            /** UpdatePermissionsResponse success */
            success?: (boolean|null);

            /** UpdatePermissionsResponse permissions */
            permissions?: (graphwiz.room.IRoomPermissions|null);
        }

        /** Represents an UpdatePermissionsResponse. */
        class UpdatePermissionsResponse implements IUpdatePermissionsResponse {

            /**
             * Constructs a new UpdatePermissionsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IUpdatePermissionsResponse);

            /** UpdatePermissionsResponse success. */
            public success: boolean;

            /** UpdatePermissionsResponse permissions. */
            public permissions?: (graphwiz.room.IRoomPermissions|null);

            /**
             * Creates a new UpdatePermissionsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdatePermissionsResponse instance
             */
            public static create(properties?: graphwiz.room.IUpdatePermissionsResponse): graphwiz.room.UpdatePermissionsResponse;

            /**
             * Encodes the specified UpdatePermissionsResponse message. Does not implicitly {@link graphwiz.room.UpdatePermissionsResponse.verify|verify} messages.
             * @param message UpdatePermissionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IUpdatePermissionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdatePermissionsResponse message, length delimited. Does not implicitly {@link graphwiz.room.UpdatePermissionsResponse.verify|verify} messages.
             * @param message UpdatePermissionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IUpdatePermissionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdatePermissionsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdatePermissionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.UpdatePermissionsResponse;

            /**
             * Decodes an UpdatePermissionsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdatePermissionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.UpdatePermissionsResponse;

            /**
             * Verifies an UpdatePermissionsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdatePermissionsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdatePermissionsResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.UpdatePermissionsResponse;

            /**
             * Creates a plain object from an UpdatePermissionsResponse message. Also converts values to other types if specified.
             * @param message UpdatePermissionsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.UpdatePermissionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdatePermissionsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdatePermissionsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RoomSettings. */
        interface IRoomSettings {

            /** RoomSettings maxPlayers */
            maxPlayers?: (number|null);

            /** RoomSettings isPublic */
            isPublic?: (boolean|null);

            /** RoomSettings allowVoiceChat */
            allowVoiceChat?: (boolean|null);

            /** RoomSettings allowTextChat */
            allowTextChat?: (boolean|null);

            /** RoomSettings allowInvites */
            allowInvites?: (boolean|null);

            /** RoomSettings maxSpectators */
            maxSpectators?: (number|null);

            /** RoomSettings requireApproval */
            requireApproval?: (boolean|null);

            /** RoomSettings passwordHash */
            passwordHash?: (string|null);

            /** RoomSettings customSettings */
            customSettings?: ({ [k: string]: string }|null);
        }

        /** Represents a RoomSettings. */
        class RoomSettings implements IRoomSettings {

            /**
             * Constructs a new RoomSettings.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IRoomSettings);

            /** RoomSettings maxPlayers. */
            public maxPlayers: number;

            /** RoomSettings isPublic. */
            public isPublic: boolean;

            /** RoomSettings allowVoiceChat. */
            public allowVoiceChat: boolean;

            /** RoomSettings allowTextChat. */
            public allowTextChat: boolean;

            /** RoomSettings allowInvites. */
            public allowInvites: boolean;

            /** RoomSettings maxSpectators. */
            public maxSpectators: number;

            /** RoomSettings requireApproval. */
            public requireApproval: boolean;

            /** RoomSettings passwordHash. */
            public passwordHash: string;

            /** RoomSettings customSettings. */
            public customSettings: { [k: string]: string };

            /**
             * Creates a new RoomSettings instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RoomSettings instance
             */
            public static create(properties?: graphwiz.room.IRoomSettings): graphwiz.room.RoomSettings;

            /**
             * Encodes the specified RoomSettings message. Does not implicitly {@link graphwiz.room.RoomSettings.verify|verify} messages.
             * @param message RoomSettings message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IRoomSettings, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RoomSettings message, length delimited. Does not implicitly {@link graphwiz.room.RoomSettings.verify|verify} messages.
             * @param message RoomSettings message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IRoomSettings, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RoomSettings message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RoomSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.RoomSettings;

            /**
             * Decodes a RoomSettings message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RoomSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.RoomSettings;

            /**
             * Verifies a RoomSettings message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RoomSettings message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RoomSettings
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.RoomSettings;

            /**
             * Creates a plain object from a RoomSettings message. Also converts values to other types if specified.
             * @param message RoomSettings
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.RoomSettings, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RoomSettings to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RoomSettings
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RoomPermissions. */
        interface IRoomPermissions {

            /** RoomPermissions ownerIds */
            ownerIds?: (string[]|null);

            /** RoomPermissions moderatorIds */
            moderatorIds?: (string[]|null);

            /** RoomPermissions bannedUserIds */
            bannedUserIds?: (string[]|null);

            /** RoomPermissions allowedUserIds */
            allowedUserIds?: (string[]|null);

            /** RoomPermissions defaultPermission */
            defaultPermission?: (graphwiz.room.PermissionLevel|null);
        }

        /** Represents a RoomPermissions. */
        class RoomPermissions implements IRoomPermissions {

            /**
             * Constructs a new RoomPermissions.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IRoomPermissions);

            /** RoomPermissions ownerIds. */
            public ownerIds: string[];

            /** RoomPermissions moderatorIds. */
            public moderatorIds: string[];

            /** RoomPermissions bannedUserIds. */
            public bannedUserIds: string[];

            /** RoomPermissions allowedUserIds. */
            public allowedUserIds: string[];

            /** RoomPermissions defaultPermission. */
            public defaultPermission: graphwiz.room.PermissionLevel;

            /**
             * Creates a new RoomPermissions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RoomPermissions instance
             */
            public static create(properties?: graphwiz.room.IRoomPermissions): graphwiz.room.RoomPermissions;

            /**
             * Encodes the specified RoomPermissions message. Does not implicitly {@link graphwiz.room.RoomPermissions.verify|verify} messages.
             * @param message RoomPermissions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IRoomPermissions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RoomPermissions message, length delimited. Does not implicitly {@link graphwiz.room.RoomPermissions.verify|verify} messages.
             * @param message RoomPermissions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IRoomPermissions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RoomPermissions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RoomPermissions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.RoomPermissions;

            /**
             * Decodes a RoomPermissions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RoomPermissions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.RoomPermissions;

            /**
             * Verifies a RoomPermissions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RoomPermissions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RoomPermissions
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.RoomPermissions;

            /**
             * Creates a plain object from a RoomPermissions message. Also converts values to other types if specified.
             * @param message RoomPermissions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.RoomPermissions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RoomPermissions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RoomPermissions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** PermissionLevel enum. */
        enum PermissionLevel {
            NONE = 0,
            VIEWER = 1,
            PARTICIPANT = 2,
            MODERATOR = 3,
            OWNER = 4
        }

        /** Properties of a RoomFilter. */
        interface IRoomFilter {

            /** RoomFilter publicOnly */
            publicOnly?: (boolean|null);

            /** RoomFilter minPlayers */
            minPlayers?: (number|null);

            /** RoomFilter maxPlayers */
            maxPlayers?: (number|null);

            /** RoomFilter hasVoiceChat */
            hasVoiceChat?: (boolean|null);

            /** RoomFilter hasTextChat */
            hasTextChat?: (boolean|null);

            /** RoomFilter tags */
            tags?: (string[]|null);
        }

        /** Represents a RoomFilter. */
        class RoomFilter implements IRoomFilter {

            /**
             * Constructs a new RoomFilter.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.room.IRoomFilter);

            /** RoomFilter publicOnly. */
            public publicOnly: boolean;

            /** RoomFilter minPlayers. */
            public minPlayers: number;

            /** RoomFilter maxPlayers. */
            public maxPlayers: number;

            /** RoomFilter hasVoiceChat. */
            public hasVoiceChat: boolean;

            /** RoomFilter hasTextChat. */
            public hasTextChat: boolean;

            /** RoomFilter tags. */
            public tags: string[];

            /**
             * Creates a new RoomFilter instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RoomFilter instance
             */
            public static create(properties?: graphwiz.room.IRoomFilter): graphwiz.room.RoomFilter;

            /**
             * Encodes the specified RoomFilter message. Does not implicitly {@link graphwiz.room.RoomFilter.verify|verify} messages.
             * @param message RoomFilter message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.room.IRoomFilter, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RoomFilter message, length delimited. Does not implicitly {@link graphwiz.room.RoomFilter.verify|verify} messages.
             * @param message RoomFilter message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.room.IRoomFilter, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RoomFilter message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RoomFilter
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.room.RoomFilter;

            /**
             * Decodes a RoomFilter message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RoomFilter
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.room.RoomFilter;

            /**
             * Verifies a RoomFilter message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RoomFilter message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RoomFilter
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.room.RoomFilter;

            /**
             * Creates a plain object from a RoomFilter message. Also converts values to other types if specified.
             * @param message RoomFilter
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.room.RoomFilter, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RoomFilter to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RoomFilter
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace media. */
    namespace media {

        /** Represents a MediaService */
        class MediaService extends $protobuf.rpc.Service {

            /**
             * Constructs a new MediaService service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new MediaService service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): MediaService;

            /**
             * Calls CreateOffer.
             * @param request CreateOfferRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and CreateOfferResponse
             */
            public createOffer(request: graphwiz.media.ICreateOfferRequest, callback: graphwiz.media.MediaService.CreateOfferCallback): void;

            /**
             * Calls CreateOffer.
             * @param request CreateOfferRequest message or plain object
             * @returns Promise
             */
            public createOffer(request: graphwiz.media.ICreateOfferRequest): Promise<graphwiz.media.CreateOfferResponse>;

            /**
             * Calls CreateAnswer.
             * @param request CreateAnswerRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and CreateAnswerResponse
             */
            public createAnswer(request: graphwiz.media.ICreateAnswerRequest, callback: graphwiz.media.MediaService.CreateAnswerCallback): void;

            /**
             * Calls CreateAnswer.
             * @param request CreateAnswerRequest message or plain object
             * @returns Promise
             */
            public createAnswer(request: graphwiz.media.ICreateAnswerRequest): Promise<graphwiz.media.CreateAnswerResponse>;

            /**
             * Calls SetRemoteDescription.
             * @param request SetRemoteDescriptionRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and SetRemoteDescriptionResponse
             */
            public setRemoteDescription(request: graphwiz.media.ISetRemoteDescriptionRequest, callback: graphwiz.media.MediaService.SetRemoteDescriptionCallback): void;

            /**
             * Calls SetRemoteDescription.
             * @param request SetRemoteDescriptionRequest message or plain object
             * @returns Promise
             */
            public setRemoteDescription(request: graphwiz.media.ISetRemoteDescriptionRequest): Promise<graphwiz.media.SetRemoteDescriptionResponse>;

            /**
             * Calls AddIceCandidate.
             * @param request AddIceCandidateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and AddIceCandidateResponse
             */
            public addIceCandidate(request: graphwiz.media.IAddIceCandidateRequest, callback: graphwiz.media.MediaService.AddIceCandidateCallback): void;

            /**
             * Calls AddIceCandidate.
             * @param request AddIceCandidateRequest message or plain object
             * @returns Promise
             */
            public addIceCandidate(request: graphwiz.media.IAddIceCandidateRequest): Promise<graphwiz.media.AddIceCandidateResponse>;

            /**
             * Calls AddTrack.
             * @param request AddTrackRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and AddTrackResponse
             */
            public addTrack(request: graphwiz.media.IAddTrackRequest, callback: graphwiz.media.MediaService.AddTrackCallback): void;

            /**
             * Calls AddTrack.
             * @param request AddTrackRequest message or plain object
             * @returns Promise
             */
            public addTrack(request: graphwiz.media.IAddTrackRequest): Promise<graphwiz.media.AddTrackResponse>;

            /**
             * Calls RemoveTrack.
             * @param request RemoveTrackRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and RemoveTrackResponse
             */
            public removeTrack(request: graphwiz.media.IRemoveTrackRequest, callback: graphwiz.media.MediaService.RemoveTrackCallback): void;

            /**
             * Calls RemoveTrack.
             * @param request RemoveTrackRequest message or plain object
             * @returns Promise
             */
            public removeTrack(request: graphwiz.media.IRemoveTrackRequest): Promise<graphwiz.media.RemoveTrackResponse>;

            /**
             * Calls MuteTrack.
             * @param request MuteTrackRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and MuteTrackResponse
             */
            public muteTrack(request: graphwiz.media.IMuteTrackRequest, callback: graphwiz.media.MediaService.MuteTrackCallback): void;

            /**
             * Calls MuteTrack.
             * @param request MuteTrackRequest message or plain object
             * @returns Promise
             */
            public muteTrack(request: graphwiz.media.IMuteTrackRequest): Promise<graphwiz.media.MuteTrackResponse>;

            /**
             * Calls JoinSession.
             * @param request JoinSessionRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and JoinSessionResponse
             */
            public joinSession(request: graphwiz.media.IJoinSessionRequest, callback: graphwiz.media.MediaService.JoinSessionCallback): void;

            /**
             * Calls JoinSession.
             * @param request JoinSessionRequest message or plain object
             * @returns Promise
             */
            public joinSession(request: graphwiz.media.IJoinSessionRequest): Promise<graphwiz.media.JoinSessionResponse>;

            /**
             * Calls LeaveSession.
             * @param request LeaveSessionRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and LeaveSessionResponse
             */
            public leaveSession(request: graphwiz.media.ILeaveSessionRequest, callback: graphwiz.media.MediaService.LeaveSessionCallback): void;

            /**
             * Calls LeaveSession.
             * @param request LeaveSessionRequest message or plain object
             * @returns Promise
             */
            public leaveSession(request: graphwiz.media.ILeaveSessionRequest): Promise<graphwiz.media.LeaveSessionResponse>;

            /**
             * Calls StreamMediaEvents.
             * @param request StreamMediaEventsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and MediaEvent
             */
            public streamMediaEvents(request: graphwiz.media.IStreamMediaEventsRequest, callback: graphwiz.media.MediaService.StreamMediaEventsCallback): void;

            /**
             * Calls StreamMediaEvents.
             * @param request StreamMediaEventsRequest message or plain object
             * @returns Promise
             */
            public streamMediaEvents(request: graphwiz.media.IStreamMediaEventsRequest): Promise<graphwiz.media.MediaEvent>;
        }

        namespace MediaService {

            /**
             * Callback as used by {@link graphwiz.media.MediaService#createOffer}.
             * @param error Error, if any
             * @param [response] CreateOfferResponse
             */
            type CreateOfferCallback = (error: (Error|null), response?: graphwiz.media.CreateOfferResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#createAnswer}.
             * @param error Error, if any
             * @param [response] CreateAnswerResponse
             */
            type CreateAnswerCallback = (error: (Error|null), response?: graphwiz.media.CreateAnswerResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#setRemoteDescription}.
             * @param error Error, if any
             * @param [response] SetRemoteDescriptionResponse
             */
            type SetRemoteDescriptionCallback = (error: (Error|null), response?: graphwiz.media.SetRemoteDescriptionResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#addIceCandidate}.
             * @param error Error, if any
             * @param [response] AddIceCandidateResponse
             */
            type AddIceCandidateCallback = (error: (Error|null), response?: graphwiz.media.AddIceCandidateResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#addTrack}.
             * @param error Error, if any
             * @param [response] AddTrackResponse
             */
            type AddTrackCallback = (error: (Error|null), response?: graphwiz.media.AddTrackResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#removeTrack}.
             * @param error Error, if any
             * @param [response] RemoveTrackResponse
             */
            type RemoveTrackCallback = (error: (Error|null), response?: graphwiz.media.RemoveTrackResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#muteTrack}.
             * @param error Error, if any
             * @param [response] MuteTrackResponse
             */
            type MuteTrackCallback = (error: (Error|null), response?: graphwiz.media.MuteTrackResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#joinSession}.
             * @param error Error, if any
             * @param [response] JoinSessionResponse
             */
            type JoinSessionCallback = (error: (Error|null), response?: graphwiz.media.JoinSessionResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#leaveSession}.
             * @param error Error, if any
             * @param [response] LeaveSessionResponse
             */
            type LeaveSessionCallback = (error: (Error|null), response?: graphwiz.media.LeaveSessionResponse) => void;

            /**
             * Callback as used by {@link graphwiz.media.MediaService#streamMediaEvents}.
             * @param error Error, if any
             * @param [response] MediaEvent
             */
            type StreamMediaEventsCallback = (error: (Error|null), response?: graphwiz.media.MediaEvent) => void;
        }

        /** Properties of a CreateOfferRequest. */
        interface ICreateOfferRequest {

            /** CreateOfferRequest roomId */
            roomId?: (string|null);

            /** CreateOfferRequest clientId */
            clientId?: (string|null);

            /** CreateOfferRequest constraints */
            constraints?: (graphwiz.media.IMediaConstraints|null);
        }

        /** Represents a CreateOfferRequest. */
        class CreateOfferRequest implements ICreateOfferRequest {

            /**
             * Constructs a new CreateOfferRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ICreateOfferRequest);

            /** CreateOfferRequest roomId. */
            public roomId: string;

            /** CreateOfferRequest clientId. */
            public clientId: string;

            /** CreateOfferRequest constraints. */
            public constraints?: (graphwiz.media.IMediaConstraints|null);

            /**
             * Creates a new CreateOfferRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateOfferRequest instance
             */
            public static create(properties?: graphwiz.media.ICreateOfferRequest): graphwiz.media.CreateOfferRequest;

            /**
             * Encodes the specified CreateOfferRequest message. Does not implicitly {@link graphwiz.media.CreateOfferRequest.verify|verify} messages.
             * @param message CreateOfferRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ICreateOfferRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateOfferRequest message, length delimited. Does not implicitly {@link graphwiz.media.CreateOfferRequest.verify|verify} messages.
             * @param message CreateOfferRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ICreateOfferRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateOfferRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateOfferRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.CreateOfferRequest;

            /**
             * Decodes a CreateOfferRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateOfferRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.CreateOfferRequest;

            /**
             * Verifies a CreateOfferRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateOfferRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateOfferRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.CreateOfferRequest;

            /**
             * Creates a plain object from a CreateOfferRequest message. Also converts values to other types if specified.
             * @param message CreateOfferRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.CreateOfferRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateOfferRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateOfferRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateOfferResponse. */
        interface ICreateOfferResponse {

            /** CreateOfferResponse success */
            success?: (boolean|null);

            /** CreateOfferResponse sdp */
            sdp?: (string|null);

            /** CreateOfferResponse sessionId */
            sessionId?: (string|null);
        }

        /** Represents a CreateOfferResponse. */
        class CreateOfferResponse implements ICreateOfferResponse {

            /**
             * Constructs a new CreateOfferResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ICreateOfferResponse);

            /** CreateOfferResponse success. */
            public success: boolean;

            /** CreateOfferResponse sdp. */
            public sdp: string;

            /** CreateOfferResponse sessionId. */
            public sessionId: string;

            /**
             * Creates a new CreateOfferResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateOfferResponse instance
             */
            public static create(properties?: graphwiz.media.ICreateOfferResponse): graphwiz.media.CreateOfferResponse;

            /**
             * Encodes the specified CreateOfferResponse message. Does not implicitly {@link graphwiz.media.CreateOfferResponse.verify|verify} messages.
             * @param message CreateOfferResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ICreateOfferResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateOfferResponse message, length delimited. Does not implicitly {@link graphwiz.media.CreateOfferResponse.verify|verify} messages.
             * @param message CreateOfferResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ICreateOfferResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateOfferResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateOfferResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.CreateOfferResponse;

            /**
             * Decodes a CreateOfferResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateOfferResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.CreateOfferResponse;

            /**
             * Verifies a CreateOfferResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateOfferResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateOfferResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.CreateOfferResponse;

            /**
             * Creates a plain object from a CreateOfferResponse message. Also converts values to other types if specified.
             * @param message CreateOfferResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.CreateOfferResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateOfferResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateOfferResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateAnswerRequest. */
        interface ICreateAnswerRequest {

            /** CreateAnswerRequest roomId */
            roomId?: (string|null);

            /** CreateAnswerRequest clientId */
            clientId?: (string|null);

            /** CreateAnswerRequest offerSdp */
            offerSdp?: (string|null);

            /** CreateAnswerRequest constraints */
            constraints?: (graphwiz.media.IMediaConstraints|null);
        }

        /** Represents a CreateAnswerRequest. */
        class CreateAnswerRequest implements ICreateAnswerRequest {

            /**
             * Constructs a new CreateAnswerRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ICreateAnswerRequest);

            /** CreateAnswerRequest roomId. */
            public roomId: string;

            /** CreateAnswerRequest clientId. */
            public clientId: string;

            /** CreateAnswerRequest offerSdp. */
            public offerSdp: string;

            /** CreateAnswerRequest constraints. */
            public constraints?: (graphwiz.media.IMediaConstraints|null);

            /**
             * Creates a new CreateAnswerRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateAnswerRequest instance
             */
            public static create(properties?: graphwiz.media.ICreateAnswerRequest): graphwiz.media.CreateAnswerRequest;

            /**
             * Encodes the specified CreateAnswerRequest message. Does not implicitly {@link graphwiz.media.CreateAnswerRequest.verify|verify} messages.
             * @param message CreateAnswerRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ICreateAnswerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateAnswerRequest message, length delimited. Does not implicitly {@link graphwiz.media.CreateAnswerRequest.verify|verify} messages.
             * @param message CreateAnswerRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ICreateAnswerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateAnswerRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateAnswerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.CreateAnswerRequest;

            /**
             * Decodes a CreateAnswerRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateAnswerRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.CreateAnswerRequest;

            /**
             * Verifies a CreateAnswerRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateAnswerRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateAnswerRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.CreateAnswerRequest;

            /**
             * Creates a plain object from a CreateAnswerRequest message. Also converts values to other types if specified.
             * @param message CreateAnswerRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.CreateAnswerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateAnswerRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateAnswerRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateAnswerResponse. */
        interface ICreateAnswerResponse {

            /** CreateAnswerResponse success */
            success?: (boolean|null);

            /** CreateAnswerResponse sdp */
            sdp?: (string|null);
        }

        /** Represents a CreateAnswerResponse. */
        class CreateAnswerResponse implements ICreateAnswerResponse {

            /**
             * Constructs a new CreateAnswerResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ICreateAnswerResponse);

            /** CreateAnswerResponse success. */
            public success: boolean;

            /** CreateAnswerResponse sdp. */
            public sdp: string;

            /**
             * Creates a new CreateAnswerResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateAnswerResponse instance
             */
            public static create(properties?: graphwiz.media.ICreateAnswerResponse): graphwiz.media.CreateAnswerResponse;

            /**
             * Encodes the specified CreateAnswerResponse message. Does not implicitly {@link graphwiz.media.CreateAnswerResponse.verify|verify} messages.
             * @param message CreateAnswerResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ICreateAnswerResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateAnswerResponse message, length delimited. Does not implicitly {@link graphwiz.media.CreateAnswerResponse.verify|verify} messages.
             * @param message CreateAnswerResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ICreateAnswerResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateAnswerResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateAnswerResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.CreateAnswerResponse;

            /**
             * Decodes a CreateAnswerResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateAnswerResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.CreateAnswerResponse;

            /**
             * Verifies a CreateAnswerResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateAnswerResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateAnswerResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.CreateAnswerResponse;

            /**
             * Creates a plain object from a CreateAnswerResponse message. Also converts values to other types if specified.
             * @param message CreateAnswerResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.CreateAnswerResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateAnswerResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateAnswerResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SetRemoteDescriptionRequest. */
        interface ISetRemoteDescriptionRequest {

            /** SetRemoteDescriptionRequest roomId */
            roomId?: (string|null);

            /** SetRemoteDescriptionRequest clientId */
            clientId?: (string|null);

            /** SetRemoteDescriptionRequest sdp */
            sdp?: (string|null);

            /** SetRemoteDescriptionRequest type */
            type?: (graphwiz.media.SessionDescriptionType|null);
        }

        /** Represents a SetRemoteDescriptionRequest. */
        class SetRemoteDescriptionRequest implements ISetRemoteDescriptionRequest {

            /**
             * Constructs a new SetRemoteDescriptionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ISetRemoteDescriptionRequest);

            /** SetRemoteDescriptionRequest roomId. */
            public roomId: string;

            /** SetRemoteDescriptionRequest clientId. */
            public clientId: string;

            /** SetRemoteDescriptionRequest sdp. */
            public sdp: string;

            /** SetRemoteDescriptionRequest type. */
            public type: graphwiz.media.SessionDescriptionType;

            /**
             * Creates a new SetRemoteDescriptionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SetRemoteDescriptionRequest instance
             */
            public static create(properties?: graphwiz.media.ISetRemoteDescriptionRequest): graphwiz.media.SetRemoteDescriptionRequest;

            /**
             * Encodes the specified SetRemoteDescriptionRequest message. Does not implicitly {@link graphwiz.media.SetRemoteDescriptionRequest.verify|verify} messages.
             * @param message SetRemoteDescriptionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ISetRemoteDescriptionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SetRemoteDescriptionRequest message, length delimited. Does not implicitly {@link graphwiz.media.SetRemoteDescriptionRequest.verify|verify} messages.
             * @param message SetRemoteDescriptionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ISetRemoteDescriptionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SetRemoteDescriptionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SetRemoteDescriptionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.SetRemoteDescriptionRequest;

            /**
             * Decodes a SetRemoteDescriptionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SetRemoteDescriptionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.SetRemoteDescriptionRequest;

            /**
             * Verifies a SetRemoteDescriptionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SetRemoteDescriptionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SetRemoteDescriptionRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.SetRemoteDescriptionRequest;

            /**
             * Creates a plain object from a SetRemoteDescriptionRequest message. Also converts values to other types if specified.
             * @param message SetRemoteDescriptionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.SetRemoteDescriptionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SetRemoteDescriptionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SetRemoteDescriptionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SetRemoteDescriptionResponse. */
        interface ISetRemoteDescriptionResponse {

            /** SetRemoteDescriptionResponse success */
            success?: (boolean|null);
        }

        /** Represents a SetRemoteDescriptionResponse. */
        class SetRemoteDescriptionResponse implements ISetRemoteDescriptionResponse {

            /**
             * Constructs a new SetRemoteDescriptionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ISetRemoteDescriptionResponse);

            /** SetRemoteDescriptionResponse success. */
            public success: boolean;

            /**
             * Creates a new SetRemoteDescriptionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SetRemoteDescriptionResponse instance
             */
            public static create(properties?: graphwiz.media.ISetRemoteDescriptionResponse): graphwiz.media.SetRemoteDescriptionResponse;

            /**
             * Encodes the specified SetRemoteDescriptionResponse message. Does not implicitly {@link graphwiz.media.SetRemoteDescriptionResponse.verify|verify} messages.
             * @param message SetRemoteDescriptionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ISetRemoteDescriptionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SetRemoteDescriptionResponse message, length delimited. Does not implicitly {@link graphwiz.media.SetRemoteDescriptionResponse.verify|verify} messages.
             * @param message SetRemoteDescriptionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ISetRemoteDescriptionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SetRemoteDescriptionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SetRemoteDescriptionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.SetRemoteDescriptionResponse;

            /**
             * Decodes a SetRemoteDescriptionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SetRemoteDescriptionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.SetRemoteDescriptionResponse;

            /**
             * Verifies a SetRemoteDescriptionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SetRemoteDescriptionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SetRemoteDescriptionResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.SetRemoteDescriptionResponse;

            /**
             * Creates a plain object from a SetRemoteDescriptionResponse message. Also converts values to other types if specified.
             * @param message SetRemoteDescriptionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.SetRemoteDescriptionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SetRemoteDescriptionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SetRemoteDescriptionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AddIceCandidateRequest. */
        interface IAddIceCandidateRequest {

            /** AddIceCandidateRequest roomId */
            roomId?: (string|null);

            /** AddIceCandidateRequest clientId */
            clientId?: (string|null);

            /** AddIceCandidateRequest candidate */
            candidate?: (graphwiz.media.IIceCandidate|null);
        }

        /** Represents an AddIceCandidateRequest. */
        class AddIceCandidateRequest implements IAddIceCandidateRequest {

            /**
             * Constructs a new AddIceCandidateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IAddIceCandidateRequest);

            /** AddIceCandidateRequest roomId. */
            public roomId: string;

            /** AddIceCandidateRequest clientId. */
            public clientId: string;

            /** AddIceCandidateRequest candidate. */
            public candidate?: (graphwiz.media.IIceCandidate|null);

            /**
             * Creates a new AddIceCandidateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AddIceCandidateRequest instance
             */
            public static create(properties?: graphwiz.media.IAddIceCandidateRequest): graphwiz.media.AddIceCandidateRequest;

            /**
             * Encodes the specified AddIceCandidateRequest message. Does not implicitly {@link graphwiz.media.AddIceCandidateRequest.verify|verify} messages.
             * @param message AddIceCandidateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IAddIceCandidateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AddIceCandidateRequest message, length delimited. Does not implicitly {@link graphwiz.media.AddIceCandidateRequest.verify|verify} messages.
             * @param message AddIceCandidateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IAddIceCandidateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AddIceCandidateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AddIceCandidateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.AddIceCandidateRequest;

            /**
             * Decodes an AddIceCandidateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AddIceCandidateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.AddIceCandidateRequest;

            /**
             * Verifies an AddIceCandidateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AddIceCandidateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AddIceCandidateRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.AddIceCandidateRequest;

            /**
             * Creates a plain object from an AddIceCandidateRequest message. Also converts values to other types if specified.
             * @param message AddIceCandidateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.AddIceCandidateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AddIceCandidateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AddIceCandidateRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AddIceCandidateResponse. */
        interface IAddIceCandidateResponse {

            /** AddIceCandidateResponse success */
            success?: (boolean|null);
        }

        /** Represents an AddIceCandidateResponse. */
        class AddIceCandidateResponse implements IAddIceCandidateResponse {

            /**
             * Constructs a new AddIceCandidateResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IAddIceCandidateResponse);

            /** AddIceCandidateResponse success. */
            public success: boolean;

            /**
             * Creates a new AddIceCandidateResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AddIceCandidateResponse instance
             */
            public static create(properties?: graphwiz.media.IAddIceCandidateResponse): graphwiz.media.AddIceCandidateResponse;

            /**
             * Encodes the specified AddIceCandidateResponse message. Does not implicitly {@link graphwiz.media.AddIceCandidateResponse.verify|verify} messages.
             * @param message AddIceCandidateResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IAddIceCandidateResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AddIceCandidateResponse message, length delimited. Does not implicitly {@link graphwiz.media.AddIceCandidateResponse.verify|verify} messages.
             * @param message AddIceCandidateResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IAddIceCandidateResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AddIceCandidateResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AddIceCandidateResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.AddIceCandidateResponse;

            /**
             * Decodes an AddIceCandidateResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AddIceCandidateResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.AddIceCandidateResponse;

            /**
             * Verifies an AddIceCandidateResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AddIceCandidateResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AddIceCandidateResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.AddIceCandidateResponse;

            /**
             * Creates a plain object from an AddIceCandidateResponse message. Also converts values to other types if specified.
             * @param message AddIceCandidateResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.AddIceCandidateResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AddIceCandidateResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AddIceCandidateResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an IceCandidate. */
        interface IIceCandidate {

            /** IceCandidate candidate */
            candidate?: (string|null);

            /** IceCandidate sdpMid */
            sdpMid?: (string|null);

            /** IceCandidate sdpMlineIndex */
            sdpMlineIndex?: (number|null);

            /** IceCandidate usernameFragment */
            usernameFragment?: (string|null);
        }

        /** Represents an IceCandidate. */
        class IceCandidate implements IIceCandidate {

            /**
             * Constructs a new IceCandidate.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IIceCandidate);

            /** IceCandidate candidate. */
            public candidate: string;

            /** IceCandidate sdpMid. */
            public sdpMid: string;

            /** IceCandidate sdpMlineIndex. */
            public sdpMlineIndex: number;

            /** IceCandidate usernameFragment. */
            public usernameFragment: string;

            /**
             * Creates a new IceCandidate instance using the specified properties.
             * @param [properties] Properties to set
             * @returns IceCandidate instance
             */
            public static create(properties?: graphwiz.media.IIceCandidate): graphwiz.media.IceCandidate;

            /**
             * Encodes the specified IceCandidate message. Does not implicitly {@link graphwiz.media.IceCandidate.verify|verify} messages.
             * @param message IceCandidate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IIceCandidate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified IceCandidate message, length delimited. Does not implicitly {@link graphwiz.media.IceCandidate.verify|verify} messages.
             * @param message IceCandidate message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IIceCandidate, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an IceCandidate message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns IceCandidate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.IceCandidate;

            /**
             * Decodes an IceCandidate message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns IceCandidate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.IceCandidate;

            /**
             * Verifies an IceCandidate message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an IceCandidate message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns IceCandidate
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.IceCandidate;

            /**
             * Creates a plain object from an IceCandidate message. Also converts values to other types if specified.
             * @param message IceCandidate
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.IceCandidate, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this IceCandidate to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for IceCandidate
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AddTrackRequest. */
        interface IAddTrackRequest {

            /** AddTrackRequest roomId */
            roomId?: (string|null);

            /** AddTrackRequest clientId */
            clientId?: (string|null);

            /** AddTrackRequest trackId */
            trackId?: (string|null);

            /** AddTrackRequest kind */
            kind?: (graphwiz.media.TrackKind|null);

            /** AddTrackRequest metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents an AddTrackRequest. */
        class AddTrackRequest implements IAddTrackRequest {

            /**
             * Constructs a new AddTrackRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IAddTrackRequest);

            /** AddTrackRequest roomId. */
            public roomId: string;

            /** AddTrackRequest clientId. */
            public clientId: string;

            /** AddTrackRequest trackId. */
            public trackId: string;

            /** AddTrackRequest kind. */
            public kind: graphwiz.media.TrackKind;

            /** AddTrackRequest metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new AddTrackRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AddTrackRequest instance
             */
            public static create(properties?: graphwiz.media.IAddTrackRequest): graphwiz.media.AddTrackRequest;

            /**
             * Encodes the specified AddTrackRequest message. Does not implicitly {@link graphwiz.media.AddTrackRequest.verify|verify} messages.
             * @param message AddTrackRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IAddTrackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AddTrackRequest message, length delimited. Does not implicitly {@link graphwiz.media.AddTrackRequest.verify|verify} messages.
             * @param message AddTrackRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IAddTrackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AddTrackRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AddTrackRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.AddTrackRequest;

            /**
             * Decodes an AddTrackRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AddTrackRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.AddTrackRequest;

            /**
             * Verifies an AddTrackRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AddTrackRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AddTrackRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.AddTrackRequest;

            /**
             * Creates a plain object from an AddTrackRequest message. Also converts values to other types if specified.
             * @param message AddTrackRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.AddTrackRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AddTrackRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AddTrackRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AddTrackResponse. */
        interface IAddTrackResponse {

            /** AddTrackResponse success */
            success?: (boolean|null);

            /** AddTrackResponse trackId */
            trackId?: (string|null);

            /** AddTrackResponse transceiverId */
            transceiverId?: (string|null);
        }

        /** Represents an AddTrackResponse. */
        class AddTrackResponse implements IAddTrackResponse {

            /**
             * Constructs a new AddTrackResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IAddTrackResponse);

            /** AddTrackResponse success. */
            public success: boolean;

            /** AddTrackResponse trackId. */
            public trackId: string;

            /** AddTrackResponse transceiverId. */
            public transceiverId: string;

            /**
             * Creates a new AddTrackResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AddTrackResponse instance
             */
            public static create(properties?: graphwiz.media.IAddTrackResponse): graphwiz.media.AddTrackResponse;

            /**
             * Encodes the specified AddTrackResponse message. Does not implicitly {@link graphwiz.media.AddTrackResponse.verify|verify} messages.
             * @param message AddTrackResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IAddTrackResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AddTrackResponse message, length delimited. Does not implicitly {@link graphwiz.media.AddTrackResponse.verify|verify} messages.
             * @param message AddTrackResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IAddTrackResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AddTrackResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AddTrackResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.AddTrackResponse;

            /**
             * Decodes an AddTrackResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AddTrackResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.AddTrackResponse;

            /**
             * Verifies an AddTrackResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AddTrackResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AddTrackResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.AddTrackResponse;

            /**
             * Creates a plain object from an AddTrackResponse message. Also converts values to other types if specified.
             * @param message AddTrackResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.AddTrackResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AddTrackResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AddTrackResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RemoveTrackRequest. */
        interface IRemoveTrackRequest {

            /** RemoveTrackRequest roomId */
            roomId?: (string|null);

            /** RemoveTrackRequest clientId */
            clientId?: (string|null);

            /** RemoveTrackRequest trackId */
            trackId?: (string|null);
        }

        /** Represents a RemoveTrackRequest. */
        class RemoveTrackRequest implements IRemoveTrackRequest {

            /**
             * Constructs a new RemoveTrackRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IRemoveTrackRequest);

            /** RemoveTrackRequest roomId. */
            public roomId: string;

            /** RemoveTrackRequest clientId. */
            public clientId: string;

            /** RemoveTrackRequest trackId. */
            public trackId: string;

            /**
             * Creates a new RemoveTrackRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RemoveTrackRequest instance
             */
            public static create(properties?: graphwiz.media.IRemoveTrackRequest): graphwiz.media.RemoveTrackRequest;

            /**
             * Encodes the specified RemoveTrackRequest message. Does not implicitly {@link graphwiz.media.RemoveTrackRequest.verify|verify} messages.
             * @param message RemoveTrackRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IRemoveTrackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RemoveTrackRequest message, length delimited. Does not implicitly {@link graphwiz.media.RemoveTrackRequest.verify|verify} messages.
             * @param message RemoveTrackRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IRemoveTrackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RemoveTrackRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RemoveTrackRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.RemoveTrackRequest;

            /**
             * Decodes a RemoveTrackRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RemoveTrackRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.RemoveTrackRequest;

            /**
             * Verifies a RemoveTrackRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RemoveTrackRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RemoveTrackRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.RemoveTrackRequest;

            /**
             * Creates a plain object from a RemoveTrackRequest message. Also converts values to other types if specified.
             * @param message RemoveTrackRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.RemoveTrackRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RemoveTrackRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RemoveTrackRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RemoveTrackResponse. */
        interface IRemoveTrackResponse {

            /** RemoveTrackResponse success */
            success?: (boolean|null);
        }

        /** Represents a RemoveTrackResponse. */
        class RemoveTrackResponse implements IRemoveTrackResponse {

            /**
             * Constructs a new RemoveTrackResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IRemoveTrackResponse);

            /** RemoveTrackResponse success. */
            public success: boolean;

            /**
             * Creates a new RemoveTrackResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RemoveTrackResponse instance
             */
            public static create(properties?: graphwiz.media.IRemoveTrackResponse): graphwiz.media.RemoveTrackResponse;

            /**
             * Encodes the specified RemoveTrackResponse message. Does not implicitly {@link graphwiz.media.RemoveTrackResponse.verify|verify} messages.
             * @param message RemoveTrackResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IRemoveTrackResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RemoveTrackResponse message, length delimited. Does not implicitly {@link graphwiz.media.RemoveTrackResponse.verify|verify} messages.
             * @param message RemoveTrackResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IRemoveTrackResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RemoveTrackResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RemoveTrackResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.RemoveTrackResponse;

            /**
             * Decodes a RemoveTrackResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RemoveTrackResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.RemoveTrackResponse;

            /**
             * Verifies a RemoveTrackResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RemoveTrackResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RemoveTrackResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.RemoveTrackResponse;

            /**
             * Creates a plain object from a RemoveTrackResponse message. Also converts values to other types if specified.
             * @param message RemoveTrackResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.RemoveTrackResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RemoveTrackResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RemoveTrackResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a MuteTrackRequest. */
        interface IMuteTrackRequest {

            /** MuteTrackRequest roomId */
            roomId?: (string|null);

            /** MuteTrackRequest clientId */
            clientId?: (string|null);

            /** MuteTrackRequest trackId */
            trackId?: (string|null);

            /** MuteTrackRequest muted */
            muted?: (boolean|null);
        }

        /** Represents a MuteTrackRequest. */
        class MuteTrackRequest implements IMuteTrackRequest {

            /**
             * Constructs a new MuteTrackRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IMuteTrackRequest);

            /** MuteTrackRequest roomId. */
            public roomId: string;

            /** MuteTrackRequest clientId. */
            public clientId: string;

            /** MuteTrackRequest trackId. */
            public trackId: string;

            /** MuteTrackRequest muted. */
            public muted: boolean;

            /**
             * Creates a new MuteTrackRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MuteTrackRequest instance
             */
            public static create(properties?: graphwiz.media.IMuteTrackRequest): graphwiz.media.MuteTrackRequest;

            /**
             * Encodes the specified MuteTrackRequest message. Does not implicitly {@link graphwiz.media.MuteTrackRequest.verify|verify} messages.
             * @param message MuteTrackRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IMuteTrackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MuteTrackRequest message, length delimited. Does not implicitly {@link graphwiz.media.MuteTrackRequest.verify|verify} messages.
             * @param message MuteTrackRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IMuteTrackRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MuteTrackRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MuteTrackRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.MuteTrackRequest;

            /**
             * Decodes a MuteTrackRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MuteTrackRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.MuteTrackRequest;

            /**
             * Verifies a MuteTrackRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MuteTrackRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MuteTrackRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.MuteTrackRequest;

            /**
             * Creates a plain object from a MuteTrackRequest message. Also converts values to other types if specified.
             * @param message MuteTrackRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.MuteTrackRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MuteTrackRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MuteTrackRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a MuteTrackResponse. */
        interface IMuteTrackResponse {

            /** MuteTrackResponse success */
            success?: (boolean|null);
        }

        /** Represents a MuteTrackResponse. */
        class MuteTrackResponse implements IMuteTrackResponse {

            /**
             * Constructs a new MuteTrackResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IMuteTrackResponse);

            /** MuteTrackResponse success. */
            public success: boolean;

            /**
             * Creates a new MuteTrackResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MuteTrackResponse instance
             */
            public static create(properties?: graphwiz.media.IMuteTrackResponse): graphwiz.media.MuteTrackResponse;

            /**
             * Encodes the specified MuteTrackResponse message. Does not implicitly {@link graphwiz.media.MuteTrackResponse.verify|verify} messages.
             * @param message MuteTrackResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IMuteTrackResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MuteTrackResponse message, length delimited. Does not implicitly {@link graphwiz.media.MuteTrackResponse.verify|verify} messages.
             * @param message MuteTrackResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IMuteTrackResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MuteTrackResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MuteTrackResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.MuteTrackResponse;

            /**
             * Decodes a MuteTrackResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MuteTrackResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.MuteTrackResponse;

            /**
             * Verifies a MuteTrackResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MuteTrackResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MuteTrackResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.MuteTrackResponse;

            /**
             * Creates a plain object from a MuteTrackResponse message. Also converts values to other types if specified.
             * @param message MuteTrackResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.MuteTrackResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MuteTrackResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MuteTrackResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a JoinSessionRequest. */
        interface IJoinSessionRequest {

            /** JoinSessionRequest roomId */
            roomId?: (string|null);

            /** JoinSessionRequest clientId */
            clientId?: (string|null);

            /** JoinSessionRequest displayName */
            displayName?: (string|null);

            /** JoinSessionRequest publishAudio */
            publishAudio?: (boolean|null);

            /** JoinSessionRequest publishVideo */
            publishVideo?: (boolean|null);
        }

        /** Represents a JoinSessionRequest. */
        class JoinSessionRequest implements IJoinSessionRequest {

            /**
             * Constructs a new JoinSessionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IJoinSessionRequest);

            /** JoinSessionRequest roomId. */
            public roomId: string;

            /** JoinSessionRequest clientId. */
            public clientId: string;

            /** JoinSessionRequest displayName. */
            public displayName: string;

            /** JoinSessionRequest publishAudio. */
            public publishAudio: boolean;

            /** JoinSessionRequest publishVideo. */
            public publishVideo: boolean;

            /**
             * Creates a new JoinSessionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinSessionRequest instance
             */
            public static create(properties?: graphwiz.media.IJoinSessionRequest): graphwiz.media.JoinSessionRequest;

            /**
             * Encodes the specified JoinSessionRequest message. Does not implicitly {@link graphwiz.media.JoinSessionRequest.verify|verify} messages.
             * @param message JoinSessionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IJoinSessionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinSessionRequest message, length delimited. Does not implicitly {@link graphwiz.media.JoinSessionRequest.verify|verify} messages.
             * @param message JoinSessionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IJoinSessionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinSessionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinSessionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.JoinSessionRequest;

            /**
             * Decodes a JoinSessionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinSessionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.JoinSessionRequest;

            /**
             * Verifies a JoinSessionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinSessionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinSessionRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.JoinSessionRequest;

            /**
             * Creates a plain object from a JoinSessionRequest message. Also converts values to other types if specified.
             * @param message JoinSessionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.JoinSessionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinSessionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for JoinSessionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a JoinSessionResponse. */
        interface IJoinSessionResponse {

            /** JoinSessionResponse success */
            success?: (boolean|null);

            /** JoinSessionResponse sessionId */
            sessionId?: (string|null);

            /** JoinSessionResponse existingTracks */
            existingTracks?: (graphwiz.media.IActiveTrack[]|null);

            /** JoinSessionResponse participantIds */
            participantIds?: (string[]|null);
        }

        /** Represents a JoinSessionResponse. */
        class JoinSessionResponse implements IJoinSessionResponse {

            /**
             * Constructs a new JoinSessionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IJoinSessionResponse);

            /** JoinSessionResponse success. */
            public success: boolean;

            /** JoinSessionResponse sessionId. */
            public sessionId: string;

            /** JoinSessionResponse existingTracks. */
            public existingTracks: graphwiz.media.IActiveTrack[];

            /** JoinSessionResponse participantIds. */
            public participantIds: string[];

            /**
             * Creates a new JoinSessionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinSessionResponse instance
             */
            public static create(properties?: graphwiz.media.IJoinSessionResponse): graphwiz.media.JoinSessionResponse;

            /**
             * Encodes the specified JoinSessionResponse message. Does not implicitly {@link graphwiz.media.JoinSessionResponse.verify|verify} messages.
             * @param message JoinSessionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IJoinSessionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinSessionResponse message, length delimited. Does not implicitly {@link graphwiz.media.JoinSessionResponse.verify|verify} messages.
             * @param message JoinSessionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IJoinSessionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinSessionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinSessionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.JoinSessionResponse;

            /**
             * Decodes a JoinSessionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinSessionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.JoinSessionResponse;

            /**
             * Verifies a JoinSessionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a JoinSessionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns JoinSessionResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.JoinSessionResponse;

            /**
             * Creates a plain object from a JoinSessionResponse message. Also converts values to other types if specified.
             * @param message JoinSessionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.JoinSessionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this JoinSessionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for JoinSessionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a LeaveSessionRequest. */
        interface ILeaveSessionRequest {

            /** LeaveSessionRequest roomId */
            roomId?: (string|null);

            /** LeaveSessionRequest clientId */
            clientId?: (string|null);

            /** LeaveSessionRequest sessionId */
            sessionId?: (string|null);
        }

        /** Represents a LeaveSessionRequest. */
        class LeaveSessionRequest implements ILeaveSessionRequest {

            /**
             * Constructs a new LeaveSessionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ILeaveSessionRequest);

            /** LeaveSessionRequest roomId. */
            public roomId: string;

            /** LeaveSessionRequest clientId. */
            public clientId: string;

            /** LeaveSessionRequest sessionId. */
            public sessionId: string;

            /**
             * Creates a new LeaveSessionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LeaveSessionRequest instance
             */
            public static create(properties?: graphwiz.media.ILeaveSessionRequest): graphwiz.media.LeaveSessionRequest;

            /**
             * Encodes the specified LeaveSessionRequest message. Does not implicitly {@link graphwiz.media.LeaveSessionRequest.verify|verify} messages.
             * @param message LeaveSessionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ILeaveSessionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LeaveSessionRequest message, length delimited. Does not implicitly {@link graphwiz.media.LeaveSessionRequest.verify|verify} messages.
             * @param message LeaveSessionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ILeaveSessionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LeaveSessionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LeaveSessionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.LeaveSessionRequest;

            /**
             * Decodes a LeaveSessionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LeaveSessionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.LeaveSessionRequest;

            /**
             * Verifies a LeaveSessionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LeaveSessionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LeaveSessionRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.LeaveSessionRequest;

            /**
             * Creates a plain object from a LeaveSessionRequest message. Also converts values to other types if specified.
             * @param message LeaveSessionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.LeaveSessionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LeaveSessionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LeaveSessionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a LeaveSessionResponse. */
        interface ILeaveSessionResponse {

            /** LeaveSessionResponse success */
            success?: (boolean|null);
        }

        /** Represents a LeaveSessionResponse. */
        class LeaveSessionResponse implements ILeaveSessionResponse {

            /**
             * Constructs a new LeaveSessionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ILeaveSessionResponse);

            /** LeaveSessionResponse success. */
            public success: boolean;

            /**
             * Creates a new LeaveSessionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LeaveSessionResponse instance
             */
            public static create(properties?: graphwiz.media.ILeaveSessionResponse): graphwiz.media.LeaveSessionResponse;

            /**
             * Encodes the specified LeaveSessionResponse message. Does not implicitly {@link graphwiz.media.LeaveSessionResponse.verify|verify} messages.
             * @param message LeaveSessionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ILeaveSessionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LeaveSessionResponse message, length delimited. Does not implicitly {@link graphwiz.media.LeaveSessionResponse.verify|verify} messages.
             * @param message LeaveSessionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ILeaveSessionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LeaveSessionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LeaveSessionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.LeaveSessionResponse;

            /**
             * Decodes a LeaveSessionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LeaveSessionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.LeaveSessionResponse;

            /**
             * Verifies a LeaveSessionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LeaveSessionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LeaveSessionResponse
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.LeaveSessionResponse;

            /**
             * Creates a plain object from a LeaveSessionResponse message. Also converts values to other types if specified.
             * @param message LeaveSessionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.LeaveSessionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LeaveSessionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LeaveSessionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a StreamMediaEventsRequest. */
        interface IStreamMediaEventsRequest {

            /** StreamMediaEventsRequest roomId */
            roomId?: (string|null);

            /** StreamMediaEventsRequest clientId */
            clientId?: (string|null);
        }

        /** Represents a StreamMediaEventsRequest. */
        class StreamMediaEventsRequest implements IStreamMediaEventsRequest {

            /**
             * Constructs a new StreamMediaEventsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IStreamMediaEventsRequest);

            /** StreamMediaEventsRequest roomId. */
            public roomId: string;

            /** StreamMediaEventsRequest clientId. */
            public clientId: string;

            /**
             * Creates a new StreamMediaEventsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns StreamMediaEventsRequest instance
             */
            public static create(properties?: graphwiz.media.IStreamMediaEventsRequest): graphwiz.media.StreamMediaEventsRequest;

            /**
             * Encodes the specified StreamMediaEventsRequest message. Does not implicitly {@link graphwiz.media.StreamMediaEventsRequest.verify|verify} messages.
             * @param message StreamMediaEventsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IStreamMediaEventsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified StreamMediaEventsRequest message, length delimited. Does not implicitly {@link graphwiz.media.StreamMediaEventsRequest.verify|verify} messages.
             * @param message StreamMediaEventsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IStreamMediaEventsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a StreamMediaEventsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns StreamMediaEventsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.StreamMediaEventsRequest;

            /**
             * Decodes a StreamMediaEventsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns StreamMediaEventsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.StreamMediaEventsRequest;

            /**
             * Verifies a StreamMediaEventsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a StreamMediaEventsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns StreamMediaEventsRequest
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.StreamMediaEventsRequest;

            /**
             * Creates a plain object from a StreamMediaEventsRequest message. Also converts values to other types if specified.
             * @param message StreamMediaEventsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.StreamMediaEventsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this StreamMediaEventsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for StreamMediaEventsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a MediaEvent. */
        interface IMediaEvent {

            /** MediaEvent eventId */
            eventId?: (string|null);

            /** MediaEvent timestamp */
            timestamp?: (number|Long|null);

            /** MediaEvent trackPublished */
            trackPublished?: (graphwiz.media.ITrackPublished|null);

            /** MediaEvent trackUnpublished */
            trackUnpublished?: (graphwiz.media.ITrackUnpublished|null);

            /** MediaEvent trackUpdated */
            trackUpdated?: (graphwiz.media.ITrackUpdated|null);

            /** MediaEvent participantJoined */
            participantJoined?: (graphwiz.media.IParticipantJoined|null);

            /** MediaEvent participantLeft */
            participantLeft?: (graphwiz.media.IParticipantLeft|null);

            /** MediaEvent participantUpdated */
            participantUpdated?: (graphwiz.media.IParticipantUpdated|null);

            /** MediaEvent sdpOffer */
            sdpOffer?: (graphwiz.media.ISdpOffer|null);

            /** MediaEvent sdpAnswer */
            sdpAnswer?: (graphwiz.media.ISdpAnswer|null);

            /** MediaEvent iceCandidate */
            iceCandidate?: (graphwiz.media.IIceCandidate|null);
        }

        /** Represents a MediaEvent. */
        class MediaEvent implements IMediaEvent {

            /**
             * Constructs a new MediaEvent.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IMediaEvent);

            /** MediaEvent eventId. */
            public eventId: string;

            /** MediaEvent timestamp. */
            public timestamp: (number|Long);

            /** MediaEvent trackPublished. */
            public trackPublished?: (graphwiz.media.ITrackPublished|null);

            /** MediaEvent trackUnpublished. */
            public trackUnpublished?: (graphwiz.media.ITrackUnpublished|null);

            /** MediaEvent trackUpdated. */
            public trackUpdated?: (graphwiz.media.ITrackUpdated|null);

            /** MediaEvent participantJoined. */
            public participantJoined?: (graphwiz.media.IParticipantJoined|null);

            /** MediaEvent participantLeft. */
            public participantLeft?: (graphwiz.media.IParticipantLeft|null);

            /** MediaEvent participantUpdated. */
            public participantUpdated?: (graphwiz.media.IParticipantUpdated|null);

            /** MediaEvent sdpOffer. */
            public sdpOffer?: (graphwiz.media.ISdpOffer|null);

            /** MediaEvent sdpAnswer. */
            public sdpAnswer?: (graphwiz.media.ISdpAnswer|null);

            /** MediaEvent iceCandidate. */
            public iceCandidate?: (graphwiz.media.IIceCandidate|null);

            /** MediaEvent payload. */
            public payload?: ("trackPublished"|"trackUnpublished"|"trackUpdated"|"participantJoined"|"participantLeft"|"participantUpdated"|"sdpOffer"|"sdpAnswer"|"iceCandidate");

            /**
             * Creates a new MediaEvent instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MediaEvent instance
             */
            public static create(properties?: graphwiz.media.IMediaEvent): graphwiz.media.MediaEvent;

            /**
             * Encodes the specified MediaEvent message. Does not implicitly {@link graphwiz.media.MediaEvent.verify|verify} messages.
             * @param message MediaEvent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IMediaEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MediaEvent message, length delimited. Does not implicitly {@link graphwiz.media.MediaEvent.verify|verify} messages.
             * @param message MediaEvent message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IMediaEvent, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MediaEvent message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MediaEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.MediaEvent;

            /**
             * Decodes a MediaEvent message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MediaEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.MediaEvent;

            /**
             * Verifies a MediaEvent message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MediaEvent message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MediaEvent
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.MediaEvent;

            /**
             * Creates a plain object from a MediaEvent message. Also converts values to other types if specified.
             * @param message MediaEvent
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.MediaEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MediaEvent to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MediaEvent
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a TrackPublished. */
        interface ITrackPublished {

            /** TrackPublished trackId */
            trackId?: (string|null);

            /** TrackPublished clientId */
            clientId?: (string|null);

            /** TrackPublished kind */
            kind?: (graphwiz.media.TrackKind|null);

            /** TrackPublished metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents a TrackPublished. */
        class TrackPublished implements ITrackPublished {

            /**
             * Constructs a new TrackPublished.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ITrackPublished);

            /** TrackPublished trackId. */
            public trackId: string;

            /** TrackPublished clientId. */
            public clientId: string;

            /** TrackPublished kind. */
            public kind: graphwiz.media.TrackKind;

            /** TrackPublished metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new TrackPublished instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TrackPublished instance
             */
            public static create(properties?: graphwiz.media.ITrackPublished): graphwiz.media.TrackPublished;

            /**
             * Encodes the specified TrackPublished message. Does not implicitly {@link graphwiz.media.TrackPublished.verify|verify} messages.
             * @param message TrackPublished message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ITrackPublished, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TrackPublished message, length delimited. Does not implicitly {@link graphwiz.media.TrackPublished.verify|verify} messages.
             * @param message TrackPublished message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ITrackPublished, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TrackPublished message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TrackPublished
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.TrackPublished;

            /**
             * Decodes a TrackPublished message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TrackPublished
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.TrackPublished;

            /**
             * Verifies a TrackPublished message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TrackPublished message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TrackPublished
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.TrackPublished;

            /**
             * Creates a plain object from a TrackPublished message. Also converts values to other types if specified.
             * @param message TrackPublished
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.TrackPublished, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TrackPublished to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for TrackPublished
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a TrackUnpublished. */
        interface ITrackUnpublished {

            /** TrackUnpublished trackId */
            trackId?: (string|null);

            /** TrackUnpublished clientId */
            clientId?: (string|null);
        }

        /** Represents a TrackUnpublished. */
        class TrackUnpublished implements ITrackUnpublished {

            /**
             * Constructs a new TrackUnpublished.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ITrackUnpublished);

            /** TrackUnpublished trackId. */
            public trackId: string;

            /** TrackUnpublished clientId. */
            public clientId: string;

            /**
             * Creates a new TrackUnpublished instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TrackUnpublished instance
             */
            public static create(properties?: graphwiz.media.ITrackUnpublished): graphwiz.media.TrackUnpublished;

            /**
             * Encodes the specified TrackUnpublished message. Does not implicitly {@link graphwiz.media.TrackUnpublished.verify|verify} messages.
             * @param message TrackUnpublished message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ITrackUnpublished, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TrackUnpublished message, length delimited. Does not implicitly {@link graphwiz.media.TrackUnpublished.verify|verify} messages.
             * @param message TrackUnpublished message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ITrackUnpublished, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TrackUnpublished message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TrackUnpublished
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.TrackUnpublished;

            /**
             * Decodes a TrackUnpublished message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TrackUnpublished
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.TrackUnpublished;

            /**
             * Verifies a TrackUnpublished message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TrackUnpublished message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TrackUnpublished
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.TrackUnpublished;

            /**
             * Creates a plain object from a TrackUnpublished message. Also converts values to other types if specified.
             * @param message TrackUnpublished
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.TrackUnpublished, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TrackUnpublished to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for TrackUnpublished
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a TrackUpdated. */
        interface ITrackUpdated {

            /** TrackUpdated trackId */
            trackId?: (string|null);

            /** TrackUpdated muted */
            muted?: (boolean|null);

            /** TrackUpdated metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents a TrackUpdated. */
        class TrackUpdated implements ITrackUpdated {

            /**
             * Constructs a new TrackUpdated.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ITrackUpdated);

            /** TrackUpdated trackId. */
            public trackId: string;

            /** TrackUpdated muted. */
            public muted: boolean;

            /** TrackUpdated metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new TrackUpdated instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TrackUpdated instance
             */
            public static create(properties?: graphwiz.media.ITrackUpdated): graphwiz.media.TrackUpdated;

            /**
             * Encodes the specified TrackUpdated message. Does not implicitly {@link graphwiz.media.TrackUpdated.verify|verify} messages.
             * @param message TrackUpdated message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ITrackUpdated, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TrackUpdated message, length delimited. Does not implicitly {@link graphwiz.media.TrackUpdated.verify|verify} messages.
             * @param message TrackUpdated message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ITrackUpdated, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TrackUpdated message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TrackUpdated
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.TrackUpdated;

            /**
             * Decodes a TrackUpdated message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TrackUpdated
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.TrackUpdated;

            /**
             * Verifies a TrackUpdated message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TrackUpdated message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TrackUpdated
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.TrackUpdated;

            /**
             * Creates a plain object from a TrackUpdated message. Also converts values to other types if specified.
             * @param message TrackUpdated
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.TrackUpdated, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TrackUpdated to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for TrackUpdated
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ParticipantJoined. */
        interface IParticipantJoined {

            /** ParticipantJoined clientId */
            clientId?: (string|null);

            /** ParticipantJoined displayName */
            displayName?: (string|null);

            /** ParticipantJoined trackIds */
            trackIds?: (string[]|null);
        }

        /** Represents a ParticipantJoined. */
        class ParticipantJoined implements IParticipantJoined {

            /**
             * Constructs a new ParticipantJoined.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IParticipantJoined);

            /** ParticipantJoined clientId. */
            public clientId: string;

            /** ParticipantJoined displayName. */
            public displayName: string;

            /** ParticipantJoined trackIds. */
            public trackIds: string[];

            /**
             * Creates a new ParticipantJoined instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ParticipantJoined instance
             */
            public static create(properties?: graphwiz.media.IParticipantJoined): graphwiz.media.ParticipantJoined;

            /**
             * Encodes the specified ParticipantJoined message. Does not implicitly {@link graphwiz.media.ParticipantJoined.verify|verify} messages.
             * @param message ParticipantJoined message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IParticipantJoined, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ParticipantJoined message, length delimited. Does not implicitly {@link graphwiz.media.ParticipantJoined.verify|verify} messages.
             * @param message ParticipantJoined message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IParticipantJoined, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ParticipantJoined message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ParticipantJoined
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.ParticipantJoined;

            /**
             * Decodes a ParticipantJoined message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ParticipantJoined
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.ParticipantJoined;

            /**
             * Verifies a ParticipantJoined message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ParticipantJoined message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ParticipantJoined
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.ParticipantJoined;

            /**
             * Creates a plain object from a ParticipantJoined message. Also converts values to other types if specified.
             * @param message ParticipantJoined
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.ParticipantJoined, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ParticipantJoined to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ParticipantJoined
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ParticipantLeft. */
        interface IParticipantLeft {

            /** ParticipantLeft clientId */
            clientId?: (string|null);
        }

        /** Represents a ParticipantLeft. */
        class ParticipantLeft implements IParticipantLeft {

            /**
             * Constructs a new ParticipantLeft.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IParticipantLeft);

            /** ParticipantLeft clientId. */
            public clientId: string;

            /**
             * Creates a new ParticipantLeft instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ParticipantLeft instance
             */
            public static create(properties?: graphwiz.media.IParticipantLeft): graphwiz.media.ParticipantLeft;

            /**
             * Encodes the specified ParticipantLeft message. Does not implicitly {@link graphwiz.media.ParticipantLeft.verify|verify} messages.
             * @param message ParticipantLeft message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IParticipantLeft, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ParticipantLeft message, length delimited. Does not implicitly {@link graphwiz.media.ParticipantLeft.verify|verify} messages.
             * @param message ParticipantLeft message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IParticipantLeft, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ParticipantLeft message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ParticipantLeft
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.ParticipantLeft;

            /**
             * Decodes a ParticipantLeft message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ParticipantLeft
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.ParticipantLeft;

            /**
             * Verifies a ParticipantLeft message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ParticipantLeft message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ParticipantLeft
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.ParticipantLeft;

            /**
             * Creates a plain object from a ParticipantLeft message. Also converts values to other types if specified.
             * @param message ParticipantLeft
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.ParticipantLeft, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ParticipantLeft to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ParticipantLeft
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ParticipantUpdated. */
        interface IParticipantUpdated {

            /** ParticipantUpdated clientId */
            clientId?: (string|null);

            /** ParticipantUpdated mutedTracks */
            mutedTracks?: ({ [k: string]: boolean }|null);
        }

        /** Represents a ParticipantUpdated. */
        class ParticipantUpdated implements IParticipantUpdated {

            /**
             * Constructs a new ParticipantUpdated.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IParticipantUpdated);

            /** ParticipantUpdated clientId. */
            public clientId: string;

            /** ParticipantUpdated mutedTracks. */
            public mutedTracks: { [k: string]: boolean };

            /**
             * Creates a new ParticipantUpdated instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ParticipantUpdated instance
             */
            public static create(properties?: graphwiz.media.IParticipantUpdated): graphwiz.media.ParticipantUpdated;

            /**
             * Encodes the specified ParticipantUpdated message. Does not implicitly {@link graphwiz.media.ParticipantUpdated.verify|verify} messages.
             * @param message ParticipantUpdated message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IParticipantUpdated, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ParticipantUpdated message, length delimited. Does not implicitly {@link graphwiz.media.ParticipantUpdated.verify|verify} messages.
             * @param message ParticipantUpdated message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IParticipantUpdated, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ParticipantUpdated message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ParticipantUpdated
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.ParticipantUpdated;

            /**
             * Decodes a ParticipantUpdated message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ParticipantUpdated
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.ParticipantUpdated;

            /**
             * Verifies a ParticipantUpdated message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ParticipantUpdated message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ParticipantUpdated
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.ParticipantUpdated;

            /**
             * Creates a plain object from a ParticipantUpdated message. Also converts values to other types if specified.
             * @param message ParticipantUpdated
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.ParticipantUpdated, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ParticipantUpdated to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ParticipantUpdated
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SdpOffer. */
        interface ISdpOffer {

            /** SdpOffer clientId */
            clientId?: (string|null);

            /** SdpOffer sdp */
            sdp?: (string|null);
        }

        /** Represents a SdpOffer. */
        class SdpOffer implements ISdpOffer {

            /**
             * Constructs a new SdpOffer.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ISdpOffer);

            /** SdpOffer clientId. */
            public clientId: string;

            /** SdpOffer sdp. */
            public sdp: string;

            /**
             * Creates a new SdpOffer instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SdpOffer instance
             */
            public static create(properties?: graphwiz.media.ISdpOffer): graphwiz.media.SdpOffer;

            /**
             * Encodes the specified SdpOffer message. Does not implicitly {@link graphwiz.media.SdpOffer.verify|verify} messages.
             * @param message SdpOffer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ISdpOffer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SdpOffer message, length delimited. Does not implicitly {@link graphwiz.media.SdpOffer.verify|verify} messages.
             * @param message SdpOffer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ISdpOffer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SdpOffer message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SdpOffer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.SdpOffer;

            /**
             * Decodes a SdpOffer message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SdpOffer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.SdpOffer;

            /**
             * Verifies a SdpOffer message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SdpOffer message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SdpOffer
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.SdpOffer;

            /**
             * Creates a plain object from a SdpOffer message. Also converts values to other types if specified.
             * @param message SdpOffer
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.SdpOffer, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SdpOffer to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SdpOffer
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a SdpAnswer. */
        interface ISdpAnswer {

            /** SdpAnswer clientId */
            clientId?: (string|null);

            /** SdpAnswer sdp */
            sdp?: (string|null);
        }

        /** Represents a SdpAnswer. */
        class SdpAnswer implements ISdpAnswer {

            /**
             * Constructs a new SdpAnswer.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.ISdpAnswer);

            /** SdpAnswer clientId. */
            public clientId: string;

            /** SdpAnswer sdp. */
            public sdp: string;

            /**
             * Creates a new SdpAnswer instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SdpAnswer instance
             */
            public static create(properties?: graphwiz.media.ISdpAnswer): graphwiz.media.SdpAnswer;

            /**
             * Encodes the specified SdpAnswer message. Does not implicitly {@link graphwiz.media.SdpAnswer.verify|verify} messages.
             * @param message SdpAnswer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.ISdpAnswer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SdpAnswer message, length delimited. Does not implicitly {@link graphwiz.media.SdpAnswer.verify|verify} messages.
             * @param message SdpAnswer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.ISdpAnswer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SdpAnswer message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SdpAnswer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.SdpAnswer;

            /**
             * Decodes a SdpAnswer message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SdpAnswer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.SdpAnswer;

            /**
             * Verifies a SdpAnswer message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SdpAnswer message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SdpAnswer
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.SdpAnswer;

            /**
             * Creates a plain object from a SdpAnswer message. Also converts values to other types if specified.
             * @param message SdpAnswer
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.SdpAnswer, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SdpAnswer to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SdpAnswer
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an ActiveTrack. */
        interface IActiveTrack {

            /** ActiveTrack trackId */
            trackId?: (string|null);

            /** ActiveTrack clientId */
            clientId?: (string|null);

            /** ActiveTrack kind */
            kind?: (graphwiz.media.TrackKind|null);

            /** ActiveTrack muted */
            muted?: (boolean|null);

            /** ActiveTrack metadata */
            metadata?: ({ [k: string]: string }|null);
        }

        /** Represents an ActiveTrack. */
        class ActiveTrack implements IActiveTrack {

            /**
             * Constructs a new ActiveTrack.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IActiveTrack);

            /** ActiveTrack trackId. */
            public trackId: string;

            /** ActiveTrack clientId. */
            public clientId: string;

            /** ActiveTrack kind. */
            public kind: graphwiz.media.TrackKind;

            /** ActiveTrack muted. */
            public muted: boolean;

            /** ActiveTrack metadata. */
            public metadata: { [k: string]: string };

            /**
             * Creates a new ActiveTrack instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ActiveTrack instance
             */
            public static create(properties?: graphwiz.media.IActiveTrack): graphwiz.media.ActiveTrack;

            /**
             * Encodes the specified ActiveTrack message. Does not implicitly {@link graphwiz.media.ActiveTrack.verify|verify} messages.
             * @param message ActiveTrack message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IActiveTrack, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ActiveTrack message, length delimited. Does not implicitly {@link graphwiz.media.ActiveTrack.verify|verify} messages.
             * @param message ActiveTrack message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IActiveTrack, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ActiveTrack message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ActiveTrack
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.ActiveTrack;

            /**
             * Decodes an ActiveTrack message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ActiveTrack
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.ActiveTrack;

            /**
             * Verifies an ActiveTrack message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ActiveTrack message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ActiveTrack
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.ActiveTrack;

            /**
             * Creates a plain object from an ActiveTrack message. Also converts values to other types if specified.
             * @param message ActiveTrack
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.ActiveTrack, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ActiveTrack to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ActiveTrack
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** TrackKind enum. */
        enum TrackKind {
            AUDIO = 0,
            VIDEO = 1,
            DATA = 2
        }

        /** SessionDescriptionType enum. */
        enum SessionDescriptionType {
            OFFER = 0,
            ANSWER = 1,
            PRANSWER = 2,
            ROLLBACK = 3
        }

        /** Properties of a MediaConstraints. */
        interface IMediaConstraints {

            /** MediaConstraints audio */
            audio?: (boolean|null);

            /** MediaConstraints video */
            video?: (boolean|null);

            /** MediaConstraints data */
            data?: (boolean|null);

            /** MediaConstraints audioConstraints */
            audioConstraints?: (graphwiz.media.IAudioConstraints|null);

            /** MediaConstraints videoConstraints */
            videoConstraints?: (graphwiz.media.IVideoConstraints|null);
        }

        /** Represents a MediaConstraints. */
        class MediaConstraints implements IMediaConstraints {

            /**
             * Constructs a new MediaConstraints.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IMediaConstraints);

            /** MediaConstraints audio. */
            public audio: boolean;

            /** MediaConstraints video. */
            public video: boolean;

            /** MediaConstraints data. */
            public data: boolean;

            /** MediaConstraints audioConstraints. */
            public audioConstraints?: (graphwiz.media.IAudioConstraints|null);

            /** MediaConstraints videoConstraints. */
            public videoConstraints?: (graphwiz.media.IVideoConstraints|null);

            /**
             * Creates a new MediaConstraints instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MediaConstraints instance
             */
            public static create(properties?: graphwiz.media.IMediaConstraints): graphwiz.media.MediaConstraints;

            /**
             * Encodes the specified MediaConstraints message. Does not implicitly {@link graphwiz.media.MediaConstraints.verify|verify} messages.
             * @param message MediaConstraints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IMediaConstraints, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MediaConstraints message, length delimited. Does not implicitly {@link graphwiz.media.MediaConstraints.verify|verify} messages.
             * @param message MediaConstraints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IMediaConstraints, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MediaConstraints message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MediaConstraints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.MediaConstraints;

            /**
             * Decodes a MediaConstraints message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MediaConstraints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.MediaConstraints;

            /**
             * Verifies a MediaConstraints message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MediaConstraints message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MediaConstraints
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.MediaConstraints;

            /**
             * Creates a plain object from a MediaConstraints message. Also converts values to other types if specified.
             * @param message MediaConstraints
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.MediaConstraints, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MediaConstraints to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MediaConstraints
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AudioConstraints. */
        interface IAudioConstraints {

            /** AudioConstraints echoCancellation */
            echoCancellation?: (boolean|null);

            /** AudioConstraints noiseSuppression */
            noiseSuppression?: (boolean|null);

            /** AudioConstraints autoGainControl */
            autoGainControl?: (boolean|null);

            /** AudioConstraints sampleRate */
            sampleRate?: (number|null);

            /** AudioConstraints channelCount */
            channelCount?: (number|null);
        }

        /** Represents an AudioConstraints. */
        class AudioConstraints implements IAudioConstraints {

            /**
             * Constructs a new AudioConstraints.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IAudioConstraints);

            /** AudioConstraints echoCancellation. */
            public echoCancellation: boolean;

            /** AudioConstraints noiseSuppression. */
            public noiseSuppression: boolean;

            /** AudioConstraints autoGainControl. */
            public autoGainControl: boolean;

            /** AudioConstraints sampleRate. */
            public sampleRate: number;

            /** AudioConstraints channelCount. */
            public channelCount: number;

            /**
             * Creates a new AudioConstraints instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AudioConstraints instance
             */
            public static create(properties?: graphwiz.media.IAudioConstraints): graphwiz.media.AudioConstraints;

            /**
             * Encodes the specified AudioConstraints message. Does not implicitly {@link graphwiz.media.AudioConstraints.verify|verify} messages.
             * @param message AudioConstraints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IAudioConstraints, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AudioConstraints message, length delimited. Does not implicitly {@link graphwiz.media.AudioConstraints.verify|verify} messages.
             * @param message AudioConstraints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IAudioConstraints, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AudioConstraints message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AudioConstraints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.AudioConstraints;

            /**
             * Decodes an AudioConstraints message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AudioConstraints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.AudioConstraints;

            /**
             * Verifies an AudioConstraints message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AudioConstraints message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AudioConstraints
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.AudioConstraints;

            /**
             * Creates a plain object from an AudioConstraints message. Also converts values to other types if specified.
             * @param message AudioConstraints
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.AudioConstraints, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AudioConstraints to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AudioConstraints
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a VideoConstraints. */
        interface IVideoConstraints {

            /** VideoConstraints maxWidth */
            maxWidth?: (number|null);

            /** VideoConstraints maxHeight */
            maxHeight?: (number|null);

            /** VideoConstraints maxFrameRate */
            maxFrameRate?: (number|null);

            /** VideoConstraints preferredCodec */
            preferredCodec?: (graphwiz.media.VideoCodecType|null);
        }

        /** Represents a VideoConstraints. */
        class VideoConstraints implements IVideoConstraints {

            /**
             * Constructs a new VideoConstraints.
             * @param [properties] Properties to set
             */
            constructor(properties?: graphwiz.media.IVideoConstraints);

            /** VideoConstraints maxWidth. */
            public maxWidth: number;

            /** VideoConstraints maxHeight. */
            public maxHeight: number;

            /** VideoConstraints maxFrameRate. */
            public maxFrameRate: number;

            /** VideoConstraints preferredCodec. */
            public preferredCodec: graphwiz.media.VideoCodecType;

            /**
             * Creates a new VideoConstraints instance using the specified properties.
             * @param [properties] Properties to set
             * @returns VideoConstraints instance
             */
            public static create(properties?: graphwiz.media.IVideoConstraints): graphwiz.media.VideoConstraints;

            /**
             * Encodes the specified VideoConstraints message. Does not implicitly {@link graphwiz.media.VideoConstraints.verify|verify} messages.
             * @param message VideoConstraints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: graphwiz.media.IVideoConstraints, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified VideoConstraints message, length delimited. Does not implicitly {@link graphwiz.media.VideoConstraints.verify|verify} messages.
             * @param message VideoConstraints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: graphwiz.media.IVideoConstraints, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a VideoConstraints message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns VideoConstraints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): graphwiz.media.VideoConstraints;

            /**
             * Decodes a VideoConstraints message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns VideoConstraints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): graphwiz.media.VideoConstraints;

            /**
             * Verifies a VideoConstraints message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a VideoConstraints message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns VideoConstraints
             */
            public static fromObject(object: { [k: string]: any }): graphwiz.media.VideoConstraints;

            /**
             * Creates a plain object from a VideoConstraints message. Also converts values to other types if specified.
             * @param message VideoConstraints
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: graphwiz.media.VideoConstraints, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this VideoConstraints to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for VideoConstraints
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** VideoCodecType enum. */
        enum VideoCodecType {
            VP8 = 0,
            VP9 = 1,
            H264 = 2,
            AV1 = 3
        }
    }
}
