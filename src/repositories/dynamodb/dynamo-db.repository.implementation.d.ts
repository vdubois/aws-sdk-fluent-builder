import { DynamoDbRepository } from './dynamo-db.repository';
import { DynamoDbTableCaracteristicsModel } from '../../models/dynamo-db-table-caracteristics.model';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
export declare class DynamoDbRepositoryImplementation implements DynamoDbRepository {
    private caracteristics;
    private dynamoDbClient;
    constructor(caracteristics: DynamoDbTableCaracteristicsModel, dynamoDbClient?: DynamoDBClient);
    get tableName(): string;
    get partitionKeyName(): string;
    get sortKeyName(): string;
    get readCapacity(): number;
    get writeCapacity(): number;
    private get withGeneratedSortKey();
    findOneByPartitionKey(partitionKeyValue: string): Promise<any>;
    findOneByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any>;
    findAllByPartitionKey(partitionKeyValue: string): Promise<Array<any>>;
    save(entity: object): Promise<any>;
    saveAll(entities: Array<object>, byChunkOf?: number): Promise<void>;
    deleteByPartitionKey(partitionKeyValue: string): Promise<any>;
    deleteByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any>;
}
