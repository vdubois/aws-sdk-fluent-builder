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
exports.S3ConfigurationService = void 0;
const S3 = require("aws-sdk/clients/s3");
class S3ConfigurationService {
    constructor(_bucketName, fileName, contents, mustCreateBeforeUse, s3Client = new S3({ region: process.env.AWS_REGION })) {
        this._bucketName = _bucketName;
        this.fileName = fileName;
        this.contents = contents;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    get bucketName() {
        return this._bucketName;
    }
    /**
     * Get a configuration value using its key (based on JSON object)
     * @param {string} configurationKey
     * @returns {Promise<any>}
     */
    get(configurationKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const configuration = yield this.loadConfiguration();
            if (configuration[configurationKey] !== undefined) {
                return Promise.resolve(configuration[configurationKey]);
            }
            else {
                throw new Error(`No key '${configurationKey}' present in configuration`);
            }
        });
    }
    /**
     * Get the configuration object
     * @returns {Promise<any>}
     */
    all() {
        return this.loadConfiguration();
    }
    createBucketIfNecesary() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mustCreateBeforeUse) {
                const { Buckets } = yield this.s3Client.listBuckets().promise();
                if (Buckets.some(bucket => bucket.Name === this.bucketName)) {
                    return Promise.resolve({});
                }
                else {
                    yield this.s3Client.createBucket({ Bucket: this.bucketName }).promise();
                    return this.s3Client.waitFor('bucketExists', { Bucket: this.bucketName });
                }
            }
            else {
                return Promise.resolve({});
            }
        });
    }
    overrideConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.contents) {
                yield this.s3Client.upload({
                    Bucket: this.bucketName,
                    Key: this.fileName,
                    Body: JSON.stringify(this.contents, null, 2)
                }).promise();
                return this.s3Client.waitFor('objectExists', { Bucket: this.bucketName, Key: this.fileName });
            }
            else {
                return Promise.resolve({});
            }
        });
    }
    loadConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.configuration) {
                return Promise.resolve(this.configuration);
            }
            else {
                yield this.createBucketIfNecesary();
                yield this.overrideConfiguration();
                try {
                    const getObjectParams = {
                        Bucket: this._bucketName,
                        Key: this.fileName
                    };
                    const result = yield this.s3Client.getObject(getObjectParams).promise();
                    this.configuration = JSON.parse(result.Body.toString());
                    return this.configuration;
                }
                catch (error) {
                    throw new Error(`${this.fileName} file does not exist in bucket`);
                }
            }
        });
    }
}
exports.S3ConfigurationService = S3ConfigurationService;
