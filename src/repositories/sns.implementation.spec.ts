import { SnsImplementation } from './sns.implementation';
import SNS = require('aws-sdk/clients/sns');

describe('SnsImplementation', () => {

    describe('publishMessage function', () => {

        it('should call publish function from aws sdk', done => {
            // GIVEN
            const mockedSns = new SNS();
            spyOn(mockedSns, 'createTopic').and.returnValue({
                promise: () => Promise.resolve({})
            });
            spyOn(mockedSns, 'publish').and.returnValue({
                promise: () => Promise.resolve({})
            });

            // WHEN
            const sns = new SnsImplementation('test', mockedSns);
            sns.publishMessage({test2: 'value2'})
                .then(() => {
                    // THEN
                    expect(mockedSns.createTopic).toHaveBeenCalledTimes(0);
                    expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                    expect(mockedSns.publish).toHaveBeenCalledWith({Message: JSON.stringify({test2: 'value2'})});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});