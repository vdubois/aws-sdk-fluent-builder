"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(scanResult => scanResult.Items);
    }
    findById(id) {
        const getParams = {
            TableName: this.tableName,
        };
        getParams.Key = {};
        getParams.Key[this.keyName] = id;
        return this.dynamoDbClient.get(getParams)
            .promise()
            .then(getResult => getResult.Item);
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
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(queryResult => queryResult.Items);
    }
    save(entity) {
        const putParams = {
            TableName: this.tableName,
            Item: entity
        };
        return this.dynamoDbClient.put(putParams).promise();
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
        return this.findAll()
            .then(items => Promise.all(items.map(item => this.deleteById(item[this.keyName]))));
    }
}
exports.DynamoDbRepositoryImplementation = DynamoDbRepositoryImplementation;
