import {DynamoDbRepository} from './dynamo-db.repository';
import { CreateTableInput } from 'aws-sdk/clients/dynamodb';
import {DynamoDbRepositoryImplementation} from './dynamo-db.repository.implementation';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';

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
        return this.dynamoDbClient.listTables().promise()
            .then(results => {
                if (results.TableNames.some(name => this.dynamoDbRepository.tableName === name)) {
                    return Promise.resolve({});
                } else {
                    return this.dynamoDbClient.createTable(createTableParams).promise()
                        .then(() => this.dynamoDbClient.waitFor('tableExists', {TableName: this.dynamoDbRepository.tableName}).promise());
                }
            });
    }

    findAll(): Promise<Array<any>> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findAll());
    }

    findById(id: string): Promise<any> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findById(id));
    }

    findBy(field: string, value: string): Promise<Array<any>> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.findBy(field, value));
    }

    save(entity: object): Promise<any> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.save(entity));
    }

    deleteById(id: string): Promise<any> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.deleteById(id));
    }

    deleteAll(): Promise<any> {
        return this.createIfNotExists()
            .then(() => this.dynamoDbRepository.deleteAll());
    }
}
