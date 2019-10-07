import {
    Serializable,
    SType,
    SLongType,
    SDoubleType,
    SListType,
    SRecordType
} from '../src/Serializable';
import bigInt from 'big-integer'
import {Buffer} from 'buffer'

class TestSubClassCommon extends Serializable {
    constructor(serializableName: string = 'x', serializableVerUID: number | bigInt.BigInteger = 101) {
        super(serializableName, serializableVerUID);
    }
}

class TestSubClassB extends TestSubClassCommon {
    a: SType<number> = new SType<number>();
    b: SType<string> = new SType<string>();
    sb: SType<string> = new SType<string>();

    constructor() {
        super('testB', 101);

        this.serializableMapMember("a", this.a);
        this.serializableMapMember("b", this.b);
    }
}

class Test extends Serializable {
    a: SType<number> = new SType<number>();
    b: SLongType = new SLongType();
    d: SDoubleType = new SDoubleType();
    e: SType<string> = new SType<string>(); // std::string
    xa: SType<Buffer> = new SType<Buffer>(); // std::vector<char>
    xb: SListType<string> = new SListType<string>();
    xc: SListType<Buffer> = new SListType<Buffer>();
    xd: SDoubleType = new SDoubleType(3.14);
    xf: SRecordType<string, string> = new SRecordType<string, string>();

    sub: SType<TestSubClassCommon> = new SType<TestSubClassCommon>();

    constructor() {
        super('test', 101);

        this.serializableMapMember('a', this.a);
        this.serializableMapMember('b', this.b);
        this.serializableMapMember('d', this.d);
        this.serializableMapMember('e', this.e);
        this.serializableMapMember('xa', this.xa);
        this.serializableMapMember('xb', this.xb);
        this.serializableMapMember('xc', this.xc);
        this.serializableMapMember('xd', this.xd);
        this.serializableMapMember('xf', this.xf);
        this.serializableMapMember('sub', this.sub).setCreateFactory(((serializableName, serializableVerUID) => new TestSubClassB()));
    }
}

let testA: Test = new Test();

testA.a.set(0xff);
testA.b.set(bigInt('1000000000000002', 16));
testA.d.set(3.14);
testA.e.set("aaaa");
testA.xd.set(1.1);

testA.xa.set(Buffer.from('1234'));
testA.xb.push("hello");
testA.xb.push("world");

testA.xc.push(Buffer.from('111'));
testA.xc.push(Buffer.from('222'));

testA.xf["aaaa"] = "aaaa";
testA.xf["bbbb"] = "bbbb";
testA.xf["cccc"] = "c";
testA.xf["dd"] = "aae";
testA.xf["ee"] = "ad";

{
    let subObj: TestSubClassB = new TestSubClassB();
    subObj.a.set(10);
    subObj.b.set('SUB TEXT!');
    testA.sub.set(subObj);
}

let bson = testA.toBson();
let buf = testA.serialize();

console.log("bson : ", bson);
console.log("base64 : \n", buf.toString("base64"));
// BQEAAAJAanNic29ucnBjc25hbWUABQAAAHRlc3QAEkBqc2Jzb25ycGNzdmVyAGUAAAAAAAAAEGEA/wAAABJiAAIAAAAAAAAQAWQAH4XrUbgeCUACZQAFAAAAYWFhYQAFeGEABAAAAAAxMjM0BHhiAB8AAAACMAAGAAAAaGVsbG8AAjEABgAAAHdvcmxkAAAEeGMAGwAAAAUwAAMAAAAAMTExBTEAAwAAAAAyMjIAAXhkAJqZmZmZmfE/A3hmAEYAAAACYWFhYQAFAAAAYWFhYQACYmJiYgAFAAAAYmJiYgACY2NjYwACAAAAYwACZGQABAAAAGFhZQACZWUAAwAAAGFkAAAA

let decTestA: Test = new Test();

decTestA.deserialize(buf);

{
    let buf2 = decTestA.serialize();
    console.log("base64(re serialized) : \n", buf.toString("base64"));
}
