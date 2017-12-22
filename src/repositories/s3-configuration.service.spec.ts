import { S3ConfigurationService } from './s3-configuration.service';
import S3 = require('aws-sdk/clients/s3');

describe('S3ConfigurationService', () => {

    describe('get function', () => {

        it('should get a value from configuration', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', mockedS3);

            // WHEN
            configurationService.get('key')
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                    done();
                })
                .catch(exception => {
                    expect(exception).toBeNull();
                    done();
                });
        });

        it('should throw an error if a key does not exist', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', mockedS3);

            // WHEN
            configurationService.get('key')
                .then(value => {
                    expect(value).toBeNull();
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual(`No key 'key' present in configuration`);
                    done();
                });
        });

        it('should load remote file just one time when requesting keys', done => {
            // GIVEN
            const mockedS3 = new S3();
            spyOn(mockedS3, 'getObject').and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', mockedS3);

            // WHEN
            configurationService.get('key')
                .then(() => configurationService.get('key'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                    done();
                })
                .catch(exception => {
                    expect(exception).toBeNull();
                    done();
                });
        });
    });
});