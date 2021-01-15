"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3ConfigurationBuilder = void 0;
const s3_configuration_service_1 = require("../../../repositories/s3/s3-configuration.service");
const fs = require("fs");
class S3ConfigurationBuilder {
    constructor(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.sourceFileName = 'config.json';
    }
    withSourceFileName(sourceFileName) {
        this.sourceFileName = sourceFileName;
        return this;
    }
    withContents(contents) {
        this.contents = contents;
        return this;
    }
    withFileContents(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath);
            this.contents = JSON.parse(fileContent.toString());
            return this;
        }
        catch (exception) {
            throw new Error('File ' + filePath + ' does not exist');
        }
    }
    build() {
        return new s3_configuration_service_1.S3ConfigurationService(this.bucketName, this.sourceFileName, this.contents, this.mustCreateBeforeUse);
    }
}
exports.S3ConfigurationBuilder = S3ConfigurationBuilder;
