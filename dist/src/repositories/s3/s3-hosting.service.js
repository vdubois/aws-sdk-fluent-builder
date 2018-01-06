"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var S3 = require("aws-sdk/clients/s3");
var fs = require("fs");
var path = require("path");
var S3HostingService = /** @class */ (function () {
    function S3HostingService(bucketName, mustCreateBeforeUse, s3Client) {
        if (s3Client === void 0) { s3Client = new S3({ region: process.env.AWS_REGION }); }
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    S3HostingService.prototype.uploadFilesFromDirectory = function (sourceDirectoryPath, destinationPathInBucket) {
        var _this = this;
        if (destinationPathInBucket === void 0) { destinationPathInBucket = ''; }
        if (!fs.existsSync(sourceDirectoryPath)) {
            return Promise.reject('uploadFilesFromDirectory function : directory does not exist');
        }
        if (!fs.statSync(sourceDirectoryPath).isDirectory()) {
            return Promise.reject('uploadFilesFromDirectory function : ' + sourceDirectoryPath + ' is not a directory');
        }
        if (destinationPathInBucket.startsWith('/')) {
            return Promise.reject("uploadFilesFromDirectory function : destination path should not start with a '/'");
        }
        if (destinationPathInBucket !== '' && !destinationPathInBucket.endsWith('/')) {
            return Promise.reject("uploadFilesFromDirectory function : destination path should end with a '/'");
        }
        var files = [].concat.apply([], this.walkDirectorySync(sourceDirectoryPath));
        return this.createBucketIfNecesary()
            .then(function () { return _this.exposeBucketAsPublicWebsite(); })
            .then(function () { return Promise.all(files.map(function (file) { return _this.s3Client.upload({
            Bucket: _this.bucketName,
            Key: destinationPathInBucket + file.substring(path.normalize(sourceDirectoryPath).length + 1),
            Body: fs.readFileSync(file)
        }).promise(); })).catch(function (exception) {
            throw new Error("uploadFilesFromDirectory function : " + exception);
        }); });
    };
    S3HostingService.prototype.createBucketIfNecesary = function () {
        var _this = this;
        if (this.mustCreateBeforeUse) {
            return this.s3Client.listBuckets().promise()
                .then(function (results) { return results.Buckets; })
                .then(function (buckets) {
                if (buckets.some(function (bucket) { return bucket.Name === _this.bucketName; })) {
                    return Promise.resolve({});
                }
                else {
                    return _this.s3Client.createBucket({ Bucket: _this.bucketName }).promise()
                        .then(function () { return _this.s3Client.waitFor('bucketExists', { Bucket: _this.bucketName }); });
                }
            });
        }
        else {
            return Promise.resolve({});
        }
    };
    S3HostingService.prototype.exposeBucketAsPublicWebsite = function () {
        var _this = this;
        var policyContent = fs.readFileSync(__dirname + '/s3-hosting.policy.json').toString();
        policyContent = policyContent.replace(new RegExp(/\$bucketName\$/, 'g'), this.bucketName);
        var bucketPolicyParams = {
            Bucket: this.bucketName,
            Policy: policyContent
        };
        var bucketWebsiteParams = {
            Bucket: this.bucketName,
            WebsiteConfiguration: {
                IndexDocument: {
                    Suffix: 'index.html'
                }
            }
        };
        return this.s3Client.putBucketPolicy(bucketPolicyParams).promise()
            .then(function () { return _this.s3Client.putBucketWebsite(bucketWebsiteParams).promise(); });
    };
    S3HostingService.prototype.walkDirectorySync = function (directoryPath, filelist) {
        var _this = this;
        if (filelist === void 0) { filelist = []; }
        return fs.readdirSync(directoryPath)
            .map(function (filePath) { return fs.statSync(path.join(directoryPath, filePath)).isDirectory()
            ? _this.walkDirectorySync(path.join(directoryPath, filePath), filelist)
            : filelist.concat(path.join(directoryPath, filePath))[0]; });
    };
    return S3HostingService;
}());
exports.S3HostingService = S3HostingService;
//# sourceMappingURL=s3-hosting.service.js.map