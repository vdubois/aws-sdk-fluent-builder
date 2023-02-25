import { S3Client } from '@aws-sdk/client-s3';
export declare class S3ConfigurationService {
    private _bucketName;
    private fileName;
    private contents;
    private mustCreateBeforeUse;
    private s3Client;
    private configuration;
    constructor(_bucketName: string, fileName: string, contents: object, mustCreateBeforeUse: boolean, s3Client?: S3Client);
    get bucketName(): string;
    /**
     * Get a configuration value using its key (based on JSON object)
     * @param {string} configurationKey
     * @returns {Promise<any>}
     */
    get(configurationKey: string): Promise<any>;
    /**
     * Get the configuration object
     * @returns {Promise<any>}
     */
    all(): Promise<any>;
    private createBucketIfNecesary;
    private overrideConfiguration;
    private loadConfiguration;
}
