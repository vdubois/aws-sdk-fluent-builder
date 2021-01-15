import { DynamoDbBuilder } from '../../src/builders/dynamodb/dynamo-db.builder';
import { CreateTableInput, DeleteTableInput, DocumentClient, PutItemInput } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const tableName = 'dynamo-db-module-e2e';
const dynamoDbRepository = new DynamoDbBuilder()
    .withTableName(tableName)
    .build();

describe('DynamoDB module', () => {

    let originalTimeout;

    /**
     * Sets timeout to 30s.
     */
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    });

    describe('createIfNotExists function', () => {

        it('should create table if it does not exist', async done => {
            try {
                // GIVEN
                await deleteTableIfExist();

                // WHEN
                const tableRepository = new DynamoDbBuilder()
                    .withTableName(tableName)
                    .createIfNotExists()
                    .build();
                // In order to create the table
                await tableRepository.findAll();
                const tableNames = await listTables();

                // THEN
                expect(tableNames).toContain(tableName);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not throw an error if table already exists', async done => {
            // GIVEN
            const tableRepository = new DynamoDbBuilder()
                .withTableName(tableName)
                .createIfNotExists()
                .build();
            await createTableIfNotExist();

            // WHEN
            try {
                const results = await tableRepository.findAll();
                // THEN
                expect(results).not.toBeNull();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findAll function', () => {

        it('should return all table objects', async done => {
            try {
                // GIVEN
                await createTableIfNotExist();
                await emptyTable();
                await insertItem({id: '1', value: 'test'});
                await insertItem({id: '2', value: 'test 2'});

                // WHEN
                const results = await dynamoDbRepository.findAll();

                // THEN
                expect(results).not.toBeNull();
                expect(results).toEqual([{id: '2', value: 'test 2'}, {id: '1', value: 'test'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findById function', () => {

        it('should return an object specified by its id', async done => {
            try {
                // GIVEN
                await createTableIfNotExist();
                await emptyTable();
                await insertItem({id: '3', value: 'test 3'});
                await insertItem({id: '4', value: 'test 4'});
                // WHEN
                const result = await dynamoDbRepository.findById('4');
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
                await createTableIfNotExist();
                await emptyTable();
                await insertItem({id: '3', value: 'test 3'});
                await insertItem({id: '4', value: 'test 4'});
                // WHEN
                const result = await dynamoDbRepository.findById('5');
                // THEN
                expect(result).toBeUndefined();
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findBy function', () => {

        it('should return objects specified by its fields values', async done => {
            try {
                // GIVEN
                await createTableIfNotExist();
                await emptyTable();
                await insertItem({id: '3', value: 'test'});
                await insertItem({id: '4', value: 'test 4'});
                await insertItem({id: '5', value: 'test'});

                // WHEN
                const results = await dynamoDbRepository.findBy('value', 'test');

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                expect(results).toEqual([{id: '5', value: 'test'}, {id: '3', value: 'test'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });

        it('should not return objects based on fields values if values do not exist', async done => {
            try {
                // GIVEN
                await createTableIfNotExist();
                await emptyTable();
                await insertItem({id: '3', value: 'test'});
                await insertItem({id: '4', value: 'test 4'});
                await insertItem({id: '5', value: 'test'});

                // WHEN
                const results = await dynamoDbRepository.findBy('value', 'estimate');

                // THEN
                expect(results).not.toBeNull();
                expect(results).toEqual([]);
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
                await createTableIfNotExist();
                await emptyTable();
                await dynamoDbRepository.save({id: 'test', value: 'myValue'});
                await dynamoDbRepository.save({id: 'test2', value: 'myValue2'});

                // WHEN
                const results = await listAll();

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
                await createTableIfNotExist();
                await emptyTable();
                await dynamoDbRepository.save({id: 'test', value: 'myValue'});
                await dynamoDbRepository.save({id: 'test', value: 'myValue2'});

                // WHEN
                const results = await listAll();

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(1);
                expect(results).toEqual([{id: 'test', value: 'myValue2'}]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('deleteById function', () => {

        it('should delete an object with its id', async done => {
            try {
                // GIVEN
                await createTableIfNotExist();
                await emptyTable();
                await dynamoDbRepository.save({id: 'a', value: 'myValue'});
                await dynamoDbRepository.save({id: 'b', value: 'myValue2'});

                // WHEN
                await dynamoDbRepository.deleteById('a');
                const results = await listAll();

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
                await createTableIfNotExist();
                await emptyTable();
                await dynamoDbRepository.save({id: 'a', value: 'myValue'});
                await dynamoDbRepository.save({id: 'b', value: 'myValue2'});

                // WHEN
                await dynamoDbRepository.deleteById('c');
                const results = await listAll();

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

    describe('deleteAll function', () => {

        it('should delete all data from tables', async done => {
            try {
                // GIVEN
                await createTableIfNotExist();
                await emptyTable();
                await dynamoDbRepository.save({id: 'c', value: 'myValue'});
                await dynamoDbRepository.save({id: 'd', value: 'myValue2'});

                // WHEN
                await dynamoDbRepository.deleteAll();
                const results = await listAll();

                // THEN
                expect(results).not.toBeNull();
                expect(results.length).toEqual(0);
                expect(results).toEqual([]);
                done();
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });
});

const createTableIfNotExist = async (): Promise<any> => {
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
            }],
            KeySchema: [{
                AttributeName: 'id',
                KeyType: 'HASH'
            }],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        };
        await dynamoDbClient.createTable(createTableParams).promise();
        return dynamoDbClient.waitFor('tableExists', {TableName: tableName}).promise();
    }
};

const emptyTable = async (): Promise<void> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const {Items} = await dynamoDbClient.scan({TableName: tableName}).promise();
    for (const item of Items) {
        await dynamoDbClient.delete({TableName: tableName, Key: {id: item.id}}).promise();
    }
};

const deleteTableIfExist = async (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.listTables({}).promise();
    if (TableNames.some(name => name === tableName)) {
        const deleteTableParams: DeleteTableInput = {
            TableName : tableName
        };
        await dynamoDbClient.deleteTable(deleteTableParams).promise();
        return dynamoDbClient.waitFor('tableNotExists', {TableName: tableName}).promise();
    } else {
        return Promise.resolve({});
    }
};

const insertItem = (item: object): Promise<any> =>  {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const putParams: DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: item
    };
    return dynamoDbClient.put(putParams).promise();
};

const listAll = async (): Promise<any> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const {Items} = await dynamoDbClient.scan({TableName: tableName}).promise();
    return Items;
};

const listTables = async (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    const {TableNames} = await dynamoDbClient.listTables({}).promise();
    return TableNames;
};
