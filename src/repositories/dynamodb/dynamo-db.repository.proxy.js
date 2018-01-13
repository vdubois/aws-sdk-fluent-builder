"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DynamoDB = require("aws-sdk/clients/dynamodb");
class DynamoDbRepositoryProxy {
    constructor(dynamoDbRepository, dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION })) {
        this.dynamoDbRepository = dynamoDbRepository;
        this.dynamoDbClient = dynamoDbClient;
    }
    createIfNotExists() {
        const createTableParams = {
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
            .then(results => {
            if (results.TableNames.some(name => this.dynamoDbRepository.tableName === name)) {
                return Promise.resolve({});
            }
            else {
                return this.dynamoDbClient.createTable(createTableParams).promise()
                    .then(() => this.dynamoDbClient.waitFor('tableExists', { TableName: this.dynamoDbRepository.tableName }).promise());
            }
        });
    }
    findAll() {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findAll());
    }
    findById(id) {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findById(id));
    }
    findBy(field, value) {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findBy(field, value));
    }
    save(entity) {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.save(entity));
    }
    deleteById(id) {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.deleteById(id));
    }
    deleteAll() {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.deleteAll());
    }
}
exports.DynamoDbRepositoryProxy = DynamoDbRepositoryProxy;
