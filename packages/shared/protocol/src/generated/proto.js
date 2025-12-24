/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.graphwiz = (function() {

    /**
     * Namespace graphwiz.
     * @exports graphwiz
     * @namespace
     */
    var graphwiz = {};

    graphwiz.core = (function() {

        /**
         * Namespace core.
         * @memberof graphwiz
         * @namespace
         */
        var core = {};

        core.Message = (function() {

            /**
             * Properties of a Message.
             * @memberof graphwiz.core
             * @interface IMessage
             * @property {string|null} [messageId] Message messageId
             * @property {number|Long|null} [timestamp] Message timestamp
             * @property {graphwiz.core.MessageType|null} [type] Message type
             * @property {graphwiz.core.IClientHello|null} [clientHello] Message clientHello
             * @property {graphwiz.core.IServerHello|null} [serverHello] Message serverHello
             * @property {graphwiz.core.IPositionUpdate|null} [positionUpdate] Message positionUpdate
             * @property {graphwiz.core.IVoiceData|null} [voiceData] Message voiceData
             * @property {graphwiz.core.IEntitySpawn|null} [entitySpawn] Message entitySpawn
             * @property {graphwiz.core.IEntityUpdate|null} [entityUpdate] Message entityUpdate
             * @property {graphwiz.core.IEntityDespawn|null} [entityDespawn] Message entityDespawn
             * @property {graphwiz.core.IChatMessage|null} [chatMessage] Message chatMessage
             * @property {graphwiz.core.IPresenceEvent|null} [presenceEvent] Message presenceEvent
             */

            /**
             * Constructs a new Message.
             * @memberof graphwiz.core
             * @classdesc Represents a Message.
             * @implements IMessage
             * @constructor
             * @param {graphwiz.core.IMessage=} [properties] Properties to set
             */
            function Message(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Message messageId.
             * @member {string} messageId
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.messageId = "";

            /**
             * Message timestamp.
             * @member {number|Long} timestamp
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Message type.
             * @member {graphwiz.core.MessageType} type
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.type = 0;

            /**
             * Message clientHello.
             * @member {graphwiz.core.IClientHello|null|undefined} clientHello
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.clientHello = null;

            /**
             * Message serverHello.
             * @member {graphwiz.core.IServerHello|null|undefined} serverHello
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.serverHello = null;

            /**
             * Message positionUpdate.
             * @member {graphwiz.core.IPositionUpdate|null|undefined} positionUpdate
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.positionUpdate = null;

            /**
             * Message voiceData.
             * @member {graphwiz.core.IVoiceData|null|undefined} voiceData
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.voiceData = null;

            /**
             * Message entitySpawn.
             * @member {graphwiz.core.IEntitySpawn|null|undefined} entitySpawn
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.entitySpawn = null;

            /**
             * Message entityUpdate.
             * @member {graphwiz.core.IEntityUpdate|null|undefined} entityUpdate
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.entityUpdate = null;

            /**
             * Message entityDespawn.
             * @member {graphwiz.core.IEntityDespawn|null|undefined} entityDespawn
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.entityDespawn = null;

            /**
             * Message chatMessage.
             * @member {graphwiz.core.IChatMessage|null|undefined} chatMessage
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.chatMessage = null;

            /**
             * Message presenceEvent.
             * @member {graphwiz.core.IPresenceEvent|null|undefined} presenceEvent
             * @memberof graphwiz.core.Message
             * @instance
             */
            Message.prototype.presenceEvent = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * Message payload.
             * @member {"clientHello"|"serverHello"|"positionUpdate"|"voiceData"|"entitySpawn"|"entityUpdate"|"entityDespawn"|"chatMessage"|"presenceEvent"|undefined} payload
             * @memberof graphwiz.core.Message
             * @instance
             */
            Object.defineProperty(Message.prototype, "payload", {
                get: $util.oneOfGetter($oneOfFields = ["clientHello", "serverHello", "positionUpdate", "voiceData", "entitySpawn", "entityUpdate", "entityDespawn", "chatMessage", "presenceEvent"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Message instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.Message
             * @static
             * @param {graphwiz.core.IMessage=} [properties] Properties to set
             * @returns {graphwiz.core.Message} Message instance
             */
            Message.create = function create(properties) {
                return new Message(properties);
            };

            /**
             * Encodes the specified Message message. Does not implicitly {@link graphwiz.core.Message.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.Message
             * @static
             * @param {graphwiz.core.IMessage} message Message message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Message.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.messageId != null && Object.hasOwnProperty.call(message, "messageId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.messageId);
                if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.timestamp);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.type);
                if (message.clientHello != null && Object.hasOwnProperty.call(message, "clientHello"))
                    $root.graphwiz.core.ClientHello.encode(message.clientHello, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.serverHello != null && Object.hasOwnProperty.call(message, "serverHello"))
                    $root.graphwiz.core.ServerHello.encode(message.serverHello, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                if (message.positionUpdate != null && Object.hasOwnProperty.call(message, "positionUpdate"))
                    $root.graphwiz.core.PositionUpdate.encode(message.positionUpdate, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
                if (message.voiceData != null && Object.hasOwnProperty.call(message, "voiceData"))
                    $root.graphwiz.core.VoiceData.encode(message.voiceData, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
                if (message.entitySpawn != null && Object.hasOwnProperty.call(message, "entitySpawn"))
                    $root.graphwiz.core.EntitySpawn.encode(message.entitySpawn, writer.uint32(/* id 30, wireType 2 =*/242).fork()).ldelim();
                if (message.entityUpdate != null && Object.hasOwnProperty.call(message, "entityUpdate"))
                    $root.graphwiz.core.EntityUpdate.encode(message.entityUpdate, writer.uint32(/* id 31, wireType 2 =*/250).fork()).ldelim();
                if (message.entityDespawn != null && Object.hasOwnProperty.call(message, "entityDespawn"))
                    $root.graphwiz.core.EntityDespawn.encode(message.entityDespawn, writer.uint32(/* id 32, wireType 2 =*/258).fork()).ldelim();
                if (message.chatMessage != null && Object.hasOwnProperty.call(message, "chatMessage"))
                    $root.graphwiz.core.ChatMessage.encode(message.chatMessage, writer.uint32(/* id 40, wireType 2 =*/322).fork()).ldelim();
                if (message.presenceEvent != null && Object.hasOwnProperty.call(message, "presenceEvent"))
                    $root.graphwiz.core.PresenceEvent.encode(message.presenceEvent, writer.uint32(/* id 50, wireType 2 =*/402).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Message message, length delimited. Does not implicitly {@link graphwiz.core.Message.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.Message
             * @static
             * @param {graphwiz.core.IMessage} message Message message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Message.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Message message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.Message
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.Message} Message
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Message.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.Message();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.messageId = reader.string();
                            break;
                        }
                    case 2: {
                            message.timestamp = reader.int64();
                            break;
                        }
                    case 3: {
                            message.type = reader.int32();
                            break;
                        }
                    case 10: {
                            message.clientHello = $root.graphwiz.core.ClientHello.decode(reader, reader.uint32());
                            break;
                        }
                    case 11: {
                            message.serverHello = $root.graphwiz.core.ServerHello.decode(reader, reader.uint32());
                            break;
                        }
                    case 20: {
                            message.positionUpdate = $root.graphwiz.core.PositionUpdate.decode(reader, reader.uint32());
                            break;
                        }
                    case 21: {
                            message.voiceData = $root.graphwiz.core.VoiceData.decode(reader, reader.uint32());
                            break;
                        }
                    case 30: {
                            message.entitySpawn = $root.graphwiz.core.EntitySpawn.decode(reader, reader.uint32());
                            break;
                        }
                    case 31: {
                            message.entityUpdate = $root.graphwiz.core.EntityUpdate.decode(reader, reader.uint32());
                            break;
                        }
                    case 32: {
                            message.entityDespawn = $root.graphwiz.core.EntityDespawn.decode(reader, reader.uint32());
                            break;
                        }
                    case 40: {
                            message.chatMessage = $root.graphwiz.core.ChatMessage.decode(reader, reader.uint32());
                            break;
                        }
                    case 50: {
                            message.presenceEvent = $root.graphwiz.core.PresenceEvent.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Message message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.Message
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.Message} Message
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Message.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Message message.
             * @function verify
             * @memberof graphwiz.core.Message
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Message.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.messageId != null && message.hasOwnProperty("messageId"))
                    if (!$util.isString(message.messageId))
                        return "messageId: string expected";
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                        return "timestamp: integer|Long expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 10:
                    case 11:
                    case 20:
                    case 21:
                    case 22:
                    case 30:
                    case 40:
                    case 41:
                    case 42:
                        break;
                    }
                if (message.clientHello != null && message.hasOwnProperty("clientHello")) {
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.ClientHello.verify(message.clientHello);
                        if (error)
                            return "clientHello." + error;
                    }
                }
                if (message.serverHello != null && message.hasOwnProperty("serverHello")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.ServerHello.verify(message.serverHello);
                        if (error)
                            return "serverHello." + error;
                    }
                }
                if (message.positionUpdate != null && message.hasOwnProperty("positionUpdate")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.PositionUpdate.verify(message.positionUpdate);
                        if (error)
                            return "positionUpdate." + error;
                    }
                }
                if (message.voiceData != null && message.hasOwnProperty("voiceData")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.VoiceData.verify(message.voiceData);
                        if (error)
                            return "voiceData." + error;
                    }
                }
                if (message.entitySpawn != null && message.hasOwnProperty("entitySpawn")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntitySpawn.verify(message.entitySpawn);
                        if (error)
                            return "entitySpawn." + error;
                    }
                }
                if (message.entityUpdate != null && message.hasOwnProperty("entityUpdate")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntityUpdate.verify(message.entityUpdate);
                        if (error)
                            return "entityUpdate." + error;
                    }
                }
                if (message.entityDespawn != null && message.hasOwnProperty("entityDespawn")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntityDespawn.verify(message.entityDespawn);
                        if (error)
                            return "entityDespawn." + error;
                    }
                }
                if (message.chatMessage != null && message.hasOwnProperty("chatMessage")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.ChatMessage.verify(message.chatMessage);
                        if (error)
                            return "chatMessage." + error;
                    }
                }
                if (message.presenceEvent != null && message.hasOwnProperty("presenceEvent")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.PresenceEvent.verify(message.presenceEvent);
                        if (error)
                            return "presenceEvent." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Message message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.Message
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.Message} Message
             */
            Message.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.Message)
                    return object;
                var message = new $root.graphwiz.core.Message();
                if (object.messageId != null)
                    message.messageId = String(object.messageId);
                if (object.timestamp != null)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = false;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "UNKNOWN":
                case 0:
                    message.type = 0;
                    break;
                case "CLIENT_HELLO":
                case 1:
                    message.type = 1;
                    break;
                case "SERVER_HELLO":
                case 2:
                    message.type = 2;
                    break;
                case "POSITION_UPDATE":
                case 10:
                    message.type = 10;
                    break;
                case "VOICE_DATA":
                case 11:
                    message.type = 11;
                    break;
                case "ENTITY_SPAWN":
                case 20:
                    message.type = 20;
                    break;
                case "ENTITY_UPDATE":
                case 21:
                    message.type = 21;
                    break;
                case "ENTITY_DESPAWN":
                case 22:
                    message.type = 22;
                    break;
                case "CHAT_MESSAGE":
                case 30:
                    message.type = 30;
                    break;
                case "PRESENCE_JOIN":
                case 40:
                    message.type = 40;
                    break;
                case "PRESENCE_LEAVE":
                case 41:
                    message.type = 41;
                    break;
                case "PRESENCE_UPDATE":
                case 42:
                    message.type = 42;
                    break;
                }
                if (object.clientHello != null) {
                    if (typeof object.clientHello !== "object")
                        throw TypeError(".graphwiz.core.Message.clientHello: object expected");
                    message.clientHello = $root.graphwiz.core.ClientHello.fromObject(object.clientHello);
                }
                if (object.serverHello != null) {
                    if (typeof object.serverHello !== "object")
                        throw TypeError(".graphwiz.core.Message.serverHello: object expected");
                    message.serverHello = $root.graphwiz.core.ServerHello.fromObject(object.serverHello);
                }
                if (object.positionUpdate != null) {
                    if (typeof object.positionUpdate !== "object")
                        throw TypeError(".graphwiz.core.Message.positionUpdate: object expected");
                    message.positionUpdate = $root.graphwiz.core.PositionUpdate.fromObject(object.positionUpdate);
                }
                if (object.voiceData != null) {
                    if (typeof object.voiceData !== "object")
                        throw TypeError(".graphwiz.core.Message.voiceData: object expected");
                    message.voiceData = $root.graphwiz.core.VoiceData.fromObject(object.voiceData);
                }
                if (object.entitySpawn != null) {
                    if (typeof object.entitySpawn !== "object")
                        throw TypeError(".graphwiz.core.Message.entitySpawn: object expected");
                    message.entitySpawn = $root.graphwiz.core.EntitySpawn.fromObject(object.entitySpawn);
                }
                if (object.entityUpdate != null) {
                    if (typeof object.entityUpdate !== "object")
                        throw TypeError(".graphwiz.core.Message.entityUpdate: object expected");
                    message.entityUpdate = $root.graphwiz.core.EntityUpdate.fromObject(object.entityUpdate);
                }
                if (object.entityDespawn != null) {
                    if (typeof object.entityDespawn !== "object")
                        throw TypeError(".graphwiz.core.Message.entityDespawn: object expected");
                    message.entityDespawn = $root.graphwiz.core.EntityDespawn.fromObject(object.entityDespawn);
                }
                if (object.chatMessage != null) {
                    if (typeof object.chatMessage !== "object")
                        throw TypeError(".graphwiz.core.Message.chatMessage: object expected");
                    message.chatMessage = $root.graphwiz.core.ChatMessage.fromObject(object.chatMessage);
                }
                if (object.presenceEvent != null) {
                    if (typeof object.presenceEvent !== "object")
                        throw TypeError(".graphwiz.core.Message.presenceEvent: object expected");
                    message.presenceEvent = $root.graphwiz.core.PresenceEvent.fromObject(object.presenceEvent);
                }
                return message;
            };

            /**
             * Creates a plain object from a Message message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.Message
             * @static
             * @param {graphwiz.core.Message} message Message
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Message.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.messageId = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestamp = options.longs === String ? "0" : 0;
                    object.type = options.enums === String ? "UNKNOWN" : 0;
                }
                if (message.messageId != null && message.hasOwnProperty("messageId"))
                    object.messageId = message.messageId;
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (typeof message.timestamp === "number")
                        object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                    else
                        object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.graphwiz.core.MessageType[message.type] === undefined ? message.type : $root.graphwiz.core.MessageType[message.type] : message.type;
                if (message.clientHello != null && message.hasOwnProperty("clientHello")) {
                    object.clientHello = $root.graphwiz.core.ClientHello.toObject(message.clientHello, options);
                    if (options.oneofs)
                        object.payload = "clientHello";
                }
                if (message.serverHello != null && message.hasOwnProperty("serverHello")) {
                    object.serverHello = $root.graphwiz.core.ServerHello.toObject(message.serverHello, options);
                    if (options.oneofs)
                        object.payload = "serverHello";
                }
                if (message.positionUpdate != null && message.hasOwnProperty("positionUpdate")) {
                    object.positionUpdate = $root.graphwiz.core.PositionUpdate.toObject(message.positionUpdate, options);
                    if (options.oneofs)
                        object.payload = "positionUpdate";
                }
                if (message.voiceData != null && message.hasOwnProperty("voiceData")) {
                    object.voiceData = $root.graphwiz.core.VoiceData.toObject(message.voiceData, options);
                    if (options.oneofs)
                        object.payload = "voiceData";
                }
                if (message.entitySpawn != null && message.hasOwnProperty("entitySpawn")) {
                    object.entitySpawn = $root.graphwiz.core.EntitySpawn.toObject(message.entitySpawn, options);
                    if (options.oneofs)
                        object.payload = "entitySpawn";
                }
                if (message.entityUpdate != null && message.hasOwnProperty("entityUpdate")) {
                    object.entityUpdate = $root.graphwiz.core.EntityUpdate.toObject(message.entityUpdate, options);
                    if (options.oneofs)
                        object.payload = "entityUpdate";
                }
                if (message.entityDespawn != null && message.hasOwnProperty("entityDespawn")) {
                    object.entityDespawn = $root.graphwiz.core.EntityDespawn.toObject(message.entityDespawn, options);
                    if (options.oneofs)
                        object.payload = "entityDespawn";
                }
                if (message.chatMessage != null && message.hasOwnProperty("chatMessage")) {
                    object.chatMessage = $root.graphwiz.core.ChatMessage.toObject(message.chatMessage, options);
                    if (options.oneofs)
                        object.payload = "chatMessage";
                }
                if (message.presenceEvent != null && message.hasOwnProperty("presenceEvent")) {
                    object.presenceEvent = $root.graphwiz.core.PresenceEvent.toObject(message.presenceEvent, options);
                    if (options.oneofs)
                        object.payload = "presenceEvent";
                }
                return object;
            };

            /**
             * Converts this Message to JSON.
             * @function toJSON
             * @memberof graphwiz.core.Message
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Message.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Message
             * @function getTypeUrl
             * @memberof graphwiz.core.Message
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Message.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.Message";
            };

            return Message;
        })();

        /**
         * MessageType enum.
         * @name graphwiz.core.MessageType
         * @enum {number}
         * @property {number} UNKNOWN=0 UNKNOWN value
         * @property {number} CLIENT_HELLO=1 CLIENT_HELLO value
         * @property {number} SERVER_HELLO=2 SERVER_HELLO value
         * @property {number} POSITION_UPDATE=10 POSITION_UPDATE value
         * @property {number} VOICE_DATA=11 VOICE_DATA value
         * @property {number} ENTITY_SPAWN=20 ENTITY_SPAWN value
         * @property {number} ENTITY_UPDATE=21 ENTITY_UPDATE value
         * @property {number} ENTITY_DESPAWN=22 ENTITY_DESPAWN value
         * @property {number} CHAT_MESSAGE=30 CHAT_MESSAGE value
         * @property {number} PRESENCE_JOIN=40 PRESENCE_JOIN value
         * @property {number} PRESENCE_LEAVE=41 PRESENCE_LEAVE value
         * @property {number} PRESENCE_UPDATE=42 PRESENCE_UPDATE value
         */
        core.MessageType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "UNKNOWN"] = 0;
            values[valuesById[1] = "CLIENT_HELLO"] = 1;
            values[valuesById[2] = "SERVER_HELLO"] = 2;
            values[valuesById[10] = "POSITION_UPDATE"] = 10;
            values[valuesById[11] = "VOICE_DATA"] = 11;
            values[valuesById[20] = "ENTITY_SPAWN"] = 20;
            values[valuesById[21] = "ENTITY_UPDATE"] = 21;
            values[valuesById[22] = "ENTITY_DESPAWN"] = 22;
            values[valuesById[30] = "CHAT_MESSAGE"] = 30;
            values[valuesById[40] = "PRESENCE_JOIN"] = 40;
            values[valuesById[41] = "PRESENCE_LEAVE"] = 41;
            values[valuesById[42] = "PRESENCE_UPDATE"] = 42;
            return values;
        })();

        core.Vector3 = (function() {

            /**
             * Properties of a Vector3.
             * @memberof graphwiz.core
             * @interface IVector3
             * @property {number|null} [x] Vector3 x
             * @property {number|null} [y] Vector3 y
             * @property {number|null} [z] Vector3 z
             */

            /**
             * Constructs a new Vector3.
             * @memberof graphwiz.core
             * @classdesc Represents a Vector3.
             * @implements IVector3
             * @constructor
             * @param {graphwiz.core.IVector3=} [properties] Properties to set
             */
            function Vector3(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Vector3 x.
             * @member {number} x
             * @memberof graphwiz.core.Vector3
             * @instance
             */
            Vector3.prototype.x = 0;

            /**
             * Vector3 y.
             * @member {number} y
             * @memberof graphwiz.core.Vector3
             * @instance
             */
            Vector3.prototype.y = 0;

            /**
             * Vector3 z.
             * @member {number} z
             * @memberof graphwiz.core.Vector3
             * @instance
             */
            Vector3.prototype.z = 0;

            /**
             * Creates a new Vector3 instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {graphwiz.core.IVector3=} [properties] Properties to set
             * @returns {graphwiz.core.Vector3} Vector3 instance
             */
            Vector3.create = function create(properties) {
                return new Vector3(properties);
            };

            /**
             * Encodes the specified Vector3 message. Does not implicitly {@link graphwiz.core.Vector3.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {graphwiz.core.IVector3} message Vector3 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vector3.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                if (message.z != null && Object.hasOwnProperty.call(message, "z"))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.z);
                return writer;
            };

            /**
             * Encodes the specified Vector3 message, length delimited. Does not implicitly {@link graphwiz.core.Vector3.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {graphwiz.core.IVector3} message Vector3 message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vector3.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Vector3 message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.Vector3} Vector3
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Vector3.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.Vector3();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.x = reader.float();
                            break;
                        }
                    case 2: {
                            message.y = reader.float();
                            break;
                        }
                    case 3: {
                            message.z = reader.float();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Vector3 message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.Vector3} Vector3
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Vector3.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Vector3 message.
             * @function verify
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Vector3.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.x != null && message.hasOwnProperty("x"))
                    if (typeof message.x !== "number")
                        return "x: number expected";
                if (message.y != null && message.hasOwnProperty("y"))
                    if (typeof message.y !== "number")
                        return "y: number expected";
                if (message.z != null && message.hasOwnProperty("z"))
                    if (typeof message.z !== "number")
                        return "z: number expected";
                return null;
            };

            /**
             * Creates a Vector3 message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.Vector3} Vector3
             */
            Vector3.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.Vector3)
                    return object;
                var message = new $root.graphwiz.core.Vector3();
                if (object.x != null)
                    message.x = Number(object.x);
                if (object.y != null)
                    message.y = Number(object.y);
                if (object.z != null)
                    message.z = Number(object.z);
                return message;
            };

            /**
             * Creates a plain object from a Vector3 message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {graphwiz.core.Vector3} message Vector3
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Vector3.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.x = 0;
                    object.y = 0;
                    object.z = 0;
                }
                if (message.x != null && message.hasOwnProperty("x"))
                    object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                if (message.y != null && message.hasOwnProperty("y"))
                    object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                if (message.z != null && message.hasOwnProperty("z"))
                    object.z = options.json && !isFinite(message.z) ? String(message.z) : message.z;
                return object;
            };

            /**
             * Converts this Vector3 to JSON.
             * @function toJSON
             * @memberof graphwiz.core.Vector3
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Vector3.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Vector3
             * @function getTypeUrl
             * @memberof graphwiz.core.Vector3
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Vector3.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.Vector3";
            };

            return Vector3;
        })();

        core.Quaternion = (function() {

            /**
             * Properties of a Quaternion.
             * @memberof graphwiz.core
             * @interface IQuaternion
             * @property {number|null} [x] Quaternion x
             * @property {number|null} [y] Quaternion y
             * @property {number|null} [z] Quaternion z
             * @property {number|null} [w] Quaternion w
             */

            /**
             * Constructs a new Quaternion.
             * @memberof graphwiz.core
             * @classdesc Represents a Quaternion.
             * @implements IQuaternion
             * @constructor
             * @param {graphwiz.core.IQuaternion=} [properties] Properties to set
             */
            function Quaternion(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Quaternion x.
             * @member {number} x
             * @memberof graphwiz.core.Quaternion
             * @instance
             */
            Quaternion.prototype.x = 0;

            /**
             * Quaternion y.
             * @member {number} y
             * @memberof graphwiz.core.Quaternion
             * @instance
             */
            Quaternion.prototype.y = 0;

            /**
             * Quaternion z.
             * @member {number} z
             * @memberof graphwiz.core.Quaternion
             * @instance
             */
            Quaternion.prototype.z = 0;

            /**
             * Quaternion w.
             * @member {number} w
             * @memberof graphwiz.core.Quaternion
             * @instance
             */
            Quaternion.prototype.w = 0;

            /**
             * Creates a new Quaternion instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {graphwiz.core.IQuaternion=} [properties] Properties to set
             * @returns {graphwiz.core.Quaternion} Quaternion instance
             */
            Quaternion.create = function create(properties) {
                return new Quaternion(properties);
            };

            /**
             * Encodes the specified Quaternion message. Does not implicitly {@link graphwiz.core.Quaternion.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {graphwiz.core.IQuaternion} message Quaternion message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Quaternion.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                if (message.z != null && Object.hasOwnProperty.call(message, "z"))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.z);
                if (message.w != null && Object.hasOwnProperty.call(message, "w"))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.w);
                return writer;
            };

            /**
             * Encodes the specified Quaternion message, length delimited. Does not implicitly {@link graphwiz.core.Quaternion.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {graphwiz.core.IQuaternion} message Quaternion message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Quaternion.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Quaternion message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.Quaternion} Quaternion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Quaternion.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.Quaternion();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.x = reader.float();
                            break;
                        }
                    case 2: {
                            message.y = reader.float();
                            break;
                        }
                    case 3: {
                            message.z = reader.float();
                            break;
                        }
                    case 4: {
                            message.w = reader.float();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Quaternion message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.Quaternion} Quaternion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Quaternion.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Quaternion message.
             * @function verify
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Quaternion.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.x != null && message.hasOwnProperty("x"))
                    if (typeof message.x !== "number")
                        return "x: number expected";
                if (message.y != null && message.hasOwnProperty("y"))
                    if (typeof message.y !== "number")
                        return "y: number expected";
                if (message.z != null && message.hasOwnProperty("z"))
                    if (typeof message.z !== "number")
                        return "z: number expected";
                if (message.w != null && message.hasOwnProperty("w"))
                    if (typeof message.w !== "number")
                        return "w: number expected";
                return null;
            };

            /**
             * Creates a Quaternion message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.Quaternion} Quaternion
             */
            Quaternion.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.Quaternion)
                    return object;
                var message = new $root.graphwiz.core.Quaternion();
                if (object.x != null)
                    message.x = Number(object.x);
                if (object.y != null)
                    message.y = Number(object.y);
                if (object.z != null)
                    message.z = Number(object.z);
                if (object.w != null)
                    message.w = Number(object.w);
                return message;
            };

            /**
             * Creates a plain object from a Quaternion message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {graphwiz.core.Quaternion} message Quaternion
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Quaternion.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.x = 0;
                    object.y = 0;
                    object.z = 0;
                    object.w = 0;
                }
                if (message.x != null && message.hasOwnProperty("x"))
                    object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                if (message.y != null && message.hasOwnProperty("y"))
                    object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                if (message.z != null && message.hasOwnProperty("z"))
                    object.z = options.json && !isFinite(message.z) ? String(message.z) : message.z;
                if (message.w != null && message.hasOwnProperty("w"))
                    object.w = options.json && !isFinite(message.w) ? String(message.w) : message.w;
                return object;
            };

            /**
             * Converts this Quaternion to JSON.
             * @function toJSON
             * @memberof graphwiz.core.Quaternion
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Quaternion.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Quaternion
             * @function getTypeUrl
             * @memberof graphwiz.core.Quaternion
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Quaternion.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.Quaternion";
            };

            return Quaternion;
        })();

        core.PositionUpdate = (function() {

            /**
             * Properties of a PositionUpdate.
             * @memberof graphwiz.core
             * @interface IPositionUpdate
             * @property {string|null} [entityId] PositionUpdate entityId
             * @property {graphwiz.core.IVector3|null} [position] PositionUpdate position
             * @property {graphwiz.core.IQuaternion|null} [rotation] PositionUpdate rotation
             * @property {number|null} [sequenceNumber] PositionUpdate sequenceNumber
             */

            /**
             * Constructs a new PositionUpdate.
             * @memberof graphwiz.core
             * @classdesc Represents a PositionUpdate.
             * @implements IPositionUpdate
             * @constructor
             * @param {graphwiz.core.IPositionUpdate=} [properties] Properties to set
             */
            function PositionUpdate(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PositionUpdate entityId.
             * @member {string} entityId
             * @memberof graphwiz.core.PositionUpdate
             * @instance
             */
            PositionUpdate.prototype.entityId = "";

            /**
             * PositionUpdate position.
             * @member {graphwiz.core.IVector3|null|undefined} position
             * @memberof graphwiz.core.PositionUpdate
             * @instance
             */
            PositionUpdate.prototype.position = null;

            /**
             * PositionUpdate rotation.
             * @member {graphwiz.core.IQuaternion|null|undefined} rotation
             * @memberof graphwiz.core.PositionUpdate
             * @instance
             */
            PositionUpdate.prototype.rotation = null;

            /**
             * PositionUpdate sequenceNumber.
             * @member {number} sequenceNumber
             * @memberof graphwiz.core.PositionUpdate
             * @instance
             */
            PositionUpdate.prototype.sequenceNumber = 0;

            /**
             * Creates a new PositionUpdate instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {graphwiz.core.IPositionUpdate=} [properties] Properties to set
             * @returns {graphwiz.core.PositionUpdate} PositionUpdate instance
             */
            PositionUpdate.create = function create(properties) {
                return new PositionUpdate(properties);
            };

            /**
             * Encodes the specified PositionUpdate message. Does not implicitly {@link graphwiz.core.PositionUpdate.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {graphwiz.core.IPositionUpdate} message PositionUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PositionUpdate.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.entityId);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.graphwiz.core.Vector3.encode(message.position, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.rotation != null && Object.hasOwnProperty.call(message, "rotation"))
                    $root.graphwiz.core.Quaternion.encode(message.rotation, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.sequenceNumber != null && Object.hasOwnProperty.call(message, "sequenceNumber"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.sequenceNumber);
                return writer;
            };

            /**
             * Encodes the specified PositionUpdate message, length delimited. Does not implicitly {@link graphwiz.core.PositionUpdate.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {graphwiz.core.IPositionUpdate} message PositionUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PositionUpdate.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PositionUpdate message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.PositionUpdate} PositionUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PositionUpdate.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.PositionUpdate();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.entityId = reader.string();
                            break;
                        }
                    case 2: {
                            message.position = $root.graphwiz.core.Vector3.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.rotation = $root.graphwiz.core.Quaternion.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.sequenceNumber = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PositionUpdate message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.PositionUpdate} PositionUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PositionUpdate.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PositionUpdate message.
             * @function verify
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PositionUpdate.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    if (!$util.isString(message.entityId))
                        return "entityId: string expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.graphwiz.core.Vector3.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.rotation != null && message.hasOwnProperty("rotation")) {
                    var error = $root.graphwiz.core.Quaternion.verify(message.rotation);
                    if (error)
                        return "rotation." + error;
                }
                if (message.sequenceNumber != null && message.hasOwnProperty("sequenceNumber"))
                    if (!$util.isInteger(message.sequenceNumber))
                        return "sequenceNumber: integer expected";
                return null;
            };

            /**
             * Creates a PositionUpdate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.PositionUpdate} PositionUpdate
             */
            PositionUpdate.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.PositionUpdate)
                    return object;
                var message = new $root.graphwiz.core.PositionUpdate();
                if (object.entityId != null)
                    message.entityId = String(object.entityId);
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".graphwiz.core.PositionUpdate.position: object expected");
                    message.position = $root.graphwiz.core.Vector3.fromObject(object.position);
                }
                if (object.rotation != null) {
                    if (typeof object.rotation !== "object")
                        throw TypeError(".graphwiz.core.PositionUpdate.rotation: object expected");
                    message.rotation = $root.graphwiz.core.Quaternion.fromObject(object.rotation);
                }
                if (object.sequenceNumber != null)
                    message.sequenceNumber = object.sequenceNumber >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a PositionUpdate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {graphwiz.core.PositionUpdate} message PositionUpdate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PositionUpdate.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.entityId = "";
                    object.position = null;
                    object.rotation = null;
                    object.sequenceNumber = 0;
                }
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    object.entityId = message.entityId;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.graphwiz.core.Vector3.toObject(message.position, options);
                if (message.rotation != null && message.hasOwnProperty("rotation"))
                    object.rotation = $root.graphwiz.core.Quaternion.toObject(message.rotation, options);
                if (message.sequenceNumber != null && message.hasOwnProperty("sequenceNumber"))
                    object.sequenceNumber = message.sequenceNumber;
                return object;
            };

            /**
             * Converts this PositionUpdate to JSON.
             * @function toJSON
             * @memberof graphwiz.core.PositionUpdate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PositionUpdate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PositionUpdate
             * @function getTypeUrl
             * @memberof graphwiz.core.PositionUpdate
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PositionUpdate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.PositionUpdate";
            };

            return PositionUpdate;
        })();

        core.VoiceData = (function() {

            /**
             * Properties of a VoiceData.
             * @memberof graphwiz.core
             * @interface IVoiceData
             * @property {string|null} [fromClientId] VoiceData fromClientId
             * @property {Uint8Array|null} [audioData] VoiceData audioData
             * @property {number|null} [sequenceNumber] VoiceData sequenceNumber
             * @property {graphwiz.core.VoiceCodec|null} [codec] VoiceData codec
             */

            /**
             * Constructs a new VoiceData.
             * @memberof graphwiz.core
             * @classdesc Represents a VoiceData.
             * @implements IVoiceData
             * @constructor
             * @param {graphwiz.core.IVoiceData=} [properties] Properties to set
             */
            function VoiceData(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * VoiceData fromClientId.
             * @member {string} fromClientId
             * @memberof graphwiz.core.VoiceData
             * @instance
             */
            VoiceData.prototype.fromClientId = "";

            /**
             * VoiceData audioData.
             * @member {Uint8Array} audioData
             * @memberof graphwiz.core.VoiceData
             * @instance
             */
            VoiceData.prototype.audioData = $util.newBuffer([]);

            /**
             * VoiceData sequenceNumber.
             * @member {number} sequenceNumber
             * @memberof graphwiz.core.VoiceData
             * @instance
             */
            VoiceData.prototype.sequenceNumber = 0;

            /**
             * VoiceData codec.
             * @member {graphwiz.core.VoiceCodec} codec
             * @memberof graphwiz.core.VoiceData
             * @instance
             */
            VoiceData.prototype.codec = 0;

            /**
             * Creates a new VoiceData instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {graphwiz.core.IVoiceData=} [properties] Properties to set
             * @returns {graphwiz.core.VoiceData} VoiceData instance
             */
            VoiceData.create = function create(properties) {
                return new VoiceData(properties);
            };

            /**
             * Encodes the specified VoiceData message. Does not implicitly {@link graphwiz.core.VoiceData.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {graphwiz.core.IVoiceData} message VoiceData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            VoiceData.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fromClientId != null && Object.hasOwnProperty.call(message, "fromClientId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.fromClientId);
                if (message.audioData != null && Object.hasOwnProperty.call(message, "audioData"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.audioData);
                if (message.sequenceNumber != null && Object.hasOwnProperty.call(message, "sequenceNumber"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sequenceNumber);
                if (message.codec != null && Object.hasOwnProperty.call(message, "codec"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.codec);
                return writer;
            };

            /**
             * Encodes the specified VoiceData message, length delimited. Does not implicitly {@link graphwiz.core.VoiceData.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {graphwiz.core.IVoiceData} message VoiceData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            VoiceData.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a VoiceData message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.VoiceData} VoiceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            VoiceData.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.VoiceData();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.fromClientId = reader.string();
                            break;
                        }
                    case 2: {
                            message.audioData = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.sequenceNumber = reader.int32();
                            break;
                        }
                    case 4: {
                            message.codec = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a VoiceData message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.VoiceData} VoiceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            VoiceData.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a VoiceData message.
             * @function verify
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            VoiceData.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fromClientId != null && message.hasOwnProperty("fromClientId"))
                    if (!$util.isString(message.fromClientId))
                        return "fromClientId: string expected";
                if (message.audioData != null && message.hasOwnProperty("audioData"))
                    if (!(message.audioData && typeof message.audioData.length === "number" || $util.isString(message.audioData)))
                        return "audioData: buffer expected";
                if (message.sequenceNumber != null && message.hasOwnProperty("sequenceNumber"))
                    if (!$util.isInteger(message.sequenceNumber))
                        return "sequenceNumber: integer expected";
                if (message.codec != null && message.hasOwnProperty("codec"))
                    switch (message.codec) {
                    default:
                        return "codec: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a VoiceData message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.VoiceData} VoiceData
             */
            VoiceData.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.VoiceData)
                    return object;
                var message = new $root.graphwiz.core.VoiceData();
                if (object.fromClientId != null)
                    message.fromClientId = String(object.fromClientId);
                if (object.audioData != null)
                    if (typeof object.audioData === "string")
                        $util.base64.decode(object.audioData, message.audioData = $util.newBuffer($util.base64.length(object.audioData)), 0);
                    else if (object.audioData.length >= 0)
                        message.audioData = object.audioData;
                if (object.sequenceNumber != null)
                    message.sequenceNumber = object.sequenceNumber | 0;
                switch (object.codec) {
                default:
                    if (typeof object.codec === "number") {
                        message.codec = object.codec;
                        break;
                    }
                    break;
                case "OPUS":
                case 0:
                    message.codec = 0;
                    break;
                case "PCMU":
                case 1:
                    message.codec = 1;
                    break;
                case "PCMA":
                case 2:
                    message.codec = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a VoiceData message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {graphwiz.core.VoiceData} message VoiceData
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            VoiceData.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.fromClientId = "";
                    if (options.bytes === String)
                        object.audioData = "";
                    else {
                        object.audioData = [];
                        if (options.bytes !== Array)
                            object.audioData = $util.newBuffer(object.audioData);
                    }
                    object.sequenceNumber = 0;
                    object.codec = options.enums === String ? "OPUS" : 0;
                }
                if (message.fromClientId != null && message.hasOwnProperty("fromClientId"))
                    object.fromClientId = message.fromClientId;
                if (message.audioData != null && message.hasOwnProperty("audioData"))
                    object.audioData = options.bytes === String ? $util.base64.encode(message.audioData, 0, message.audioData.length) : options.bytes === Array ? Array.prototype.slice.call(message.audioData) : message.audioData;
                if (message.sequenceNumber != null && message.hasOwnProperty("sequenceNumber"))
                    object.sequenceNumber = message.sequenceNumber;
                if (message.codec != null && message.hasOwnProperty("codec"))
                    object.codec = options.enums === String ? $root.graphwiz.core.VoiceCodec[message.codec] === undefined ? message.codec : $root.graphwiz.core.VoiceCodec[message.codec] : message.codec;
                return object;
            };

            /**
             * Converts this VoiceData to JSON.
             * @function toJSON
             * @memberof graphwiz.core.VoiceData
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            VoiceData.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for VoiceData
             * @function getTypeUrl
             * @memberof graphwiz.core.VoiceData
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            VoiceData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.VoiceData";
            };

            return VoiceData;
        })();

        /**
         * VoiceCodec enum.
         * @name graphwiz.core.VoiceCodec
         * @enum {number}
         * @property {number} OPUS=0 OPUS value
         * @property {number} PCMU=1 PCMU value
         * @property {number} PCMA=2 PCMA value
         */
        core.VoiceCodec = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "OPUS"] = 0;
            values[valuesById[1] = "PCMU"] = 1;
            values[valuesById[2] = "PCMA"] = 2;
            return values;
        })();

        core.EntitySpawn = (function() {

            /**
             * Properties of an EntitySpawn.
             * @memberof graphwiz.core
             * @interface IEntitySpawn
             * @property {string|null} [entityId] EntitySpawn entityId
             * @property {string|null} [templateId] EntitySpawn templateId
             * @property {string|null} [ownerId] EntitySpawn ownerId
             * @property {Object.<string,string>|null} [components] EntitySpawn components
             */

            /**
             * Constructs a new EntitySpawn.
             * @memberof graphwiz.core
             * @classdesc Represents an EntitySpawn.
             * @implements IEntitySpawn
             * @constructor
             * @param {graphwiz.core.IEntitySpawn=} [properties] Properties to set
             */
            function EntitySpawn(properties) {
                this.components = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EntitySpawn entityId.
             * @member {string} entityId
             * @memberof graphwiz.core.EntitySpawn
             * @instance
             */
            EntitySpawn.prototype.entityId = "";

            /**
             * EntitySpawn templateId.
             * @member {string} templateId
             * @memberof graphwiz.core.EntitySpawn
             * @instance
             */
            EntitySpawn.prototype.templateId = "";

            /**
             * EntitySpawn ownerId.
             * @member {string} ownerId
             * @memberof graphwiz.core.EntitySpawn
             * @instance
             */
            EntitySpawn.prototype.ownerId = "";

            /**
             * EntitySpawn components.
             * @member {Object.<string,string>} components
             * @memberof graphwiz.core.EntitySpawn
             * @instance
             */
            EntitySpawn.prototype.components = $util.emptyObject;

            /**
             * Creates a new EntitySpawn instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {graphwiz.core.IEntitySpawn=} [properties] Properties to set
             * @returns {graphwiz.core.EntitySpawn} EntitySpawn instance
             */
            EntitySpawn.create = function create(properties) {
                return new EntitySpawn(properties);
            };

            /**
             * Encodes the specified EntitySpawn message. Does not implicitly {@link graphwiz.core.EntitySpawn.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {graphwiz.core.IEntitySpawn} message EntitySpawn message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntitySpawn.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.entityId);
                if (message.templateId != null && Object.hasOwnProperty.call(message, "templateId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.templateId);
                if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.ownerId);
                if (message.components != null && Object.hasOwnProperty.call(message, "components"))
                    for (var keys = Object.keys(message.components), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.components[keys[i]]).ldelim();
                return writer;
            };

            /**
             * Encodes the specified EntitySpawn message, length delimited. Does not implicitly {@link graphwiz.core.EntitySpawn.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {graphwiz.core.IEntitySpawn} message EntitySpawn message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntitySpawn.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EntitySpawn message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.EntitySpawn} EntitySpawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntitySpawn.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.EntitySpawn(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.entityId = reader.string();
                            break;
                        }
                    case 2: {
                            message.templateId = reader.string();
                            break;
                        }
                    case 3: {
                            message.ownerId = reader.string();
                            break;
                        }
                    case 4: {
                            if (message.components === $util.emptyObject)
                                message.components = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.components[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EntitySpawn message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.EntitySpawn} EntitySpawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntitySpawn.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EntitySpawn message.
             * @function verify
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EntitySpawn.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    if (!$util.isString(message.entityId))
                        return "entityId: string expected";
                if (message.templateId != null && message.hasOwnProperty("templateId"))
                    if (!$util.isString(message.templateId))
                        return "templateId: string expected";
                if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                    if (!$util.isString(message.ownerId))
                        return "ownerId: string expected";
                if (message.components != null && message.hasOwnProperty("components")) {
                    if (!$util.isObject(message.components))
                        return "components: object expected";
                    var key = Object.keys(message.components);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.components[key[i]]))
                            return "components: string{k:string} expected";
                }
                return null;
            };

            /**
             * Creates an EntitySpawn message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.EntitySpawn} EntitySpawn
             */
            EntitySpawn.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.EntitySpawn)
                    return object;
                var message = new $root.graphwiz.core.EntitySpawn();
                if (object.entityId != null)
                    message.entityId = String(object.entityId);
                if (object.templateId != null)
                    message.templateId = String(object.templateId);
                if (object.ownerId != null)
                    message.ownerId = String(object.ownerId);
                if (object.components) {
                    if (typeof object.components !== "object")
                        throw TypeError(".graphwiz.core.EntitySpawn.components: object expected");
                    message.components = {};
                    for (var keys = Object.keys(object.components), i = 0; i < keys.length; ++i)
                        message.components[keys[i]] = String(object.components[keys[i]]);
                }
                return message;
            };

            /**
             * Creates a plain object from an EntitySpawn message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {graphwiz.core.EntitySpawn} message EntitySpawn
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EntitySpawn.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.components = {};
                if (options.defaults) {
                    object.entityId = "";
                    object.templateId = "";
                    object.ownerId = "";
                }
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    object.entityId = message.entityId;
                if (message.templateId != null && message.hasOwnProperty("templateId"))
                    object.templateId = message.templateId;
                if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                    object.ownerId = message.ownerId;
                var keys2;
                if (message.components && (keys2 = Object.keys(message.components)).length) {
                    object.components = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.components[keys2[j]] = message.components[keys2[j]];
                }
                return object;
            };

            /**
             * Converts this EntitySpawn to JSON.
             * @function toJSON
             * @memberof graphwiz.core.EntitySpawn
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EntitySpawn.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EntitySpawn
             * @function getTypeUrl
             * @memberof graphwiz.core.EntitySpawn
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EntitySpawn.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.EntitySpawn";
            };

            return EntitySpawn;
        })();

        core.EntityUpdate = (function() {

            /**
             * Properties of an EntityUpdate.
             * @memberof graphwiz.core
             * @interface IEntityUpdate
             * @property {string|null} [entityId] EntityUpdate entityId
             * @property {Object.<string,Uint8Array>|null} [components] EntityUpdate components
             */

            /**
             * Constructs a new EntityUpdate.
             * @memberof graphwiz.core
             * @classdesc Represents an EntityUpdate.
             * @implements IEntityUpdate
             * @constructor
             * @param {graphwiz.core.IEntityUpdate=} [properties] Properties to set
             */
            function EntityUpdate(properties) {
                this.components = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EntityUpdate entityId.
             * @member {string} entityId
             * @memberof graphwiz.core.EntityUpdate
             * @instance
             */
            EntityUpdate.prototype.entityId = "";

            /**
             * EntityUpdate components.
             * @member {Object.<string,Uint8Array>} components
             * @memberof graphwiz.core.EntityUpdate
             * @instance
             */
            EntityUpdate.prototype.components = $util.emptyObject;

            /**
             * Creates a new EntityUpdate instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {graphwiz.core.IEntityUpdate=} [properties] Properties to set
             * @returns {graphwiz.core.EntityUpdate} EntityUpdate instance
             */
            EntityUpdate.create = function create(properties) {
                return new EntityUpdate(properties);
            };

            /**
             * Encodes the specified EntityUpdate message. Does not implicitly {@link graphwiz.core.EntityUpdate.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {graphwiz.core.IEntityUpdate} message EntityUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntityUpdate.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.entityId);
                if (message.components != null && Object.hasOwnProperty.call(message, "components"))
                    for (var keys = Object.keys(message.components), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).bytes(message.components[keys[i]]).ldelim();
                return writer;
            };

            /**
             * Encodes the specified EntityUpdate message, length delimited. Does not implicitly {@link graphwiz.core.EntityUpdate.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {graphwiz.core.IEntityUpdate} message EntityUpdate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntityUpdate.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EntityUpdate message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.EntityUpdate} EntityUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntityUpdate.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.EntityUpdate(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.entityId = reader.string();
                            break;
                        }
                    case 2: {
                            if (message.components === $util.emptyObject)
                                message.components = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = [];
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.bytes();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.components[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EntityUpdate message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.EntityUpdate} EntityUpdate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntityUpdate.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EntityUpdate message.
             * @function verify
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EntityUpdate.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    if (!$util.isString(message.entityId))
                        return "entityId: string expected";
                if (message.components != null && message.hasOwnProperty("components")) {
                    if (!$util.isObject(message.components))
                        return "components: object expected";
                    var key = Object.keys(message.components);
                    for (var i = 0; i < key.length; ++i)
                        if (!(message.components[key[i]] && typeof message.components[key[i]].length === "number" || $util.isString(message.components[key[i]])))
                            return "components: buffer{k:string} expected";
                }
                return null;
            };

            /**
             * Creates an EntityUpdate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.EntityUpdate} EntityUpdate
             */
            EntityUpdate.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.EntityUpdate)
                    return object;
                var message = new $root.graphwiz.core.EntityUpdate();
                if (object.entityId != null)
                    message.entityId = String(object.entityId);
                if (object.components) {
                    if (typeof object.components !== "object")
                        throw TypeError(".graphwiz.core.EntityUpdate.components: object expected");
                    message.components = {};
                    for (var keys = Object.keys(object.components), i = 0; i < keys.length; ++i)
                        if (typeof object.components[keys[i]] === "string")
                            $util.base64.decode(object.components[keys[i]], message.components[keys[i]] = $util.newBuffer($util.base64.length(object.components[keys[i]])), 0);
                        else if (object.components[keys[i]].length >= 0)
                            message.components[keys[i]] = object.components[keys[i]];
                }
                return message;
            };

            /**
             * Creates a plain object from an EntityUpdate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {graphwiz.core.EntityUpdate} message EntityUpdate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EntityUpdate.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.components = {};
                if (options.defaults)
                    object.entityId = "";
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    object.entityId = message.entityId;
                var keys2;
                if (message.components && (keys2 = Object.keys(message.components)).length) {
                    object.components = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.components[keys2[j]] = options.bytes === String ? $util.base64.encode(message.components[keys2[j]], 0, message.components[keys2[j]].length) : options.bytes === Array ? Array.prototype.slice.call(message.components[keys2[j]]) : message.components[keys2[j]];
                }
                return object;
            };

            /**
             * Converts this EntityUpdate to JSON.
             * @function toJSON
             * @memberof graphwiz.core.EntityUpdate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EntityUpdate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EntityUpdate
             * @function getTypeUrl
             * @memberof graphwiz.core.EntityUpdate
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EntityUpdate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.EntityUpdate";
            };

            return EntityUpdate;
        })();

        core.EntityDespawn = (function() {

            /**
             * Properties of an EntityDespawn.
             * @memberof graphwiz.core
             * @interface IEntityDespawn
             * @property {string|null} [entityId] EntityDespawn entityId
             */

            /**
             * Constructs a new EntityDespawn.
             * @memberof graphwiz.core
             * @classdesc Represents an EntityDespawn.
             * @implements IEntityDespawn
             * @constructor
             * @param {graphwiz.core.IEntityDespawn=} [properties] Properties to set
             */
            function EntityDespawn(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EntityDespawn entityId.
             * @member {string} entityId
             * @memberof graphwiz.core.EntityDespawn
             * @instance
             */
            EntityDespawn.prototype.entityId = "";

            /**
             * Creates a new EntityDespawn instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {graphwiz.core.IEntityDespawn=} [properties] Properties to set
             * @returns {graphwiz.core.EntityDespawn} EntityDespawn instance
             */
            EntityDespawn.create = function create(properties) {
                return new EntityDespawn(properties);
            };

            /**
             * Encodes the specified EntityDespawn message. Does not implicitly {@link graphwiz.core.EntityDespawn.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {graphwiz.core.IEntityDespawn} message EntityDespawn message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntityDespawn.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.entityId);
                return writer;
            };

            /**
             * Encodes the specified EntityDespawn message, length delimited. Does not implicitly {@link graphwiz.core.EntityDespawn.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {graphwiz.core.IEntityDespawn} message EntityDespawn message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntityDespawn.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EntityDespawn message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.EntityDespawn} EntityDespawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntityDespawn.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.EntityDespawn();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.entityId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EntityDespawn message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.EntityDespawn} EntityDespawn
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntityDespawn.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EntityDespawn message.
             * @function verify
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EntityDespawn.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    if (!$util.isString(message.entityId))
                        return "entityId: string expected";
                return null;
            };

            /**
             * Creates an EntityDespawn message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.EntityDespawn} EntityDespawn
             */
            EntityDespawn.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.EntityDespawn)
                    return object;
                var message = new $root.graphwiz.core.EntityDespawn();
                if (object.entityId != null)
                    message.entityId = String(object.entityId);
                return message;
            };

            /**
             * Creates a plain object from an EntityDespawn message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {graphwiz.core.EntityDespawn} message EntityDespawn
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EntityDespawn.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.entityId = "";
                if (message.entityId != null && message.hasOwnProperty("entityId"))
                    object.entityId = message.entityId;
                return object;
            };

            /**
             * Converts this EntityDespawn to JSON.
             * @function toJSON
             * @memberof graphwiz.core.EntityDespawn
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EntityDespawn.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EntityDespawn
             * @function getTypeUrl
             * @memberof graphwiz.core.EntityDespawn
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EntityDespawn.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.EntityDespawn";
            };

            return EntityDespawn;
        })();

        core.ChatMessage = (function() {

            /**
             * Properties of a ChatMessage.
             * @memberof graphwiz.core
             * @interface IChatMessage
             * @property {string|null} [fromClientId] ChatMessage fromClientId
             * @property {string|null} [message] ChatMessage message
             * @property {number|Long|null} [timestamp] ChatMessage timestamp
             * @property {graphwiz.core.ChatMessageType|null} [type] ChatMessage type
             */

            /**
             * Constructs a new ChatMessage.
             * @memberof graphwiz.core
             * @classdesc Represents a ChatMessage.
             * @implements IChatMessage
             * @constructor
             * @param {graphwiz.core.IChatMessage=} [properties] Properties to set
             */
            function ChatMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ChatMessage fromClientId.
             * @member {string} fromClientId
             * @memberof graphwiz.core.ChatMessage
             * @instance
             */
            ChatMessage.prototype.fromClientId = "";

            /**
             * ChatMessage message.
             * @member {string} message
             * @memberof graphwiz.core.ChatMessage
             * @instance
             */
            ChatMessage.prototype.message = "";

            /**
             * ChatMessage timestamp.
             * @member {number|Long} timestamp
             * @memberof graphwiz.core.ChatMessage
             * @instance
             */
            ChatMessage.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * ChatMessage type.
             * @member {graphwiz.core.ChatMessageType} type
             * @memberof graphwiz.core.ChatMessage
             * @instance
             */
            ChatMessage.prototype.type = 0;

            /**
             * Creates a new ChatMessage instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {graphwiz.core.IChatMessage=} [properties] Properties to set
             * @returns {graphwiz.core.ChatMessage} ChatMessage instance
             */
            ChatMessage.create = function create(properties) {
                return new ChatMessage(properties);
            };

            /**
             * Encodes the specified ChatMessage message. Does not implicitly {@link graphwiz.core.ChatMessage.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {graphwiz.core.IChatMessage} message ChatMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChatMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fromClientId != null && Object.hasOwnProperty.call(message, "fromClientId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.fromClientId);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.timestamp);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.type);
                return writer;
            };

            /**
             * Encodes the specified ChatMessage message, length delimited. Does not implicitly {@link graphwiz.core.ChatMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {graphwiz.core.IChatMessage} message ChatMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChatMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ChatMessage message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.ChatMessage} ChatMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChatMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.ChatMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.fromClientId = reader.string();
                            break;
                        }
                    case 2: {
                            message.message = reader.string();
                            break;
                        }
                    case 3: {
                            message.timestamp = reader.int64();
                            break;
                        }
                    case 4: {
                            message.type = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ChatMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.ChatMessage} ChatMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChatMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ChatMessage message.
             * @function verify
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ChatMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fromClientId != null && message.hasOwnProperty("fromClientId"))
                    if (!$util.isString(message.fromClientId))
                        return "fromClientId: string expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                        return "timestamp: integer|Long expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a ChatMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.ChatMessage} ChatMessage
             */
            ChatMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.ChatMessage)
                    return object;
                var message = new $root.graphwiz.core.ChatMessage();
                if (object.fromClientId != null)
                    message.fromClientId = String(object.fromClientId);
                if (object.message != null)
                    message.message = String(object.message);
                if (object.timestamp != null)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = false;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "NORMAL":
                case 0:
                    message.type = 0;
                    break;
                case "WHISPER":
                case 1:
                    message.type = 1;
                    break;
                case "SHOUT":
                case 2:
                    message.type = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a ChatMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {graphwiz.core.ChatMessage} message ChatMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ChatMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.fromClientId = "";
                    object.message = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestamp = options.longs === String ? "0" : 0;
                    object.type = options.enums === String ? "NORMAL" : 0;
                }
                if (message.fromClientId != null && message.hasOwnProperty("fromClientId"))
                    object.fromClientId = message.fromClientId;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (typeof message.timestamp === "number")
                        object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                    else
                        object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.graphwiz.core.ChatMessageType[message.type] === undefined ? message.type : $root.graphwiz.core.ChatMessageType[message.type] : message.type;
                return object;
            };

            /**
             * Converts this ChatMessage to JSON.
             * @function toJSON
             * @memberof graphwiz.core.ChatMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ChatMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ChatMessage
             * @function getTypeUrl
             * @memberof graphwiz.core.ChatMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ChatMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.ChatMessage";
            };

            return ChatMessage;
        })();

        /**
         * ChatMessageType enum.
         * @name graphwiz.core.ChatMessageType
         * @enum {number}
         * @property {number} NORMAL=0 NORMAL value
         * @property {number} WHISPER=1 WHISPER value
         * @property {number} SHOUT=2 SHOUT value
         */
        core.ChatMessageType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NORMAL"] = 0;
            values[valuesById[1] = "WHISPER"] = 1;
            values[valuesById[2] = "SHOUT"] = 2;
            return values;
        })();

        core.PresenceEvent = (function() {

            /**
             * Properties of a PresenceEvent.
             * @memberof graphwiz.core
             * @interface IPresenceEvent
             * @property {string|null} [clientId] PresenceEvent clientId
             * @property {graphwiz.core.PresenceEventType|null} [eventType] PresenceEvent eventType
             * @property {graphwiz.core.IPresenceData|null} [data] PresenceEvent data
             */

            /**
             * Constructs a new PresenceEvent.
             * @memberof graphwiz.core
             * @classdesc Represents a PresenceEvent.
             * @implements IPresenceEvent
             * @constructor
             * @param {graphwiz.core.IPresenceEvent=} [properties] Properties to set
             */
            function PresenceEvent(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PresenceEvent clientId.
             * @member {string} clientId
             * @memberof graphwiz.core.PresenceEvent
             * @instance
             */
            PresenceEvent.prototype.clientId = "";

            /**
             * PresenceEvent eventType.
             * @member {graphwiz.core.PresenceEventType} eventType
             * @memberof graphwiz.core.PresenceEvent
             * @instance
             */
            PresenceEvent.prototype.eventType = 0;

            /**
             * PresenceEvent data.
             * @member {graphwiz.core.IPresenceData|null|undefined} data
             * @memberof graphwiz.core.PresenceEvent
             * @instance
             */
            PresenceEvent.prototype.data = null;

            /**
             * Creates a new PresenceEvent instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {graphwiz.core.IPresenceEvent=} [properties] Properties to set
             * @returns {graphwiz.core.PresenceEvent} PresenceEvent instance
             */
            PresenceEvent.create = function create(properties) {
                return new PresenceEvent(properties);
            };

            /**
             * Encodes the specified PresenceEvent message. Does not implicitly {@link graphwiz.core.PresenceEvent.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {graphwiz.core.IPresenceEvent} message PresenceEvent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PresenceEvent.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.clientId);
                if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.eventType);
                if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                    $root.graphwiz.core.PresenceData.encode(message.data, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified PresenceEvent message, length delimited. Does not implicitly {@link graphwiz.core.PresenceEvent.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {graphwiz.core.IPresenceEvent} message PresenceEvent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PresenceEvent.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PresenceEvent message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.PresenceEvent} PresenceEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PresenceEvent.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.PresenceEvent();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.clientId = reader.string();
                            break;
                        }
                    case 2: {
                            message.eventType = reader.int32();
                            break;
                        }
                    case 3: {
                            message.data = $root.graphwiz.core.PresenceData.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PresenceEvent message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.PresenceEvent} PresenceEvent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PresenceEvent.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PresenceEvent message.
             * @function verify
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PresenceEvent.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    if (!$util.isString(message.clientId))
                        return "clientId: string expected";
                if (message.eventType != null && message.hasOwnProperty("eventType"))
                    switch (message.eventType) {
                    default:
                        return "eventType: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                if (message.data != null && message.hasOwnProperty("data")) {
                    var error = $root.graphwiz.core.PresenceData.verify(message.data);
                    if (error)
                        return "data." + error;
                }
                return null;
            };

            /**
             * Creates a PresenceEvent message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.PresenceEvent} PresenceEvent
             */
            PresenceEvent.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.PresenceEvent)
                    return object;
                var message = new $root.graphwiz.core.PresenceEvent();
                if (object.clientId != null)
                    message.clientId = String(object.clientId);
                switch (object.eventType) {
                default:
                    if (typeof object.eventType === "number") {
                        message.eventType = object.eventType;
                        break;
                    }
                    break;
                case "JOIN":
                case 0:
                    message.eventType = 0;
                    break;
                case "LEAVE":
                case 1:
                    message.eventType = 1;
                    break;
                case "UPDATE":
                case 2:
                    message.eventType = 2;
                    break;
                }
                if (object.data != null) {
                    if (typeof object.data !== "object")
                        throw TypeError(".graphwiz.core.PresenceEvent.data: object expected");
                    message.data = $root.graphwiz.core.PresenceData.fromObject(object.data);
                }
                return message;
            };

            /**
             * Creates a plain object from a PresenceEvent message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {graphwiz.core.PresenceEvent} message PresenceEvent
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PresenceEvent.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.clientId = "";
                    object.eventType = options.enums === String ? "JOIN" : 0;
                    object.data = null;
                }
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    object.clientId = message.clientId;
                if (message.eventType != null && message.hasOwnProperty("eventType"))
                    object.eventType = options.enums === String ? $root.graphwiz.core.PresenceEventType[message.eventType] === undefined ? message.eventType : $root.graphwiz.core.PresenceEventType[message.eventType] : message.eventType;
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = $root.graphwiz.core.PresenceData.toObject(message.data, options);
                return object;
            };

            /**
             * Converts this PresenceEvent to JSON.
             * @function toJSON
             * @memberof graphwiz.core.PresenceEvent
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PresenceEvent.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PresenceEvent
             * @function getTypeUrl
             * @memberof graphwiz.core.PresenceEvent
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PresenceEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.PresenceEvent";
            };

            return PresenceEvent;
        })();

        /**
         * PresenceEventType enum.
         * @name graphwiz.core.PresenceEventType
         * @enum {number}
         * @property {number} JOIN=0 JOIN value
         * @property {number} LEAVE=1 LEAVE value
         * @property {number} UPDATE=2 UPDATE value
         */
        core.PresenceEventType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "JOIN"] = 0;
            values[valuesById[1] = "LEAVE"] = 1;
            values[valuesById[2] = "UPDATE"] = 2;
            return values;
        })();

        core.PresenceData = (function() {

            /**
             * Properties of a PresenceData.
             * @memberof graphwiz.core
             * @interface IPresenceData
             * @property {string|null} [displayName] PresenceData displayName
             * @property {string|null} [avatarUrl] PresenceData avatarUrl
             * @property {graphwiz.core.IVector3|null} [position] PresenceData position
             * @property {graphwiz.core.IQuaternion|null} [rotation] PresenceData rotation
             */

            /**
             * Constructs a new PresenceData.
             * @memberof graphwiz.core
             * @classdesc Represents a PresenceData.
             * @implements IPresenceData
             * @constructor
             * @param {graphwiz.core.IPresenceData=} [properties] Properties to set
             */
            function PresenceData(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PresenceData displayName.
             * @member {string} displayName
             * @memberof graphwiz.core.PresenceData
             * @instance
             */
            PresenceData.prototype.displayName = "";

            /**
             * PresenceData avatarUrl.
             * @member {string} avatarUrl
             * @memberof graphwiz.core.PresenceData
             * @instance
             */
            PresenceData.prototype.avatarUrl = "";

            /**
             * PresenceData position.
             * @member {graphwiz.core.IVector3|null|undefined} position
             * @memberof graphwiz.core.PresenceData
             * @instance
             */
            PresenceData.prototype.position = null;

            /**
             * PresenceData rotation.
             * @member {graphwiz.core.IQuaternion|null|undefined} rotation
             * @memberof graphwiz.core.PresenceData
             * @instance
             */
            PresenceData.prototype.rotation = null;

            /**
             * Creates a new PresenceData instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {graphwiz.core.IPresenceData=} [properties] Properties to set
             * @returns {graphwiz.core.PresenceData} PresenceData instance
             */
            PresenceData.create = function create(properties) {
                return new PresenceData(properties);
            };

            /**
             * Encodes the specified PresenceData message. Does not implicitly {@link graphwiz.core.PresenceData.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {graphwiz.core.IPresenceData} message PresenceData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PresenceData.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.displayName != null && Object.hasOwnProperty.call(message, "displayName"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.displayName);
                if (message.avatarUrl != null && Object.hasOwnProperty.call(message, "avatarUrl"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.avatarUrl);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.graphwiz.core.Vector3.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.rotation != null && Object.hasOwnProperty.call(message, "rotation"))
                    $root.graphwiz.core.Quaternion.encode(message.rotation, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified PresenceData message, length delimited. Does not implicitly {@link graphwiz.core.PresenceData.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {graphwiz.core.IPresenceData} message PresenceData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PresenceData.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PresenceData message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.PresenceData} PresenceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PresenceData.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.PresenceData();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.displayName = reader.string();
                            break;
                        }
                    case 2: {
                            message.avatarUrl = reader.string();
                            break;
                        }
                    case 3: {
                            message.position = $root.graphwiz.core.Vector3.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.rotation = $root.graphwiz.core.Quaternion.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PresenceData message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.PresenceData} PresenceData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PresenceData.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PresenceData message.
             * @function verify
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PresenceData.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    if (!$util.isString(message.displayName))
                        return "displayName: string expected";
                if (message.avatarUrl != null && message.hasOwnProperty("avatarUrl"))
                    if (!$util.isString(message.avatarUrl))
                        return "avatarUrl: string expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.graphwiz.core.Vector3.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.rotation != null && message.hasOwnProperty("rotation")) {
                    var error = $root.graphwiz.core.Quaternion.verify(message.rotation);
                    if (error)
                        return "rotation." + error;
                }
                return null;
            };

            /**
             * Creates a PresenceData message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.PresenceData} PresenceData
             */
            PresenceData.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.PresenceData)
                    return object;
                var message = new $root.graphwiz.core.PresenceData();
                if (object.displayName != null)
                    message.displayName = String(object.displayName);
                if (object.avatarUrl != null)
                    message.avatarUrl = String(object.avatarUrl);
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".graphwiz.core.PresenceData.position: object expected");
                    message.position = $root.graphwiz.core.Vector3.fromObject(object.position);
                }
                if (object.rotation != null) {
                    if (typeof object.rotation !== "object")
                        throw TypeError(".graphwiz.core.PresenceData.rotation: object expected");
                    message.rotation = $root.graphwiz.core.Quaternion.fromObject(object.rotation);
                }
                return message;
            };

            /**
             * Creates a plain object from a PresenceData message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {graphwiz.core.PresenceData} message PresenceData
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PresenceData.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.displayName = "";
                    object.avatarUrl = "";
                    object.position = null;
                    object.rotation = null;
                }
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    object.displayName = message.displayName;
                if (message.avatarUrl != null && message.hasOwnProperty("avatarUrl"))
                    object.avatarUrl = message.avatarUrl;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.graphwiz.core.Vector3.toObject(message.position, options);
                if (message.rotation != null && message.hasOwnProperty("rotation"))
                    object.rotation = $root.graphwiz.core.Quaternion.toObject(message.rotation, options);
                return object;
            };

            /**
             * Converts this PresenceData to JSON.
             * @function toJSON
             * @memberof graphwiz.core.PresenceData
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PresenceData.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PresenceData
             * @function getTypeUrl
             * @memberof graphwiz.core.PresenceData
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PresenceData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.PresenceData";
            };

            return PresenceData;
        })();

        core.ClientHello = (function() {

            /**
             * Properties of a ClientHello.
             * @memberof graphwiz.core
             * @interface IClientHello
             * @property {string|null} [clientId] ClientHello clientId
             * @property {string|null} [displayName] ClientHello displayName
             * @property {string|null} [authToken] ClientHello authToken
             * @property {string|null} [requestedRoom] ClientHello requestedRoom
             */

            /**
             * Constructs a new ClientHello.
             * @memberof graphwiz.core
             * @classdesc Represents a ClientHello.
             * @implements IClientHello
             * @constructor
             * @param {graphwiz.core.IClientHello=} [properties] Properties to set
             */
            function ClientHello(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ClientHello clientId.
             * @member {string} clientId
             * @memberof graphwiz.core.ClientHello
             * @instance
             */
            ClientHello.prototype.clientId = "";

            /**
             * ClientHello displayName.
             * @member {string} displayName
             * @memberof graphwiz.core.ClientHello
             * @instance
             */
            ClientHello.prototype.displayName = "";

            /**
             * ClientHello authToken.
             * @member {string} authToken
             * @memberof graphwiz.core.ClientHello
             * @instance
             */
            ClientHello.prototype.authToken = "";

            /**
             * ClientHello requestedRoom.
             * @member {string} requestedRoom
             * @memberof graphwiz.core.ClientHello
             * @instance
             */
            ClientHello.prototype.requestedRoom = "";

            /**
             * Creates a new ClientHello instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {graphwiz.core.IClientHello=} [properties] Properties to set
             * @returns {graphwiz.core.ClientHello} ClientHello instance
             */
            ClientHello.create = function create(properties) {
                return new ClientHello(properties);
            };

            /**
             * Encodes the specified ClientHello message. Does not implicitly {@link graphwiz.core.ClientHello.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {graphwiz.core.IClientHello} message ClientHello message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ClientHello.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.clientId);
                if (message.displayName != null && Object.hasOwnProperty.call(message, "displayName"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.displayName);
                if (message.authToken != null && Object.hasOwnProperty.call(message, "authToken"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.authToken);
                if (message.requestedRoom != null && Object.hasOwnProperty.call(message, "requestedRoom"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.requestedRoom);
                return writer;
            };

            /**
             * Encodes the specified ClientHello message, length delimited. Does not implicitly {@link graphwiz.core.ClientHello.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {graphwiz.core.IClientHello} message ClientHello message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ClientHello.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ClientHello message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.ClientHello} ClientHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ClientHello.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.ClientHello();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.clientId = reader.string();
                            break;
                        }
                    case 2: {
                            message.displayName = reader.string();
                            break;
                        }
                    case 3: {
                            message.authToken = reader.string();
                            break;
                        }
                    case 4: {
                            message.requestedRoom = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ClientHello message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.ClientHello} ClientHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ClientHello.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ClientHello message.
             * @function verify
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ClientHello.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    if (!$util.isString(message.clientId))
                        return "clientId: string expected";
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    if (!$util.isString(message.displayName))
                        return "displayName: string expected";
                if (message.authToken != null && message.hasOwnProperty("authToken"))
                    if (!$util.isString(message.authToken))
                        return "authToken: string expected";
                if (message.requestedRoom != null && message.hasOwnProperty("requestedRoom"))
                    if (!$util.isString(message.requestedRoom))
                        return "requestedRoom: string expected";
                return null;
            };

            /**
             * Creates a ClientHello message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.ClientHello} ClientHello
             */
            ClientHello.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.ClientHello)
                    return object;
                var message = new $root.graphwiz.core.ClientHello();
                if (object.clientId != null)
                    message.clientId = String(object.clientId);
                if (object.displayName != null)
                    message.displayName = String(object.displayName);
                if (object.authToken != null)
                    message.authToken = String(object.authToken);
                if (object.requestedRoom != null)
                    message.requestedRoom = String(object.requestedRoom);
                return message;
            };

            /**
             * Creates a plain object from a ClientHello message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {graphwiz.core.ClientHello} message ClientHello
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ClientHello.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.clientId = "";
                    object.displayName = "";
                    object.authToken = "";
                    object.requestedRoom = "";
                }
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    object.clientId = message.clientId;
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    object.displayName = message.displayName;
                if (message.authToken != null && message.hasOwnProperty("authToken"))
                    object.authToken = message.authToken;
                if (message.requestedRoom != null && message.hasOwnProperty("requestedRoom"))
                    object.requestedRoom = message.requestedRoom;
                return object;
            };

            /**
             * Converts this ClientHello to JSON.
             * @function toJSON
             * @memberof graphwiz.core.ClientHello
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ClientHello.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ClientHello
             * @function getTypeUrl
             * @memberof graphwiz.core.ClientHello
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ClientHello.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.ClientHello";
            };

            return ClientHello;
        })();

        core.ServerHello = (function() {

            /**
             * Properties of a ServerHello.
             * @memberof graphwiz.core
             * @interface IServerHello
             * @property {string|null} [serverVersion] ServerHello serverVersion
             * @property {string|null} [assignedClientId] ServerHello assignedClientId
             * @property {string|null} [roomId] ServerHello roomId
             * @property {graphwiz.core.IWorldState|null} [initialState] ServerHello initialState
             */

            /**
             * Constructs a new ServerHello.
             * @memberof graphwiz.core
             * @classdesc Represents a ServerHello.
             * @implements IServerHello
             * @constructor
             * @param {graphwiz.core.IServerHello=} [properties] Properties to set
             */
            function ServerHello(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ServerHello serverVersion.
             * @member {string} serverVersion
             * @memberof graphwiz.core.ServerHello
             * @instance
             */
            ServerHello.prototype.serverVersion = "";

            /**
             * ServerHello assignedClientId.
             * @member {string} assignedClientId
             * @memberof graphwiz.core.ServerHello
             * @instance
             */
            ServerHello.prototype.assignedClientId = "";

            /**
             * ServerHello roomId.
             * @member {string} roomId
             * @memberof graphwiz.core.ServerHello
             * @instance
             */
            ServerHello.prototype.roomId = "";

            /**
             * ServerHello initialState.
             * @member {graphwiz.core.IWorldState|null|undefined} initialState
             * @memberof graphwiz.core.ServerHello
             * @instance
             */
            ServerHello.prototype.initialState = null;

            /**
             * Creates a new ServerHello instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {graphwiz.core.IServerHello=} [properties] Properties to set
             * @returns {graphwiz.core.ServerHello} ServerHello instance
             */
            ServerHello.create = function create(properties) {
                return new ServerHello(properties);
            };

            /**
             * Encodes the specified ServerHello message. Does not implicitly {@link graphwiz.core.ServerHello.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {graphwiz.core.IServerHello} message ServerHello message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerHello.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.serverVersion != null && Object.hasOwnProperty.call(message, "serverVersion"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.serverVersion);
                if (message.assignedClientId != null && Object.hasOwnProperty.call(message, "assignedClientId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.assignedClientId);
                if (message.roomId != null && Object.hasOwnProperty.call(message, "roomId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.roomId);
                if (message.initialState != null && Object.hasOwnProperty.call(message, "initialState"))
                    $root.graphwiz.core.WorldState.encode(message.initialState, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ServerHello message, length delimited. Does not implicitly {@link graphwiz.core.ServerHello.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {graphwiz.core.IServerHello} message ServerHello message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerHello.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ServerHello message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.ServerHello} ServerHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerHello.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.ServerHello();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.serverVersion = reader.string();
                            break;
                        }
                    case 2: {
                            message.assignedClientId = reader.string();
                            break;
                        }
                    case 3: {
                            message.roomId = reader.string();
                            break;
                        }
                    case 4: {
                            message.initialState = $root.graphwiz.core.WorldState.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ServerHello message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.ServerHello} ServerHello
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerHello.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ServerHello message.
             * @function verify
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ServerHello.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.serverVersion != null && message.hasOwnProperty("serverVersion"))
                    if (!$util.isString(message.serverVersion))
                        return "serverVersion: string expected";
                if (message.assignedClientId != null && message.hasOwnProperty("assignedClientId"))
                    if (!$util.isString(message.assignedClientId))
                        return "assignedClientId: string expected";
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    if (!$util.isString(message.roomId))
                        return "roomId: string expected";
                if (message.initialState != null && message.hasOwnProperty("initialState")) {
                    var error = $root.graphwiz.core.WorldState.verify(message.initialState);
                    if (error)
                        return "initialState." + error;
                }
                return null;
            };

            /**
             * Creates a ServerHello message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.ServerHello} ServerHello
             */
            ServerHello.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.ServerHello)
                    return object;
                var message = new $root.graphwiz.core.ServerHello();
                if (object.serverVersion != null)
                    message.serverVersion = String(object.serverVersion);
                if (object.assignedClientId != null)
                    message.assignedClientId = String(object.assignedClientId);
                if (object.roomId != null)
                    message.roomId = String(object.roomId);
                if (object.initialState != null) {
                    if (typeof object.initialState !== "object")
                        throw TypeError(".graphwiz.core.ServerHello.initialState: object expected");
                    message.initialState = $root.graphwiz.core.WorldState.fromObject(object.initialState);
                }
                return message;
            };

            /**
             * Creates a plain object from a ServerHello message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {graphwiz.core.ServerHello} message ServerHello
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ServerHello.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.serverVersion = "";
                    object.assignedClientId = "";
                    object.roomId = "";
                    object.initialState = null;
                }
                if (message.serverVersion != null && message.hasOwnProperty("serverVersion"))
                    object.serverVersion = message.serverVersion;
                if (message.assignedClientId != null && message.hasOwnProperty("assignedClientId"))
                    object.assignedClientId = message.assignedClientId;
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    object.roomId = message.roomId;
                if (message.initialState != null && message.hasOwnProperty("initialState"))
                    object.initialState = $root.graphwiz.core.WorldState.toObject(message.initialState, options);
                return object;
            };

            /**
             * Converts this ServerHello to JSON.
             * @function toJSON
             * @memberof graphwiz.core.ServerHello
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ServerHello.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ServerHello
             * @function getTypeUrl
             * @memberof graphwiz.core.ServerHello
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ServerHello.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.ServerHello";
            };

            return ServerHello;
        })();

        core.WorldState = (function() {

            /**
             * Properties of a WorldState.
             * @memberof graphwiz.core
             * @interface IWorldState
             * @property {Array.<graphwiz.core.IEntitySnapshot>|null} [entities] WorldState entities
             * @property {Array.<graphwiz.core.IPlayerSnapshot>|null} [players] WorldState players
             * @property {number|Long|null} [lastUpdate] WorldState lastUpdate
             */

            /**
             * Constructs a new WorldState.
             * @memberof graphwiz.core
             * @classdesc Represents a WorldState.
             * @implements IWorldState
             * @constructor
             * @param {graphwiz.core.IWorldState=} [properties] Properties to set
             */
            function WorldState(properties) {
                this.entities = [];
                this.players = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * WorldState entities.
             * @member {Array.<graphwiz.core.IEntitySnapshot>} entities
             * @memberof graphwiz.core.WorldState
             * @instance
             */
            WorldState.prototype.entities = $util.emptyArray;

            /**
             * WorldState players.
             * @member {Array.<graphwiz.core.IPlayerSnapshot>} players
             * @memberof graphwiz.core.WorldState
             * @instance
             */
            WorldState.prototype.players = $util.emptyArray;

            /**
             * WorldState lastUpdate.
             * @member {number|Long} lastUpdate
             * @memberof graphwiz.core.WorldState
             * @instance
             */
            WorldState.prototype.lastUpdate = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new WorldState instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {graphwiz.core.IWorldState=} [properties] Properties to set
             * @returns {graphwiz.core.WorldState} WorldState instance
             */
            WorldState.create = function create(properties) {
                return new WorldState(properties);
            };

            /**
             * Encodes the specified WorldState message. Does not implicitly {@link graphwiz.core.WorldState.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {graphwiz.core.IWorldState} message WorldState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WorldState.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.entities != null && message.entities.length)
                    for (var i = 0; i < message.entities.length; ++i)
                        $root.graphwiz.core.EntitySnapshot.encode(message.entities[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.players != null && message.players.length)
                    for (var i = 0; i < message.players.length; ++i)
                        $root.graphwiz.core.PlayerSnapshot.encode(message.players[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.lastUpdate != null && Object.hasOwnProperty.call(message, "lastUpdate"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.lastUpdate);
                return writer;
            };

            /**
             * Encodes the specified WorldState message, length delimited. Does not implicitly {@link graphwiz.core.WorldState.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {graphwiz.core.IWorldState} message WorldState message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WorldState.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a WorldState message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.WorldState} WorldState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WorldState.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.WorldState();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.entities && message.entities.length))
                                message.entities = [];
                            message.entities.push($root.graphwiz.core.EntitySnapshot.decode(reader, reader.uint32()));
                            break;
                        }
                    case 2: {
                            if (!(message.players && message.players.length))
                                message.players = [];
                            message.players.push($root.graphwiz.core.PlayerSnapshot.decode(reader, reader.uint32()));
                            break;
                        }
                    case 3: {
                            message.lastUpdate = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a WorldState message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.WorldState} WorldState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WorldState.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a WorldState message.
             * @function verify
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WorldState.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.entities != null && message.hasOwnProperty("entities")) {
                    if (!Array.isArray(message.entities))
                        return "entities: array expected";
                    for (var i = 0; i < message.entities.length; ++i) {
                        var error = $root.graphwiz.core.EntitySnapshot.verify(message.entities[i]);
                        if (error)
                            return "entities." + error;
                    }
                }
                if (message.players != null && message.hasOwnProperty("players")) {
                    if (!Array.isArray(message.players))
                        return "players: array expected";
                    for (var i = 0; i < message.players.length; ++i) {
                        var error = $root.graphwiz.core.PlayerSnapshot.verify(message.players[i]);
                        if (error)
                            return "players." + error;
                    }
                }
                if (message.lastUpdate != null && message.hasOwnProperty("lastUpdate"))
                    if (!$util.isInteger(message.lastUpdate) && !(message.lastUpdate && $util.isInteger(message.lastUpdate.low) && $util.isInteger(message.lastUpdate.high)))
                        return "lastUpdate: integer|Long expected";
                return null;
            };

            /**
             * Creates a WorldState message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.WorldState} WorldState
             */
            WorldState.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.WorldState)
                    return object;
                var message = new $root.graphwiz.core.WorldState();
                if (object.entities) {
                    if (!Array.isArray(object.entities))
                        throw TypeError(".graphwiz.core.WorldState.entities: array expected");
                    message.entities = [];
                    for (var i = 0; i < object.entities.length; ++i) {
                        if (typeof object.entities[i] !== "object")
                            throw TypeError(".graphwiz.core.WorldState.entities: object expected");
                        message.entities[i] = $root.graphwiz.core.EntitySnapshot.fromObject(object.entities[i]);
                    }
                }
                if (object.players) {
                    if (!Array.isArray(object.players))
                        throw TypeError(".graphwiz.core.WorldState.players: array expected");
                    message.players = [];
                    for (var i = 0; i < object.players.length; ++i) {
                        if (typeof object.players[i] !== "object")
                            throw TypeError(".graphwiz.core.WorldState.players: object expected");
                        message.players[i] = $root.graphwiz.core.PlayerSnapshot.fromObject(object.players[i]);
                    }
                }
                if (object.lastUpdate != null)
                    if ($util.Long)
                        (message.lastUpdate = $util.Long.fromValue(object.lastUpdate)).unsigned = false;
                    else if (typeof object.lastUpdate === "string")
                        message.lastUpdate = parseInt(object.lastUpdate, 10);
                    else if (typeof object.lastUpdate === "number")
                        message.lastUpdate = object.lastUpdate;
                    else if (typeof object.lastUpdate === "object")
                        message.lastUpdate = new $util.LongBits(object.lastUpdate.low >>> 0, object.lastUpdate.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a WorldState message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {graphwiz.core.WorldState} message WorldState
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WorldState.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.entities = [];
                    object.players = [];
                }
                if (options.defaults)
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.lastUpdate = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.lastUpdate = options.longs === String ? "0" : 0;
                if (message.entities && message.entities.length) {
                    object.entities = [];
                    for (var j = 0; j < message.entities.length; ++j)
                        object.entities[j] = $root.graphwiz.core.EntitySnapshot.toObject(message.entities[j], options);
                }
                if (message.players && message.players.length) {
                    object.players = [];
                    for (var j = 0; j < message.players.length; ++j)
                        object.players[j] = $root.graphwiz.core.PlayerSnapshot.toObject(message.players[j], options);
                }
                if (message.lastUpdate != null && message.hasOwnProperty("lastUpdate"))
                    if (typeof message.lastUpdate === "number")
                        object.lastUpdate = options.longs === String ? String(message.lastUpdate) : message.lastUpdate;
                    else
                        object.lastUpdate = options.longs === String ? $util.Long.prototype.toString.call(message.lastUpdate) : options.longs === Number ? new $util.LongBits(message.lastUpdate.low >>> 0, message.lastUpdate.high >>> 0).toNumber() : message.lastUpdate;
                return object;
            };

            /**
             * Converts this WorldState to JSON.
             * @function toJSON
             * @memberof graphwiz.core.WorldState
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WorldState.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for WorldState
             * @function getTypeUrl
             * @memberof graphwiz.core.WorldState
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            WorldState.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.WorldState";
            };

            return WorldState;
        })();

        core.EntitySnapshot = (function() {

            /**
             * Properties of an EntitySnapshot.
             * @memberof graphwiz.core
             * @interface IEntitySnapshot
             * @property {string|null} [id] EntitySnapshot id
             * @property {string|null} [templateId] EntitySnapshot templateId
             * @property {graphwiz.core.IVector3|null} [position] EntitySnapshot position
             * @property {graphwiz.core.IQuaternion|null} [rotation] EntitySnapshot rotation
             * @property {Object.<string,string>|null} [components] EntitySnapshot components
             */

            /**
             * Constructs a new EntitySnapshot.
             * @memberof graphwiz.core
             * @classdesc Represents an EntitySnapshot.
             * @implements IEntitySnapshot
             * @constructor
             * @param {graphwiz.core.IEntitySnapshot=} [properties] Properties to set
             */
            function EntitySnapshot(properties) {
                this.components = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EntitySnapshot id.
             * @member {string} id
             * @memberof graphwiz.core.EntitySnapshot
             * @instance
             */
            EntitySnapshot.prototype.id = "";

            /**
             * EntitySnapshot templateId.
             * @member {string} templateId
             * @memberof graphwiz.core.EntitySnapshot
             * @instance
             */
            EntitySnapshot.prototype.templateId = "";

            /**
             * EntitySnapshot position.
             * @member {graphwiz.core.IVector3|null|undefined} position
             * @memberof graphwiz.core.EntitySnapshot
             * @instance
             */
            EntitySnapshot.prototype.position = null;

            /**
             * EntitySnapshot rotation.
             * @member {graphwiz.core.IQuaternion|null|undefined} rotation
             * @memberof graphwiz.core.EntitySnapshot
             * @instance
             */
            EntitySnapshot.prototype.rotation = null;

            /**
             * EntitySnapshot components.
             * @member {Object.<string,string>} components
             * @memberof graphwiz.core.EntitySnapshot
             * @instance
             */
            EntitySnapshot.prototype.components = $util.emptyObject;

            /**
             * Creates a new EntitySnapshot instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {graphwiz.core.IEntitySnapshot=} [properties] Properties to set
             * @returns {graphwiz.core.EntitySnapshot} EntitySnapshot instance
             */
            EntitySnapshot.create = function create(properties) {
                return new EntitySnapshot(properties);
            };

            /**
             * Encodes the specified EntitySnapshot message. Does not implicitly {@link graphwiz.core.EntitySnapshot.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {graphwiz.core.IEntitySnapshot} message EntitySnapshot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntitySnapshot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.templateId != null && Object.hasOwnProperty.call(message, "templateId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.templateId);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.graphwiz.core.Vector3.encode(message.position, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.rotation != null && Object.hasOwnProperty.call(message, "rotation"))
                    $root.graphwiz.core.Quaternion.encode(message.rotation, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.components != null && Object.hasOwnProperty.call(message, "components"))
                    for (var keys = Object.keys(message.components), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.components[keys[i]]).ldelim();
                return writer;
            };

            /**
             * Encodes the specified EntitySnapshot message, length delimited. Does not implicitly {@link graphwiz.core.EntitySnapshot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {graphwiz.core.IEntitySnapshot} message EntitySnapshot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EntitySnapshot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EntitySnapshot message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.EntitySnapshot} EntitySnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntitySnapshot.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.EntitySnapshot(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
                            break;
                        }
                    case 2: {
                            message.templateId = reader.string();
                            break;
                        }
                    case 3: {
                            message.position = $root.graphwiz.core.Vector3.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.rotation = $root.graphwiz.core.Quaternion.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            if (message.components === $util.emptyObject)
                                message.components = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.components[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EntitySnapshot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.EntitySnapshot} EntitySnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EntitySnapshot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EntitySnapshot message.
             * @function verify
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EntitySnapshot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.templateId != null && message.hasOwnProperty("templateId"))
                    if (!$util.isString(message.templateId))
                        return "templateId: string expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.graphwiz.core.Vector3.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.rotation != null && message.hasOwnProperty("rotation")) {
                    var error = $root.graphwiz.core.Quaternion.verify(message.rotation);
                    if (error)
                        return "rotation." + error;
                }
                if (message.components != null && message.hasOwnProperty("components")) {
                    if (!$util.isObject(message.components))
                        return "components: object expected";
                    var key = Object.keys(message.components);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.components[key[i]]))
                            return "components: string{k:string} expected";
                }
                return null;
            };

            /**
             * Creates an EntitySnapshot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.EntitySnapshot} EntitySnapshot
             */
            EntitySnapshot.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.EntitySnapshot)
                    return object;
                var message = new $root.graphwiz.core.EntitySnapshot();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.templateId != null)
                    message.templateId = String(object.templateId);
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".graphwiz.core.EntitySnapshot.position: object expected");
                    message.position = $root.graphwiz.core.Vector3.fromObject(object.position);
                }
                if (object.rotation != null) {
                    if (typeof object.rotation !== "object")
                        throw TypeError(".graphwiz.core.EntitySnapshot.rotation: object expected");
                    message.rotation = $root.graphwiz.core.Quaternion.fromObject(object.rotation);
                }
                if (object.components) {
                    if (typeof object.components !== "object")
                        throw TypeError(".graphwiz.core.EntitySnapshot.components: object expected");
                    message.components = {};
                    for (var keys = Object.keys(object.components), i = 0; i < keys.length; ++i)
                        message.components[keys[i]] = String(object.components[keys[i]]);
                }
                return message;
            };

            /**
             * Creates a plain object from an EntitySnapshot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {graphwiz.core.EntitySnapshot} message EntitySnapshot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EntitySnapshot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.components = {};
                if (options.defaults) {
                    object.id = "";
                    object.templateId = "";
                    object.position = null;
                    object.rotation = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.templateId != null && message.hasOwnProperty("templateId"))
                    object.templateId = message.templateId;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.graphwiz.core.Vector3.toObject(message.position, options);
                if (message.rotation != null && message.hasOwnProperty("rotation"))
                    object.rotation = $root.graphwiz.core.Quaternion.toObject(message.rotation, options);
                var keys2;
                if (message.components && (keys2 = Object.keys(message.components)).length) {
                    object.components = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.components[keys2[j]] = message.components[keys2[j]];
                }
                return object;
            };

            /**
             * Converts this EntitySnapshot to JSON.
             * @function toJSON
             * @memberof graphwiz.core.EntitySnapshot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EntitySnapshot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EntitySnapshot
             * @function getTypeUrl
             * @memberof graphwiz.core.EntitySnapshot
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EntitySnapshot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.EntitySnapshot";
            };

            return EntitySnapshot;
        })();

        core.PlayerSnapshot = (function() {

            /**
             * Properties of a PlayerSnapshot.
             * @memberof graphwiz.core
             * @interface IPlayerSnapshot
             * @property {string|null} [clientId] PlayerSnapshot clientId
             * @property {string|null} [displayName] PlayerSnapshot displayName
             * @property {string|null} [avatarUrl] PlayerSnapshot avatarUrl
             * @property {graphwiz.core.IVector3|null} [position] PlayerSnapshot position
             * @property {graphwiz.core.IQuaternion|null} [rotation] PlayerSnapshot rotation
             */

            /**
             * Constructs a new PlayerSnapshot.
             * @memberof graphwiz.core
             * @classdesc Represents a PlayerSnapshot.
             * @implements IPlayerSnapshot
             * @constructor
             * @param {graphwiz.core.IPlayerSnapshot=} [properties] Properties to set
             */
            function PlayerSnapshot(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PlayerSnapshot clientId.
             * @member {string} clientId
             * @memberof graphwiz.core.PlayerSnapshot
             * @instance
             */
            PlayerSnapshot.prototype.clientId = "";

            /**
             * PlayerSnapshot displayName.
             * @member {string} displayName
             * @memberof graphwiz.core.PlayerSnapshot
             * @instance
             */
            PlayerSnapshot.prototype.displayName = "";

            /**
             * PlayerSnapshot avatarUrl.
             * @member {string} avatarUrl
             * @memberof graphwiz.core.PlayerSnapshot
             * @instance
             */
            PlayerSnapshot.prototype.avatarUrl = "";

            /**
             * PlayerSnapshot position.
             * @member {graphwiz.core.IVector3|null|undefined} position
             * @memberof graphwiz.core.PlayerSnapshot
             * @instance
             */
            PlayerSnapshot.prototype.position = null;

            /**
             * PlayerSnapshot rotation.
             * @member {graphwiz.core.IQuaternion|null|undefined} rotation
             * @memberof graphwiz.core.PlayerSnapshot
             * @instance
             */
            PlayerSnapshot.prototype.rotation = null;

            /**
             * Creates a new PlayerSnapshot instance using the specified properties.
             * @function create
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {graphwiz.core.IPlayerSnapshot=} [properties] Properties to set
             * @returns {graphwiz.core.PlayerSnapshot} PlayerSnapshot instance
             */
            PlayerSnapshot.create = function create(properties) {
                return new PlayerSnapshot(properties);
            };

            /**
             * Encodes the specified PlayerSnapshot message. Does not implicitly {@link graphwiz.core.PlayerSnapshot.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {graphwiz.core.IPlayerSnapshot} message PlayerSnapshot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PlayerSnapshot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.clientId);
                if (message.displayName != null && Object.hasOwnProperty.call(message, "displayName"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.displayName);
                if (message.avatarUrl != null && Object.hasOwnProperty.call(message, "avatarUrl"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.avatarUrl);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.graphwiz.core.Vector3.encode(message.position, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.rotation != null && Object.hasOwnProperty.call(message, "rotation"))
                    $root.graphwiz.core.Quaternion.encode(message.rotation, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified PlayerSnapshot message, length delimited. Does not implicitly {@link graphwiz.core.PlayerSnapshot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {graphwiz.core.IPlayerSnapshot} message PlayerSnapshot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PlayerSnapshot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PlayerSnapshot message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.core.PlayerSnapshot} PlayerSnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PlayerSnapshot.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.core.PlayerSnapshot();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.clientId = reader.string();
                            break;
                        }
                    case 2: {
                            message.displayName = reader.string();
                            break;
                        }
                    case 3: {
                            message.avatarUrl = reader.string();
                            break;
                        }
                    case 4: {
                            message.position = $root.graphwiz.core.Vector3.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.rotation = $root.graphwiz.core.Quaternion.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PlayerSnapshot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.core.PlayerSnapshot} PlayerSnapshot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PlayerSnapshot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PlayerSnapshot message.
             * @function verify
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PlayerSnapshot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    if (!$util.isString(message.clientId))
                        return "clientId: string expected";
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    if (!$util.isString(message.displayName))
                        return "displayName: string expected";
                if (message.avatarUrl != null && message.hasOwnProperty("avatarUrl"))
                    if (!$util.isString(message.avatarUrl))
                        return "avatarUrl: string expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    var error = $root.graphwiz.core.Vector3.verify(message.position);
                    if (error)
                        return "position." + error;
                }
                if (message.rotation != null && message.hasOwnProperty("rotation")) {
                    var error = $root.graphwiz.core.Quaternion.verify(message.rotation);
                    if (error)
                        return "rotation." + error;
                }
                return null;
            };

            /**
             * Creates a PlayerSnapshot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.core.PlayerSnapshot} PlayerSnapshot
             */
            PlayerSnapshot.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.core.PlayerSnapshot)
                    return object;
                var message = new $root.graphwiz.core.PlayerSnapshot();
                if (object.clientId != null)
                    message.clientId = String(object.clientId);
                if (object.displayName != null)
                    message.displayName = String(object.displayName);
                if (object.avatarUrl != null)
                    message.avatarUrl = String(object.avatarUrl);
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".graphwiz.core.PlayerSnapshot.position: object expected");
                    message.position = $root.graphwiz.core.Vector3.fromObject(object.position);
                }
                if (object.rotation != null) {
                    if (typeof object.rotation !== "object")
                        throw TypeError(".graphwiz.core.PlayerSnapshot.rotation: object expected");
                    message.rotation = $root.graphwiz.core.Quaternion.fromObject(object.rotation);
                }
                return message;
            };

            /**
             * Creates a plain object from a PlayerSnapshot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {graphwiz.core.PlayerSnapshot} message PlayerSnapshot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PlayerSnapshot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.clientId = "";
                    object.displayName = "";
                    object.avatarUrl = "";
                    object.position = null;
                    object.rotation = null;
                }
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    object.clientId = message.clientId;
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    object.displayName = message.displayName;
                if (message.avatarUrl != null && message.hasOwnProperty("avatarUrl"))
                    object.avatarUrl = message.avatarUrl;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = $root.graphwiz.core.Vector3.toObject(message.position, options);
                if (message.rotation != null && message.hasOwnProperty("rotation"))
                    object.rotation = $root.graphwiz.core.Quaternion.toObject(message.rotation, options);
                return object;
            };

            /**
             * Converts this PlayerSnapshot to JSON.
             * @function toJSON
             * @memberof graphwiz.core.PlayerSnapshot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PlayerSnapshot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PlayerSnapshot
             * @function getTypeUrl
             * @memberof graphwiz.core.PlayerSnapshot
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PlayerSnapshot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.core.PlayerSnapshot";
            };

            return PlayerSnapshot;
        })();

        return core;
    })();

    graphwiz.networking = (function() {

        /**
         * Namespace networking.
         * @memberof graphwiz
         * @namespace
         */
        var networking = {};

        networking.RoomService = (function() {

            /**
             * Constructs a new RoomService service.
             * @memberof graphwiz.networking
             * @classdesc Represents a RoomService
             * @extends $protobuf.rpc.Service
             * @constructor
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             */
            function RoomService(rpcImpl, requestDelimited, responseDelimited) {
                $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
            }

            (RoomService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = RoomService;

            /**
             * Creates new RoomService service using the specified rpc implementation.
             * @function create
             * @memberof graphwiz.networking.RoomService
             * @static
             * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
             * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
             * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
             * @returns {RoomService} RPC service. Useful where requests and/or responses are streamed.
             */
            RoomService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                return new this(rpcImpl, requestDelimited, responseDelimited);
            };

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#connectToRoom}.
             * @memberof graphwiz.networking.RoomService
             * @typedef ConnectToRoomCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {graphwiz.networking.ServerMessage} [response] ServerMessage
             */

            /**
             * Calls ConnectToRoom.
             * @function connectToRoom
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.IClientMessage} request ClientMessage message or plain object
             * @param {graphwiz.networking.RoomService.ConnectToRoomCallback} callback Node-style callback called with the error, if any, and ServerMessage
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RoomService.prototype.connectToRoom = function connectToRoom(request, callback) {
                return this.rpcCall(connectToRoom, $root.graphwiz.networking.ClientMessage, $root.graphwiz.networking.ServerMessage, request, callback);
            }, "name", { value: "ConnectToRoom" });

            /**
             * Calls ConnectToRoom.
             * @function connectToRoom
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.IClientMessage} request ClientMessage message or plain object
             * @returns {Promise<graphwiz.networking.ServerMessage>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#joinRoom}.
             * @memberof graphwiz.networking.RoomService
             * @typedef JoinRoomCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {graphwiz.networking.JoinResponse} [response] JoinResponse
             */

            /**
             * Calls JoinRoom.
             * @function joinRoom
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.IJoinRequest} request JoinRequest message or plain object
             * @param {graphwiz.networking.RoomService.JoinRoomCallback} callback Node-style callback called with the error, if any, and JoinResponse
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RoomService.prototype.joinRoom = function joinRoom(request, callback) {
                return this.rpcCall(joinRoom, $root.graphwiz.networking.JoinRequest, $root.graphwiz.networking.JoinResponse, request, callback);
            }, "name", { value: "JoinRoom" });

            /**
             * Calls JoinRoom.
             * @function joinRoom
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.IJoinRequest} request JoinRequest message or plain object
             * @returns {Promise<graphwiz.networking.JoinResponse>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#leaveRoom}.
             * @memberof graphwiz.networking.RoomService
             * @typedef LeaveRoomCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {graphwiz.networking.LeaveResponse} [response] LeaveResponse
             */

            /**
             * Calls LeaveRoom.
             * @function leaveRoom
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.ILeaveRequest} request LeaveRequest message or plain object
             * @param {graphwiz.networking.RoomService.LeaveRoomCallback} callback Node-style callback called with the error, if any, and LeaveResponse
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RoomService.prototype.leaveRoom = function leaveRoom(request, callback) {
                return this.rpcCall(leaveRoom, $root.graphwiz.networking.LeaveRequest, $root.graphwiz.networking.LeaveResponse, request, callback);
            }, "name", { value: "LeaveRoom" });

            /**
             * Calls LeaveRoom.
             * @function leaveRoom
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.ILeaveRequest} request LeaveRequest message or plain object
             * @returns {Promise<graphwiz.networking.LeaveResponse>} Promise
             * @variation 2
             */

            /**
             * Callback as used by {@link graphwiz.networking.RoomService#watchPresence}.
             * @memberof graphwiz.networking.RoomService
             * @typedef WatchPresenceCallback
             * @type {function}
             * @param {Error|null} error Error, if any
             * @param {graphwiz.core.PresenceEvent} [response] PresenceEvent
             */

            /**
             * Calls WatchPresence.
             * @function watchPresence
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.IPresenceRequest} request PresenceRequest message or plain object
             * @param {graphwiz.networking.RoomService.WatchPresenceCallback} callback Node-style callback called with the error, if any, and PresenceEvent
             * @returns {undefined}
             * @variation 1
             */
            Object.defineProperty(RoomService.prototype.watchPresence = function watchPresence(request, callback) {
                return this.rpcCall(watchPresence, $root.graphwiz.networking.PresenceRequest, $root.graphwiz.core.PresenceEvent, request, callback);
            }, "name", { value: "WatchPresence" });

            /**
             * Calls WatchPresence.
             * @function watchPresence
             * @memberof graphwiz.networking.RoomService
             * @instance
             * @param {graphwiz.networking.IPresenceRequest} request PresenceRequest message or plain object
             * @returns {Promise<graphwiz.core.PresenceEvent>} Promise
             * @variation 2
             */

            return RoomService;
        })();

        networking.ClientMessage = (function() {

            /**
             * Properties of a ClientMessage.
             * @memberof graphwiz.networking
             * @interface IClientMessage
             * @property {graphwiz.core.IPositionUpdate|null} [position] ClientMessage position
             * @property {graphwiz.core.IVoiceData|null} [voice] ClientMessage voice
             * @property {graphwiz.core.IEntityUpdate|null} [entity] ClientMessage entity
             * @property {graphwiz.core.IChatMessage|null} [chat] ClientMessage chat
             */

            /**
             * Constructs a new ClientMessage.
             * @memberof graphwiz.networking
             * @classdesc Represents a ClientMessage.
             * @implements IClientMessage
             * @constructor
             * @param {graphwiz.networking.IClientMessage=} [properties] Properties to set
             */
            function ClientMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ClientMessage position.
             * @member {graphwiz.core.IPositionUpdate|null|undefined} position
             * @memberof graphwiz.networking.ClientMessage
             * @instance
             */
            ClientMessage.prototype.position = null;

            /**
             * ClientMessage voice.
             * @member {graphwiz.core.IVoiceData|null|undefined} voice
             * @memberof graphwiz.networking.ClientMessage
             * @instance
             */
            ClientMessage.prototype.voice = null;

            /**
             * ClientMessage entity.
             * @member {graphwiz.core.IEntityUpdate|null|undefined} entity
             * @memberof graphwiz.networking.ClientMessage
             * @instance
             */
            ClientMessage.prototype.entity = null;

            /**
             * ClientMessage chat.
             * @member {graphwiz.core.IChatMessage|null|undefined} chat
             * @memberof graphwiz.networking.ClientMessage
             * @instance
             */
            ClientMessage.prototype.chat = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * ClientMessage payload.
             * @member {"position"|"voice"|"entity"|"chat"|undefined} payload
             * @memberof graphwiz.networking.ClientMessage
             * @instance
             */
            Object.defineProperty(ClientMessage.prototype, "payload", {
                get: $util.oneOfGetter($oneOfFields = ["position", "voice", "entity", "chat"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ClientMessage instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {graphwiz.networking.IClientMessage=} [properties] Properties to set
             * @returns {graphwiz.networking.ClientMessage} ClientMessage instance
             */
            ClientMessage.create = function create(properties) {
                return new ClientMessage(properties);
            };

            /**
             * Encodes the specified ClientMessage message. Does not implicitly {@link graphwiz.networking.ClientMessage.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {graphwiz.networking.IClientMessage} message ClientMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ClientMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    $root.graphwiz.core.PositionUpdate.encode(message.position, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.voice != null && Object.hasOwnProperty.call(message, "voice"))
                    $root.graphwiz.core.VoiceData.encode(message.voice, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.entity != null && Object.hasOwnProperty.call(message, "entity"))
                    $root.graphwiz.core.EntityUpdate.encode(message.entity, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.chat != null && Object.hasOwnProperty.call(message, "chat"))
                    $root.graphwiz.core.ChatMessage.encode(message.chat, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ClientMessage message, length delimited. Does not implicitly {@link graphwiz.networking.ClientMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {graphwiz.networking.IClientMessage} message ClientMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ClientMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ClientMessage message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.ClientMessage} ClientMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ClientMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.ClientMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.position = $root.graphwiz.core.PositionUpdate.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.voice = $root.graphwiz.core.VoiceData.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.entity = $root.graphwiz.core.EntityUpdate.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.chat = $root.graphwiz.core.ChatMessage.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ClientMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.ClientMessage} ClientMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ClientMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ClientMessage message.
             * @function verify
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ClientMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.position != null && message.hasOwnProperty("position")) {
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.PositionUpdate.verify(message.position);
                        if (error)
                            return "position." + error;
                    }
                }
                if (message.voice != null && message.hasOwnProperty("voice")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.VoiceData.verify(message.voice);
                        if (error)
                            return "voice." + error;
                    }
                }
                if (message.entity != null && message.hasOwnProperty("entity")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntityUpdate.verify(message.entity);
                        if (error)
                            return "entity." + error;
                    }
                }
                if (message.chat != null && message.hasOwnProperty("chat")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.ChatMessage.verify(message.chat);
                        if (error)
                            return "chat." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ClientMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.ClientMessage} ClientMessage
             */
            ClientMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.ClientMessage)
                    return object;
                var message = new $root.graphwiz.networking.ClientMessage();
                if (object.position != null) {
                    if (typeof object.position !== "object")
                        throw TypeError(".graphwiz.networking.ClientMessage.position: object expected");
                    message.position = $root.graphwiz.core.PositionUpdate.fromObject(object.position);
                }
                if (object.voice != null) {
                    if (typeof object.voice !== "object")
                        throw TypeError(".graphwiz.networking.ClientMessage.voice: object expected");
                    message.voice = $root.graphwiz.core.VoiceData.fromObject(object.voice);
                }
                if (object.entity != null) {
                    if (typeof object.entity !== "object")
                        throw TypeError(".graphwiz.networking.ClientMessage.entity: object expected");
                    message.entity = $root.graphwiz.core.EntityUpdate.fromObject(object.entity);
                }
                if (object.chat != null) {
                    if (typeof object.chat !== "object")
                        throw TypeError(".graphwiz.networking.ClientMessage.chat: object expected");
                    message.chat = $root.graphwiz.core.ChatMessage.fromObject(object.chat);
                }
                return message;
            };

            /**
             * Creates a plain object from a ClientMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {graphwiz.networking.ClientMessage} message ClientMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ClientMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (message.position != null && message.hasOwnProperty("position")) {
                    object.position = $root.graphwiz.core.PositionUpdate.toObject(message.position, options);
                    if (options.oneofs)
                        object.payload = "position";
                }
                if (message.voice != null && message.hasOwnProperty("voice")) {
                    object.voice = $root.graphwiz.core.VoiceData.toObject(message.voice, options);
                    if (options.oneofs)
                        object.payload = "voice";
                }
                if (message.entity != null && message.hasOwnProperty("entity")) {
                    object.entity = $root.graphwiz.core.EntityUpdate.toObject(message.entity, options);
                    if (options.oneofs)
                        object.payload = "entity";
                }
                if (message.chat != null && message.hasOwnProperty("chat")) {
                    object.chat = $root.graphwiz.core.ChatMessage.toObject(message.chat, options);
                    if (options.oneofs)
                        object.payload = "chat";
                }
                return object;
            };

            /**
             * Converts this ClientMessage to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.ClientMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ClientMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ClientMessage
             * @function getTypeUrl
             * @memberof graphwiz.networking.ClientMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ClientMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.ClientMessage";
            };

            return ClientMessage;
        })();

        networking.ServerMessage = (function() {

            /**
             * Properties of a ServerMessage.
             * @memberof graphwiz.networking
             * @interface IServerMessage
             * @property {graphwiz.core.IWorldState|null} [worldState] ServerMessage worldState
             * @property {graphwiz.core.IPresenceEvent|null} [presence] ServerMessage presence
             * @property {graphwiz.core.IEntitySpawn|null} [entitySpawn] ServerMessage entitySpawn
             * @property {graphwiz.core.IEntityUpdate|null} [entityUpdate] ServerMessage entityUpdate
             * @property {graphwiz.core.IEntityDespawn|null} [entityDespawn] ServerMessage entityDespawn
             * @property {graphwiz.core.IChatMessage|null} [chat] ServerMessage chat
             */

            /**
             * Constructs a new ServerMessage.
             * @memberof graphwiz.networking
             * @classdesc Represents a ServerMessage.
             * @implements IServerMessage
             * @constructor
             * @param {graphwiz.networking.IServerMessage=} [properties] Properties to set
             */
            function ServerMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ServerMessage worldState.
             * @member {graphwiz.core.IWorldState|null|undefined} worldState
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            ServerMessage.prototype.worldState = null;

            /**
             * ServerMessage presence.
             * @member {graphwiz.core.IPresenceEvent|null|undefined} presence
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            ServerMessage.prototype.presence = null;

            /**
             * ServerMessage entitySpawn.
             * @member {graphwiz.core.IEntitySpawn|null|undefined} entitySpawn
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            ServerMessage.prototype.entitySpawn = null;

            /**
             * ServerMessage entityUpdate.
             * @member {graphwiz.core.IEntityUpdate|null|undefined} entityUpdate
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            ServerMessage.prototype.entityUpdate = null;

            /**
             * ServerMessage entityDespawn.
             * @member {graphwiz.core.IEntityDespawn|null|undefined} entityDespawn
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            ServerMessage.prototype.entityDespawn = null;

            /**
             * ServerMessage chat.
             * @member {graphwiz.core.IChatMessage|null|undefined} chat
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            ServerMessage.prototype.chat = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * ServerMessage payload.
             * @member {"worldState"|"presence"|"entitySpawn"|"entityUpdate"|"entityDespawn"|"chat"|undefined} payload
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             */
            Object.defineProperty(ServerMessage.prototype, "payload", {
                get: $util.oneOfGetter($oneOfFields = ["worldState", "presence", "entitySpawn", "entityUpdate", "entityDespawn", "chat"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ServerMessage instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {graphwiz.networking.IServerMessage=} [properties] Properties to set
             * @returns {graphwiz.networking.ServerMessage} ServerMessage instance
             */
            ServerMessage.create = function create(properties) {
                return new ServerMessage(properties);
            };

            /**
             * Encodes the specified ServerMessage message. Does not implicitly {@link graphwiz.networking.ServerMessage.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {graphwiz.networking.IServerMessage} message ServerMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.worldState != null && Object.hasOwnProperty.call(message, "worldState"))
                    $root.graphwiz.core.WorldState.encode(message.worldState, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.presence != null && Object.hasOwnProperty.call(message, "presence"))
                    $root.graphwiz.core.PresenceEvent.encode(message.presence, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.entitySpawn != null && Object.hasOwnProperty.call(message, "entitySpawn"))
                    $root.graphwiz.core.EntitySpawn.encode(message.entitySpawn, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.entityUpdate != null && Object.hasOwnProperty.call(message, "entityUpdate"))
                    $root.graphwiz.core.EntityUpdate.encode(message.entityUpdate, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.entityDespawn != null && Object.hasOwnProperty.call(message, "entityDespawn"))
                    $root.graphwiz.core.EntityDespawn.encode(message.entityDespawn, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.chat != null && Object.hasOwnProperty.call(message, "chat"))
                    $root.graphwiz.core.ChatMessage.encode(message.chat, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ServerMessage message, length delimited. Does not implicitly {@link graphwiz.networking.ServerMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {graphwiz.networking.IServerMessage} message ServerMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ServerMessage message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.ServerMessage} ServerMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.ServerMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.worldState = $root.graphwiz.core.WorldState.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.presence = $root.graphwiz.core.PresenceEvent.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.entitySpawn = $root.graphwiz.core.EntitySpawn.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.entityUpdate = $root.graphwiz.core.EntityUpdate.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.entityDespawn = $root.graphwiz.core.EntityDespawn.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.chat = $root.graphwiz.core.ChatMessage.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ServerMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.ServerMessage} ServerMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ServerMessage message.
             * @function verify
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ServerMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.worldState != null && message.hasOwnProperty("worldState")) {
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.WorldState.verify(message.worldState);
                        if (error)
                            return "worldState." + error;
                    }
                }
                if (message.presence != null && message.hasOwnProperty("presence")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.PresenceEvent.verify(message.presence);
                        if (error)
                            return "presence." + error;
                    }
                }
                if (message.entitySpawn != null && message.hasOwnProperty("entitySpawn")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntitySpawn.verify(message.entitySpawn);
                        if (error)
                            return "entitySpawn." + error;
                    }
                }
                if (message.entityUpdate != null && message.hasOwnProperty("entityUpdate")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntityUpdate.verify(message.entityUpdate);
                        if (error)
                            return "entityUpdate." + error;
                    }
                }
                if (message.entityDespawn != null && message.hasOwnProperty("entityDespawn")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.EntityDespawn.verify(message.entityDespawn);
                        if (error)
                            return "entityDespawn." + error;
                    }
                }
                if (message.chat != null && message.hasOwnProperty("chat")) {
                    if (properties.payload === 1)
                        return "payload: multiple values";
                    properties.payload = 1;
                    {
                        var error = $root.graphwiz.core.ChatMessage.verify(message.chat);
                        if (error)
                            return "chat." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ServerMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.ServerMessage} ServerMessage
             */
            ServerMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.ServerMessage)
                    return object;
                var message = new $root.graphwiz.networking.ServerMessage();
                if (object.worldState != null) {
                    if (typeof object.worldState !== "object")
                        throw TypeError(".graphwiz.networking.ServerMessage.worldState: object expected");
                    message.worldState = $root.graphwiz.core.WorldState.fromObject(object.worldState);
                }
                if (object.presence != null) {
                    if (typeof object.presence !== "object")
                        throw TypeError(".graphwiz.networking.ServerMessage.presence: object expected");
                    message.presence = $root.graphwiz.core.PresenceEvent.fromObject(object.presence);
                }
                if (object.entitySpawn != null) {
                    if (typeof object.entitySpawn !== "object")
                        throw TypeError(".graphwiz.networking.ServerMessage.entitySpawn: object expected");
                    message.entitySpawn = $root.graphwiz.core.EntitySpawn.fromObject(object.entitySpawn);
                }
                if (object.entityUpdate != null) {
                    if (typeof object.entityUpdate !== "object")
                        throw TypeError(".graphwiz.networking.ServerMessage.entityUpdate: object expected");
                    message.entityUpdate = $root.graphwiz.core.EntityUpdate.fromObject(object.entityUpdate);
                }
                if (object.entityDespawn != null) {
                    if (typeof object.entityDespawn !== "object")
                        throw TypeError(".graphwiz.networking.ServerMessage.entityDespawn: object expected");
                    message.entityDespawn = $root.graphwiz.core.EntityDespawn.fromObject(object.entityDespawn);
                }
                if (object.chat != null) {
                    if (typeof object.chat !== "object")
                        throw TypeError(".graphwiz.networking.ServerMessage.chat: object expected");
                    message.chat = $root.graphwiz.core.ChatMessage.fromObject(object.chat);
                }
                return message;
            };

            /**
             * Creates a plain object from a ServerMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {graphwiz.networking.ServerMessage} message ServerMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ServerMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (message.worldState != null && message.hasOwnProperty("worldState")) {
                    object.worldState = $root.graphwiz.core.WorldState.toObject(message.worldState, options);
                    if (options.oneofs)
                        object.payload = "worldState";
                }
                if (message.presence != null && message.hasOwnProperty("presence")) {
                    object.presence = $root.graphwiz.core.PresenceEvent.toObject(message.presence, options);
                    if (options.oneofs)
                        object.payload = "presence";
                }
                if (message.entitySpawn != null && message.hasOwnProperty("entitySpawn")) {
                    object.entitySpawn = $root.graphwiz.core.EntitySpawn.toObject(message.entitySpawn, options);
                    if (options.oneofs)
                        object.payload = "entitySpawn";
                }
                if (message.entityUpdate != null && message.hasOwnProperty("entityUpdate")) {
                    object.entityUpdate = $root.graphwiz.core.EntityUpdate.toObject(message.entityUpdate, options);
                    if (options.oneofs)
                        object.payload = "entityUpdate";
                }
                if (message.entityDespawn != null && message.hasOwnProperty("entityDespawn")) {
                    object.entityDespawn = $root.graphwiz.core.EntityDespawn.toObject(message.entityDespawn, options);
                    if (options.oneofs)
                        object.payload = "entityDespawn";
                }
                if (message.chat != null && message.hasOwnProperty("chat")) {
                    object.chat = $root.graphwiz.core.ChatMessage.toObject(message.chat, options);
                    if (options.oneofs)
                        object.payload = "chat";
                }
                return object;
            };

            /**
             * Converts this ServerMessage to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.ServerMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ServerMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ServerMessage
             * @function getTypeUrl
             * @memberof graphwiz.networking.ServerMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ServerMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.ServerMessage";
            };

            return ServerMessage;
        })();

        networking.JoinRequest = (function() {

            /**
             * Properties of a JoinRequest.
             * @memberof graphwiz.networking
             * @interface IJoinRequest
             * @property {string|null} [roomId] JoinRequest roomId
             * @property {string|null} [authToken] JoinRequest authToken
             * @property {string|null} [displayName] JoinRequest displayName
             */

            /**
             * Constructs a new JoinRequest.
             * @memberof graphwiz.networking
             * @classdesc Represents a JoinRequest.
             * @implements IJoinRequest
             * @constructor
             * @param {graphwiz.networking.IJoinRequest=} [properties] Properties to set
             */
            function JoinRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * JoinRequest roomId.
             * @member {string} roomId
             * @memberof graphwiz.networking.JoinRequest
             * @instance
             */
            JoinRequest.prototype.roomId = "";

            /**
             * JoinRequest authToken.
             * @member {string} authToken
             * @memberof graphwiz.networking.JoinRequest
             * @instance
             */
            JoinRequest.prototype.authToken = "";

            /**
             * JoinRequest displayName.
             * @member {string} displayName
             * @memberof graphwiz.networking.JoinRequest
             * @instance
             */
            JoinRequest.prototype.displayName = "";

            /**
             * Creates a new JoinRequest instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {graphwiz.networking.IJoinRequest=} [properties] Properties to set
             * @returns {graphwiz.networking.JoinRequest} JoinRequest instance
             */
            JoinRequest.create = function create(properties) {
                return new JoinRequest(properties);
            };

            /**
             * Encodes the specified JoinRequest message. Does not implicitly {@link graphwiz.networking.JoinRequest.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {graphwiz.networking.IJoinRequest} message JoinRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.roomId != null && Object.hasOwnProperty.call(message, "roomId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.roomId);
                if (message.authToken != null && Object.hasOwnProperty.call(message, "authToken"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.authToken);
                if (message.displayName != null && Object.hasOwnProperty.call(message, "displayName"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.displayName);
                return writer;
            };

            /**
             * Encodes the specified JoinRequest message, length delimited. Does not implicitly {@link graphwiz.networking.JoinRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {graphwiz.networking.IJoinRequest} message JoinRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a JoinRequest message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.JoinRequest} JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.JoinRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.roomId = reader.string();
                            break;
                        }
                    case 2: {
                            message.authToken = reader.string();
                            break;
                        }
                    case 3: {
                            message.displayName = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a JoinRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.JoinRequest} JoinRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a JoinRequest message.
             * @function verify
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            JoinRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    if (!$util.isString(message.roomId))
                        return "roomId: string expected";
                if (message.authToken != null && message.hasOwnProperty("authToken"))
                    if (!$util.isString(message.authToken))
                        return "authToken: string expected";
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    if (!$util.isString(message.displayName))
                        return "displayName: string expected";
                return null;
            };

            /**
             * Creates a JoinRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.JoinRequest} JoinRequest
             */
            JoinRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.JoinRequest)
                    return object;
                var message = new $root.graphwiz.networking.JoinRequest();
                if (object.roomId != null)
                    message.roomId = String(object.roomId);
                if (object.authToken != null)
                    message.authToken = String(object.authToken);
                if (object.displayName != null)
                    message.displayName = String(object.displayName);
                return message;
            };

            /**
             * Creates a plain object from a JoinRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {graphwiz.networking.JoinRequest} message JoinRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            JoinRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.roomId = "";
                    object.authToken = "";
                    object.displayName = "";
                }
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    object.roomId = message.roomId;
                if (message.authToken != null && message.hasOwnProperty("authToken"))
                    object.authToken = message.authToken;
                if (message.displayName != null && message.hasOwnProperty("displayName"))
                    object.displayName = message.displayName;
                return object;
            };

            /**
             * Converts this JoinRequest to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.JoinRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            JoinRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for JoinRequest
             * @function getTypeUrl
             * @memberof graphwiz.networking.JoinRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            JoinRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.JoinRequest";
            };

            return JoinRequest;
        })();

        networking.JoinResponse = (function() {

            /**
             * Properties of a JoinResponse.
             * @memberof graphwiz.networking
             * @interface IJoinResponse
             * @property {boolean|null} [success] JoinResponse success
             * @property {string|null} [roomId] JoinResponse roomId
             * @property {string|null} [assignedClientId] JoinResponse assignedClientId
             * @property {graphwiz.core.IWorldState|null} [initialState] JoinResponse initialState
             */

            /**
             * Constructs a new JoinResponse.
             * @memberof graphwiz.networking
             * @classdesc Represents a JoinResponse.
             * @implements IJoinResponse
             * @constructor
             * @param {graphwiz.networking.IJoinResponse=} [properties] Properties to set
             */
            function JoinResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * JoinResponse success.
             * @member {boolean} success
             * @memberof graphwiz.networking.JoinResponse
             * @instance
             */
            JoinResponse.prototype.success = false;

            /**
             * JoinResponse roomId.
             * @member {string} roomId
             * @memberof graphwiz.networking.JoinResponse
             * @instance
             */
            JoinResponse.prototype.roomId = "";

            /**
             * JoinResponse assignedClientId.
             * @member {string} assignedClientId
             * @memberof graphwiz.networking.JoinResponse
             * @instance
             */
            JoinResponse.prototype.assignedClientId = "";

            /**
             * JoinResponse initialState.
             * @member {graphwiz.core.IWorldState|null|undefined} initialState
             * @memberof graphwiz.networking.JoinResponse
             * @instance
             */
            JoinResponse.prototype.initialState = null;

            /**
             * Creates a new JoinResponse instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {graphwiz.networking.IJoinResponse=} [properties] Properties to set
             * @returns {graphwiz.networking.JoinResponse} JoinResponse instance
             */
            JoinResponse.create = function create(properties) {
                return new JoinResponse(properties);
            };

            /**
             * Encodes the specified JoinResponse message. Does not implicitly {@link graphwiz.networking.JoinResponse.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {graphwiz.networking.IJoinResponse} message JoinResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                if (message.roomId != null && Object.hasOwnProperty.call(message, "roomId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.roomId);
                if (message.assignedClientId != null && Object.hasOwnProperty.call(message, "assignedClientId"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.assignedClientId);
                if (message.initialState != null && Object.hasOwnProperty.call(message, "initialState"))
                    $root.graphwiz.core.WorldState.encode(message.initialState, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified JoinResponse message, length delimited. Does not implicitly {@link graphwiz.networking.JoinResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {graphwiz.networking.IJoinResponse} message JoinResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a JoinResponse message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.JoinResponse} JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.JoinResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.success = reader.bool();
                            break;
                        }
                    case 2: {
                            message.roomId = reader.string();
                            break;
                        }
                    case 3: {
                            message.assignedClientId = reader.string();
                            break;
                        }
                    case 4: {
                            message.initialState = $root.graphwiz.core.WorldState.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a JoinResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.JoinResponse} JoinResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a JoinResponse message.
             * @function verify
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            JoinResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    if (!$util.isString(message.roomId))
                        return "roomId: string expected";
                if (message.assignedClientId != null && message.hasOwnProperty("assignedClientId"))
                    if (!$util.isString(message.assignedClientId))
                        return "assignedClientId: string expected";
                if (message.initialState != null && message.hasOwnProperty("initialState")) {
                    var error = $root.graphwiz.core.WorldState.verify(message.initialState);
                    if (error)
                        return "initialState." + error;
                }
                return null;
            };

            /**
             * Creates a JoinResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.JoinResponse} JoinResponse
             */
            JoinResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.JoinResponse)
                    return object;
                var message = new $root.graphwiz.networking.JoinResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                if (object.roomId != null)
                    message.roomId = String(object.roomId);
                if (object.assignedClientId != null)
                    message.assignedClientId = String(object.assignedClientId);
                if (object.initialState != null) {
                    if (typeof object.initialState !== "object")
                        throw TypeError(".graphwiz.networking.JoinResponse.initialState: object expected");
                    message.initialState = $root.graphwiz.core.WorldState.fromObject(object.initialState);
                }
                return message;
            };

            /**
             * Creates a plain object from a JoinResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {graphwiz.networking.JoinResponse} message JoinResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            JoinResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.success = false;
                    object.roomId = "";
                    object.assignedClientId = "";
                    object.initialState = null;
                }
                if (message.success != null && message.hasOwnProperty("success"))
                    object.success = message.success;
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    object.roomId = message.roomId;
                if (message.assignedClientId != null && message.hasOwnProperty("assignedClientId"))
                    object.assignedClientId = message.assignedClientId;
                if (message.initialState != null && message.hasOwnProperty("initialState"))
                    object.initialState = $root.graphwiz.core.WorldState.toObject(message.initialState, options);
                return object;
            };

            /**
             * Converts this JoinResponse to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.JoinResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            JoinResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for JoinResponse
             * @function getTypeUrl
             * @memberof graphwiz.networking.JoinResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            JoinResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.JoinResponse";
            };

            return JoinResponse;
        })();

        networking.LeaveRequest = (function() {

            /**
             * Properties of a LeaveRequest.
             * @memberof graphwiz.networking
             * @interface ILeaveRequest
             * @property {string|null} [roomId] LeaveRequest roomId
             * @property {string|null} [clientId] LeaveRequest clientId
             */

            /**
             * Constructs a new LeaveRequest.
             * @memberof graphwiz.networking
             * @classdesc Represents a LeaveRequest.
             * @implements ILeaveRequest
             * @constructor
             * @param {graphwiz.networking.ILeaveRequest=} [properties] Properties to set
             */
            function LeaveRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * LeaveRequest roomId.
             * @member {string} roomId
             * @memberof graphwiz.networking.LeaveRequest
             * @instance
             */
            LeaveRequest.prototype.roomId = "";

            /**
             * LeaveRequest clientId.
             * @member {string} clientId
             * @memberof graphwiz.networking.LeaveRequest
             * @instance
             */
            LeaveRequest.prototype.clientId = "";

            /**
             * Creates a new LeaveRequest instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {graphwiz.networking.ILeaveRequest=} [properties] Properties to set
             * @returns {graphwiz.networking.LeaveRequest} LeaveRequest instance
             */
            LeaveRequest.create = function create(properties) {
                return new LeaveRequest(properties);
            };

            /**
             * Encodes the specified LeaveRequest message. Does not implicitly {@link graphwiz.networking.LeaveRequest.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {graphwiz.networking.ILeaveRequest} message LeaveRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            LeaveRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.roomId != null && Object.hasOwnProperty.call(message, "roomId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.roomId);
                if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.clientId);
                return writer;
            };

            /**
             * Encodes the specified LeaveRequest message, length delimited. Does not implicitly {@link graphwiz.networking.LeaveRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {graphwiz.networking.ILeaveRequest} message LeaveRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            LeaveRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a LeaveRequest message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.LeaveRequest} LeaveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            LeaveRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.LeaveRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.roomId = reader.string();
                            break;
                        }
                    case 2: {
                            message.clientId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a LeaveRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.LeaveRequest} LeaveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            LeaveRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a LeaveRequest message.
             * @function verify
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            LeaveRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    if (!$util.isString(message.roomId))
                        return "roomId: string expected";
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    if (!$util.isString(message.clientId))
                        return "clientId: string expected";
                return null;
            };

            /**
             * Creates a LeaveRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.LeaveRequest} LeaveRequest
             */
            LeaveRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.LeaveRequest)
                    return object;
                var message = new $root.graphwiz.networking.LeaveRequest();
                if (object.roomId != null)
                    message.roomId = String(object.roomId);
                if (object.clientId != null)
                    message.clientId = String(object.clientId);
                return message;
            };

            /**
             * Creates a plain object from a LeaveRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {graphwiz.networking.LeaveRequest} message LeaveRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            LeaveRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.roomId = "";
                    object.clientId = "";
                }
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    object.roomId = message.roomId;
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    object.clientId = message.clientId;
                return object;
            };

            /**
             * Converts this LeaveRequest to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.LeaveRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            LeaveRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for LeaveRequest
             * @function getTypeUrl
             * @memberof graphwiz.networking.LeaveRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            LeaveRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.LeaveRequest";
            };

            return LeaveRequest;
        })();

        networking.LeaveResponse = (function() {

            /**
             * Properties of a LeaveResponse.
             * @memberof graphwiz.networking
             * @interface ILeaveResponse
             * @property {boolean|null} [success] LeaveResponse success
             */

            /**
             * Constructs a new LeaveResponse.
             * @memberof graphwiz.networking
             * @classdesc Represents a LeaveResponse.
             * @implements ILeaveResponse
             * @constructor
             * @param {graphwiz.networking.ILeaveResponse=} [properties] Properties to set
             */
            function LeaveResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * LeaveResponse success.
             * @member {boolean} success
             * @memberof graphwiz.networking.LeaveResponse
             * @instance
             */
            LeaveResponse.prototype.success = false;

            /**
             * Creates a new LeaveResponse instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {graphwiz.networking.ILeaveResponse=} [properties] Properties to set
             * @returns {graphwiz.networking.LeaveResponse} LeaveResponse instance
             */
            LeaveResponse.create = function create(properties) {
                return new LeaveResponse(properties);
            };

            /**
             * Encodes the specified LeaveResponse message. Does not implicitly {@link graphwiz.networking.LeaveResponse.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {graphwiz.networking.ILeaveResponse} message LeaveResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            LeaveResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                return writer;
            };

            /**
             * Encodes the specified LeaveResponse message, length delimited. Does not implicitly {@link graphwiz.networking.LeaveResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {graphwiz.networking.ILeaveResponse} message LeaveResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            LeaveResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a LeaveResponse message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.LeaveResponse} LeaveResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            LeaveResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.LeaveResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.success = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a LeaveResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.LeaveResponse} LeaveResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            LeaveResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a LeaveResponse message.
             * @function verify
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            LeaveResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                return null;
            };

            /**
             * Creates a LeaveResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.LeaveResponse} LeaveResponse
             */
            LeaveResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.LeaveResponse)
                    return object;
                var message = new $root.graphwiz.networking.LeaveResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a LeaveResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {graphwiz.networking.LeaveResponse} message LeaveResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            LeaveResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.success = false;
                if (message.success != null && message.hasOwnProperty("success"))
                    object.success = message.success;
                return object;
            };

            /**
             * Converts this LeaveResponse to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.LeaveResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            LeaveResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for LeaveResponse
             * @function getTypeUrl
             * @memberof graphwiz.networking.LeaveResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            LeaveResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.LeaveResponse";
            };

            return LeaveResponse;
        })();

        networking.PresenceRequest = (function() {

            /**
             * Properties of a PresenceRequest.
             * @memberof graphwiz.networking
             * @interface IPresenceRequest
             * @property {string|null} [roomId] PresenceRequest roomId
             */

            /**
             * Constructs a new PresenceRequest.
             * @memberof graphwiz.networking
             * @classdesc Represents a PresenceRequest.
             * @implements IPresenceRequest
             * @constructor
             * @param {graphwiz.networking.IPresenceRequest=} [properties] Properties to set
             */
            function PresenceRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PresenceRequest roomId.
             * @member {string} roomId
             * @memberof graphwiz.networking.PresenceRequest
             * @instance
             */
            PresenceRequest.prototype.roomId = "";

            /**
             * Creates a new PresenceRequest instance using the specified properties.
             * @function create
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {graphwiz.networking.IPresenceRequest=} [properties] Properties to set
             * @returns {graphwiz.networking.PresenceRequest} PresenceRequest instance
             */
            PresenceRequest.create = function create(properties) {
                return new PresenceRequest(properties);
            };

            /**
             * Encodes the specified PresenceRequest message. Does not implicitly {@link graphwiz.networking.PresenceRequest.verify|verify} messages.
             * @function encode
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {graphwiz.networking.IPresenceRequest} message PresenceRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PresenceRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.roomId != null && Object.hasOwnProperty.call(message, "roomId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.roomId);
                return writer;
            };

            /**
             * Encodes the specified PresenceRequest message, length delimited. Does not implicitly {@link graphwiz.networking.PresenceRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {graphwiz.networking.IPresenceRequest} message PresenceRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PresenceRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PresenceRequest message from the specified reader or buffer.
             * @function decode
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {graphwiz.networking.PresenceRequest} PresenceRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PresenceRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.graphwiz.networking.PresenceRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.roomId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PresenceRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {graphwiz.networking.PresenceRequest} PresenceRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PresenceRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PresenceRequest message.
             * @function verify
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PresenceRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    if (!$util.isString(message.roomId))
                        return "roomId: string expected";
                return null;
            };

            /**
             * Creates a PresenceRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {graphwiz.networking.PresenceRequest} PresenceRequest
             */
            PresenceRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.graphwiz.networking.PresenceRequest)
                    return object;
                var message = new $root.graphwiz.networking.PresenceRequest();
                if (object.roomId != null)
                    message.roomId = String(object.roomId);
                return message;
            };

            /**
             * Creates a plain object from a PresenceRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {graphwiz.networking.PresenceRequest} message PresenceRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PresenceRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.roomId = "";
                if (message.roomId != null && message.hasOwnProperty("roomId"))
                    object.roomId = message.roomId;
                return object;
            };

            /**
             * Converts this PresenceRequest to JSON.
             * @function toJSON
             * @memberof graphwiz.networking.PresenceRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PresenceRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PresenceRequest
             * @function getTypeUrl
             * @memberof graphwiz.networking.PresenceRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PresenceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/graphwiz.networking.PresenceRequest";
            };

            return PresenceRequest;
        })();

        return networking;
    })();

    return graphwiz;
})();

module.exports = $root;
