"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DynamoDB = require("aws-sdk/clients/dynamodb");
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
        if (!this.tableName) {
            throw new Error('Table name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            var dynamoDbClient = new DynamoDB();
            yield dynamoDbClient.createTable().promise();
        }
        return new DynamoDbRepository(this.tableName, this.keyName, this.readCapacity, this.writeCapacity);
    };
    return DynamoDbBuilder;
}());
exports.DynamoDbBuilder = DynamoDbBuilder;
var DynamoDbRepository = /** @class */ (function () {
    function DynamoDbRepository(_tableName, _keyName, _readCapacity, _writeCapacity) {
        this._tableName = _tableName;
        this._keyName = _keyName;
        this._readCapacity = _readCapacity;
        this._writeCapacity = _writeCapacity;
    }
    Object.defineProperty(DynamoDbRepository.prototype, "tableName", {
        get: function () {
            return this._tableName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepository.prototype, "keyName", {
        get: function () {
            return this._keyName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepository.prototype, "readCapacity", {
        get: function () {
            return this._readCapacity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamoDbRepository.prototype, "writeCapacity", {
        get: function () {
            return this._writeCapacity;
        },
        enumerable: true,
        configurable: true
    });
    return DynamoDbRepository;
}());
exports.DynamoDbRepository = DynamoDbRepository;
//# sourceMappingURL=dynamo-db.builder.js.map