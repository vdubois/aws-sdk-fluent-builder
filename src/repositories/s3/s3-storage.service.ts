import * as S3 from 'aws-sdk/clients/s3';

export class S3StorageService {

    constructor(private bucketName: string,
                private mustCreateBeforeUse: boolean,
                private s3Client = new S3({ region: process.env.AWS_REGION })) {
    }

    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    async listFiles(predicate = (file) => true): Promise<any> {
        try {
            await this.createBucketIfNecesary();
            const {Contents} = await this.s3Client.listObjects({Bucket: this.bucketName}).promise();
            return Contents
                .map(file => file.Key)
                .filter(predicate);
        } catch (exception) {
            throw new Error(`listFiles function : ${exception}`);
        }
    }

    /**
     * Reads file with path in bucket and returns a Buffer
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    async readFile(filePath: string): Promise<any> {
        try {
            await this.createBucketIfNecesary();
            const file = await this.s3Client.getObject({
                Bucket: this.bucketName,
                Key: filePath
            }).promise();
            return file.Body;
        } catch (exception) {
            throw new Error(`readFile function : ${exception}`);
        }
    }

    /**
     * Writes file with path in bucket
     * @param {string} filePath
     * @param {Buffer} fileContent
     * @returns {Promise<any>}
     */
    async writeFile(filePath: string, fileContent: Buffer): Promise<any> {
        try {
            await this.createBucketIfNecesary();
            return await this.s3Client.upload({
                Bucket: this.bucketName,
                Key: filePath,
                Body: fileContent
            }).promise();
        } catch (exception) {
            throw new Error(`writeFile function : ${exception}`);
        }
    }

    /**
     * Deletes a file in bucket using its path
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    async deleteFile(filePath: string): Promise<any> {
        try {
            await this.createBucketIfNecesary();
            return await this.s3Client.deleteObject({
                Bucket: this.bucketName,
                Key: filePath
            }).promise();
        } catch (exception) {
            throw new Error(`deleteFile function : ${exception}`);
        }
    }

    /**
     * Copies a file in bucket using source and destination paths
     * @param {string} sourceFilePath
     * @param {string} destinationFilePath
     * @returns {Promise<any>}
     */
    async copyFile(sourceFilePath: string, destinationFilePath: string): Promise<any> {
        if (sourceFilePath === destinationFilePath) {
            return Promise.reject('copyFile function : source and destination must have different paths');
        }
        try {
            await this.createBucketIfNecesary();
            return await this.s3Client.copyObject({
                Bucket: this.bucketName,
                CopySource: `${this.bucketName}/${sourceFilePath}`,
                Key: destinationFilePath
            }).promise();
        } catch (exception) {
            throw new Error(`copyFile function : ${exception}`);
        }
    }

    private async createBucketIfNecesary(): Promise<any> {
        if (this.mustCreateBeforeUse) {
            const {Buckets} = await this.s3Client.listBuckets().promise();
            if (Buckets.some(bucket => bucket.Name === this.bucketName)) {
                return Promise.resolve({});
            } else {
                await this.s3Client.createBucket({Bucket: this.bucketName}).promise();
                return this.s3Client.waitFor('bucketExists', {Bucket: this.bucketName});
            }
        } else {
            return Promise.resolve({});
        }
    }
}
