"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sns_proxy_1 = require("../../repositories/sns/sns.proxy");
const sns_implementation_1 = require("../../repositories/sns/sns.implementation");
class SnsBuilder {
    constructor() {
        this.mustCreateBeforeUse = false;
    }
    withTopicName(topicName) {
        this.topicName = topicName;
        return this;
    }
    createIfNotExists() {
        this.mustCreateBeforeUse = true;
        return this;
    }
    build() {
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
    }
}
exports.SnsBuilder = SnsBuilder;
