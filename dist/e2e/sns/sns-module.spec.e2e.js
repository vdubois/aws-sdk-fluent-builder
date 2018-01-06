"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SNS = require("aws-sdk/clients/sns");
var sns_builder_1 = require("../../src/builders/sns/sns.builder");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
var topicName = 'sns-topic-e2e';
describe('SNS Module', function () {
    var originalTimeout;
    /**
     * Sets timeout to 30s.
     */
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    });
    describe('createIfNotExists function', function () {
        it('should create topic if it does not exist', function (done) {
            // GIVEN
            var sns = new sns_builder_1.SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            deleteTopicIfExist()
                .then(function () { return sns.publishMessage({}); })
                .then(function () { return listTopics(); })
                .then(function (topics) {
                // THEN
                var topicFound = topics.some(function (topic) { return topic.TopicArn.indexOf(topicName) !== -1; });
                expect(topicFound).toBe(true);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should not throw an error if topic already exist', function (done) {
            // GIVEN
            var sns = new sns_builder_1.SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            createTopicIfNotExist()
                .then(function () { return sns.publishMessage({}); })
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
});
var deleteTopicIfExist = function () {
    var snsClient = new SNS({ region: process.env.AWS_REGION });
    return snsClient.listTopics({}).promise()
        .then(function (results) { return results.Topics; })
        .then(function (topics) {
        if (topics.some(function (topic) { return topic.TopicArn.indexOf(topicName) !== -1; })) {
            return snsClient.deleteTopic({
                TopicArn: topics.find(function (topic) { return topic.TopicArn.indexOf(topicName) !== -1; }).TopicArn
            }).promise();
        }
        else {
            return Promise.resolve({});
        }
    });
};
var listTopics = function () {
    var snsClient = new SNS({ region: process.env.AWS_REGION });
    return snsClient.listTopics({}).promise()
        .then(function (results) { return results.Topics; });
};
var createTopicIfNotExist = function () {
    var snsClient = new SNS({ region: process.env.AWS_REGION });
    return snsClient.listTopics({}).promise()
        .then(function (results) { return results.Topics; })
        .then(function (topics) {
        if (topics.some(function (topic) { return topic.TopicArn.indexOf(topicName) !== -1; })) {
            return Promise.resolve({});
        }
        else {
            return snsClient.createTopic({
                Name: topicName
            }).promise();
        }
    });
};
//# sourceMappingURL=sns-module.spec.e2e.js.map