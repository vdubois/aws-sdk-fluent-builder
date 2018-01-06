"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var jasmine_spec_reporter_1 = require("jasmine-spec-reporter");
var TypescriptProcessor = /** @class */ (function (_super) {
    __extends(TypescriptProcessor, _super);
    function TypescriptProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypescriptProcessor.prototype.displayJasmineStarted = function (info, log) {
        return "TypeScript " + log;
    };
    return TypescriptProcessor;
}(jasmine_spec_reporter_1.DisplayProcessor));
var jasmineReporters = require('jasmine-reporters');
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new jasmine_spec_reporter_1.SpecReporter({
    customProcessors: [TypescriptProcessor]
}));
//# sourceMappingURL=reporter.js.map