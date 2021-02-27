import { SnsProxy } from './sns.proxy';
import { SnsImplementation } from './sns.implementation';
import { SNS } from 'aws-sdk';

describe('SnsProxy', () => {

    describe('publishMessage function', () => {

        it('should call publish function from aws sdk after calling topic creation and topic does not exist', async done => {
            // GIVEN
            const listTopicsMock = jest.fn();
            listTopicsMock.mockImplementationOnce((params: SNS.Types.ListTopicsInput) => ({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'arn'}]})
            }));
            listTopicsMock.mockImplementationOnce((params: SNS.Types.ListTopicsInput) => ({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'arn'}, {TopicArn: 'test'}]})
            }));
            const createTopicMock = jest.fn((params: SNS.Types.CreateTopicInput) => ({
                promise: () => Promise.resolve({})
            }));
            const publishMock = jest.fn((params: SNS.Types.PublishInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedSns = {
                listTopics: listTopicsMock,
                createTopic: createTopicMock,
                publish: publishMock,
            };

            // WHEN
            // @ts-ignore
            const sns = new SnsProxy(new SnsImplementation('test', mockedSns), mockedSns);
            try {
                await sns.publishMessage({test: 'value'});
                // THEN
                expect(listTopicsMock).toHaveBeenCalledTimes(2);
                expect(createTopicMock).toHaveBeenCalledTimes(1);
                expect(createTopicMock).toHaveBeenCalledWith({Name: 'test'});
                expect(publishMock).toHaveBeenCalledTimes(1);
                expect(publishMock).toHaveBeenCalledWith({
                    TopicArn: 'test',
                    Message: JSON.stringify({test: 'value'})
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should call publish function from aws sdk after calling topic creation and topic does exist', async done => {
            // GIVEN
            const listTopicsMock = jest.fn((params: SNS.Types.ListTopicsInput) => ({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'test'}]})
            }));
            const createTopicMock = jest.fn((params: SNS.Types.CreateTopicInput) => ({
                promise: () => Promise.resolve({})
            }));
            const publishMock = jest.fn((params: SNS.Types.PublishInput) => ({
                promise: () => Promise.resolve({})
            }));
            const mockedSns = {
                listTopics: listTopicsMock,
                createTopic: createTopicMock,
                publish: publishMock,
            };

            // WHEN
            // @ts-ignore
            const sns = new SnsProxy(new SnsImplementation('test', mockedSns), mockedSns);
            try {
                await sns.publishMessage({test: 'value'});
                // THEN
                expect(listTopicsMock).toHaveBeenCalledTimes(2);
                expect(createTopicMock).toHaveBeenCalledTimes(0);
                expect(publishMock).toHaveBeenCalledTimes(1);
                expect(publishMock).toHaveBeenCalledWith({
                    TopicArn: 'test',
                    Message: JSON.stringify({test: 'value'})
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
