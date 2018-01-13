"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SNS = require("aws-sdk/clients/sns");
class SnsImplementation {
    constructor(_topicName, snsClient = new SNS({ region: process.env.AWS_REGION })) {
        this._topicName = _topicName;
        this.snsClient = snsClient;
    }
    publishMessage(message) {
        return this.findTopicArn()
            .then(topicArn => this.snsClient.publish({
            TopicArn: topicArn,
            Message: JSON.stringify(message)
        }).promise());
    }
    findTopicArn() {
        return this.snsClient.listTopics().promise()
            .then(results => results.Topics.find(topic => topic.TopicArn.indexOf(this._topicName) !== -1))
            .then(topic => topic.TopicArn);
    }
    get topicName() {
        return this._topicName;
    }
}
exports.SnsImplementation = SnsImplementation;
