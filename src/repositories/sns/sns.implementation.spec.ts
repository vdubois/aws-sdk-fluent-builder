import { SnsImplementation } from './sns.implementation';
import { SNS } from 'aws-sdk';

describe('SnsImplementation', () => {

    describe('publishMessage function', () => {

        it('should call publish function from aws sdk', async done => {
            // GIVEN
            const listTopicsMock = jest.fn((params: SNS.Types.ListTopicsInput) => ({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'test-arn'}]})
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
            const sns = new SnsImplementation('test', mockedSns);
            try {
                await sns.publishMessage({test2: 'value2'});
                // THEN
                expect(listTopicsMock).toHaveBeenCalledTimes(1);
                expect(createTopicMock).toHaveBeenCalledTimes(0);
                expect(publishMock).toHaveBeenCalledTimes(1);
                expect(publishMock).toHaveBeenCalledWith({
                    TopicArn: 'test-arn',
                    Message: JSON.stringify({test2: 'value2'})
                });
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});
