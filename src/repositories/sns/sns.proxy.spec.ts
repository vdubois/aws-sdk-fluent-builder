import { SnsProxy } from './sns.proxy';
import { SnsImplementation } from './sns.implementation';

describe('SnsProxy', () => {

    describe('publishMessage function', () => {

        it('should call publish function from aws sdk after calling topic creation and topic does not exist', async done => {
            // GIVEN
            const mockedSns = jasmine.createSpyObj('SNS', ['listTopics', 'createTopic', 'publish']);
            mockedSns.listTopics.and.returnValues({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'arn'}]})
            }, {
                promise: () => Promise.resolve({Topics: [{TopicArn: 'arn'}, {TopicArn: 'test'}]})
            });
            mockedSns.createTopic.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedSns.publish.and.returnValue({
                promise: () => Promise.resolve({})
            });

            // WHEN
            const sns = new SnsProxy(new SnsImplementation('test', mockedSns), mockedSns);
            try {
                await sns.publishMessage({test: 'value'});
                // THEN
                expect(mockedSns.listTopics).toHaveBeenCalledTimes(2);
                expect(mockedSns.createTopic).toHaveBeenCalledTimes(1);
                expect(mockedSns.createTopic).toHaveBeenCalledWith({Name: 'test'});
                expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                expect(mockedSns.publish).toHaveBeenCalledWith({
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
            const mockedSns = jasmine.createSpyObj('SNS', ['listTopics', 'createTopic', 'publish']);
            mockedSns.listTopics.and.returnValue({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'test'}]})
            });
            mockedSns.createTopic.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedSns.publish.and.returnValue({
                promise: () => Promise.resolve({})
            });

            // WHEN
            const sns = new SnsProxy(new SnsImplementation('test', mockedSns), mockedSns);
            try {
                await sns.publishMessage({test: 'value'});
                // THEN
                expect(mockedSns.listTopics).toHaveBeenCalledTimes(2);
                expect(mockedSns.createTopic).toHaveBeenCalledTimes(0);
                expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                expect(mockedSns.publish).toHaveBeenCalledWith({
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
