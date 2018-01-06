"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_builder_1 = require("../s3.builder");
describe('S3ConfigurationBuilder', function () {
    beforeEach(function () {
        process.env.AWS_REGION = 'test';
    });
    describe('build function', function () {
        it('should build a configuration service', function (done) {
            // GIVEN
            // WHEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .build();
            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService.constructor.name).toEqual('S3ConfigurationService');
            done();
        });
    });
    describe('withSourceFileName function', function () {
        it('should store source file name', function (done) {
            // GIVEN
            // WHEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .withSourceFileName('myConfig.json')
                .build();
            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService['fileName']).toEqual('myConfig.json');
            done();
        });
    });
    describe('withContents function', function () {
        it('should store contents of configuration ', function (done) {
            // GIVEN
            // WHEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .withContents({ myKey: 'myValue' })
                .build();
            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService['contents']).toEqual({ myKey: 'myValue' });
            done();
        });
    });
    describe('withFileContents function', function () {
        it('should store contents of configuration', function (done) {
            // GIVEN
            // WHEN
            var configurationService = new s3_builder_1.S3Builder()
                .withBucketName('toto')
                .asConfigurationService()
                .withFileContents(__dirname + '/../../../../spec/data/config.json')
                .build();
            // THEN
            expect(configurationService).not.toBeNull();
            expect(configurationService['contents']).toEqual({ test: 'sample', test2: false });
            done();
        });
        it('should throw an error if file does not exist', function (done) {
            // GIVEN
            // WHEN
            try {
                var configurationService = new s3_builder_1.S3Builder()
                    .withBucketName('toto')
                    .asConfigurationService()
                    .withFileContents('config.json')
                    .build();
                fail('we should not reach here because file does not exist');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('File config.json does not exist');
                done();
            }
        });
    });
});
//# sourceMappingURL=s3-configuration.builder.spec.js.map