import { S3HostingService } from '../../../repositories/s3/s3-hosting.service';
export declare class S3HostingBuilder {
    private bucketName;
    private mustCreateBeforeUse;
    constructor(bucketName: string, mustCreateBeforeUse: boolean);
    build(): S3HostingService;
}
