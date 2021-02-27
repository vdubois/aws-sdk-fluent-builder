import { DynamoDbRepository } from './dynamo-db.repository';
import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
export declare class DynamoDbRepositoryProxy implements DynamoDbRepository {
    private dynamoDbRepository;
    private dynamoDbClient;
    constructor(dynamoDbRepository: DynamoDbRepositoryImplementation, dynamoDbClient?: DynamoDB);
    createIfNotExists(): Promise<any>;
    private attributeDefinitions;
    private keySchema;
    findOneByPartitionKey(id: string): Promise<any>;
    findOneByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any>;
    findAllByPartitionKey(partitionKeyValue: string): Promise<Array<any>>;
    save(entity: object): Promise<any>;
    saveAll(entities: Array<object>, byChunkOf?: number): Promise<void>;
    deleteByPartitionKey(partitionKeyValue: string): Promise<any>;
    deleteByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any>;
}
