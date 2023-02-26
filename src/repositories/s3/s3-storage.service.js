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
exports.S3StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const configuration_1 = require("../configuration/configuration");
class S3StorageService {
    constructor(bucketName, mustCreateBeforeUse, s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION })) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.s3Client = s3Client;
    }
    /**
     * List files in bucket using an optional predicate
     * @param {(file) => boolean} predicate
     * @returns {Promise<any>}
     */
    listFiles(predicate = (file) => true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.createBucketIfNecesary();
                const { Contents } = yield this.s3Client.send(new client_s3_1.ListObjectsV2Command({ Bucket: this.bucketName }));
                if (Contents) {
                    return Contents
                        .map(file => file.Key)
                        .filter(predicate);
                }
                return [];
            }
            catch (exception) {
                throw new Error(`listFiles function : ${exception}`);
            }
        });
    }
    /**
     * Reads file with path in bucket and returns a Buffer
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    readFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.createBucketIfNecesary();
                const file = yield this.s3Client.send(new client_s3_1.GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: filePath
                }));
                const fileContent = yield file.Body.transformToByteArray();
                return Buffer.from(fileContent);
            }
            catch (exception) {
                throw new Error(`readFile function : ${exception}`);
            }
        });
    }
    /**
     * Writes file with path in bucket
     * @param {string} filePath
     * @param {Buffer} fileContent
     * @returns {Promise<any>}
     */
    writeFile(filePath, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.createBucketIfNecesary();
                return this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: filePath,
                    Body: fileContent
                }));
            }
            catch (exception) {
                throw new Error(`writeFile function : ${exception}`);
            }
        });
    }
    /**
     * Deletes a file in bucket using its path
     * @param {string} filePath
     * @returns {Promise<any>}
     */
    deleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.createBucketIfNecesary();
                return yield this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: filePath
                }));
            }
            catch (exception) {
                throw new Error(`deleteFile function : ${exception}`);
            }
        });
    }
    /**
     * Copies a file in bucket using source and destination paths
     * @param {string} sourceFilePath
     * @param {string} destinationFilePath
     * @returns {Promise<any>}
     */
    copyFile(sourceFilePath, destinationFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sourceFilePath === destinationFilePath) {
                return Promise.reject('copyFile function : source and destination must have different paths');
            }
            try {
                yield this.createBucketIfNecesary();
                return yield this.s3Client.send(new client_s3_1.CopyObjectCommand({
                    Bucket: this.bucketName,
                    CopySource: `${this.bucketName}/${sourceFilePath}`,
                    Key: destinationFilePath
                }));
            }
            catch (exception) {
                throw new Error(`copyFile function : ${exception}`);
            }
        });
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
}
exports.S3StorageService = S3StorageService;
