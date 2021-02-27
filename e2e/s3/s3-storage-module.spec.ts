import { S3Builder } from '../../src/builders/s3/s3.builder';
import { deleteBucketIfExists } from '../clean-functions';
import { createBucketIfNotExists, emptyBucket, listBuckets } from './s3-configuration-module.spec';
import S3 = require('aws-sdk/clients/s3');

const bucketName = 's3-storage-module-e2e';
const storageService = new S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asStorageService()
    .build();

describe('S3 Storage module', () => {

    describe('createIfNotExists function', () => {

        it('should create the bucket if it does not exist', async done => {
            try {
                // GIVEN
                await deleteBucketIfExists(bucketName);
                // WHEN
                const value = await storageService.listFiles();
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual([]);
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
            try {
                // GIVEN
                await createBucketIfNotExists(bucketName);
                // WHEN
                const value = await storageService.listFiles();
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual([]);
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

    describe('listFiles function', () => {

        it('should get an empty list if bucket is empty', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                const files = await storageService.listFiles();
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual([]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get full files list if bucket is not empty with no predicate', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                const files = await storageService.listFiles();
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual(['sample.txt', 'test.md', 'test.txt']);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get partial files list if bucket is not empty with a predicate', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                const files = await storageService.listFiles(filename => filename.endsWith('.txt'));
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual(['sample.txt', 'test.txt']);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should get no files if bucket is not empty with a non matching predicate', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                const files = await storageService.listFiles(filename => filename.endsWith('.ts'));
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual([]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('readFile function', () => {

        it('should throw an error if file does not exist in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                await storageService.readFile('test.txt');
                fail('we should never reach here because the file does not exist in bucket');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('readFile function : NoSuchKey: The specified key does not exist.');
                done();
            }
        });

        it('should return file content if file does exist in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                const fileContent = await storageService.readFile('test.txt');
                // THEN
                expect(fileContent).not.toBeNull();
                expect(fileContent).toEqual(Buffer.from('sample data'));
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('writeFile function', () => {

        it('should override a file if file already exists in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                await storageService.writeFile('test.txt', Buffer.from('overriden content'));
                const fileContent = await loadFileContent('test.txt');
                // THEN
                expect(fileContent).not.toBeNull();
                expect(fileContent).toEqual('overriden content');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should write a file if file does not exist in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                await storageService.writeFile('test.txt', Buffer.from('written content'));
                const fileContent = await loadFileContent('test.txt');
                // THEN
                expect(fileContent).not.toBeNull();
                expect(fileContent).toEqual('written content');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteFile function', () => {

        it('should not throw an error if file does not exist in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                await storageService.deleteFile('test.txt');
                // THEN
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should delete file if file exists in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                await storageService.deleteFile('test.txt');
                const files = await listFiles(bucketName);
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual(['sample.txt', 'test.md']);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('copyFile function', () => {

        it('should throw an error if source file path does not exist in bucket', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                await storageService.copyFile('test.txt', 'test2.txt');
                fail('we should never reach here because the file does not exist in bucket');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('copyFile function : NoSuchKey: The specified key does not exist.');
                done();
            }
        });

        it('should copy file if source file exists and destination files does not exist', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                await storageService.copyFile('test.txt', 'copied.txt');
                const fileContent = await loadFileContent('copied.txt');
                // THEN
                expect(fileContent).toEqual('sample data');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should copy file if source file exists and destination file already exist', async done => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                await uploadAllFiles();
                // WHEN
                await storageService.copyFile('test.txt', 'test.md');
                const fileContent = await loadFileContent('test.md');
                // THEN
                expect(fileContent).toEqual('sample data');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});

const uploadAllFiles = async (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    await s3Client.upload({
        Bucket: bucketName,
        Key: 'test.txt',
        Body: 'sample data'
    }).promise();
    await s3Client.upload({
        Bucket: bucketName,
        Key: 'sample.txt',
        Body: 'sample data'
    }).promise();
    await s3Client.upload({
        Bucket: bucketName,
        Key: 'test.md',
        Body: 'sample data'
    }).promise();
};

const loadFileContent = async (filePath: string): Promise<string> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    const {Body} = await s3Client.getObject({Bucket: bucketName, Key: filePath}).promise();
    return Body.toString();
};

export const listFiles = async (bucketNameToListFilesFrom): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    const {Contents} = await s3Client.listObjects({Bucket: bucketNameToListFilesFrom}).promise();
    return Contents.map(file => file.Key);
};

