/// <reference types="node" />
import * as S3 from 'aws-sdk/clients/s3';
export declare class S3StorageService {
    private bucketName;
    private mustCreateBeforeUse;
    private s3Client;
    constructor(bucketName: string, mustCreateBeforeUse: boolean, s3Client?: S3);
    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    listFiles(predicate?: (file: any) => boolean): Promise<any>;
    /**
     * Reads file with path in bucket and returns a Buffer
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    readFile(filePath: string): Promise<any>;
    /**
     * Writes file with path in bucket
     * @param {string} filePath
     * @param {Buffer} fileContent
     * @returns {Promise<any>}
     */
    writeFile(filePath: string, fileContent: Buffer): Promise<any>;
    /**
     * Deletes a file in bucket using its path
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    deleteFile(filePath: string): Promise<any>;
    /**
     * Copies a file in bucket using source and destination paths
     * @param {string} sourceFilePath
     * @param {string} destinationFilePath
     * @returns {Promise<any>}
     */
    copyFile(sourceFilePath: string, destinationFilePath: string): Promise<any>;
    private createBucketIfNecesary();
}
