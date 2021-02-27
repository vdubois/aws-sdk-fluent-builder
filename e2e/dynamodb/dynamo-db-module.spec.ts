import { DynamoDbBuilder } from '../../src/builders/dynamodb/dynamo-db.builder';
import { CreateTableInput, DeleteTableInput, DocumentClient } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');

const tableNameWithComposedKey = 'dynamo-db-module-pk-sk-e2e';
const tableNameWithPartitionKey = 'dynamo-db-module-pk-e2e';
const dynamoDbRepositoryWithComposedKey = new DynamoDbBuilder()
    .withTableName(tableNameWithComposedKey)
    .withPartitionKeyName('id')
    .withSortKeyName('sort')
    .build();
const dynamoDbRepositoryWithPartitionKey = new DynamoDbBuilder()
    .withTableName(tableNameWithPartitionKey)
    .withPartitionKeyName('id')
    .build();

describe('DynamoDB module', () => {

    describe('createIfNotExists function', () => {

        it('should create table if it does not exist', async done => {
            try {
                // GIVEN
                await deleteTableIfExist(tableNameWithComposedKey);

                // WHEN
                const tableRepository = new DynamoDbBuilder()
                    .withTableName(tableNameWithComposedKey)
                    .withPartitionKeyName('id')
                    .withSortKeyName('sort')
                    .createIfNotExists()
                    .build();
                // In order to create the table
                await tableRepository.findOneByPartitionKeyAndSortKey('1', '2');
                const tableNames = await listTables();

                // THEN
                expect(tableNames).toContain(tableNameWithComposedKey);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not throw an error if table already exists', async done => {
            // GIVEN
            const tableRepository = new DynamoDbBuilder()
                .withTableName(tableNameWithComposedKey)
                .withPartitionKeyName('id')
                .withSortKeyName('sort')
                .createIfNotExists()
                .build();
            await createTableIfNotExist(tableNameWithComposedKey, 'sort');

            // WHEN
            try {
                const results = await tableRepository.findOneByPartitionKeyAndSortKey('1', '2');
                // THEN
                expect(results).not.toBeNull();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findOneByPartitionKey function', () => {

        it('should return an object specified by its id', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithPartitionKey);
                await emptyTable(tableNameWithPartitionKey);
                await insertItemInTable({id: '3', value: 'test 3'}, tableNameWithPartitionKey);
                await insertItemInTable({id: '4', value: 'test 4'}, tableNameWithPartitionKey);
                // WHEN
                const result = await dynamoDbRepositoryWithPartitionKey.findOneByPartitionKey('4');
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual({id: '4', value: 'test 4'});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not return an object if its id does not exists', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithPartitionKey);
                await emptyTable(tableNameWithPartitionKey);
                await insertItemInTable({id: '3', value: 'test 3'}, tableNameWithPartitionKey);
                await insertItemInTable({id: '4', value: 'test 4'}, tableNameWithPartitionKey);
                // WHEN
                const result = await dynamoDbRepositoryWithPartitionKey.findOneByPartitionKey('5');
                // THEN
                expect(result).toBeUndefined();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findOneByPartitionKeyAndSortKey function', () => {

        it('should return an object specified by its id', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey);
                await insertItemInTable({id: '3', sort: '1', value: 'test 3'}, tableNameWithComposedKey);
                await insertItemInTable({id: '3', sort: '2', value: 'test 3 bis'}, tableNameWithComposedKey);
                await insertItemInTable({id: '4', sort: '1', value: 'test 4'}, tableNameWithComposedKey);
                await insertItemInTable({id: '4', sort: '2', value: 'test 4 bis'}, tableNameWithComposedKey);
                // WHEN
                const result = await dynamoDbRepositoryWithComposedKey.findOneByPartitionKeyAndSortKey('4', '2');
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual({id: '4', sort: '2', value: 'test 4 bis'});
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not return an object if its id does not exists', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey, 'sort');
                await insertItemInTable({id: '3', sort: '1', value: 'test 3'}, tableNameWithComposedKey);
                await insertItemInTable({id: '3', sort: '2', value: 'test 3 bis'}, tableNameWithComposedKey);
                await insertItemInTable({id: '4', sort: '1', value: 'test 4'}, tableNameWithComposedKey);
                await insertItemInTable({id: '4', sort: '2', value: 'test 4 bis'}, tableNameWithComposedKey);
                // WHEN
                const result = await dynamoDbRepositoryWithComposedKey.findOneByPartitionKeyAndSortKey('5', '1');
                // THEN
                expect(result).toBeUndefined();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findAllByPartitionKey function', () => {

        it('should return all table objects that match the partition key', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey);
                await emptyTable(tableNameWithComposedKey, 'sort');
                await insertItemInTable({id: '1', sort: '1', value: 'test'}, tableNameWithComposedKey);
                await insertItemInTable({id: '2', sort: '1', value: 'test2'}, tableNameWithComposedKey);
                await insertItemInTable({id: '3', sort: '1', value: 'test3'}, tableNameWithComposedKey);
                await insertItemInTable({id: '1', sort: '2', value: 'test4'}, tableNameWithComposedKey);
                await insertItemInTable({id: '2', sort: '2', value: 'test5'}, tableNameWithComposedKey);
                await insertItemInTable({id: '3', sort: '2', value: 'test6'}, tableNameWithComposedKey);
                await insertItemInTable({id: '1', sort: '3', value: 'test7'}, tableNameWithComposedKey);
                await insertItemInTable({id: '2', sort: '3', value: 'test8'}, tableNameWithComposedKey);
                await insertItemInTable({id: '3', sort: '3', value: 'test9'}, tableNameWithComposedKey);

                // WHEN
                const results = await dynamoDbRepositoryWithComposedKey.findAllByPartitionKey('2');

                // THEN
                expect(results).not.toBeNull();
                expect(results).toEqual([
                    {id: '2', sort: '1', value: 'test2'},
                    {id: '2', sort: '2', value: 'test5'},
                    {id: '2', sort: '3', value: 'test8'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('save function', () => {

        it('should save objects in database', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey, 'sort');
                await dynamoDbRepositoryWithComposedKey.save({id: 'test', sort: '1', value: 'myValue'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'test2', sort: '1', value: 'myValue2'});

                // WHEN
                const results = await listAll(tableNameWithComposedKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should an object with same id multiple times just one time in database', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey, 'sort');
                await dynamoDbRepositoryWithComposedKey.save({id: 'test', sort: '1', value: 'myValue'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'test', sort: '1', value: 'myValue2'});

                // WHEN
                const results = await listAll(tableNameWithComposedKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(1);
                expect(results).toEqual([{id: 'test', sort: '1', value: 'myValue2'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('saveAll function', () => {

        it('should save objects in database', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey, 'sort');
                await dynamoDbRepositoryWithComposedKey.saveAll([
                    {id: 'test', sort: '1', value: 'myValue'},
                    {id: 'test2', sort: '1', value: 'myValue2'}
                ], 1);

                // WHEN
                const results = await listAll(tableNameWithComposedKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteByPartitionKey function', () => {

        it('should delete an object with its id', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithPartitionKey);
                await emptyTable(tableNameWithPartitionKey);
                await dynamoDbRepositoryWithPartitionKey.save({id: 'a', value: 'myValue'});
                await dynamoDbRepositoryWithPartitionKey.save({id: 'b', value: 'myValue2'});

                // WHEN
                await dynamoDbRepositoryWithPartitionKey.deleteByPartitionKey('a');
                const results = await listAll(tableNameWithPartitionKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(1);
                expect(results).toEqual([{id: 'b', value: 'myValue2'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not delete anything with an id that does not exist', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithPartitionKey);
                await emptyTable(tableNameWithPartitionKey);
                await dynamoDbRepositoryWithPartitionKey.save({id: 'a', value: 'myValue'});
                await dynamoDbRepositoryWithPartitionKey.save({id: 'b', value: 'myValue2'});

                // WHEN
                await dynamoDbRepositoryWithPartitionKey.deleteByPartitionKey('c');
                const results = await listAll(tableNameWithPartitionKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                expect(results).toEqual([{id: 'b', value: 'myValue2'}, {id: 'a', value: 'myValue'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteByPartitionKeyAndSortKey function', () => {

        it('should delete an object with its id', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey, 'sort');
                await dynamoDbRepositoryWithComposedKey.save({id: 'a', sort: '1', value: 'myValue'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'a', sort: '2', value: 'myValue2'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'b', sort: '1', value: 'myValue3'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'b', sort: '2', value: 'myValue4'});

                // WHEN
                await dynamoDbRepositoryWithComposedKey.deleteByPartitionKeyAndSortKey('a', '2');
                const results = await listAll(tableNameWithComposedKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(3);
                expect(results).toEqual(expect.arrayContaining([
                    {id: 'a', sort: '1', value: 'myValue'},
                    {id: 'b', sort: '1', value: 'myValue3'},
                    {id: 'b', sort: '2', value: 'myValue4'}
                ]));
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not delete anything with an id that does not exist', async done => {
            try {
                // GIVEN
                await createTableIfNotExist(tableNameWithComposedKey, 'sort');
                await emptyTable(tableNameWithComposedKey, 'sort');
                await dynamoDbRepositoryWithComposedKey.save({id: 'a', sort: '1', value: 'myValue'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'a', sort: '2', value: 'myValue2'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'b', sort: '1', value: 'myValue3'});
                await dynamoDbRepositoryWithComposedKey.save({id: 'b', sort: '2', value: 'myValue4'});

                // WHEN
                await dynamoDbRepositoryWithComposedKey.deleteByPartitionKeyAndSortKey('c', '3');
                const results = await listAll(tableNameWithComposedKey);

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(4);
                expect(results).toEqual(expect.arrayContaining([
                    {id: 'a', sort: '1', value: 'myValue'},
                    {id: 'a', sort: '2', value: 'myValue2'},
                    {id: 'b', sort: '1', value: 'myValue3'},
                    {id: 'b', sort: '2', value: 'myValue4'}
                ]));
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});

const createTableIfNotExist = async (tableName: string, sortKeyName?: string): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.listTables({}).promise();
    if (TableNames.some(name => name === tableName)) {
        return Promise.resolve({});
    } else {
        const createTableParams: CreateTableInput = {
            TableName: tableName,
            AttributeDefinitions: [{
                AttributeName: 'id',
                AttributeType: 'S'
            }, sortKeyName && {
                AttributeName: 'sort',
                AttributeType: 'S'
            }].filter(attributeDefinition => attributeDefinition),
            KeySchema: [{
                AttributeName: 'id',
                KeyType: 'HASH'
            }, sortKeyName && {
                AttributeName: sortKeyName,
                KeyType: 'RANGE'
            }].filter(key => key),
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        };
        await dynamoDbClient.createTable(createTableParams).promise();
        return dynamoDbClient.waitFor('tableExists', {TableName: tableName}).promise();
    }
};

const emptyTable = async (tableName: string, sortKeyName?: string): Promise<void> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const {Items} = await dynamoDbClient.scan({TableName: tableName}).promise();
    for (const item of Items) {
        const deleteParams = {
            TableName: tableName,
            Key: {
                id: item.id
            }
        };
        if (sortKeyName) {
            deleteParams.Key[sortKeyName] = item[sortKeyName];
        }
        await dynamoDbClient.delete(deleteParams).promise();
    }
};

const deleteTableIfExist = async (tableName: string): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    try {
        const deleteTableParams: DeleteTableInput = {
            TableName : tableName
        };
        await dynamoDbClient.deleteTable(deleteTableParams).promise();
    } catch (err) {
        console.log(err);
    }
};

const insertItemInTable = (item: object, tableName: string): Promise<any> =>  {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const putParams: DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: item
    };
    return dynamoDbClient.put(putParams).promise();
};

const listAll = async (tableName: string): Promise<any> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const {Items} = await dynamoDbClient.scan({TableName: tableName}).promise();
    return Items;
};

const listTables = async (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.listTables({}).promise();
    return TableNames;
};
