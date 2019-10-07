import {Buffer} from 'buffer'
import bigInt, {BigInteger} from 'big-integer'
import BSON from 'bson'

export type CreateFactoryType = (serializableName: string, serializableVerUID: BigInteger) => Serializable;

interface Field {
    name: string;
    obj: STypeBase;
    createFactory?: CreateFactoryType;
}

export class SerializableMapMemberConfigurer {
    meta: Field;

    constructor(meta: Field) {
        this.meta = meta;
    }

    setCreateFactory(callback: CreateFactoryType): SerializableMapMemberConfigurer {
        this.meta.createFactory = callback;
        return this;
    }
}

interface STypeBase {
    toBson(): any;
    fromBson(data: any, createFactory?: CreateFactoryType): void;
}

function bigIntToLong(value: BigInteger) {
    let low = value.and(bigInt("ffffffff", 16));
    let high = value.shiftRight(32).and(bigInt("ffffffff", 16));
    let longValue = new BSON.Long(low.toJSNumber(), high.toJSNumber());
    return longValue;
}

function longToBigInt(value: BSON.Long) {
    return bigInt(value.toString(16), bigInt('16', 10));
}

function literalToBson(value: string | number | boolean | number[] | string[] | boolean[] | STypeBase | null | Buffer) {
    if(Array.isArray(value)) {
        let outArr: any[] = [];
        for(var item of value) {
            outArr.push(literalToBson(item));
        }
        return outArr;
    }else if(Buffer.isBuffer(value)) {
        return new BSON.Binary(value);
    }else{
        if (value == null)
            return null;
        switch (typeof value) {
            case 'string':
            case 'boolean':
                return value;
            case 'number':
                return new BSON.Int32(value);
            default:
                console.log("literalToBson : ", value);
                return value.toBson();
        }
    }
    return null;
}

function bsonToLiteral(target: any, data: any, createFactory?: CreateFactoryType) {
    if(typeof data == 'object') {
        if(data instanceof BSON.Binary) {
            return data.value(true);
        }else if(Array.isArray(data)) {
            let outArr: any[] = [];
            for(var item of data) {
                outArr.push(bsonToLiteral(undefined, item, createFactory));
            }
            return outArr;
        }else{
            if(createFactory) {
                target = createFactory(data['@jsbsonrpcsname'], data['@jsbsonrpcsver']);
            }
            target.fromBson(data);
            return target;
        }
    }else{
        return data;
    }
}

export class SType<T extends STypeBase | number | string | boolean | number[] | string[] | boolean[] | Buffer> implements STypeBase {
    private _value: any;

    constructor(value?: T) {
        this._value = value;
    }

    get(): T {
        return this._value;
    }

    ref(): T {
        return this._value;
    }

    set(value: T) {
        this._value = value;
    }

    toBson(): any {
        return literalToBson(this._value);
    }

    fromBson(data: any, createFactory?: CreateFactoryType): void {
        this._value = bsonToLiteral(this._value, data, createFactory);
    }
}

export class SLongType implements STypeBase {
    private _value: BigInteger;

    constructor(value?: BigInteger | string | number, radix: number = 10) {
        if(typeof value == 'number') {
            this._value = bigInt(value);
        }else if(typeof value == 'string') {
            this._value = bigInt(value, radix);
        }else{
            this._value = bigInt(0);
        }
    }

    get(): BigInteger {
        return this._value;
    }

    set(value: BigInteger) {
        this._value = value;
    }

    toBson(): any {
        return bigIntToLong(this._value);
    }

    fromBson(data: any): void {
        this._value = longToBigInt(data);
    }
}

export class SDoubleType implements STypeBase {
    private _value: number;

    constructor(value: number = 0) {
        this._value = value;
    }

    get(): number {
        return this._value;
    }

    set(value: number) {
        this._value = value;
    }

    toBson(): any {
        return new BSON.Double(this._value);
    }

    fromBson(data: any): void {
        this._value = data;
    }
}

