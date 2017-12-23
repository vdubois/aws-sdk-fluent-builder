import { S3Builder } from '../../src/builders/s3/s3.builder';
import S3 = require('aws-sdk/clients/s3');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const bucketName = 's3-configuration-module-e2e';

describe('S3 Configuration module', () => {

    describe('get function', () => {

        it('should throw an error if the bucket does not contain the config file', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                // WHEN
                .then(() => configurationService.get('test'))
                .then(() => {
                    fail('we should never reach here because config file is missing from bucket');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('config.json file does not exist in bucket');
                    done();
                });
        });

        it('should throw an error if the bucket contains a config file that does not contain config value', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(() => uploadEmptyConfigFile())
                // WHEN
                .then(() => configurationService.get('test'))
                .then(() => {
                    fail('we should never reach here because config file is empty');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual(`No key 'test' present in configuration`);
                    done();
                });
        });

        it('should get a config value if config file is present and contains the config value', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.get('test'))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual('value');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('all function', () => {

        it('should throw an error if the bucket does not contain the config file', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
            // WHEN
                .then(() => configurationService.all())
                .then(() => {
                    fail('we should never reach here because config file is missing from bucket');
                    done();
                })
                .catch(exception => {
                    // THEN
                    expect(exception).not.toBeNull();
                    expect(exception.message).toEqual('config.json file does not exist in bucket');
                    done();
                });
        });

        it('should get all config values if config file is present and contains those config values', done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(() => uploadConfigFile())
                // WHEN
                .then(() => configurationService.all())
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    expect(value).toEqual({test: 'value', test2: 'value2'});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});

const emptyBucket = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({Bucket: bucketName}).promise()
        .then(results =>
            Promise.all(results.Contents.map(result => s3Client.deleteObject({Bucket: bucketName, Key: result.Key}).promise())));
};

const uploadEmptyConfigFile = (): Promise<any> =>  {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({})}).promise();
};

const uploadConfigFile = (): Promise<any> =>  {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({test: 'value', test2: 'value2'})}).promise();
};
