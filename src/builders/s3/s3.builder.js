"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Builder = void 0;
const s3_configuration_builder_1 = require("./configuration/s3-configuration.builder");
const s3_storage_builder_1 = require("./storage/s3-storage.builder");
const s3_hosting_builder_1 = require("./hosting/s3-hosting.builder");
class S3Builder {
    constructor() {
        this.mustCreateBeforeUse = false;
    }
    withBucketName(bucketName) {
        this.bucketName = bucketName;
        return this;
    }
    createIfNotExists() {
        this.mustCreateBeforeUse = true;
        return this;
    }
    asConfigurationService() {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new s3_configuration_builder_1.S3ConfigurationBuilder(this.bucketName, this.mustCreateBeforeUse);
    }
    asStorageService() {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new s3_storage_builder_1.S3StorageBuilder(this.bucketName, this.mustCreateBeforeUse);
    }
    asHostingService() {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new s3_hosting_builder_1.S3HostingBuilder(this.bucketName, this.mustCreateBeforeUse);
    }
    checkAwsRegionEnvironmentVariableIsPresent() {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
    }
    checkBucketNameWasProvide() {
        if (!this.bucketName) {
            throw new Error('Bucket name is mandatory');
        }
    }
}
exports.S3Builder = S3Builder;
