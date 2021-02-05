import {DynamoDbRepository} from './dynamo-db.repository';
import { CreateTableInput } from 'aws-sdk/clients/dynamodb';
import {DynamoDbRepositoryImplementation} from './dynamo-db.repository.implementation';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';

export class DynamoDbRepositoryProxy implements DynamoDbRepository {

    constructor(private dynamoDbRepository: DynamoDbRepositoryImplementation,
        private dynamoDbClient: DynamoDB = new DynamoDB({region: process.env.AWS_REGION})) {
    }

    async createIfNotExists(): Promise<any> {
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
        const results = await this.dynamoDbClient.listTables().promise();
        if (results.TableNames.some(name => this.dynamoDbRepository.tableName === name)) {
            return Promise.resolve({});
        } else {
            await this.dynamoDbClient.createTable(createTableParams).promise();
            return this.dynamoDbClient.waitFor('tableExists', {TableName: this.dynamoDbRepository.tableName}).promise();
        }
    }

    async findAll(): Promise<Array<any>> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.findAll();
    }

    async findById(id: string): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.findById(id);
    }

    async findBy(field: string, value: string): Promise<Array<any>> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.findBy(field, value);
    }

    async save(entity: object): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.save(entity);
    }

    async saveAll(entities: Array<object>, byChunkOf: number = 25): Promise<void> {
        await this.createIfNotExists();
        await this.dynamoDbRepository.saveAll(entities, byChunkOf);
    }

    async deleteById(id: string): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.deleteById(id);
    }

    async deleteAll(): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.deleteAll();
    }
}
