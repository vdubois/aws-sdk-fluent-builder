import { DynamoDbRepository } from './dynamo-db.repository';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { CreateTableInput } from 'aws-sdk/clients/dynamodb';
import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';

export class DynamoDbRepositoryProxy implements DynamoDbRepository {

    constructor(private dynamoDbRepository: DynamoDbRepositoryImplementation,
        private dynamoDbClient: DynamoDB = new DynamoDB({region: process.env.AWS_REGION})) {
    }

    async createIfNotExists(): Promise<any> {
        const createTableParams: CreateTableInput = {
            TableName: this.dynamoDbRepository.tableName,
            AttributeDefinitions: this.attributeDefinitions(),
            KeySchema: this.keySchema(),
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

    private attributeDefinitions() {
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

    private keySchema() {
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

    async findOneByPartitionKey(id: string): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.findOneByPartitionKey(id);
    }

    async findOneByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.findOneByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue);
    }

    async findAllByPartitionKey(partitionKeyValue: string): Promise<Array<any>> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.findAllByPartitionKey(partitionKeyValue);
    }

    async save(entity: object): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.save(entity);
    }

    async saveAll(entities: Array<object>, byChunkOf: number = 25): Promise<void> {
        await this.createIfNotExists();
        await this.dynamoDbRepository.saveAll(entities, byChunkOf);
    }

    async deleteByPartitionKey(partitionKeyValue: string): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.deleteByPartitionKey(partitionKeyValue);
    }

    async deleteByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any> {
        await this.createIfNotExists();
        return this.dynamoDbRepository.deleteByPartitionKeyAndSortKey(partitionKeyValue, sortKeyValue);
    }
}
