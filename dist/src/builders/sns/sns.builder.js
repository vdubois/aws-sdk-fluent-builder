"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sns_proxy_1 = require("../../repositories/sns/sns.proxy");
var sns_implementation_1 = require("../../repositories/sns/sns.implementation");
var SnsBuilder = /** @class */ (function () {
    function SnsBuilder() {
        this.mustCreateBeforeUse = false;
    }
    SnsBuilder.prototype.withTopicName = function (topicName) {
        this.topicName = topicName;
        return this;
    };
    SnsBuilder.prototype.createIfNotExists = function () {
        this.mustCreateBeforeUse = true;
        return this;
    };
    SnsBuilder.prototype.build = function () {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.topicName) {
            throw new Error('Topic name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new sns_proxy_1.SnsProxy(new sns_implementation_1.SnsImplementation(this.topicName));
        }
        return new sns_implementation_1.SnsImplementation(this.topicName);
    };
    return SnsBuilder;
}());
exports.SnsBuilder = SnsBuilder;
//# sourceMappingURL=sns.builder.js.map