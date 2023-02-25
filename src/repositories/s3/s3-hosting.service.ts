import {
    CreateBucketCommand,
    ListBucketsCommand, PutBucketPolicyCommand,
    PutBucketPolicyCommandInput, PutBucketWebsiteCommand,
    PutBucketWebsiteCommandInput, PutObjectCommand,
    S3Client, waitUntilBucketExists
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import {MAX_WAIT_TIME_IN_SECONDS} from '../configuration/configuration';

export class S3HostingService {

    constructor(
        private bucketName: string,
        private mustCreateBeforeUse,
        private s3Client = new S3Client({region: process.env.AWS_REGION})) {
    }

    async uploadFilesFromDirectory(sourceDirectoryPath: string, destinationPathInBucket = ''): Promise<void> {
        if (!fs.existsSync(sourceDirectoryPath)) {
            throw Error('uploadFilesFromDirectory function : source directory does not exist');
        }
        if (!fs.statSync(sourceDirectoryPath).isDirectory()) {
            throw Error('uploadFilesFromDirectory function : ' + sourceDirectoryPath + ' is not a directory');
        }
        if (destinationPathInBucket.startsWith('/')) {
            throw Error(`uploadFilesFromDirectory function : destination path should not start with a '/'`);
        }
        if (destinationPathInBucket !== '' && !destinationPathInBucket.endsWith('/')) {
            throw Error(`uploadFilesFromDirectory function : destination path should end with a '/'`);
        }
        // @ts-ignore
        const files = this.walkDirectorySync(sourceDirectoryPath).flat(100);
        await this.createBucketIfNecesary();
        await this.exposeBucketAsPublicWebsite();
        let uploadIndex = 1;
        for (const file of files) {
            await this.s3Client.send(new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: destinationPathInBucket + file.substring(path.normalize(sourceDirectoryPath).length),
                    Body: fs.readFileSync(file)
            }));
            console.log(`[uploadFilesFromDirectory] (${uploadIndex++}/${files.length}) uploaded ${file}`);
        }
    }

    private async createBucketIfNecesary(): Promise<any> {
        if (this.mustCreateBeforeUse) {
            const results = await this.s3Client.send(new ListBucketsCommand({}));
            const buckets = results.Buckets;
            if (buckets.some(bucket => bucket.Name === this.bucketName)) {
                return Promise.resolve({});
            } else {
                await this.s3Client.send(new CreateBucketCommand({Bucket: this.bucketName}));
                return waitUntilBucketExists(
                    {client: this.s3Client, maxWaitTime: MAX_WAIT_TIME_IN_SECONDS},
                    {Bucket: this.bucketName});
            }
        } else {
            return Promise.resolve({});
        }
    }

    private async exposeBucketAsPublicWebsite(): Promise<any> {
        const policyContent = `
            {
                "Version":"2012-10-17",
                "Statement": [
                    {
                      "Sid":"PublicReadGetObject",
                      "Effect":"Allow",
                      "Principal": "*",
                      "Action":["s3:GetObject"],
                      "Resource":["arn:aws:s3:::${this.bucketName}/*"]
                    }
                ]
            }
        `.trim();
        const bucketPolicyParams: PutBucketPolicyCommandInput = {
          Bucket: this.bucketName,
          Policy: policyContent
        };
        const bucketWebsiteParams: PutBucketWebsiteCommandInput = {
            Bucket: this.bucketName,
            WebsiteConfiguration: {
                IndexDocument: {
                    Suffix: 'index.html'
                }
            }
        };
        await this.s3Client.send(new PutBucketPolicyCommand(bucketPolicyParams));
        return this.s3Client.send(new PutBucketWebsiteCommand(bucketWebsiteParams));
    }

    private walkDirectorySync(directoryPath, filelist = []): Array<any> {
        return fs.readdirSync(directoryPath)
            .map(filePath => fs.statSync(path.join(directoryPath, filePath)).isDirectory()
                ? this.walkDirectorySync(path.join(directoryPath, filePath), filelist)
                : filelist.concat(path.join(directoryPath, filePath))[0]);
    }
}
