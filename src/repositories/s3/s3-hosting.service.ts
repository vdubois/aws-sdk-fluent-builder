import S3 = require('aws-sdk/clients/s3');
import * as fs from 'fs';
import * as path from 'path';

export class S3HostingService {

    constructor(private bucketName: string, private s3Client = new S3({region: process.env.AWS_REGION})) {
    }

    uploadFilesFromDirectory(sourceDirectoryPath: string, destinationPathInBucket = ''): Promise<any> {
        if (!fs.existsSync(sourceDirectoryPath)) {
            return Promise.reject('uploadFilesFromDirectory function : directory does not exist');
        }
        if (!fs.statSync(sourceDirectoryPath).isDirectory()) {
            return Promise.reject('uploadFilesFromDirectory function : ' + sourceDirectoryPath + ' is not a directory');
        }
        if (destinationPathInBucket.startsWith('/')) {
            return Promise.reject(`uploadFilesFromDirectory function : destination path should not start with a '/'`);
        }
        if (destinationPathInBucket !== '' && !destinationPathInBucket.endsWith('/')) {
            return Promise.reject(`uploadFilesFromDirectory function : destination path should end with a '/'`);
        }
        const files = [].concat.apply([], this.walkDirectorySync(sourceDirectoryPath));
        return Promise.all(
            files.map(file => this.s3Client.upload({
                    Bucket: this.bucketName,
                    Key: destinationPathInBucket + file.substring(path.normalize(sourceDirectoryPath).length + 1),
                    Body: fs.readFileSync(file)
                }).promise())).catch(exception => {
                    throw new Error(`uploadFilesFromDirectory function : ${exception}`);
                });
    }

    private walkDirectorySync(directoryPath, filelist = []): Array<any> {
        return fs.readdirSync(directoryPath)
            .map(filePath => fs.statSync(path.join(directoryPath, filePath)).isDirectory()
                ? this.walkDirectorySync(path.join(directoryPath, filePath), filelist)
                : filelist.concat(path.join(directoryPath, filePath))[0]);
    }
}
