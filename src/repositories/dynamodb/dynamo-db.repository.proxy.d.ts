import { DynamoDbRepository } from './dynamo-db.repository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';
export declare class DynamoDbRepositoryProxy implements DynamoDbRepository {
    private dynamoDbRepository;
    private dynamoDbClient;
    constructor(dynamoDbRepository: DynamoDbRepositoryImplementation, dynamoDbClient?: DynamoDBClient);
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
