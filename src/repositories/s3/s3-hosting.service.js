"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3HostingService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const configuration_1 = require("../configuration/configuration");
class S3HostingService {
    constructor(bucketName, mustCreateBeforeUse, s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION })) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    uploadFilesFromDirectory(sourceDirectoryPath, destinationPathInBucket = '') {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.createBucketIfNecesary();
            yield this.exposeBucketAsPublicWebsite();
            let uploadIndex = 1;
            for (const file of files) {
                yield this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: destinationPathInBucket + file.substring(path.normalize(sourceDirectoryPath).length),
                    Body: fs.readFileSync(file)
                }));
                console.log(`[uploadFilesFromDirectory] (${uploadIndex++}/${files.length}) uploaded ${file}`);
            }
        });
    }
    createBucketIfNecesary() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mustCreateBeforeUse) {
                const results = yield this.s3Client.send(new client_s3_1.ListBucketsCommand({}));
                const buckets = results.Buckets;
                if (buckets.some(bucket => bucket.Name === this.bucketName)) {
                    return Promise.resolve({});
                }
                else {
                    yield this.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucketName }));
                    return client_s3_1.waitUntilBucketExists({ client: this.s3Client, maxWaitTime: configuration_1.MAX_WAIT_TIME_IN_SECONDS }, { Bucket: this.bucketName });
                }
            }
            else {
                return Promise.resolve({});
            }
        });
    }
    exposeBucketAsPublicWebsite() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const bucketPolicyParams = {
                Bucket: this.bucketName,
                Policy: policyContent
            };
            const bucketWebsiteParams = {
                Bucket: this.bucketName,
                WebsiteConfiguration: {
                    IndexDocument: {
                        Suffix: 'index.html'
                    }
                }
            };
            yield this.s3Client.send(new client_s3_1.PutBucketPolicyCommand(bucketPolicyParams));
            return this.s3Client.send(new client_s3_1.PutBucketWebsiteCommand(bucketWebsiteParams));
        });
    }
    walkDirectorySync(directoryPath, filelist = []) {
        return fs.readdirSync(directoryPath)
            .map(filePath => fs.statSync(path.join(directoryPath, filePath)).isDirectory()
            ? this.walkDirectorySync(path.join(directoryPath, filePath), filelist)
            : filelist.concat(path.join(directoryPath, filePath))[0]);
    }
}
exports.S3HostingService = S3HostingService;
