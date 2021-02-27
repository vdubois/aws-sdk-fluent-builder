import SNS = require('aws-sdk/clients/sns');
import { SnsBuilder } from '../../src/builders/sns/sns.builder';
import { deleteTopicIfExist } from '../clean-functions';

const topicName = 'sns-topic-e2e';

describe('SNS Module', () => {

    describe('createIfNotExists function', () => {

        it('should create topic if it does not exist', async done => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            await deleteTopicIfExist();

            try {
                // WHEN
                await sns.publishMessage({});
                const topics = await listTopics();

                // THEN
                const topicFound = topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1);
                expect(topicFound).toBe(true);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not throw an error if topic already exist', async done => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            await createTopicIfNotExist();

            try {
                // WHEN
                const result = await sns.publishMessage({});

                // THEN
                expect(result).not.toBeNull();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});

const listTopics = async (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    const {Topics} = await snsClient.listTopics({}).promise();
    return Topics;
};

const createTopicIfNotExist = async (): Promise<any> => {
    const snsClient = new SNS({region: process.env.AWS_REGION});
    const {Topics} = await snsClient.listTopics({}).promise();
    if (Topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1)) {
        return Promise.resolve({});
    } else {
        return snsClient.createTopic({
            Name: topicName
        }).promise();
    }
};
