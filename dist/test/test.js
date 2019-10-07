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
var Serializable_1 = require("../src/Serializable");
var big_integer_1 = __importDefault(require("big-integer"));
var buffer_1 = require("buffer");
var TestSubClassCommon = /** @class */ (function (_super) {
    __extends(TestSubClassCommon, _super);
    function TestSubClassCommon(serializableName, serializableVerUID) {
        if (serializableName === void 0) { serializableName = 'x'; }
        if (serializableVerUID === void 0) { serializableVerUID = 101; }
        return _super.call(this, serializableName, serializableVerUID) || this;
    }
    return TestSubClassCommon;
}(Serializable_1.Serializable));
var TestSubClassB = /** @class */ (function (_super) {
    __extends(TestSubClassB, _super);
    function TestSubClassB() {
        var _this = _super.call(this, 'testB', 101) || this;
        _this.a = new Serializable_1.SType();
        _this.b = new Serializable_1.SType();
        _this.sb = new Serializable_1.SType();
        _this.serializableMapMember("a", _this.a);
        _this.serializableMapMember("b", _this.b);
        return _this;
    }
    return TestSubClassB;
}(TestSubClassCommon));
var Test = /** @class */ (function (_super) {
    __extends(Test, _super);
    function Test() {
        var _this = _super.call(this, 'test', 101) || this;
        _this.a = new Serializable_1.SType();
        _this.b = new Serializable_1.SLongType();
        _this.d = new Serializable_1.SDoubleType();
        _this.e = new Serializable_1.SType(); // std::string
        _this.xa = new Serializable_1.SType(); // std::vector<char>
        _this.xb = new Serializable_1.SListType();
        _this.xc = new Serializable_1.SListType();
        _this.xd = new Serializable_1.SDoubleType(3.14);
        _this.xf = new Serializable_1.SRecordType();
        _this.sub = new Serializable_1.SType();
        _this.serializableMapMember('a', _this.a);
        _this.serializableMapMember('b', _this.b);
        _this.serializableMapMember('d', _this.d);
        _this.serializableMapMember('e', _this.e);
        _this.serializableMapMember('xa', _this.xa);
        _this.serializableMapMember('xb', _this.xb);
        _this.serializableMapMember('xc', _this.xc);
        _this.serializableMapMember('xd', _this.xd);
        _this.serializableMapMember('xf', _this.xf);
        _this.serializableMapMember('sub', _this.sub).setCreateFactory((function (serializableName, serializableVerUID) { return new TestSubClassB(); }));
        return _this;
    }
    return Test;
}(Serializable_1.Serializable));
var testA = new Test();
testA.a.set(0xff);
testA.b.set(big_integer_1.default('1000000000000002', 16));
testA.d.set(3.14);
testA.e.set("aaaa");
testA.xd.set(1.1);
testA.xa.set(buffer_1.Buffer.from('1234'));
testA.xb.push("hello");
testA.xb.push("world");
testA.xc.push(buffer_1.Buffer.from('111'));
testA.xc.push(buffer_1.Buffer.from('222'));
testA.xf["aaaa"] = "aaaa";
testA.xf["bbbb"] = "bbbb";
testA.xf["cccc"] = "c";
testA.xf["dd"] = "aae";
testA.xf["ee"] = "ad";
{
    var subObj = new TestSubClassB();
    subObj.a.set(10);
    subObj.b.set('SUB TEXT!');
    testA.sub.set(subObj);
}
var bson = testA.toBson();
var buf = testA.serialize();
console.log("bson : ", bson);
console.log("base64 : \n", buf.toString("base64"));
// BQEAAAJAanNic29ucnBjc25hbWUABQAAAHRlc3QAEkBqc2Jzb25ycGNzdmVyAGUAAAAAAAAAEGEA/wAAABJiAAIAAAAAAAAQAWQAH4XrUbgeCUACZQAFAAAAYWFhYQAFeGEABAAAAAAxMjM0BHhiAB8AAAACMAAGAAAAaGVsbG8AAjEABgAAAHdvcmxkAAAEeGMAGwAAAAUwAAMAAAAAMTExBTEAAwAAAAAyMjIAAXhkAJqZmZmZmfE/A3hmAEYAAAACYWFhYQAFAAAAYWFhYQACYmJiYgAFAAAAYmJiYgACY2NjYwACAAAAYwACZGQABAAAAGFhZQACZWUAAwAAAGFkAAAA
var decTestA = new Test();
decTestA.deserialize(buf);
{
    var buf2 = decTestA.serialize();
    console.log("base64(re serialized) : \n", buf.toString("base64"));
}
