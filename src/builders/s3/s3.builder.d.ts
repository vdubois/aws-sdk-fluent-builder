import { S3ConfigurationBuilder } from './configuration/s3-configuration.builder';
import { S3StorageBuilder } from './storage/s3-storage.builder';
import { S3HostingBuilder } from './hosting/s3-hosting.builder';
export declare class S3Builder {
    private bucketName;
    private mustCreateBeforeUse;
    withBucketName(bucketName: string): S3Builder;
    createIfNotExists(): S3Builder;
    asConfigurationService(): S3ConfigurationBuilder;
    asStorageService(): S3StorageBuilder;
    asHostingService(): S3HostingBuilder;
    private checkAwsRegionEnvironmentVariableIsPresent;
    private checkBucketNameWasProvide;
}
