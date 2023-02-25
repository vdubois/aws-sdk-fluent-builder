import { S3Client } from '@aws-sdk/client-s3';
export declare class S3HostingService {
    private bucketName;
    private mustCreateBeforeUse;
    private s3Client;
    constructor(bucketName: string, mustCreateBeforeUse: any, s3Client?: S3Client);
    uploadFilesFromDirectory(sourceDirectoryPath: string, destinationPathInBucket?: string): Promise<void>;
    private createBucketIfNecesary;
    private exposeBucketAsPublicWebsite;
    private walkDirectorySync;
}
