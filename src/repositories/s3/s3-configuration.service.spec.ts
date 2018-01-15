import { S3ConfigurationService } from './s3-configuration.service';

describe('S3ConfigurationService', () => {

    describe('get function', () => {

        it('should get a value from configuration', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            const configurationService = new S3ConfigurationService(
                'toto', 'config.json', undefined, false, mockedS3);

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

        it('should get a value from an overriden configuration', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject', 'upload', 'waitFor']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.waitFor.and.returnValue({
                promise: () => Promise.resolve()
            });
            const configurationService = new S3ConfigurationService(
                'toto', 'config.json', {we: `don't care`}, false, mockedS3);

            // WHEN
            configurationService.get('key')
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                    expect(mockedS3.upload).toHaveBeenCalledTimes(1);
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'config.json',
                        Body: JSON.stringify({we: `don't care`}, null, 2)
                    });
                    done();
                })
                .catch(exception => {
                    expect(exception).toBeNull();
                    done();
                });
        });

        it('should throw an error if a key does not exist', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

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
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

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

        it('should throw an error if file does not exist in bucket', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.reject({})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            // WHEN
            configurationService.get('key')
                .then(() => configurationService.get('key'))
                .then(value => {
                    // THEN
                    fail('we should never reach here because config file does not exist in bucket');
                    done();
                })
                .catch(exception => {
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('config.json file does not exist in bucket');
                    done();
                });
        });

    });

    describe('all function', () => {

        it('should get all values from configuration', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value', key2: 'value'}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            // WHEN
            configurationService.all()
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual({key: 'value', key2: 'value'});
                    expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                    done();
                })
                .catch(exception => {
                    expect(exception).toBeNull();
                    done();
                });
        });

        it('should get all values from an overriden configuration', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject', 'upload', 'waitFor']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            mockedS3.upload.and.returnValue({
                promise: () => Promise.resolve({})
            });
            mockedS3.waitFor.and.returnValue({
                promise: () => Promise.resolve()
            });
            const configurationService = new S3ConfigurationService(
                'toto', 'config.json', {we: `don't care`}, false, mockedS3);

            // WHEN
            configurationService.all()
                .then(values => {
                    // THEN
                    expect(values).not.toBeNull();
                    expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                    expect(mockedS3.upload).toHaveBeenCalledTimes(1);
                    expect(mockedS3.upload).toHaveBeenCalledWith({
                        Bucket: 'toto',
                        Key: 'config.json',
                        Body: JSON.stringify({we: `don't care`}, null, 2)
                    });
                    done();
                })
                .catch(exception => {
                    expect(exception).toBeNull();
                    done();
                });
        });

        it('should load remote file just one time when requesting configuration', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.resolve({Body: new Buffer(JSON.stringify({key: 'value'}))})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            // WHEN
            configurationService.all()
                .then(() => configurationService.all())
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                    done();
                })
                .catch(exception => {
                    expect(exception).toBeNull();
                    done();
                });
        });

        it('should throw an error if file does not exist in bucket', done => {
            // GIVEN
            const mockedS3 = jasmine.createSpyObj('S3', ['getObject']);
            mockedS3.getObject.and.returnValue({
                promise: () => Promise.reject({})
            });
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            // WHEN
            configurationService.all()
                .then(() => configurationService.all())
                .then(value => {
                    // THEN
                    fail('we should never reach here because config file does not exist in bucket');
                    done();
                })
                .catch(exception => {
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('config.json file does not exist in bucket');
                    done();
                });
        });
    });
});
