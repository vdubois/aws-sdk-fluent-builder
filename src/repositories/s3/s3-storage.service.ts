import S3 = require('aws-sdk/clients/s3');

export class S3StorageService {

    constructor(private bucketName: string, private s3Client = new S3({ region: process.env.AWS_REGION })) {
    }

    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    listFiles(predicate = (file) => true): Promise<any> {
        return this.s3Client.listObjects({Bucket: this.bucketName}).promise()
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
        return this.s3Client.getObject({
            Bucket: this.bucketName,
            Key: filePath
        }).promise()
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
        return this.s3Client.upload({
            Bucket: this.bucketName,
            Key: filePath,
            Body: fileContent
        }).promise()
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
        return this.s3Client.deleteObject({
            Bucket: this.bucketName,
            Key: filePath
        }).promise()
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
        return this.s3Client.copyObject({
            Bucket: this.bucketName,
            CopySource: `${this.bucketName}/${sourceFilePath}`,
            Key: destinationFilePath
        }).promise()
            .catch(exception => {
                throw new Error(`copyFile function : ${exception}`);
            });
    }
}
