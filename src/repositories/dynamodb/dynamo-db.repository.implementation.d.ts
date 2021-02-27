import { DynamoDbRepository } from './dynamo-db.repository';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDbTableCaracteristicsModel } from '../../models/dynamo-db-table-caracteristics.model';
export declare class DynamoDbRepositoryImplementation implements DynamoDbRepository {
    private caracteristics;
    private dynamoDbClient;
    constructor(caracteristics: DynamoDbTableCaracteristicsModel, dynamoDbClient?: DocumentClient);
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
