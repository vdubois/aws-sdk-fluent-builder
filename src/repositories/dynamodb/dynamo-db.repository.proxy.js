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
exports.DynamoDbRepositoryProxy = void 0;
const DynamoDB = require("aws-sdk/clients/dynamodb");
class DynamoDbRepositoryProxy {
    constructor(dynamoDbRepository, dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION })) {
        this.dynamoDbRepository = dynamoDbRepository;
        this.dynamoDbClient = dynamoDbClient;
    }
    createIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            const createTableParams = {
                TableName: this.dynamoDbRepository.tableName,
                AttributeDefinitions: this.attributeDefinitions(),
                KeySchema: this.keySchema(),
                ProvisionedThroughput: {
                    ReadCapacityUnits: this.dynamoDbRepository.readCapacity,
                    WriteCapacityUnits: this.dynamoDbRepository.writeCapacity
                }
            };
            const results = yield this.dynamoDbClient.listTables().promise();
            if (results.TableNames.some(name => this.dynamoDbRepository.tableName === name)) {
                return Promise.resolve({});
            }
            else {
                yield this.dynamoDbClient.createTable(createTableParams).promise();
                return this.dynamoDbClient.waitFor('tableExists', { TableName: this.dynamoDbRepository.tableName }).promise();
            }
        });
    }
    attributeDefinitions() {
        const attributeDefinitions = [{
                AttributeName: this.dynamoDbRepository.partitionKeyName,
                AttributeType: 'S'
            }];
        if (this.dynamoDbRepository.sortKeyName) {
            attributeDefinitions.push({
                AttributeName: this.dynamoDbRepository.sortKeyName,
                AttributeType: 'S'
            });
        }
        return attributeDefinitions;
    }
    keySchema() {
        const keySchema = [{
                AttributeName: this.dynamoDbRepository.partitionKeyName,
                KeyType: 'HASH'
            }];
        if (this.dynamoDbRepository.sortKeyName) {
            keySchema.push({
                AttributeName: this.dynamoDbRepository.sortKeyName,
                KeyType: 'RANGE'
            });
        }
        return keySchema;
    }
    findOneByPartitionKey(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.dynamoDbRepository.findOneByPartitionKey(id);
        });
    }
    findOneByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.dynamoDbRepository.findOneByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue);
        });
    }
    findAllByPartitionKey(partitionKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.dynamoDbRepository.findAllByPartitionKey(partitionKeyValue);
        });
    }
    save(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.dynamoDbRepository.save(entity);
        });
    }
    saveAll(entities, byChunkOf = 25) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            yield this.dynamoDbRepository.saveAll(entities, byChunkOf);
        });
    }
    deleteByPartitionKey(partitionKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.dynamoDbRepository.deleteByPartitionKey(partitionKeyValue);
        });
    }
    deleteByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.dynamoDbRepository.deleteByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue);
        });
    }
}
exports.DynamoDbRepositoryProxy = DynamoDbRepositoryProxy;
