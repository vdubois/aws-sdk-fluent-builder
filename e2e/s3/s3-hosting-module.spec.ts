import {expect, test, describe} from 'vitest';
import {S3Builder} from '../../src/builders/s3/s3.builder';
import needle = require('needle');
import {deleteBucketIfExists} from '../clean-functions';
import {createBucketIfNotExists, listBuckets} from './s3-configuration-module.spec';
import {listFiles} from './s3-storage-module.spec';

const bucketName = 's3-hosting-module-e2e';
const hostingService = new S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asHostingService()
    .build();

describe('S3 Hosting module', () => {

    describe('createIfNotExists function', () => {

        test('should create the bucket if it does not exist', async () => {
            // GIVEN
            await deleteBucketIfExists(bucketName);
            // WHEN
            const value = await hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
            // THEN
            expect(value).not.toBeNull();
            const buckets = await listBuckets();
            expect(buckets).not.toBeNull();
            expect(buckets).toContain(bucketName);
        });

        test('should not throw an error if the bucket already exist', async () => {
            // GIVEN
            await createBucketIfNotExists(bucketName);
            // WHEN
            const value = await hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
            // THEN
            expect(value).not.toBeNull();
            const buckets = await listBuckets();
            expect(buckets).not.toBeNull();
            expect(buckets).toContain(bucketName);
        });
    });

    describe('uploadFilesFromDirectory function', () => {

        test('should upload files to the bucket', async () => {
            // GIVEN
            await createBucketIfNotExists(bucketName);
            // WHEN
            const value = await hostingService.uploadFilesFromDirectory(`${__dirname}/../data/hosting`);
            // THEN
            expect(value).not.toBeNull();
            const files = await listFiles(bucketName);
            expect(files).not.toBeNull();
            expect(files).toContain('/index.html');
        });
    });

    test('should host a website that will be then publicly accessible', async () => {
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
        expect(websiteHtmlContent.body.toString()).toContain('S3 Hosting E2E Test');
    });
});
