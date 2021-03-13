import { S3Builder } from '../../src/builders/s3/s3.builder';
import { deleteBucketIfExists } from '../clean-functions';
import S3 = require('aws-sdk/clients/s3');

const bucketName = 's3-configuration-module';

describe('S3 Configuration module', () => {

    describe('createIfNotExists function', () => {

        it('should create the bucket if it does not exist', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'value'})
                .build();
            await deleteBucketIfExists(bucketName);

            try {
                const value = await configurationService.get('test');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                const buckets = await listBuckets();
                expect(buckets).not.toBeNull();
                expect(buckets).toContain(bucketName);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not throw an error if the bucket already exist', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'value'})
                .build();
            await createBucketIfNotExists(bucketName);

            try {
                const value = await configurationService.get('test');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                const buckets = await listBuckets();
                expect(buckets).not.toBeNull();
                expect(buckets).toContain(bucketName);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('get function', () => {

        it('should throw an error if the bucket does not contain the config file', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            await emptyBucket(bucketName);
            try {
                // WHEN
                await configurationService.get('test');
                fail('we should never reach here because config file is missing from bucket');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            }
        });

        it('should throw an error if the bucket contains a config file that does not contain config value', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();

            await emptyBucket(bucketName);
            await uploadEmptyConfigFile();
            try {
                // WHEN
                await configurationService.get('test');
                fail('we should never reach here because config file is empty');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual(`No key 'test' present in configuration`);
                done();
            }
        });

        it('should get a config value if config file is present and contains the config value', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            try {
                // WHEN
                const value = await configurationService.get('test');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get an overriden config value if configuration was overriden with an object', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'overriden value'})
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            try {
                // WHEN
                const value = await configurationService.get('test');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('overriden value');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get an overriden config value if configuration was overriden with a file', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            try {
                // WHEN
                const value = await configurationService.get('test');
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('sample');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('all function', () => {

        it('should throw an error if the bucket does not contain the config file', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            await emptyBucket(bucketName);
            try {
                await configurationService.all();
                fail('we should never reach here because config file is missing from bucket');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            }
        });

        it('should get all config values if config file is present and contains those config values', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();

            try {
                await emptyBucket(bucketName);
                await uploadConfigFile();
                // WHEN
                const values = await configurationService.all();
                // THEN
                expect(values).not.toBeNull();
                expect(values).toEqual({test: 'value', test2: 'value2'});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get overriden config values if configuration was overriden with an object', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'overriden value'})
                .build();

            try {
                await emptyBucket(bucketName);
                await uploadConfigFile();
                // WHEN
                const values = await configurationService.all();
                // THEN
                expect(values).not.toBeNull();
                expect(values).toEqual({test: 'overriden value'});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get overriden config values if configuration was overriden with a file', async done => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();

            try {
                await emptyBucket(bucketName);
                await uploadConfigFile();
                // WHEN
                const value = await configurationService.all();
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual({test: 'sample', test2: false});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});

export const emptyBucket = async (bucketNameToEmpty: string): Promise<void> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    const {Contents} = await s3Client.listObjects({Bucket: bucketNameToEmpty}).promise();
    for (const result of Contents) {
        await s3Client.deleteObject({Bucket: bucketNameToEmpty, Key: result.Key}).promise();
    }
};

const uploadEmptyConfigFile = (): Promise<any> =>  {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({})}).promise();
};

const uploadConfigFile = (): Promise<any> =>  {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({test: 'value', test2: 'value2'})}).promise();
};

export const createBucketIfNotExists = async (bucketNameToCreate: string) => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    const {Buckets} = await s3Client.listBuckets().promise();
    if (Buckets.some(bucket => bucket.Name === bucketNameToCreate)) {
        return Promise.resolve({});
    } else {
        await s3Client.createBucket({Bucket: bucketNameToCreate}).promise();
        return s3Client.waitFor('bucketExists', {Bucket: bucketNameToCreate});
    }
};

export const listBuckets = async () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    const {Buckets} = await s3Client.listBuckets().promise();
    return Buckets.map(bucket => bucket.Name);
};
