"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var S3 = require("aws-sdk/clients/s3");
var S3StorageService = /** @class */ (function () {
    function S3StorageService(bucketName, mustCreateBeforeUse, s3Client) {
        if (s3Client === void 0) { s3Client = new S3({ region: process.env.AWS_REGION }); }
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.listFiles = function (predicate) {
        var _this = this;
        if (predicate === void 0) { predicate = function (file) { return true; }; }
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.listObjects({ Bucket: _this.bucketName }).promise(); })
            .then(function (files) { return files.Contents.map(function (file) { return file.Key; }); })
            .then(function (filesNames) { return filesNames.filter(predicate); })
            .catch(function (exception) {
            throw new Error("listFiles function : " + exception);
        });
    };
    /**
     * Reads file with path in bucket and returns a Buffer
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.readFile = function (filePath) {
        var _this = this;
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.getObject({
            Bucket: _this.bucketName,
            Key: filePath
        }).promise(); })
            .then(function (file) { return file.Body; })
            .catch(function (exception) {
            throw new Error("readFile function : " + exception);
        });
    };
    /**
     * Writes file with path in bucket
     * @param {string} filePath
     * @param {Buffer} fileContent
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.writeFile = function (filePath, fileContent) {
        var _this = this;
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.upload({
            Bucket: _this.bucketName,
            Key: filePath,
            Body: fileContent
        }).promise(); })
            .catch(function (exception) {
            throw new Error("writeFile function : " + exception);
        });
    };
    /**
     * Deletes a file in bucket using its path
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.deleteFile = function (filePath) {
        var _this = this;
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.deleteObject({
            Bucket: _this.bucketName,
            Key: filePath
        }).promise(); })
            .catch(function (exception) {
            throw new Error("deleteFile function : " + exception);
        });
    };
    /**
     * Copies a file in bucket using source and destination paths
     * @param {string} sourceFilePath
     * @param {string} destinationFilePath
     * @returns {Promise<any>}
     */
    S3StorageService.prototype.copyFile = function (sourceFilePath, destinationFilePath) {
        var _this = this;
        if (sourceFilePath === destinationFilePath) {
            return Promise.reject('copyFile function : source and destination must have different paths');
        }
        return this.createBucketIfNecesary()
            .then(function () { return _this.s3Client.copyObject({
            Bucket: _this.bucketName,
            CopySource: _this.bucketName + "/" + sourceFilePath,
            Key: destinationFilePath
        }).promise(); })
            .catch(function (exception) {
            throw new Error("copyFile function : " + exception);
        });
    };
    S3StorageService.prototype.createBucketIfNecesary = function () {
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
    return S3StorageService;
}());
exports.S3StorageService = S3StorageService;
//# sourceMappingURL=s3-storage.service.js.map