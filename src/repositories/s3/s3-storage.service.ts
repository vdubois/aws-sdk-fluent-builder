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
        }).promise();
    }

    deleteFile(filePath: string): Promise<any> {
        return this.s3Client.deleteObject({
            Bucket: this.bucketName,
            Key: filePath
        }).promise();
    }
}