export class SListType<T extends STypeBase | number | string | boolean | Buffer> extends Array<T> implements STypeBase {
    constructor() {
        super();
        (<any>Object).setPrototypeOf(this, Object.create(SListType.prototype));
    }
    toBson(): any {
        let outArray: any[] = [];
        this.forEach((value) => {
            outArray.push(literalToBson(value));
        });
        return outArray;
    }
    fromBson(data: any, createFactory?: CreateFactoryType): void {
        if(Array.isArray(data)) {
            while(this.length > 0) this.pop();
            for(var item of data) {
                this.push(bsonToLiteral(undefined, data, createFactory));
            }
        }else{
            throw Error("Unknown List Type: typeof=[" + (typeof data) + "], data=" + data);
        }
    }
}

export class SRecordType<K extends string, V extends STypeBase | number | string | boolean | Buffer> extends Object implements STypeBase {
    constructor() {
        super();
        (<any>Object).setPrototypeOf(this, Object.create(SRecordType.prototype));
    }
    toBson(): any {
        let outObject: object = {};
        for(var key of Object.keys(this)) {
            outObject[key] = literalToBson(this[key]);
        }
        return outObject;
    }
    fromBson(data: any): void {
        for(var key of Object.keys(this)) {
            delete this[key];
        }
        for(var key of Object.keys(data)) {
            this[key] = data[key];
        }
    }
}

export class SEnumType<ENUM_TYPE, V extends number | string = number> implements STypeBase {
    private _value: ENUM_TYPE | null = null;

    get(): ENUM_TYPE | null {
        return this._value;
    }

    set(value: ENUM_TYPE | null) {
        this._value = value;
    }

    toBson(): any {
        if(typeof this._value == 'number') {
            return new BSON.Int32(this._value);
        }else if(typeof this._value == 'string') {
            return this._value;
        }
        return this._value;
    }

    fromBson(data: any, createFactory?: CreateFactoryType) {
        this._value = data;
    }
}

export class SFlagsType<ENUM_TYPE, V extends number = number> implements STypeBase {
    private _raw_value: number = 0;
    private _enumObj: object;

    constructor(enumObj) {
        this._enumObj = enumObj;
    }

    get(): number {
        return this._raw_value;
    }

    set(...values: number[]) {
        this._raw_value = 0;
        if(values.length > 0) {
            for(var item of values) {
                this._raw_value |= item;
            }
        }
    }

    getList(): ENUM_TYPE[] {
        let outArr: ENUM_TYPE[] = [];

        if(this._enumObj) {
            Object.keys(this._enumObj).forEach(((value, index) => {
                if (this._raw_value & this._enumObj[value]) {
                    outArr.push(this._enumObj[value]);
                }
            }));
        }

        return outArr;
    }

    toBson(): any {
        return new BSON.Int32(this._raw_value);
    }

    fromBson(data: any, createFactory?: CreateFactoryType) {
        this._raw_value = data;
    }
}

export class Serializable implements STypeBase {
    private _serializableName: string;
    private _serializableVerUID: BigInteger; // bigint
    private _serializableMembers: { [key: string]: Field; } = {};

    constructor(serializableName: string, serializableVerUID: number | BigInteger) {
        this._serializableName = serializableName;
        if(typeof serializableVerUID === 'number')
            this._serializableVerUID = bigInt(serializableVerUID);
        else
            this._serializableVerUID = serializableVerUID;
    }

    serializableMapMember(name: string, obj: STypeBase) : SerializableMapMemberConfigurer {
        let meta = this._serializableMembers[name] = {
            name: name,
            obj: obj,
            createFactory: undefined
        };
        return new SerializableMapMemberConfigurer(meta);
    }

    toBson(): any {
        let doc = {
            '@jsbsonrpcsname': this._serializableName,
            '@jsbsonrpcsver': bigIntToLong(this._serializableVerUID)
        };
        for(var key in this._serializableMembers) {
            var item = this._serializableMembers[key];
            doc[key] = item.obj.toBson();
        }
        return doc;
    }

    fromBson(bson: any): void {
        delete bson['@jsbsonrpcsname'];
        delete bson['@jsbsonrpcsver'];

        for(var key in this._serializableMembers) {
            var item = this._serializableMembers[key];
            var value = bson[key];
            if(value) {
                item.obj.fromBson(value, item.createFactory);
                delete bson[key];
            }
        }
    }

    serialize(): Buffer {
        return BSON.serialize(this.toBson());
    }

    deserialize(payload: Buffer): void {
        let bson = BSON.deserialize(payload);
        this.fromBson(bson);
    }
}
