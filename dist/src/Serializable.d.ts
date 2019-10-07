import { Buffer } from 'buffer';
import { BigInteger } from 'big-integer';
export declare type CreateFactoryType = (serializableName: string, serializableVerUID: BigInteger) => Serializable;
interface Field {
    name: string;
    obj: STypeBase;
    createFactory?: CreateFactoryType;
}
export declare class SerializableMapMemberConfigurer {
    meta: Field;
    constructor(meta: Field);
    setCreateFactory(callback: CreateFactoryType): SerializableMapMemberConfigurer;
}
interface STypeBase {
    toBson(): any;
    fromBson(data: any, createFactory?: CreateFactoryType): void;
}
export declare class SType<T extends STypeBase | number | string | boolean | number[] | string[] | boolean[] | Buffer> implements STypeBase {
    private _value;
    constructor(value?: T);
    get(): T;
    ref(): T;
    set(value: T): void;
    toBson(): any;
    fromBson(data: any, createFactory?: CreateFactoryType): void;
}
export declare class SLongType implements STypeBase {
    private _value;
    constructor(value?: BigInteger | string | number, radix?: number);
    get(): BigInteger;
    set(value: BigInteger): void;
    toBson(): any;
    fromBson(data: any): void;
}
export declare class SDoubleType implements STypeBase {
    private _value;
    constructor(value?: number);
    get(): number;
    set(value: number): void;
    toBson(): any;
    fromBson(data: any): void;
}
export declare class SListType<T extends STypeBase | number | string | boolean | Buffer> extends Array<T> implements STypeBase {
    constructor();
    toBson(): any;
    fromBson(data: any, createFactory?: CreateFactoryType): void;
}
export declare class SRecordType<K extends string, V extends STypeBase | number | string | boolean | Buffer> extends Object implements STypeBase {
    constructor();
    toBson(): any;
    fromBson(data: any): void;
}
export declare class Serializable implements STypeBase {
    private _serializableName;
    private _serializableVerUID;
    private _serializableMembers;
    constructor(serializableName: string, serializableVerUID: number | BigInteger);
    serializableMapMember(name: string, obj: STypeBase): SerializableMapMemberConfigurer;
    toBson(): any;
    fromBson(bson: any): void;
    serialize(): Buffer;
    deserialize(payload: Buffer): void;
}
export {};
//# sourceMappingURL=Serializable.d.ts.map