"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
var DynamoDbRepositoryImplementation = /** @class */ (function () {
    function DynamoDbRepositoryImplementation(caracteristics, dynamoDbClient) {
        if (dynamoDbClient === void 0) { dynamoDbClient = new dynamodb_1.DocumentClient({ region: process.env.AWS_REGION }); }
        this.caracteristics = caracteristics;
        this.dynamoDbClient = dynamoDbClient;
    }
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "tableName", {
        get: function () {
            return this.caracteristics.tableName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "keyName", {
        get: function () {
            return this.caracteristics.keyName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "readCapacity", {
        get: function () {
            return this.caracteristics.readCapacity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepositoryImplementation.prototype, "writeCapacity", {
        get: function () {
            return this.caracteristics.writeCapacity;
        },
        enumerable: true,
        configurable: true
    });
    DynamoDbRepositoryImplementation.prototype.findAll = function () {
        var scanParams = {
            TableName: this.tableName
        };
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(function (scanResult) { return scanResult.Items; });
    };
    DynamoDbRepositoryImplementation.prototype.findById = function (id) {
        var getParams = {
            TableName: this.tableName,
        };
        getParams.Key = {};
        getParams.Key[this.keyName] = id;
        return this.dynamoDbClient.get(getParams)
            .promise()
            .then(function (getResult) { return getResult.Item; });
    };
    DynamoDbRepositoryImplementation.prototype.findBy = function (field, value) {
        var scanParams = {
            TableName: this.tableName
        };
        scanParams.ScanFilter = {};
        scanParams.ScanFilter[field] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [value]
        };
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(function (queryResult) { return queryResult.Items; });
    };
    DynamoDbRepositoryImplementation.prototype.save = function (entity) {
        var putParams = {
            TableName: this.tableName,
            Item: entity
        };
        return this.dynamoDbClient.put(putParams).promise();
    };
    DynamoDbRepositoryImplementation.prototype.deleteById = function (id) {
        var deleteParams = {
            TableName: this.tableName
        };
        deleteParams.Key = {};
        deleteParams.Key[this.keyName] = id;
        return this.dynamoDbClient.delete(deleteParams).promise();
    };
    DynamoDbRepositoryImplementation.prototype.deleteAll = function () {
        var _this = this;
        return this.findAll()
            .then(function (items) { return Promise.all(items.map(function (item) { return _this.deleteById(item[_this.keyName]); })); });
    };
    return DynamoDbRepositoryImplementation;
}());
exports.DynamoDbRepositoryImplementation = DynamoDbRepositoryImplementation;
//# sourceMappingURL=dynamo-db.repository.implementation.js.map