"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("buffer");
var big_integer_1 = __importDefault(require("big-integer"));
var bson_1 = __importDefault(require("bson"));
var SerializableMapMemberConfigurer = /** @class */ (function () {
    function SerializableMapMemberConfigurer(meta) {
        this.meta = meta;
    }
    SerializableMapMemberConfigurer.prototype.setCreateFactory = function (callback) {
        this.meta.createFactory = callback;
        return this;
    };
    return SerializableMapMemberConfigurer;
}());
exports.SerializableMapMemberConfigurer = SerializableMapMemberConfigurer;
function bigIntToLong(value) {
    var low = value.and(big_integer_1.default("ffffffff", 16));
    var high = value.shiftRight(32).and(big_integer_1.default("ffffffff", 16));
    var longValue = new bson_1.default.Long(low.toJSNumber(), high.toJSNumber());
    return longValue;
}
function longToBigInt(value) {
    return big_integer_1.default(value.toString(16), big_integer_1.default('16', 10));
}
function literalToBson(value) {
    if (Array.isArray(value)) {
        var outArr = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var item = value_1[_i];
            outArr.push(literalToBson(item));
        }
        return outArr;
    }
    else if (buffer_1.Buffer.isBuffer(value)) {
        return new bson_1.default.Binary(value);
    }
    else {
        if (value == null)
            return null;
        switch (typeof value) {
            case 'string':
            case 'boolean':
                return value;
            case 'number':
                return new bson_1.default.Int32(value);
            default:
                console.log("literalToBson : ", value);
                return value.toBson();
        }
    }
    return null;
}
function bsonToLiteral(target, data, createFactory) {
    if (typeof data == 'object') {
        if (data instanceof bson_1.default.Binary) {
            return data.value(true);
        }
        else if (Array.isArray(data)) {
            var outArr = [];
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                outArr.push(bsonToLiteral(undefined, item, createFactory));
            }
            return outArr;
        }
        else {
            if (createFactory) {
                target = createFactory(data['@jsbsonrpcsname'], data['@jsbsonrpcsver']);
            }
            target.fromBson(data);
            return target;
        }
    }
    else {
        return data;
    }
}
var SType = /** @class */ (function () {
    function SType(value) {
        this._value = value;
    }
    SType.prototype.get = function () {
        return this._value;
    };
    SType.prototype.ref = function () {
        return this._value;
    };
    SType.prototype.set = function (value) {
        this._value = value;
    };
    SType.prototype.toBson = function () {
        return literalToBson(this._value);
    };
    SType.prototype.fromBson = function (data, createFactory) {
        this._value = bsonToLiteral(this._value, data, createFactory);
    };
    return SType;
}());
exports.SType = SType;
var SLongType = /** @class */ (function () {
    function SLongType(value, radix) {
        if (radix === void 0) { radix = 10; }
        if (typeof value == 'number') {
            this._value = big_integer_1.default(value);
        }
        else if (typeof value == 'string') {
            this._value = big_integer_1.default(value, radix);
        }
        else {
            this._value = big_integer_1.default(0);
        }
    }
    SLongType.prototype.get = function () {
        return this._value;
    };
    SLongType.prototype.set = function (value) {
        this._value = value;
    };
    SLongType.prototype.toBson = function () {
        return bigIntToLong(this._value);
    };
    SLongType.prototype.fromBson = function (data) {
        this._value = longToBigInt(data);
    };
    return SLongType;
}());
exports.SLongType = SLongType;
var SDoubleType = /** @class */ (function () {
    function SDoubleType(value) {
        if (value === void 0) { value = 0; }
        this._value = value;
    }
    SDoubleType.prototype.get = function () {
        return this._value;
    };
    SDoubleType.prototype.set = function (value) {
        this._value = value;
    };
    SDoubleType.prototype.toBson = function () {
        return new bson_1.default.Double(this._value);
    };
    SDoubleType.prototype.fromBson = function (data) {
        this._value = data;
    };
    return SDoubleType;
}());
exports.SDoubleType = SDoubleType;
var SListType = /** @class */ (function (_super) {
    __extends(SListType, _super);
    function SListType() {
        var _this = _super.call(this) || this;
        Object.setPrototypeOf(_this, Object.create(SListType.prototype));
        return _this;
    }
    SListType.prototype.toBson = function () {
        var outArray = [];
        this.forEach(function (value) {
            outArray.push(literalToBson(value));
        });
        return outArray;
    };
    SListType.prototype.fromBson = function (data, createFactory) {
        if (Array.isArray(data)) {
            while (this.length > 0)
                this.pop();
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var item = data_2[_i];
                this.push(bsonToLiteral(undefined, data, createFactory));
            }
        }
        else {
            throw Error("Unknown List Type: typeof=[" + (typeof data) + "], data=" + data);
        }
    };
    return SListType;
}(Array));
exports.SListType = SListType;
var SRecordType = /** @class */ (function (_super) {
    __extends(SRecordType, _super);
    function SRecordType() {
        var _this = _super.call(this) || this;
        Object.setPrototypeOf(_this, Object.create(SRecordType.prototype));
        return _this;
    }
    SRecordType.prototype.toBson = function () {
        var outObject = {};
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var key = _a[_i];
            outObject[key] = literalToBson(this[key]);
        }
        return outObject;
    };
    SRecordType.prototype.fromBson = function (data) {
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var key = _a[_i];
            delete this[key];
        }
        for (var _b = 0, _c = Object.keys(data); _b < _c.length; _b++) {
            var key = _c[_b];
            this[key] = data[key];
        }
    };
    return SRecordType;
}(Object));
exports.SRecordType = SRecordType;
var Serializable = /** @class */ (function () {
    function Serializable(serializableName, serializableVerUID) {
        this._serializableMembers = {};
        this._serializableName = serializableName;
        if (typeof serializableVerUID === 'number')
            this._serializableVerUID = big_integer_1.default(serializableVerUID);
        else
            this._serializableVerUID = serializableVerUID;
    }
    Serializable.prototype.serializableMapMember = function (name, obj) {
        var meta = this._serializableMembers[name] = {
            name: name,
            obj: obj,
            createFactory: undefined
        };
        return new SerializableMapMemberConfigurer(meta);
    };
    Serializable.prototype.toBson = function () {
        var doc = {
            '@jsbsonrpcsname': this._serializableName,
            '@jsbsonrpcsver': bigIntToLong(this._serializableVerUID)
        };
        for (var key in this._serializableMembers) {
            var item = this._serializableMembers[key];
            doc[key] = item.obj.toBson();
        }
        return doc;
    };
    Serializable.prototype.fromBson = function (bson) {
        delete bson['@jsbsonrpcsname'];
        delete bson['@jsbsonrpcsver'];
        for (var key in this._serializableMembers) {
            var item = this._serializableMembers[key];
            var value = bson[key];
            if (value) {
                item.obj.fromBson(value, item.createFactory);
                delete bson[key];
            }
        }
    };
    Serializable.prototype.serialize = function () {
        return bson_1.default.serialize(this.toBson());
    };
    Serializable.prototype.deserialize = function (payload) {
        var bson = bson_1.default.deserialize(payload);
        this.fromBson(bson);
    };
    return Serializable;
}());
exports.Serializable = Serializable;
