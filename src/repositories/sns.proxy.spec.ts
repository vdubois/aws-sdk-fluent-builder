import { SnsProxy } from './sns.proxy';
import { SnsImplementation } from './sns.implementation';
import SNS = require('aws-sdk/clients/sns');

describe('SnsProxy', () => {

    describe('publishMessage function', () => {

        it('should call publish function from aws sdk after calling topic creation', done => {
            // GIVEN
            const mockedSns = new SNS();
            spyOn(mockedSns, 'createTopic').and.returnValue({
                promise: () => Promise.resolve({})
            });
            spyOn(mockedSns, 'publish').and.returnValue({
                promise: () => Promise.resolve({})
            });

            // WHEN
            const sns = new SnsProxy(new SnsImplementation('test', mockedSns), mockedSns);
            sns.publishMessage({test: 'value'})
                .then(() => {
                    // THEN
                    expect(mockedSns.createTopic).toHaveBeenCalledTimes(1);
                    expect(mockedSns.createTopic).toHaveBeenCalledWith({Name: 'test'});
                    expect(mockedSns.publish).toHaveBeenCalledTimes(1);
                    expect(mockedSns.publish).toHaveBeenCalledWith({Message: JSON.stringify({test: 'value'})});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});
