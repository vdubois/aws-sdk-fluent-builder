"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_builder_1 = require("../../src/builders/s3/s3.builder");
var S3 = require("aws-sdk/clients/s3");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
var bucketName = 's3-storage-module-e2e';
var storageService = new s3_builder_1.S3Builder()
    .withBucketName(bucketName)
    .createIfNotExists()
    .asStorageService()
    .build();
describe('S3 Storage module', function () {
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
                .then(function () { return storageService.listFiles(); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual([]);
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
                .then(function () { return storageService.listFiles(); })
                .then(function (value) {
                // THEN
                expect(value).not.toBeNull();
                expect(value).toEqual([]);
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
    describe('listFiles function', function () {
        it('should get an empty list if bucket is empty', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return storageService.listFiles(); })
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual([]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get full files list if bucket is not empty with no predicate', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.listFiles(); })
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual(['sample.txt', 'test.md', 'test.txt']);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get partial files list if bucket is not empty with a predicate', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.listFiles(function (filename) { return filename.endsWith('.txt'); }); })
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual(['sample.txt', 'test.txt']);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should get no files if bucket is not empty with a non matching predicate', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.listFiles(function (filename) { return filename.endsWith('.ts'); }); })
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual([]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('readFile function', function () {
        it('should throw an error if file does not exist in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return storageService.readFile('test.txt'); })
                .then(function () {
                fail('we should never reach here because the file does not exist in bucket');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('readFile function : NoSuchKey: The specified key does not exist.');
                done();
            });
        });
        it('should return file content if file does exist in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.readFile('test.txt'); })
                .then(function (fileContent) {
                // THEN
                expect(fileContent).not.toBeNull();
                expect(fileContent).toEqual(new Buffer('sample data'));
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('writeFile function', function () {
        it('should override a file if file already exists in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.writeFile('test.txt', new Buffer('overriden content')); })
                .then(function () { return loadFileContent('test.txt'); })
                .then(function (fileContent) {
                // THEN
                expect(fileContent).not.toBeNull();
                expect(fileContent).toEqual('overriden content');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should write a file if file does not exist in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return storageService.writeFile('test.txt', new Buffer('written content')); })
                .then(function () { return loadFileContent('test.txt'); })
                .then(function (fileContent) {
                // THEN
                expect(fileContent).not.toBeNull();
                expect(fileContent).toEqual('written content');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('deleteFile function', function () {
        it('should not throw an error if file does not exist in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return storageService.deleteFile('test.txt'); })
                .then(function () {
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should delete file if file exists in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.deleteFile('test.txt'); })
                .then(function () { return listFiles(); })
                .then(function (files) {
                // THEN
                expect(files).not.toBeNull();
                expect(files).toEqual(['sample.txt', 'test.md']);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('copyFile function', function () {
        it('should throw an error if source file path does not exist in bucket', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return storageService.copyFile('test.txt', 'test2.txt'); })
                .then(function () {
                fail('we should never reach here because the file does not exist in bucket');
                done();
            })
                .catch(function (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('copyFile function : NoSuchKey: The specified key does not exist.');
                done();
            });
        });
        it('should copy file if source file exists and destination files does not exist', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.copyFile('test.txt', 'copied.txt'); })
                .then(function () { return loadFileContent('copied.txt'); })
                .then(function (fileContent) {
                // THEN
                expect(fileContent).toEqual('sample data');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should copy file if source file exists and destination file already exist', function (done) {
            // GIVEN
            emptyBucket()
                .then(function () { return uploadAllFiles(); })
                .then(function () { return storageService.copyFile('test.txt', 'test.md'); })
                .then(function () { return loadFileContent('test.md'); })
                .then(function (fileContent) {
                // THEN
                expect(fileContent).toEqual('sample data');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
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
var uploadAllFiles = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.upload({
        Bucket: bucketName,
        Key: 'test.txt',
        Body: 'sample data'
    }).promise()
        .then(function () { return s3Client.upload({
        Bucket: bucketName,
        Key: 'sample.txt',
        Body: 'sample data'
    }).promise(); })
        .then(function () { return s3Client.upload({
        Bucket: bucketName,
        Key: 'test.md',
        Body: 'sample data'
    }).promise(); });
};
var loadFileContent = function (filePath) {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.getObject({ Bucket: bucketName, Key: filePath }).promise().then(function (result) { return result.Body.toString(); });
};
var listFiles = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listObjects({ Bucket: bucketName }).promise()
        .then(function (result) { return result.Contents.map(function (file) { return file.Key; }); });
};
var listBuckets = function () {
    var s3Client = new S3({ region: process.env.AWS_REGION });
    return s3Client.listBuckets().promise()
        .then(function (results) { return results.Buckets.map(function (bucket) { return bucket.Name; }); });
};
//# sourceMappingURL=s3-storage-module.spec.e2e.js.map