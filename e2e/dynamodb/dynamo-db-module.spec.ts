import {expect, test, describe} from 'vitest';

import {DynamoDbBuilder} from '../../src/builders/dynamodb/dynamo-db.builder';
import {
    CreateTableCommand,
    CreateTableCommandInput, DeleteItemCommand, DeleteTableCommand,
    DeleteTableCommandInput,
    DynamoDBClient, ListTablesCommand, PutItemCommand,
    PutItemInput,
    ScanCommand,
    waitUntilTableExists
} from '@aws-sdk/client-dynamodb';
import {dynamoDBItemToItem, itemToDynamoDBItem} from '../../src/repositories/dynamodb/dynamo-db-item';

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

        test('should create table if it does not exist', async () => {
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
        });

        test('should not throw an error if table already exists', async () => {
            // GIVEN
            const tableRepository = new DynamoDbBuilder()
                .withTableName(tableNameWithComposedKey)
                .withPartitionKeyName('id')
                .withSortKeyName('sort')
                .createIfNotExists()
                .build();
            await createTableIfNotExist(tableNameWithComposedKey, 'sort');

            // WHEN
            const results = await tableRepository.findOneByPartitionKeyAndSortKey('1', '2');

            // THEN
            expect(results).not.toBeNull();
        }, {timeout: 10000});
    });

    describe('findOneByPartitionKey function', () => {

        test('should return an object specified by its id', async () => {
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
        });

        test('should not return an object if its id does not exists', async () => {
            // GIVEN
            await createTableIfNotExist(tableNameWithPartitionKey);
            await emptyTable(tableNameWithPartitionKey);
            await insertItemInTable({id: '3', value: 'test 3'}, tableNameWithPartitionKey);
            await insertItemInTable({id: '4', value: 'test 4'}, tableNameWithPartitionKey);
            // WHEN
            const result = await dynamoDbRepositoryWithPartitionKey.findOneByPartitionKey('5');
            // THEN
            expect(result).toBeUndefined();
        });
    });

    describe('findOneByPartitionKeyAndSortKey function', () => {

        test('should return an object specified by its id', async () => {
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
        });

        test('should not return an object if its id does not exists', async () => {
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
        });
    });

    describe('findAllByPartitionKey function', () => {

        test('should return all table objects that match the partition key', async () => {
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
        });
    });

    describe('save function', () => {

        test('should save objects in database', async () => {
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
        });

        test('should an object with same id multiple times just one time in database', async () => {
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
        });
    });

    describe('saveAll function', () => {

        test('should save objects in database', async () => {
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
        });
    });

    describe('deleteByPartitionKey function', () => {

        test('should delete an object with its id', async () => {
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
        });

        test('should not delete anything with an id that does not exist', async () => {
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
        });
    });

    describe('deleteByPartitionKeyAndSortKey function', () => {

        test('should delete an object with its id', async () => {
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
        });

        test('should not delete anything with an id that does not exist', async () => {
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
        });
    });
});

const createTableIfNotExist = async (tableName: string, sortKeyName?: string): Promise<any> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.send(new ListTablesCommand({}));
    if (TableNames.some(name => name === tableName)) {
        return Promise.resolve({});
    } else {
        const createTableParams: CreateTableCommandInput = {
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
        await dynamoDbClient.send(new CreateTableCommand(createTableParams));
        return waitUntilTableExists({
            client: dynamoDbClient,
            maxWaitTime: 200
        }, {TableName: tableName});
    }
};

const emptyTable = async (tableName: string, sortKeyName?: string): Promise<void> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    const command = new ScanCommand({TableName: tableName});
    const {Items} = await dynamoDbClient.send(command);
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
        const deleteItemCommand = new DeleteItemCommand(deleteParams);
        await dynamoDbClient.send(deleteItemCommand);
    }
};

const deleteTableIfExist = async (tableName: string): Promise<any> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    try {
        const deleteTableParams: DeleteTableCommandInput = {
            TableName: tableName
        };
        await dynamoDbClient.send(new DeleteTableCommand(deleteTableParams));
    } catch (err) {
        console.log(err);
    }
};

const insertItemInTable = (item: any, tableName: string): Promise<any> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    const putParams: PutItemInput = {
        TableName: tableName,
        Item: itemToDynamoDBItem(item)
    };
    return dynamoDbClient.send(new PutItemCommand(putParams));
};

const listAll = async (tableName: string): Promise<any> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    const {Items} = await dynamoDbClient.send(new ScanCommand({TableName: tableName}));
    return Items.map(dynamoDbItem => dynamoDBItemToItem(dynamoDbItem));
};

const listTables = async (): Promise<any> => {
    const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.send(new ListTablesCommand({}));
    return TableNames;
};
