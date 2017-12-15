import {DynamoDbRepository} from './dynamo-db.repository';
import {CreateTableInput} from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {DynamoDbRepositoryImplementation} from './dynamo-db.repository.implementation';

export class DynamoDbRepositoryProxy implements DynamoDbRepository {

    constructor(private dynamoDbRepository: DynamoDbRepositoryImplementation,
                private dynamoDbClient: DynamoDB = new DynamoDB({region: process.env.AWS_REGION})) {

    }

    createIfNotExists(): Promise<any> {
        const createTableParams: CreateTableInput = {
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
        return this.dynamoDbClient.createTable(createTableParams).promise();
    }

    findAll(): Promise<Array<any>> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findAll());
    }
}
