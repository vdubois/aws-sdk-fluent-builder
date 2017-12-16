export interface DynamoDbRepository {

    findAll(): Promise<Array<any>>;

    findById(id: string): Promise<any>;

    findBy(field: string, value: string): Promise<Array<any>>;

    save(entity: object): Promise<any>;

    deleteById(id: string): Promise<any>;

    deleteAll(): Promise<any>;
}
