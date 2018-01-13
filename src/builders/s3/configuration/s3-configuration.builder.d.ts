import { S3ConfigurationService } from '../../../repositories/s3/s3-configuration.service';
export declare class S3ConfigurationBuilder {
    private bucketName;
    private mustCreateBeforeUse;
    private sourceFileName;
    private contents;
    constructor(bucketName: string, mustCreateBeforeUse: boolean);
    withSourceFileName(sourceFileName: string): S3ConfigurationBuilder;
    withContents(contents: object): S3ConfigurationBuilder;
    withFileContents(filePath: string): S3ConfigurationBuilder;
    build(): S3ConfigurationService;
}
