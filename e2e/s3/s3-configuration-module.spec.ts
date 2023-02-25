import {describe, expect, test} from 'vitest';
import {S3Builder} from '../../src/builders/s3/s3.builder';
import {deleteBucketIfExists} from '../clean-functions';
import {
    CreateBucketCommand,
    DeleteObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
    waitUntilBucketExists
} from '@aws-sdk/client-s3';

const bucketName = 's3-configuration-module';

describe('S3 Configuration module', () => {

    describe('createIfNotExists function', () => {

        test('should create the bucket if it does not exist', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'value'})
                .build();
            await deleteBucketIfExists(bucketName);

            const value = await configurationService.get('test');
            // THEN
            expect(value).not.toBeNull();
            expect(value).toEqual('value');
            const buckets = await listBuckets();
            expect(buckets).not.toBeNull();
            expect(buckets).toContain(bucketName);
        });

        test('should not throw an error if the bucket already exist', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'value'})
                .build();
            await createBucketIfNotExists(bucketName);

            const value = await configurationService.get('test');
            // THEN
            expect(value).not.toBeNull();
            expect(value).toEqual('value');
            const buckets = await listBuckets();
            expect(buckets).not.toBeNull();
            expect(buckets).toContain(bucketName);
        });
    });

    describe('get function', () => {

        test('should throw an error if the bucket does not contain the config file', async () => {
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
                throw new Error('we should never reach here because config file is missing from bucket');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
            }
        });

        test('should throw an error if the bucket contains a config file that does not contain config value', async () => {
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
                throw new Error('we should never reach here because config file is empty');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual(`No key 'test' present in configuration`);
            }
        });

        test('should get a config value if config file is present and contains the config value', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            // WHEN
            const value = await configurationService.get('test');
            // THEN
            expect(value).not.toBeNull();
            expect(value).toEqual('value');
        });

        test('should get an overriden config value if configuration was overriden with an object', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'overriden value'})
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            // WHEN
            const value = await configurationService.get('test');
            // THEN
            expect(value).not.toBeNull();
            expect(value).toEqual('overriden value');
        });

        test('should get an overriden config value if configuration was overriden with a file', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            // WHEN
            const value = await configurationService.get('test');
            // THEN
            expect(value).not.toBeNull();
            expect(value).toEqual('sample');
        });
    });

    describe('all function', () => {

        test('should throw an error if the bucket does not contain the config file', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            await emptyBucket(bucketName);
            try {
                await configurationService.all();
                throw new Error('we should never reach here because config file is missing from bucket');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
            }
        });

        test('should get all config values if config file is present and contains those config values', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            // WHEN
            const values = await configurationService.all();
            // THEN
            expect(values).not.toBeNull();
            expect(values).toEqual({test: 'value', test2: 'value2'});
        });

        test('should get overriden config values if configuration was overriden with an object', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({test: 'overriden value'})
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            // WHEN
            const values = await configurationService.all();
            // THEN
            expect(values).not.toBeNull();
            expect(values).toEqual({test: 'overriden value'});
        });

        test('should get overriden config values if configuration was overriden with a file', async () => {
            // GIVEN
            const configurationService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();

            await emptyBucket(bucketName);
            await uploadConfigFile();
            // WHEN
            const value = await configurationService.all();
            // THEN
            expect(value).not.toBeNull();
            expect(value).toEqual({test: 'sample', test2: false});
        });
    });
});

export const emptyBucket = async (bucketNameToEmpty: string): Promise<void> => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const bucketObjects = await s3Client.send(new ListObjectsV2Command({Bucket: bucketNameToEmpty}));
    if (bucketObjects.Contents) {
        for (const result of bucketObjects.Contents) {
            await s3Client.send(new DeleteObjectCommand({Bucket: bucketNameToEmpty, Key: result.Key}));
        }
    }
};

const uploadEmptyConfigFile = async (): Promise<any> => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const config = await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: 'config.json',
        Body: JSON.stringify({})
    }));
    const objets = await s3Client.send(new ListObjectsV2Command({Bucket: bucketName}));
    return config;
};

const uploadConfigFile = async (): Promise<any> => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    return await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: 'config.json',
        Body: JSON.stringify({test: 'value', test2: 'value2'})})
    );
};

export const createBucketIfNotExists = async (bucketNameToCreate: string) => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const {Buckets} = await s3Client.send(new ListBucketsCommand({}));
    if (Buckets.some(bucket => bucket.Name === bucketNameToCreate)) {
        return Promise.resolve({});
    } else {
        await s3Client.send(new CreateBucketCommand({Bucket: bucketNameToCreate}));
        return waitUntilBucketExists({
            client: s3Client,
            maxWaitTime: 200
        }, {Bucket: bucketNameToCreate});
    }
};

export const listBuckets = async () => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const {Buckets} = await s3Client.send(new ListBucketsCommand({}));
    return Buckets.map(bucket => bucket.Name);
};
