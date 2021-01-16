import { S3Builder } from '../../src/builders/s3/s3.builder';
import * as needle from 'needle';
import { deleteBucketIfExists } from '../clean-functions';
import { createBucketIfNotExists, listBuckets } from './s3-configuration-module.spec.e2e';
import { listFiles } from './s3-storage-module.spec.e2e';

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

        it('should create the bucket if it does not exist', async done => {
            try {
                // GIVEN
                await deleteBucketIfExists(bucketName);
                // WHEN
                const value = await hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
                // THEN
                expect(value).not.toBeNull();
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
                const value = await hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
                // THEN
                expect(value).not.toBeNull();
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

    describe('uploadFilesFromDirectory function', () => {

        it('should upload files to the bucket', async done => {
            try { // GIVEN
                await createBucketIfNotExists(bucketName);
                // WHEN
                const value = await hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
                // THEN
                expect(value).not.toBeNull();
                const files = await listFiles(bucketName);
                expect(files).not.toBeNull();
                expect(files).toContain('/index.html');
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    it('should host a website that will be then publicly accessible', async done => {
        try {
            // GIVEN
            const s3HostingService = new S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asHostingService()
                .build();
            await deleteBucketIfExists(bucketName);
            // WHEN
            await s3HostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
            const websiteHtmlContent = await needle('get', 'http://' + bucketName + '.s3-website-' + process.env.AWS_REGION + '.amazonaws.com//index.html');
            // THEN
            expect(websiteHtmlContent.body).toContain('S3 Hosting E2E Test');
            done();
        } catch (exception) {
            fail(exception);
            done();
        }
    });
});
