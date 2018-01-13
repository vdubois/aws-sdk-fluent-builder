import { S3StorageService } from '../../../repositories/s3/s3-storage.service';
export declare class S3StorageBuilder {
    private bucketName;
    private mustCreateBeforeUse;
    constructor(bucketName: string, mustCreateBeforeUse: boolean);
    build(): S3StorageService;
}
