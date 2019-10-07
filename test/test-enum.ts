import {
    Serializable,
    SType,
    SLongType,
    SDoubleType,
    SListType,
    SRecordType,
    SEnumType,
    SFlagsType
} from '../src/Serializable';

enum TestType {
    A = 0,
    B = 1,
    C = 2,
    D = 3
}

enum TestFlags {
    A = 0x0001,
    B = 0x0002,
    C = 0x0004,
    D = 0x0008
}

class TestEnum extends Serializable {
    a: SEnumType<TestType, number> = new SEnumType<TestType, number>(TestType);
    b: SFlagsType<TestFlags, number> = new SFlagsType<TestFlags, number>(TestFlags);

    constructor() {
        super('test', 101);

        this.serializableMapMember('a', this.a);
        this.serializableMapMember('b', this.b);
    }
}

let test: TestEnum = new TestEnum();

test.a.set(TestType.A);
test.b.set(TestFlags.A, TestFlags.B);

console.log("a.get : " + test.a.get());
console.log("b.get : " + test.b.get());
console.log("b.getList : " + test.b.getList());

let bson = test.toBson();
let buf = test.serialize();

console.log("bson : ", bson);
console.log("base64 : \n", buf.toString("base64"));
