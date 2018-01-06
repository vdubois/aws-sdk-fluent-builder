import * as S3 from 'aws-sdk/clients/s3';
export declare class S3HostingService {
    private bucketName;
    private mustCreateBeforeUse;
    private s3Client;
    constructor(bucketName: string, mustCreateBeforeUse: any, s3Client?: S3);
    uploadFilesFromDirectory(sourceDirectoryPath: string, destinationPathInBucket?: string): Promise<any>;
    private createBucketIfNecesary();
    private exposeBucketAsPublicWebsite();
    private walkDirectorySync(directoryPath, filelist?);
}
