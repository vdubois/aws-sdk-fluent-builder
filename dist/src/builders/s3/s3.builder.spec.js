"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_builder_1 = require("./s3.builder");
describe('S3Builder', function () {
    beforeEach(function () {
        process.env.AWS_REGION = 'test';
    });
    describe('withBucketName function', function () {
        it('should store bucket name', function (done) {
            // GIVEN
            // WHEN
            var builder = new s3_builder_1.S3Builder()
                .withBucketName('test');
            // THEN
            expect(builder).not.toBeNull();
            expect(builder['bucketName']).toEqual('test');
            done();
        });
    });
    describe('createIfNotExists function', function () {
        it('should store create if not exists information', function (done) {
            // GIVEN
            // WHEN
            var builder = new s3_builder_1.S3Builder()
                .withBucketName('test')
                .createIfNotExists();
            // THEN
            expect(builder).not.toBeNull();
            expect(builder['bucketName']).toEqual('test');
            expect(builder['mustCreateBeforeUse']).toEqual(true);
            done();
        });
    });
    describe('asConfigurationService function', function () {
        it('should throw an error if AWS_REGION environment variable is not set', function (done) {
            // GIVEN
            process.env = {};
            // WHEN
            try {
                new s3_builder_1.S3Builder()
                    .withBucketName('toto')
                    .asConfigurationService();
                fail('we should never reach here because asConfigurationService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });
        it('should throw an error when a bucket name was not supplied', function (done) {
            // GIVEN
            // WHEN
            try {
                new s3_builder_1.S3Builder()
                    .asConfigurationService();
                fail('we should never reach here because asConfigurationService should throw an error when a bucket is not supplied');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
                done();
            }
        });
    });
    describe('asHostingService function', function () {
        it('should throw an error if AWS_REGION environment variable is not set', function (done) {
            // GIVEN
            process.env = {};
            // WHEN
            try {
                new s3_builder_1.S3Builder()
                    .withBucketName('toto')
                    .asHostingService();
                fail('we should never reach here because asHostingService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });
        it('should throw an error when a bucket name was not supplied', function (done) {
            // GIVEN
            // WHEN
            try {
                new s3_builder_1.S3Builder()
                    .asHostingService();
                fail('we should never reach here because asHostingService should throw an error when a bucket is not supplied');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
                done();
            }
        });
    });
    describe('asStorageService function', function () {
        it('should throw an error if AWS_REGION environment variable is not set', function (done) {
            // GIVEN
            process.env = {};
            // WHEN
            try {
                new s3_builder_1.S3Builder()
                    .withBucketName('toto')
                    .asStorageService();
                fail('we should never reach here because asStorageService should throw an error when AWS_REGION '
                    + 'environment variable is not set');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });
        it('should throw an error when a bucket name was not supplied', function (done) {
            // GIVEN
            // WHEN
            try {
                new s3_builder_1.S3Builder()
                    .asStorageService();
                fail('we should never reach here because asStorageService should throw an error when a bucket is not supplied');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('Bucket name is mandatory');
                done();
            }
        });
    });
});
//# sourceMappingURL=s3.builder.spec.js.map