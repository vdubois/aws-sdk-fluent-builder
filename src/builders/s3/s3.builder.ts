import { S3ConfigurationBuilder } from './configuration/s3-configuration.builder';
import { S3StorageBuilder } from './storage/s3-storage.builder';
import { S3HostingBuilder } from './hosting/s3-hosting.builder';

export class S3Builder {

    private bucketName: string;
    private mustCreateBeforeUse = false;

    withBucketName(bucketName: string): S3Builder {
        this.bucketName = bucketName;
        return this;
    }

    createIfNotExists(): S3Builder {
        this.mustCreateBeforeUse = true;
        return this;
    }

    asConfigurationService(): S3ConfigurationBuilder {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new S3ConfigurationBuilder(this.bucketName, this.mustCreateBeforeUse);
    }

    asStorageService(): S3StorageBuilder {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new S3StorageBuilder(this.bucketName, this.mustCreateBeforeUse);
    }

    asHostingService(): S3HostingBuilder {
        this.checkAwsRegionEnvironmentVariableIsPresent();
        this.checkBucketNameWasProvide();
        return new S3HostingBuilder(this.bucketName, this.mustCreateBeforeUse);
    }

    private checkAwsRegionEnvironmentVariableIsPresent() {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
    }

    private checkBucketNameWasProvide() {
        if (!this.bucketName) {
            throw new Error('Bucket name is mandatory');
        }
    }
}
