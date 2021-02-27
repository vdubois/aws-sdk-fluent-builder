import { S3ConfigurationService } from './s3-configuration.service';
import { S3 } from 'aws-sdk';

describe('S3ConfigurationService', () => {

    describe('get function', () => {

        it('should get a value from configuration', async (done) => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({key: 'value'}))})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try {
                // WHEN
                const value = await configurationService.get('key');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            } catch (exception) {
                expect(exception).toBeNull();
                done();
            }
        });

        it('should get a value from an overriden configuration', async (done) => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({key: 'value'}))})
            }));
            const uploadMock = jest.fn((params: any) => ({
                promise: () => Promise.resolve({})
            }));
            const waitForMock = jest.fn(() => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                getObject: getObjectMock,
                upload: uploadMock,
                waitFor: waitForMock
            };
            const configurationService = new S3ConfigurationService(
                // @ts-ignore
                'toto', 'config.json', {we: `don't care`}, false, mockedS3);

            try {
                // WHEN
                const value = await configurationService.get('key');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                expect(getObjectMock).toHaveBeenCalledTimes(1);
                expect(uploadMock).toHaveBeenCalledTimes(1);
                expect(uploadMock).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'config.json',
                    Body: JSON.stringify({we: `don't care`}, null, 2)
                });
                done();
            } catch (exception) {
                expect(exception).toBeNull();
                done();
            }
        });

        it('should throw an error if a key does not exist', async (done) => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({}))})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try {
                // WHEN
                const value = await configurationService.get('key');
                expect(value).toBeNull();
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual(`No key 'key' present in configuration`);
                done();
            }
        });

        it('should load remote file just one time when requesting keys', async (done) => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({key: 'value'}))})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try { // WHEN
                await configurationService.get('key');
                const value = await configurationService.get('key');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            } catch (exception) {
                expect(exception).toBeNull();
                done();
            }
        });

        it('should throw an error if file does not exist in bucket', async done => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.reject({})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try {
                // WHEN
                await configurationService.get('key');
                // THEN
                fail('we should never reach here because config file does not exist in bucket');
                done();
            } catch (exception) {
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            }
        });

    });

    describe('all function', () => {

        it('should get all values from configuration', async done => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({key: 'value', key2: 'value'}))})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try {
                // WHEN
                const value = await configurationService.all();
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual({key: 'value', key2: 'value'});
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            } catch (exception) {
                expect(exception).toBeNull();
                done();
            }
        });

        it('should get all values from an overriden configuration', async done => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({key: 'value'}))})
            }));
            const uploadMock = jest.fn((params: any) => ({
                promise: () => Promise.resolve({})
            }));
            const waitForMock = jest.fn(() => ({
                promise: () => Promise.resolve({})
            }));
            const mockedS3 = {
                getObject: getObjectMock,
                upload: uploadMock,
                waitFor: waitForMock
            };
            const configurationService = new S3ConfigurationService(
                // @ts-ignore
                'toto', 'config.json', {we: `don't care`}, false, mockedS3);

            try {
                // WHEN
                const values = await configurationService.all();
                // THEN
                expect(values).not.toBeNull();
                expect(getObjectMock).toHaveBeenCalledTimes(1);
                expect(uploadMock).toHaveBeenCalledTimes(1);
                expect(uploadMock).toHaveBeenCalledWith({
                    Bucket: 'toto',
                    Key: 'config.json',
                    Body: JSON.stringify({we: `don't care`}, null, 2)
                });
                done();
            } catch (exception) {
                expect(exception).toBeNull();
                done();
            }
        });

        it('should load remote file just one time when requesting configuration', async done => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.resolve({Body: Buffer.from(JSON.stringify({key: 'value'}))})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try { // WHEN
                await configurationService.all();
                const value = await configurationService.all();
                // THEN
                expect(value).not.toBeNull();
                expect(mockedS3.getObject).toHaveBeenCalledTimes(1);
                done();
            } catch (exception) {
                expect(exception).toBeNull();
                done();
            }
        });

        it('should throw an error if file does not exist in bucket', async done => {
            // GIVEN
            const getObjectMock = jest.fn((params: S3.Types.GetObjectRequest) => ({
                promise: () => Promise.reject({})
            }));
            const mockedS3 = {
                getObject: getObjectMock
            };
            // @ts-ignore
            const configurationService = new S3ConfigurationService('toto', 'config.json', undefined, false, mockedS3);

            try { // WHEN
                await configurationService.all();
                // THEN
                fail('we should never reach here because config file does not exist in bucket');
                done();
            } catch (exception) {
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            }
        });
    });
});
