"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamo_db_repository_implementation_1 = require("../../repositories/dynamodb/dynamo-db.repository.implementation");
var dynamo_db_repository_proxy_1 = require("../../repositories/dynamodb/dynamo-db.repository.proxy");
var DynamoDbBuilder = /** @class */ (function () {
    function DynamoDbBuilder() {
        this.keyName = 'id';
        this.readCapacity = 1;
        this.writeCapacity = 1;
        this.mustCreateBeforeUse = false;
    }
    DynamoDbBuilder.prototype.withTableName = function (tableName) {
        this.tableName = tableName;
        return this;
    };
    DynamoDbBuilder.prototype.withKeyName = function (keyname) {
        this.keyName = keyname;
        return this;
    };
    DynamoDbBuilder.prototype.withReadCapacity = function (readCapacity) {
        this.readCapacity = readCapacity;
        return this;
    };
    DynamoDbBuilder.prototype.withWriteCapacity = function (writeCapacity) {
        this.writeCapacity = writeCapacity;
        return this;
    };
    DynamoDbBuilder.prototype.createIfNotExists = function () {
        this.mustCreateBeforeUse = true;
        return this;
    };
    DynamoDbBuilder.prototype.build = function () {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.tableName) {
            throw new Error('Table name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation({
                tableName: this.tableName,
                keyName: this.keyName,
                readCapacity: this.readCapacity,
                writeCapacity: this.writeCapacity
            }));
        }
        return new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation({
            tableName: this.tableName,
            keyName: this.keyName,
            readCapacity: this.readCapacity,
            writeCapacity: this.writeCapacity
        });
    };
    return DynamoDbBuilder;
}());
exports.DynamoDbBuilder = DynamoDbBuilder;
//# sourceMappingURL=dynamo-db.builder.js.map