"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SNS = require("aws-sdk/clients/sns");
class SnsProxy {
    constructor(sns, snsClient = new SNS({ region: process.env.AWS_REGION })) {
        this.sns = sns;
        this.snsClient = snsClient;
    }
    createIfNotExists() {
        return this.snsClient.listTopics().promise()
            .then(results => {
            if (results.Topics.some(topic => topic.TopicArn.indexOf(this.sns.topicName) !== -1)) {
                return Promise.resolve({});
            }
            else {
                return this.snsClient.createTopic({ Name: this.sns.topicName }).promise();
            }
        });
    }
    publishMessage(message) {
        return this.createIfNotExists()
            .then(() => this.sns.publishMessage(message));
    }
}
exports.SnsProxy = SnsProxy;
