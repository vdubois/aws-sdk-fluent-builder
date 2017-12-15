export interface DynamoDbRepository {

    findAll(): Promise<Array<any>>;
}
