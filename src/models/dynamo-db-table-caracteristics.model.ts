export const GENERATED_SORT_KEY = 'generatedSortKey';

export interface DynamoDbTableCaracteristicsModel {
    tableName: string;
    partitionKeyName: string;
    sortKeyName?: string;
    readCapacity?: number;
    writeCapacity?: number;
}
