import { S3Builder } from '../../src/builders/s3/s3.builder';
import S3 = require('aws-sdk/clients/s3');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const bucketName = 's3-storage-module-e2e';
const storageService = new S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asStorageService()
    .build();

fdescribe('S3 Storage module', () => {

    describe('listFiles function', () => {

        it('should get an empty list if bucket is empty', done => {
            // GIVEN
            emptyBucket()
                // WHEN
                .then(() => storageService.listFiles())
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual([]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get full files list if bucket is not empty with no predicate', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.listFiles())
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual(['sample.txt', 'test.md', 'test.txt']);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should get partial files list if bucket is not empty with a predicate', done => {
            // GIVEN
            emptyBucket()
                .then(() => uploadAllFiles())
                // WHEN
                .then(() => storageService.listFiles(filename => filename.endsWith('.txt')))
                .then(files => {
                    // THEN
                    expect(files).not.toBeNull();
                    expect(files).toEqual(['sample.txt', 'test.txt']);
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

const uploadAllFiles = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({
        Bucket: bucketName,
        Key: 'test.txt',
        Body: 'sample data'
    }).promise()
        .then(() => s3Client.upload({
            Bucket: bucketName,
            Key: 'sample.txt',
            Body: 'sample data'
        }).promise())
        .then(() => s3Client.upload({
            Bucket: bucketName,
            Key: 'test.md',
            Body: 'sample data'
        }).promise());
};
