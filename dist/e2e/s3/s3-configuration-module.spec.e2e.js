"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_builder_1 = require("../../src/builders/s3/s3.builder");
var S3 = require("aws-sdk/clients/s3");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
var bucketName = 's3-configuration-module-e2e';
describe('S3 Configuration module', function () {
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
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({ test: 'value' })
                .build();
            deleteBucketIfExists()
                .then(function () { return configurationService.get('test'); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
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
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({ test: 'value' })
                .build();
            createBucketIfNotExists()
                .then(function () { return configurationService.get('test'); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
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
    describe('get function', function () {
        it('should throw an error if the bucket does not contain the config file', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(function () { return configurationService.get('test'); })
                .then(function () {
                fail('we should never reach here because config file is missing from bucket');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            });
        });
        it('should throw an error if the bucket contains a config file that does not contain config value', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(function () { return uploadEmptyConfigFile(); })
                .then(function () { return configurationService.get('test'); })
                .then(function () {
                fail('we should never reach here because config file is empty');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual("No key 'test' present in configuration");
                done();
            });
        });
        it('should get a config value if config file is present and contains the config value', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(function () { return uploadConfigFile(); })
                .then(function () { return configurationService.get('test'); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('value');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get an overriden config value if configuration was overriden with an object', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({ test: 'overriden value' })
                .build();
            emptyBucket()
                .then(function () { return uploadConfigFile(); })
                .then(function () { return configurationService.get('test'); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('overriden value');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get an overriden config value if configuration was overriden with a file', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();
            emptyBucket()
                .then(function () { return uploadConfigFile(); })
                .then(function () { return configurationService.get('test'); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual('sample');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('all function', function () {
        it('should throw an error if the bucket does not contain the config file', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(function () { return configurationService.all(); })
                .then(function () {
                fail('we should never reach here because config file is missing from bucket');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('config.json file does not exist in bucket');
                done();
            });
        });
        it('should get all config values if config file is present and contains those config values', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .build();
            emptyBucket()
                .then(function () { return uploadConfigFile(); })
                .then(function () { return configurationService.all(); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual({ test: 'value', test2: 'value2' });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get overriden config values if configuration was overriden with an object', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withContents({ test: 'overriden value' })
                .build();
            emptyBucket()
                .then(function () { return uploadConfigFile(); })
                .then(function () { return configurationService.all(); })
                .then(function (values) {
                // THEN
                expect(values).not.toBeNull();
                expect(values).toEqual({ test: 'overriden value' });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get overriden config values if configuration was overriden with a file', function (done) {
            // GIVEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName(bucketName)
                .createIfNotExists()
                .asConfigurationService()
                .withFileContents(__dirname + '/../data/config.json')
                .build();
            emptyBucket()
                .then(function () { return uploadConfigFile(); })
                .then(function () { return configurationService.all(); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual({ test: 'sample', test2: false });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
});
var emptyBucket = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({ Bucket: bucketName }).promise()
        .then(function (results) {
        return Promise.all(results.Contents.map(function (result) { return s3Client.deleteObject({ Bucket: bucketName, Key: result.Key }).promise(); }));
    });
};
var uploadEmptyConfigFile = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({ Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({}) }).promise();
};
var uploadConfigFile = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({ Bucket: bucketName, Key: 'config.json', Body: JSON.stringify({ test: 'value', test2: 'value2' }) }).promise();
};
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
var listBuckets = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(function (results) { return results.Buckets.map(function (bucket) { return bucket.Name; }); });
};
//# sourceMappingURL=s3-configuration-module.spec.e2e.js.map