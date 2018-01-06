"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var S3 = require("aws-sdk/clients/s3");
var s3_builder_1 = require("../../src/builders/s3/s3.builder");
var needle = require("needle");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
var bucketName = 's3-hosting-module-e2e';
var hostingService = new s3_builder_1.S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asHostingService()
    .build();
describe('S3 Hosting module', function () {
    var originalTimeout;
    /**
     * Sets timeout to 30s.
     */
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    });
    describe('createIfNotExists function', function () {
        it('should create the bucket if it does not exist', function (done) {
            // GIVEN
            deleteBucketIfExists()
                .then(function () { return hostingService.uploadFilesFromDirectory(__dirname + "/../data/hosting"); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                return listBuckets();
            })
                .then(function (buckets) {
                expect(buckets).not.toBeNull();
                expect(buckets).toContain(bucketName);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should not throw an error if the bucket already exist', function (done) {
            // GIVEN
            createBucketIfNotExists()
                .then(function () { return hostingService.uploadFilesFromDirectory(__dirname + "/../data/hosting"); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                return listBuckets();
            })
                .then(function (buckets) {
                expect(buckets).not.toBeNull();
                expect(buckets).toContain(bucketName);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('uploadFilesFromDirectory function', function () {
        it('should upload files to the bucket', function (done) {
            // GIVEN
            createBucketIfNotExists()
                .then(function () { return hostingService.uploadFilesFromDirectory(__dirname + "/../data/hosting"); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                return listFiles();
            })
                .then(function (files) {
                expect(files).not.toBeNull();
                expect(files).toContain('index.html');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    it('should host a website that will be then publicly accessible', function (done) {
        // GIVEN
        var s3HostingService = new s3_builder_1.S3Builder()
            .withBucketName(bucketName)
            .createIfNotExists()
            .asHostingService()
            .build();
        deleteBucketIfExists()
            .then(function () { return s3HostingService.uploadFilesFromDirectory(__dirname + "/../data/hosting"); })
            .then(function () { return needle('get', 'http://' + bucketName + '.s3-website-' + process.env.AWS_REGION + '.amazonaws.com/index.html'); })
            .then(function (websiteHtmlContent) {
            // THEN
            expect(websiteHtmlContent.body).toContain('S3 Hosting E2E Test');
            done();
        })
            .catch(function (exception) {
            fail(exception);
            done();
        });
    });
});
var deleteBucketIfExists = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(function (results) { return results.Buckets; })
        .then(function (bucketNames) {
        if (bucketNames.some(function (bucket) { return bucket.Name === bucketName; })) {
            return s3Client.listObjects({ Bucket: bucketName }).promise()
                .then(function (objects) { return objects.Contents; })
                .then(function (objects) { return Promise.all(objects.map(function (s3Object) { return s3Client.deleteObject({
                Bucket: bucketName,
                Key: s3Object.Key
            }).promise(); })); })
                .then(function () { return s3Client.deleteBucket({ Bucket: bucketName }).promise(); })
                .then(function () { return s3Client.waitFor('bucketNotExists', { Bucket: bucketName }); });
        }
        else {
            return Promise.resolve({});
        }
    });
};
var createBucketIfNotExists = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(function (results) { return results.Buckets; })
        .then(function (bucketNames) {
        if (bucketNames.some(function (bucket) { return bucket.Name === bucketName; })) {
            return Promise.resolve({});
        }
        else {
            return s3Client.createBucket({ Bucket: bucketName }).promise()
                .then(function () { return s3Client.waitFor('bucketExists', { Bucket: bucketName }); });
        }
    });
};
var emptyBucket = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({ Bucket: bucketName }).promise()
        .then(function (results) {
        return Promise.all(results.Contents.map(function (result) { return s3Client.deleteObject({ Bucket: bucketName, Key: result.Key }).promise(); }));
    });
};
var listBuckets = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(function (results) { return results.Buckets.map(function (bucket) { return bucket.Name; }); });
};
var listFiles = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({ Bucket: bucketName }).promise()
        .then(function (results) { return results.Contents.map(function (s3Object) { return s3Object.Key; }); });
};
//# sourceMappingURL=s3-hosting-module.spec.e2e.js.map