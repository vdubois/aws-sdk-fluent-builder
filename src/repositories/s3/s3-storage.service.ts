import * as S3 from 'aws-sdk/clients/s3';
import { trace } from '../../utils/log';

export class S3StorageService {

    constructor(private bucketName: string,
                private mustCreateBeforeUse: boolean,
                private s3Client = new S3({ region: process.env.AWS_REGION })) {
      trace('Creating S3 Storage service with S3 params : ' + JSON.stringify({region: process.env.AWS_REGION}));
    }

    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    listFiles(predicate = (file) => true): Promise<any> {
        return this.createBucketIfNecesary()
            .then(() => {
              let params = {Bucket: this.bucketName};
              trace('Calling listObjects with : ' + JSON.stringify(params));
              return this.s3Client.listObjects(params).promise();
            })
            .then(files => files.Contents.map(file => file.Key))
            .then(filesNames => filesNames.filter(predicate))
            .catch(exception => {
                throw new Error(`listFiles function : ${exception}`);
            });
    }

    /**
     * Reads file with path in bucket and returns a Buffer
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    readFile(filePath: string): Promise<any> {
        return this.createBucketIfNecesary()
            .then(() => this.s3Client.getObject({
                Bucket: this.bucketName,
                Key: filePath
            }).promise())
            .then(file => file.Body)
            .catch(exception => {
                throw new Error(`readFile function : ${exception}`);
            });
    }

    /**
     * Writes file with path in bucket
     * @param {string} filePath
     * @param {Buffer} fileContent
     * @returns {Promise<any>}
     */
    writeFile(filePath: string, fileContent: Buffer): Promise<any> {
        return this.createBucketIfNecesary()
            .then(() => this.s3Client.upload({
                Bucket: this.bucketName,
                Key: filePath,
                Body: fileContent
            }).promise())
            .catch(exception => {
                throw new Error(`writeFile function : ${exception}`);
            });
    }

    /**
     * Deletes a file in bucket using its path
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    deleteFile(filePath: string): Promise<any> {
        return this.createBucketIfNecesary()
            .then(() => this.s3Client.deleteObject({
                Bucket: this.bucketName,
                Key: filePath
            }).promise())
            .catch(exception => {
                throw new Error(`deleteFile function : ${exception}`);
            });
    }

    /**
     * Copies a file in bucket using source and destination paths
     * @param {string} sourceFilePath
     * @param {string} destinationFilePath
     * @returns {Promise<any>}
     */
    copyFile(sourceFilePath: string, destinationFilePath: string): Promise<any> {
        if (sourceFilePath === destinationFilePath) {
            return Promise.reject('copyFile function : source and destination must have different paths');
        }
        return this.createBucketIfNecesary()
            .then(() => this.s3Client.copyObject({
                Bucket: this.bucketName,
                CopySource: `${this.bucketName}/${sourceFilePath}`,
                Key: destinationFilePath
            }).promise())
            .catch(exception => {
                throw new Error(`copyFile function : ${exception}`);
            });
    }

    private createBucketIfNecesary(): Promise<any> {
        if (this.mustCreateBeforeUse) {
            return this.s3Client.listBuckets().promise()
                .then(results => results.Buckets)
                .then(buckets => {
                    if (buckets.some(bucket => bucket.Name === this.bucketName)) {
                        return Promise.resolve({});
                    } else {
                        return this.s3Client.createBucket({Bucket: this.bucketName}).promise()
                            .then(() => this.s3Client.waitFor('bucketExists', {Bucket: this.bucketName}));
                    }
                });
        } else {
            return Promise.resolve({});
        }
    }
}
