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
Object.defineProperty(exports, "__esModule", { value: true });
var Serializable_1 = require("../src/Serializable");
var TestType;
(function (TestType) {
    TestType[TestType["A"] = 0] = "A";
    TestType[TestType["B"] = 1] = "B";
    TestType[TestType["C"] = 2] = "C";
    TestType[TestType["D"] = 3] = "D";
})(TestType || (TestType = {}));
var TestFlags;
(function (TestFlags) {
    TestFlags[TestFlags["A"] = 1] = "A";
    TestFlags[TestFlags["B"] = 2] = "B";
    TestFlags[TestFlags["C"] = 4] = "C";
    TestFlags[TestFlags["D"] = 8] = "D";
})(TestFlags || (TestFlags = {}));
var TestEnum = /** @class */ (function (_super) {
    __extends(TestEnum, _super);
    function TestEnum() {
        var _this = _super.call(this, 'test', 101) || this;
        _this.a = new Serializable_1.SEnumType(TestType);
        _this.b = new Serializable_1.SFlagsType(TestFlags);
        _this.serializableMapMember('a', _this.a);
        _this.serializableMapMember('b', _this.b);
        return _this;
    }
    return TestEnum;
}(Serializable_1.Serializable));
var test = new TestEnum();
test.a.set(TestType.A);
test.b.set(TestFlags.A, TestFlags.B);
console.log("a.get : " + test.a.get());
console.log("b.get : " + test.b.get());
console.log("b.getList : " + test.b.getList());
var bson = test.toBson();
var buf = test.serialize();
console.log("bson : ", bson);
console.log("base64 : \n", buf.toString("base64"));
