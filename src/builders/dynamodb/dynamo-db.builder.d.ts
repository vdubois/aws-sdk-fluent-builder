import { DynamoDbRepository } from '../../repositories/dynamodb/dynamo-db.repository';
export declare class DynamoDbBuilder {
    private tableName;
    private keyName;
    private readCapacity;
    private writeCapacity;
    private mustCreateBeforeUse;
    withTableName(tableName: string): DynamoDbBuilder;
    withKeyName(keyname: string): DynamoDbBuilder;
    withReadCapacity(readCapacity: number): DynamoDbBuilder;
    withWriteCapacity(writeCapacity: number): DynamoDbBuilder;
    createIfNotExists(): DynamoDbBuilder;
    build(): DynamoDbRepository;
}
