import S3 = require('aws-sdk/clients/s3');
import * as fs from 'fs';
import * as path from 'path';
import { PutBucketPolicyRequest, PutBucketWebsiteRequest } from 'aws-sdk/clients/s3';

export class S3HostingService {

    constructor(private bucketName: string, private mustCreateBeforeUse, private s3Client = new S3({region: process.env.AWS_REGION})) {
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
        return this.createBucketIfNecesary()
            .then(() => this.exposeBucketAsPublicWebsite())
            .then(() => Promise.all(
                files.map(file => this.s3Client.upload({
                        Bucket: this.bucketName,
                        Key: destinationPathInBucket + file.substring(path.normalize(sourceDirectoryPath).length + 1),
                        Body: fs.readFileSync(file)
                    }).promise())).catch(exception => {
                        throw new Error(`uploadFilesFromDirectory function : ${exception}`);
                    }));
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

    private exposeBucketAsPublicWebsite(): Promise<any> {
        let policyContent = fs.readFileSync(__dirname + '/s3-hosting.policy.json').toString();
        policyContent = policyContent.replace(new RegExp(/\$bucketName\$/, 'g'), this.bucketName);
        const bucketPolicyParams: PutBucketPolicyRequest = {
          Bucket: this.bucketName,
          Policy: policyContent
        };
        const bucketWebsiteParams: PutBucketWebsiteRequest = {
            Bucket: this.bucketName,
            WebsiteConfiguration: {
                IndexDocument: {
                    Suffix: 'index.html'
                }
            }
        };
        return this.s3Client.putBucketPolicy(bucketPolicyParams).promise()
            .then(() => this.s3Client.putBucketWebsite(bucketWebsiteParams).promise());
    }

    private walkDirectorySync(directoryPath, filelist = []): Array<any> {
        return fs.readdirSync(directoryPath)
            .map(filePath => fs.statSync(path.join(directoryPath, filePath)).isDirectory()
                ? this.walkDirectorySync(path.join(directoryPath, filePath), filelist)
                : filelist.concat(path.join(directoryPath, filePath))[0]);
    }
}
