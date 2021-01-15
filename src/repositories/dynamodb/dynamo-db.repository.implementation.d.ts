import { DynamoDbRepository } from './dynamo-db.repository';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDbTableCaracteristicsModel } from '../../models/dynamo-db-table-caracteristics.model';
export declare class DynamoDbRepositoryImplementation implements DynamoDbRepository {
    private caracteristics;
    private dynamoDbClient;
    constructor(caracteristics: DynamoDbTableCaracteristicsModel, dynamoDbClient?: DocumentClient);
    get tableName(): string;
    get keyName(): string;
    get readCapacity(): number;
    get writeCapacity(): number;
    findAll(): Promise<Array<any>>;
    findById(id: string): Promise<any>;
    findBy(field: string, value: string): Promise<Array<any>>;
    save(entity: object): Promise<any>;
    deleteById(id: string): Promise<any>;
    deleteAll(): Promise<void>;
    private scan;
    private flattenArray;
}
