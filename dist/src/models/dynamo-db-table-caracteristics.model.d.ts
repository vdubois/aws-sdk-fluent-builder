export interface DynamoDbTableCaracteristicsModel {
    tableName: string;
    keyName?: string;
    readCapacity?: number;
    writeCapacity?: number;
}
