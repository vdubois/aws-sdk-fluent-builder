import { DynamoDbRepository } from '../../repositories/dynamodb/dynamo-db.repository';
export declare class DynamoDbBuilder {
    private tableName;
    private partitionKeyName;
    private sortKeyName?;
    private readCapacity;
    private writeCapacity;
    private mustCreateBeforeUse;
    withTableName(tableName: string): DynamoDbBuilder;
    withPartitionKeyName(partitionKeyName: string): DynamoDbBuilder;
    withSortKeyName(sortKeyName: string): DynamoDbBuilder;
    withGeneratedSortKey(): DynamoDbBuilder;
    withReadCapacity(readCapacity: number): DynamoDbBuilder;
    withWriteCapacity(writeCapacity: number): DynamoDbBuilder;
    createIfNotExists(): DynamoDbBuilder;
    build(): DynamoDbRepository;
}
