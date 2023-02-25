import {expect, test, describe} from 'vitest';
import {SnsBuilder} from '../../src/builders/sns/sns.builder';
import {deleteTopicIfExist} from '../clean-functions';
import {CreateTopicCommand, ListTopicsCommand, SNSClient} from '@aws-sdk/client-sns';

const topicName = 'sns-topic-e2e';

describe('SNS Module', () => {

    describe('createIfNotExists function', () => {

        test('should create topic if it does not exist', async () => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            await deleteTopicIfExist();

            // WHEN
            await sns.publishMessage({});
            const topics = await listTopics();

            // THEN
            const topicFound = topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1);
            expect(topicFound).toBe(true);
        });

        test('should not throw an error if topic already exist', async () => {
            // GIVEN
            const sns = new SnsBuilder()
                .withTopicName(topicName)
                .createIfNotExists()
                .build();
            await createTopicIfNotExist();

            // WHEN
            const result = await sns.publishMessage({});

            // THEN
            expect(result).not.toBeNull();
        });
    });
});

const listTopics = async (): Promise<any> => {
    const snsClient = new SNSClient({region: process.env.AWS_REGION});
    const {Topics} = await snsClient.send(new ListTopicsCommand({}));
    return Topics;
};

const createTopicIfNotExist = async (): Promise<any> => {
    const snsClient = new SNSClient({region: process.env.AWS_REGION});
    const {Topics} = await snsClient.send(new ListTopicsCommand({}));
    if (Topics.some(topic => topic.TopicArn.indexOf(topicName) !== -1)) {
        return Promise.resolve({});
    } else {
        return snsClient.send(new CreateTopicCommand({
            Name: topicName
        }));
    }
};
