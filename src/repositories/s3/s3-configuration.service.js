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
const client_s3_1 = require("@aws-sdk/client-s3");
const configuration_1 = require("../configuration/configuration");
class S3ConfigurationService {
    constructor(_bucketName, fileName, contents, mustCreateBeforeUse, s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION })) {
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
                const { Buckets } = yield this.s3Client.send(new client_s3_1.ListBucketsCommand({}));
                if (Buckets.some(bucket => bucket.Name === this.bucketName)) {
                    return Promise.resolve({});
                }
                else {
                    yield this.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucketName }));
                    return (0, client_s3_1.waitUntilBucketExists)({ client: this.s3Client, maxWaitTime: configuration_1.MAX_WAIT_TIME_IN_SECONDS }, { Bucket: this.bucketName });
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
                yield this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: this.fileName,
                    Body: JSON.stringify(this.contents, null, 2)
                }));
                return (0, client_s3_1.waitUntilObjectExists)({ client: this.s3Client, maxWaitTime: configuration_1.MAX_WAIT_TIME_IN_SECONDS }, { Bucket: this.bucketName, Key: this.fileName });
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
                    const result = yield this.s3Client.send(new client_s3_1.GetObjectCommand(getObjectParams));
                    const fileContent = yield result.Body.transformToString('utf8');
                    this.configuration = JSON.parse(fileContent);
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
