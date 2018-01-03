import S3 = require('aws-sdk/clients/s3');
import { S3Builder } from '../../src/builders/s3/s3.builder';
import * as needle from 'needle';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const bucketName = 's3-hosting-module-e2e';
const hostingService = new S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asHostingService()
    .build();

describe('S3 Hosting module', () => {

    let originalTimeout;

    /**
     * Sets timeout to 30s.
     */
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });

    describe('createIfNotExists function', () => {

        it('should create the bucket if it does not exist', done => {
            // GIVEN
            deleteBucketIfExists()
            // WHEN
                .then(() => hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    return listBuckets();
                })
                .then(buckets => {
                    expect(buckets).not.toBeNull();
                    expect(buckets).toContain(bucketName);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not throw an error if the bucket already exist', done => {
            // GIVEN
            createBucketIfNotExists()
            // WHEN
                .then(() => hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    return listBuckets();
                })
                .then(buckets => {
                    expect(buckets).not.toBeNull();
                    expect(buckets).toContain(bucketName);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('uploadFilesFromDirectory function', () => {

        it('should upload files to the bucket', done => {
            // GIVEN
            createBucketIfNotExists()
            // WHEN
                .then(() => hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`))
                .then(value => {
                    // THEN
                    expect(value).not.toBeNull();
                    return listFiles();
                })
                .then(files => {
                    expect(files).not.toBeNull();
                    expect(files).toContain('index.html');
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    it('should host a website that will be then publicly accessible', done => {
        // GIVEN
        const s3HostingService = new S3Builder()
            .withBucketName(bucketName)
            .createIfNotExists()
            .asHostingService()
            .build();
        deleteBucketIfExists()
            // WHEN
            .then(() => s3HostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`))
            .then(() => needle('get', 'http://' + bucketName + '.s3-website-' + process.env.AWS_REGION + '.amazonaws.com/index.html'))
            .then(websiteHtmlContent => {
                // THEN
                expect(websiteHtmlContent.body).toContain('S3 Hosting E2E Test');
                done();
            })
            .catch(exception => {
                fail(exception);
                done();
            });
    });
});

const deleteBucketIfExists = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets)
        .then(bucketNames => {
            if (bucketNames.some(bucket => bucket.Name === bucketName)) {
                return s3Client.listObjects({Bucket: bucketName}).promise()
                    .then(objects => objects.Contents)
                    .then(objects => Promise.all(
                        objects.map(s3Object => s3Client.deleteObject({
                            Bucket: bucketName,
                            Key: s3Object.Key
                        }).promise())))
                    .then(() => s3Client.deleteBucket({Bucket: bucketName}).promise())
                    .then(() => s3Client.waitFor('bucketNotExists', {Bucket: bucketName}));
            } else {
                return Promise.resolve({});
            }
        });
};

const createBucketIfNotExists = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets)
        .then(bucketNames => {
            if (bucketNames.some(bucket => bucket.Name === bucketName)) {
                return Promise.resolve({});
            } else {
                return s3Client.createBucket({Bucket: bucketName}).promise()
                    .then(() => s3Client.waitFor('bucketExists', {Bucket: bucketName}));
            }
        });
};

const emptyBucket = (): Promise<any> => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({Bucket: bucketName}).promise()
        .then(results =>
            Promise.all(results.Contents.map(result => s3Client.deleteObject({Bucket: bucketName, Key: result.Key}).promise())));
};

const listBuckets = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(results => results.Buckets.map(bucket => bucket.Name));
};

const listFiles = () => {
    const s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({Bucket: bucketName}).promise()
        .then(results => results.Contents.map(s3Object => s3Object.Key));
};
