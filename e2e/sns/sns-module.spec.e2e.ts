import SNS = require('aws-sdk/clients/sns');
import { SnsBuilder } from '../../src/builders/sns/sns.builder';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
const topicName = 'sns-topic-e2e';

describe('SNS Module', () => {

    let originalTimeout;

    /**
     * Sets timeout to 30s.
     */
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    });

    describe('createIfNotExists function', () => {

        it('should create topic if it does not exist', done => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            deleteTopicIfExist()
                // WHEN
                .then(() => sns.publishMessage({}))
                .then(() => listTopics())
                .then(topics => {
                    // THEN
                    const topicFound = topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1);
                    expect(topicFound).toBe(true);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not throw an error if topic already exist', done => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            createTopicIfNotExist()
                // WHEN
                .then(() => sns.publishMessage({}))
                .then(result => {
                    // THEN
                    expect(result).not.toBeNull();
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});

const deleteTopicIfExist = (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    return snsClient.listTopics({}).promise()
        .then(results => results.Topics)
        .then(topics => {
            if (topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1)) {
                return snsClient.deleteTopic({
                    TopicArn: topics.find(topic => topic.TopicArn.indexOf(topicName) !== -1).TopicArn
                }).promise();
            } else {
                return Promise.resolve({});
            }
        });
};

const listTopics = (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    return snsClient.listTopics({}).promise()
        .then(results => results.Topics);
};

const createTopicIfNotExist = (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    return snsClient.listTopics({}).promise()
        .then(results => results.Topics)
        .then(topics => {
            if (topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1)) {
                return Promise.resolve({});
            } else {
                return snsClient.createTopic({
                    Name: topicName
                }).promise();
            }
        });
};
