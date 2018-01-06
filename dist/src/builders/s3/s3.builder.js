"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_configuration_builder_1 = require("./configuration/s3-configuration.builder");
var s3_storage_builder_1 = require("./storage/s3-storage.builder");
var s3_hosting_builder_1 = require("./hosting/s3-hosting.builder");
var S3Builder = /** @class */ (function () {
    function S3Builder() {
        this.mustCreateBeforeUse = false;
    }
    S3Builder.prototype.withBucketName = function (bucketName) {
        this.bucketName = bucketName;
        return this;
    };
    S3Builder.prototype.createIfNotExists = function () {
        this.mustCreateBeforeUse = true;
        return this;
    };
    S3Builder.prototype.asConfigurationService = function () {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new s3_configuration_builder_1.S3ConfigurationBuilder(this.bucketName, this.mustCreateBeforeUse);
    };
    S3Builder.prototype.asStorageService = function () {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new s3_storage_builder_1.S3StorageBuilder(this.bucketName, this.mustCreateBeforeUse);
    };
    S3Builder.prototype.asHostingService = function () {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new s3_hosting_builder_1.S3HostingBuilder(this.bucketName, this.mustCreateBeforeUse);
    };
    S3Builder.prototype.checkAwsRegionEnvironmentVariableIsPresent = function () {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
    };
    S3Builder.prototype.checkBucketNameWasProvide = function () {
        if (!this.bucketName) {
            throw new Error('Bucket name is mandatory');
        }
    };
    return S3Builder;
}());
exports.S3Builder = S3Builder;
//# sourceMappingURL=s3.builder.js.map