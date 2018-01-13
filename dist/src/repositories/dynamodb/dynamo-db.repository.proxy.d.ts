import { DynamoDbRepository } from './dynamo-db.repository';
import { DynamoDbRepositoryImplementation } from './dynamo-db.repository.implementation';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
export declare class DynamoDbRepositoryProxy implements DynamoDbRepository {
    private dynamoDbRepository;
    private dynamoDbClient;
    constructor(dynamoDbRepository: DynamoDbRepositoryImplementation, dynamoDbClient?: DynamoDB);
    createIfNotExists(): Promise<any>;
    findAll(): Promise<Array<any>>;
    findById(id: string): Promise<any>;
    findBy(field: string, value: string): Promise<Array<any>>;
    save(entity: object): Promise<any>;
    deleteById(id: string): Promise<any>;
    deleteAll(): Promise<any>;
}
