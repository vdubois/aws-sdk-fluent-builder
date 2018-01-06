"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SNS = require("aws-sdk/clients/sns");
var SnsProxy = /** @class */ (function () {
    function SnsProxy(sns, snsClient) {
        if (snsClient === void 0) { snsClient = new SNS({ region: process.env.AWS_REGION }); }
        this.sns = sns;
        this.snsClient = snsClient;
    }
    SnsProxy.prototype.createIfNotExists = function () {
        var _this = this;
        return this.snsClient.listTopics().promise()
            .then(function (results) {
            if (results.Topics.some(function (topic) { return topic.TopicArn.indexOf(_this.sns.topicName) !== -1; })) {
                return Promise.resolve({});
            }
            else {
                return _this.snsClient.createTopic({ Name: _this.sns.topicName }).promise();
            }
        });
    };
    SnsProxy.prototype.publishMessage = function (message) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.sns.publishMessage(message); });
    };
    return SnsProxy;
}());
exports.SnsProxy = SnsProxy;
//# sourceMappingURL=sns.proxy.js.map