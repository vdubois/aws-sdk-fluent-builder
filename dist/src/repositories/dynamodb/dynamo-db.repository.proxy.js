"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DynamoDB = require("aws-sdk/clients/dynamodb");
var DynamoDbRepositoryProxy = /** @class */ (function () {
    function DynamoDbRepositoryProxy(dynamoDbRepository, dynamoDbClient) {
        if (dynamoDbClient === void 0) { dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION }); }
        this.dynamoDbRepository = dynamoDbRepository;
        this.dynamoDbClient = dynamoDbClient;
    }
    DynamoDbRepositoryProxy.prototype.createIfNotExists = function () {
        var _this = this;
        var createTableParams = {
            TableName: this.dynamoDbRepository.tableName,
            AttributeDefinitions: [{
                    AttributeName: this.dynamoDbRepository.keyName,
                    AttributeType: 'S'
                }],
            KeySchema: [{
                    AttributeName: this.dynamoDbRepository.keyName,
                    KeyType: 'HASH'
                }],
            ProvisionedThroughput: {
                ReadCapacityUnits: this.dynamoDbRepository.readCapacity,
                WriteCapacityUnits: this.dynamoDbRepository.writeCapacity
            }
        };
        return this.dynamoDbClient.listTables().promise()
            .then(function (results) {
            if (results.TableNames.some(function (name) { return _this.dynamoDbRepository.tableName === name; })) {
                return Promise.resolve({});
            }
            else {
                return _this.dynamoDbClient.createTable(createTableParams).promise()
                    .then(function () { return _this.dynamoDbClient.waitFor('tableExists', { TableName: _this.dynamoDbRepository.tableName }).promise(); });
            }
        });
    };
    DynamoDbRepositoryProxy.prototype.findAll = function () {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.findAll(); });
    };
    DynamoDbRepositoryProxy.prototype.findById = function (id) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.findById(id); });
    };
    DynamoDbRepositoryProxy.prototype.findBy = function (field, value) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.findBy(field, value); });
    };
    DynamoDbRepositoryProxy.prototype.save = function (entity) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.save(entity); });
    };
    DynamoDbRepositoryProxy.prototype.deleteById = function (id) {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.deleteById(id); });
    };
    DynamoDbRepositoryProxy.prototype.deleteAll = function () {
        var _this = this;
        return this.createIfNotExists()
            .then(function () { return _this.dynamoDbRepository.deleteAll(); });
    };
    return DynamoDbRepositoryProxy;
}());
exports.DynamoDbRepositoryProxy = DynamoDbRepositoryProxy;
//# sourceMappingURL=dynamo-db.repository.proxy.js.map