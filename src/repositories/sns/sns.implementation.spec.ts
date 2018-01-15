import { SnsImplementation } from './sns.implementation';

describe('SnsImplementation', () => {

    describe('publishMessage function', () => {

        it('should call publish function from aws sdk', done => {
            // GIVEN
            const mockedSns = jasmine.createSpyObj('SNS', ['listTopics', 'createTopic', 'publish']);
            mockedSns.listTopics.and.returnValue({
                promise: () => Promise.resolve({Topics: [{TopicArn: 'test-arn'}]})
            });
            mockedSns.createTopic.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedSns.publish.and.returnValue({
                promise: () => Promise.resolve({})
            });

            // WHEN
            const sns = new SnsImplementation('test', mockedSns);
            sns.publishMessage({test2: 'value2'})
                .then(() => {
                    // THEN
                    expect(mockedSns.listTopics).toHaveBeenCalledTimes(1);
                    expect(mockedSns.createTopic).toHaveBeenCalledTimes(0);
                    expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                    expect(mockedSns.publish).toHaveBeenCalledWith({
                        TopicArn: 'test-arn',
                        Message: JSON.stringify({test2: 'value2'})
                    });
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});
