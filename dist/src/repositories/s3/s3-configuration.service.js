"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var S3 = require("aws-sdk/clients/s3");
var S3ConfigurationService = /** @class */ (function () {
    function S3ConfigurationService(_bucketName, fileName, contents, mustCreateBeforeUse, s3Client) {
        if (s3Client === void 0) { s3Client = new S3({ region: process.env.AWS_REGION }); }
        this._bucketName = _bucketName;
        this.fileName = fileName;
        this.contents = contents;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    Object.defineProperty(S3ConfigurationService.prototype, "bucketName", {
        get: function () {
            return this._bucketName;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get a configuration value using its key (based on JSON object)
     * @param {string} configurationKey
     * @returns {Promise<any>}
     */
    S3ConfigurationService.prototype.get = function (configurationKey) {
        return this.loadConfiguration()
            .then(function (configuration) {
            if (configuration[configurationKey] !== undefined) {
                return Promise.resolve(configuration[configurationKey]);
            }
            else {
                throw new Error("No key '" + configurationKey + "' present in configuration");
            }
        });
    };
    /**
     * Get the configuration object
     * @returns {Promise<any>}
     */
    S3ConfigurationService.prototype.all = function () {
        return this.loadConfiguration();
    };
    S3ConfigurationService.prototype.createBucketIfNecesary = function () {
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
    S3ConfigurationService.prototype.overrideConfiguration = function () {
        var _this = this;
        if (this.contents) {
            return this.s3Client.upload({
                Bucket: this.bucketName,
                Key: this.fileName,
                Body: JSON.stringify(this.contents, null, 2)
            }).promise()
                .then(function () { return _this.s3Client.waitFor('objectExists', { Bucket: _this.bucketName, Key: _this.fileName }); });
        }
        else {
            return Promise.resolve({});
        }
    };
    S3ConfigurationService.prototype.loadConfiguration = function () {
        var _this = this;
        if (this.configuration) {
            return Promise.resolve(this.configuration);
        }
        else {
            return this.createBucketIfNecesary()
                .then(function () { return _this.overrideConfiguration(); })
                .then(function () {
                var getObjectParams = {
                    Bucket: _this._bucketName,
                    Key: _this.fileName
                };
                return _this.s3Client.getObject(getObjectParams).promise();
            })
                .then(function (result) {
                _this.configuration = JSON.parse(result.Body.toString());
                return _this.configuration;
            })
                .catch(function (exception) {
                throw new Error(_this.fileName + " file does not exist in bucket");
            });
        }
    };
    return S3ConfigurationService;
}());
exports.S3ConfigurationService = S3ConfigurationService;
//# sourceMappingURL=s3-configuration.service.js.map