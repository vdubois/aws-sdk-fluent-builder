import {expect, test, describe} from 'vitest';
import {S3Builder} from '../../src/builders/s3/s3.builder';
import {deleteBucketIfExists} from '../clean-functions';
import {createBucketIfNotExists, emptyBucket, listBuckets} from './s3-configuration-module.spec';
import {GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

const bucketName = 's3-storage-module-e2e';
const storageService = new S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asStorageService()
    .build();

describe('S3 Storage module', () => {

    describe('createIfNotExists function', () => {

        test('should create the bucket if it does not exist', async () => {
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
        });

        test('should not throw an error if the bucket already exist', async () => {
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
        });
    });

    describe('listFiles function', () => {

        test('should get an empty list if bucket is empty', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            // WHEN
            const files = await storageService.listFiles();
            // THEN
            expect(files).not.toBeNull();
            expect(files).toEqual([]);
        });

        test('should get full files list if bucket is not empty with no predicate', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            const files = await storageService.listFiles();
            // THEN
            expect(files).not.toBeNull();
            expect(files).toEqual(['sample.txt', 'test.md', 'test.txt']);
        });

        test('should get partial files list if bucket is not empty with a predicate', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            const files = await storageService.listFiles(filename => filename.endsWith('.txt'));
            // THEN
            expect(files).not.toBeNull();
            expect(files).toEqual(['sample.txt', 'test.txt']);
        });

        test('should get no files if bucket is not empty with a non matching predicate', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            const files = await storageService.listFiles(filename => filename.endsWith('.ts'));
            // THEN
            expect(files).not.toBeNull();
            expect(files).toEqual([]);
        });
    });

    describe('readFile function', () => {

        test('should throw an error if file does not exist in bucket', async () => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                await storageService.readFile('test.txt');
                throw new Error('we should never reach here because the file does not exist in bucket');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('readFile function : NoSuchKey: The specified key does not exist.');
            }
        });

        test('should return file content if file does exist in bucket', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            const fileContent = await storageService.readFile('test.txt');
            // THEN
            expect(fileContent).not.toBeNull();
            expect(fileContent).toEqual(Buffer.from('sample data'));
        });
    });

    describe('writeFile function', () => {

        test('should override a file if file already exists in bucket', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            await storageService.writeFile('test.txt', Buffer.from('overriden content'));
            const fileContent = await loadFileContent('test.txt');
            // THEN
            expect(fileContent).not.toBeNull();
            expect(fileContent).toEqual('overriden content');
        });

        test('should write a file if file does not exist in bucket', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            // WHEN
            await storageService.writeFile('test.txt', Buffer.from('written content'));
            const fileContent = await loadFileContent('test.txt');
            // THEN
            expect(fileContent).not.toBeNull();
            expect(fileContent).toEqual('written content');
        });
    });

    describe('deleteFile function', () => {

        test('should not throw an error if file does not exist in bucket', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            // WHEN
            await storageService.deleteFile('test.txt');
            // THEN
        });

        test('should delete file if file exists in bucket', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            await storageService.deleteFile('test.txt');
            const files = await listFiles(bucketName);
            // THEN
            expect(files).not.toBeNull();
            expect(files).toEqual(['sample.txt', 'test.md']);
        });
    });

    describe('copyFile function', () => {

        test('should throw an error if source file path does not exist in bucket', async () => {
            try {
                // GIVEN
                await emptyBucket(bucketName);
                // WHEN
                await storageService.copyFile('test.txt', 'test2.txt');
                throw new Error('we should never reach here because the file does not exist in bucket');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('copyFile function : NoSuchKey: The specified key does not exist.');
            }
        });

        test('should copy file if source file exists and destination files does not exist', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            await storageService.copyFile('test.txt', 'copied.txt');
            const fileContent = await loadFileContent('copied.txt');
            // THEN
            expect(fileContent).toEqual('sample data');
        });

        test('should copy file if source file exists and destination file already exist', async () => {
            // GIVEN
            await emptyBucket(bucketName);
            await uploadAllFiles();
            // WHEN
            await storageService.copyFile('test.txt', 'test.md');
            const fileContent = await loadFileContent('test.md');
            // THEN
            expect(fileContent).toEqual('sample data');
        });
    });
});

const uploadAllFiles = async (): Promise<any> => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: 'test.txt',
        Body: 'sample data'
    }));
    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: 'sample.txt',
        Body: 'sample data'
    }));
    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: 'test.md',
        Body: 'sample data'
    }));
};

const loadFileContent = async (filePath: string): Promise<string> => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const {Body} = await s3Client.send(new GetObjectCommand({Bucket: bucketName, Key: filePath}));
    return Body.transformToString('utf8');
};

export const listFiles = async (bucketNameToListFilesFrom): Promise<any> => {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const {Contents} = await s3Client.send(new ListObjectsV2Command({Bucket: bucketNameToListFilesFrom}));
    return Contents.map(file => file.Key);
};

