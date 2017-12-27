import S3 = require('aws-sdk/clients/s3');

export class S3StorageService {

    constructor(private bucketName: string, private s3Client = new S3({ region: process.env.AWS_REGION })) {
    }

    listFiles(predicate = (file) => true): Promise<any> {
        return this.s3Client.listObjects({Bucket: this.bucketName}).promise()
            .then(files => files.Contents.map(file => file.Key))
            .then(filesNames => filesNames.filter(predicate))
            .catch(exception => {
                throw new Error(`listFiles function : ${exception}`);
            });
    }

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

    deleteFile(filePath: string): Promise<any> {
        return this.s3Client.deleteObject({
            Bucket: this.bucketName,
            Key: filePath
        }).promise()
            .catch(exception => {
                throw new Error(`deleteFile function : ${exception}`);
            });
    }

    copyFile(sourceFilePath: string, destinationFilePath: string): Promise<any> {
        if (sourceFilePath === destinationFilePath) {
            return Promise.reject('copyFile function : source and destination must have different paths');
        }
        return this.s3Client.copyObject({
            Bucket: this.bucketName,
            CopySource: `s3://${this.bucketName}/${sourceFilePath}`,
            Key: destinationFilePath
        }).promise()
            .catch(exception => {
                throw new Error(`copyFile function : ${exception}`);
            });
    }
}
