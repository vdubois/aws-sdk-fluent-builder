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
const dynamo_db_table_caracteristics_model_1 = require("../../models/dynamo-db-table-caracteristics.model");
const uuid_1 = require("uuid");
class DynamoDbRepositoryImplementation {
    constructor(caracteristics, dynamoDbClient = new dynamodb_1.DocumentClient({ region: process.env.AWS_REGION })) {
        this.caracteristics = caracteristics;
        this.dynamoDbClient = dynamoDbClient;
    }
    get tableName() {
        return this.caracteristics.tableName;
    }
    get partitionKeyName() {
        return this.caracteristics.partitionKeyName;
    }
    get sortKeyName() {
        return this.caracteristics.sortKeyName;
    }
    get readCapacity() {
        return this.caracteristics.readCapacity;
    }
    get writeCapacity() {
        return this.caracteristics.writeCapacity;
    }
    get withGeneratedSortKey() {
        return this.caracteristics.sortKeyName === dynamo_db_table_caracteristics_model_1.GENERATED_SORT_KEY;
    }
    findOneByPartitionKey(partitionKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const getParams = {
                TableName: this.tableName,
            };
            getParams.Key = {};
            getParams.Key[this.partitionKeyName] = partitionKeyValue;
            const result = yield this.dynamoDbClient.get(getParams).promise();
            return result.Item;
        });
    }
    findOneByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const getParams = {
                TableName: this.tableName,
            };
            getParams.Key = {};
            getParams.Key[this.partitionKeyName] = partitionKeyValue;
            getParams.Key[this.sortKeyName] = sortKeyValue;
            const result = yield this.dynamoDbClient.get(getParams).promise();
            return result.Item;
        });
    }
    findAllByPartitionKey(partitionKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryParams;
            queryParams = {
                TableName: this.tableName,
                KeyConditionExpression: `${this.partitionKeyName} = :pk`,
                ExpressionAttributeValues: {
                    // @ts-ignore
                    ':pk': partitionKeyValue
                }
            };
            const results = yield this.dynamoDbClient.query(queryParams).promise();
            return results.Items;
        });
    }
    save(entity) {
        // @ts-ignore
        const putParams = {
            TableName: this.tableName,
        };
        putParams.Item = entity;
        if (this.withGeneratedSortKey) {
            putParams.Item[`${dynamo_db_table_caracteristics_model_1.GENERATED_SORT_KEY}`] = uuid_1.v4();
        }
        return this.dynamoDbClient.put(putParams).promise();
    }
    saveAll(entities, byChunkOf = 25) {
        return __awaiter(this, void 0, void 0, function* () {
            const chunks = function (array, size) {
                if (!array.length) {
                    return [];
                }
                const head = array.slice(0, size);
                const tail = array.slice(size);
                return [head, ...chunks(tail, size)];
            };
            const chunkedEntities = chunks(entities, byChunkOf);
            for (const entitiesToSave of chunkedEntities) {
                const putParams = {
                    RequestItems: {}
                };
                putParams.RequestItems[this.tableName] = entitiesToSave.map(entity => {
                    const putRequest = {
                        PutRequest: {
                            Item: entity
                        }
                    };
                    if (this.withGeneratedSortKey) {
                        putRequest.PutRequest.Item[dynamo_db_table_caracteristics_model_1.GENERATED_SORT_KEY] = uuid_1.v4();
                    }
                    return putRequest;
                });
                yield this.dynamoDbClient.batchWrite(putParams).promise();
            }
        });
    }
    deleteByPartitionKey(partitionKeyValue) {
        const deleteParams = {
            TableName: this.tableName,
        };
        deleteParams.Key = {};
        deleteParams.Key[this.partitionKeyName] = partitionKeyValue;
        return this.dynamoDbClient.delete(deleteParams).promise();
    }
    deleteByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue) {
        const deleteParams = {
            TableName: this.tableName,
        };
        deleteParams.Key = {};
        deleteParams.Key[this.partitionKeyName] = partitionKeyValue;
        deleteParams.Key[this.sortKeyName] = sortKeyValue;
        return this.dynamoDbClient.delete(deleteParams).promise();
    }
}
exports.DynamoDbRepositoryImplementation = DynamoDbRepositoryImplementation;
