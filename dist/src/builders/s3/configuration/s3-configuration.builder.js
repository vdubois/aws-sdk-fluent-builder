"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3_configuration_service_1 = require("../../../repositories/s3/s3-configuration.service");
var fs = require("fs");
var S3ConfigurationBuilder = /** @class */ (function () {
    function S3ConfigurationBuilder(bucketName, mustCreateBeforeUse) {
        this.bucketName = bucketName;
        this.mustCreateBeforeUse = mustCreateBeforeUse;
        this.sourceFileName = 'config.json';
    }
    S3ConfigurationBuilder.prototype.withSourceFileName = function (sourceFileName) {
        this.sourceFileName = sourceFileName;
        return this;
    };
    S3ConfigurationBuilder.prototype.withContents = function (contents) {
        this.contents = contents;
        return this;
    };
    S3ConfigurationBuilder.prototype.withFileContents = function (filePath) {
        try {
            var fileContent = fs.readFileSync(filePath);
            this.contents = JSON.parse(fileContent.toString());
            return this;
        }
        catch (exception) {
            throw new Error('File ' + filePath + ' does not exist');
        }
    };
    S3ConfigurationBuilder.prototype.build = function () {
        return new s3_configuration_service_1.S3ConfigurationService(this.bucketName, this.sourceFileName, this.contents, this.mustCreateBeforeUse);
    };
    return S3ConfigurationBuilder;
}());
exports.S3ConfigurationBuilder = S3ConfigurationBuilder;
//# sourceMappingURL=s3-configuration.builder.js.map