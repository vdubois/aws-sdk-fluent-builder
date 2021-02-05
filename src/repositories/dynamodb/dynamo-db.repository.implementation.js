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
exports.DynamoDbRepositoryImplementation = void 0;
const dynamodb_1 = require("aws-sdk/clients/dynamodb");
class DynamoDbRepositoryImplementation {
    constructor(caracteristics, dynamoDbClient = new dynamodb_1.DocumentClient({ region: process.env.AWS_REGION })) {
        this.caracteristics = caracteristics;
        this.dynamoDbClient = dynamoDbClient;
    }
    get tableName() {
        return this.caracteristics.tableName;
    }
    get keyName() {
        return this.caracteristics.keyName;
    }
    get readCapacity() {
        return this.caracteristics.readCapacity;
    }
    get writeCapacity() {
        return this.caracteristics.writeCapacity;
    }
    findAll() {
        const scanParams = {
            TableName: this.tableName
        };
        return this.scan(scanParams);
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const getParams = {
                TableName: this.tableName,
            };
            getParams.Key = {};
            getParams.Key[this.keyName] = id;
            const result = yield this.dynamoDbClient.get(getParams).promise();
            return result.Item;
        });
    }
    findBy(field, value) {
        const scanParams = {
            TableName: this.tableName
        };
        scanParams.ScanFilter = {};
        scanParams.ScanFilter[field] = {
            ComparisonOperator: 'EQ',
            AttributeValueList: [value]
        };
        return this.scan(scanParams);
    }
    save(entity) {
        const putParams = {
            TableName: this.tableName,
            Item: entity
        };
        return this.dynamoDbClient.put(putParams).promise();
    }
    saveAll(entities, byChunkOf = 25) {
        const chunks = function (array, size) {
            if (!array.length) {
                return [];
            }
            const head = array.slice(0, size);
            const tail = array.slice(size);
            return [head, ...chunks(tail, size)];
        };
        const putParams = {
            RequestItems: {}
        };
        const chunkedEntities = chunks(entities, byChunkOf);
        chunkedEntities.forEach((entitiesToSave) => {
            putParams.RequestItems[this.tableName] = entitiesToSave.map(entity => ({
                PutRequest: {
                    Item: entity
                }
            }));
        });
        return this.dynamoDbClient.batchWrite(putParams).promise();
    }
    deleteById(id) {
        const deleteParams = {
            TableName: this.tableName
        };
        deleteParams.Key = {};
        deleteParams.Key[this.keyName] = id;
        return this.dynamoDbClient.delete(deleteParams).promise();
    }
    deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.findAll();
            for (const item of items) {
                yield this.deleteById(item[this.keyName]);
            }
        });
    }
    scan(scanParams, alreadyScannedItems) {
        return __awaiter(this, void 0, void 0, function* () {
            const scannedItems = alreadyScannedItems || [];
            scanParams.ConsistentRead = true;
            const result = yield this.dynamoDbClient.scan(scanParams).promise();
            scannedItems.push(result.Items);
            if (result.LastEvaluatedKey) {
                scanParams.ExclusiveStartKey = result.LastEvaluatedKey;
                return this.scan(scanParams, scannedItems);
            }
            else {
                return Promise.resolve(this.flattenArray(scannedItems));
            }
        });
    }
    flattenArray(arrayOfArray) {
        return [].concat.apply([], arrayOfArray);
    }
}
exports.DynamoDbRepositoryImplementation = DynamoDbRepositoryImplementation;
