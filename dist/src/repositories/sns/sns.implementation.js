"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SNS = require("aws-sdk/clients/sns");
var SnsImplementation = /** @class */ (function () {
    function SnsImplementation(_topicName, snsClient) {
        if (snsClient === void 0) { snsClient = new SNS({ region: process.env.AWS_REGION }); }
        this._topicName = _topicName;
        this.snsClient = snsClient;
    }
    SnsImplementation.prototype.publishMessage = function (message) {
        var _this = this;
        return this.findTopicArn()
            .then(function (topicArn) { return _this.snsClient.publish({
            TopicArn: topicArn,
            Message: JSON.stringify(message)
        }).promise(); });
    };
    SnsImplementation.prototype.findTopicArn = function () {
        var _this = this;
        return this.snsClient.listTopics().promise()
            .then(function (results) { return results.Topics.find(function (topic) { return topic.TopicArn.indexOf(_this._topicName) !== -1; }); })
            .then(function (topic) { return topic.TopicArn; });
    };
    Object.defineProperty(SnsImplementation.prototype, "topicName", {
        get: function () {
            return this._topicName;
        },
        enumerable: true,
        configurable: true
    });
    return SnsImplementation;
}());
exports.SnsImplementation = SnsImplementation;
//# sourceMappingURL=sns.implementation.js.map