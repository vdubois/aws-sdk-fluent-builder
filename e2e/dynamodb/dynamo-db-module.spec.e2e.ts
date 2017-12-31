import { DynamoDbBuilder } from '../../src/builders/dynamodb/dynamo-db.builder';
import { CreateTableInput, DeleteTableInput, DocumentClient } from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import PutItemInput = DocumentClient.PutItemInput;

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

        it('should create table if it does not exist', done => {
            // GIVEN
            deleteTableIfExist()
                .then(() => {
                    // WHEN
                    const tableRepository = new DynamoDbBuilder()
                        .withTableName(tableName)
                        .createIfNotExists()
                        .build();
                    return tableRepository.findAll();
                })
                .then(() => listTables())
                .then(tableNames => {
                    // THEN
                    expect(tableNames).toContain(tableName);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not throw an error if table already exists', done => {
            // GIVEN
            const tableRepository = new DynamoDbBuilder()
                .withTableName(tableName)
                .createIfNotExists()
                .build();

            // WHEN
            try {
                createTableIfNotExist()
                    .then(() => tableRepository.findAll())
                    .then(results => {
                        // THEN
                        expect(results).not.toBeNull();
                        done();
                    });
            } catch (exception) {
                fail(exception);
                done();
            }
        });
    });

    describe('findAll function', () => {

        it('should return all table objects', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: '1', value: 'test'}))
                .then(() => insertItem({ id: '2', value: 'test 2' }))
                // WHEN
                .then(() => dynamoDbRepository.findAll())
                .then(results => {
                    // THEN
                    expect(results).not.toBeNull();
                    expect(results).toEqual([{ id: '2', value: 'test 2' }, { id: '1', value: 'test' }]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('findById function', () => {

        it('should return an object specified by its id', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: '3', value: 'test 3'}))
                .then(() => insertItem({ id: '4', value: 'test 4' }))
                // WHEN
                .then(() => dynamoDbRepository.findById('4'))
                // THEN
                .then(result => {
                    expect(result).not.toBeNull();
                    expect(result).toEqual({id: '4', value: 'test 4'});
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not return an object if its id does not exists', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then((result) => insertItem({id: '3', value: 'test 3'}))
                .then((result) => insertItem({ id: '4', value: 'test 4' }))
                // WHEN
                .then(() => dynamoDbRepository.findById('5'))
                // THEN
                .then(result => {
                    expect(result).toBeUndefined();
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('findBy function', () => {

        it('should return objects specified by its fields values', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: '3', value: 'test'}))
                .then(() => insertItem({ id: '4', value: 'test 4' }))
                .then(() => insertItem({ id: '5', value: 'test' }))
                // WHEN
                .then(() => dynamoDbRepository.findBy('value', 'test'))
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results.length).toEqual(2);
                    expect(results).toEqual([{id: '5', value: 'test'}, {id: '3', value: 'test'}]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not return objects based on fields values if values do not exist', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: '3', value: 'test'}))
                .then(() => insertItem({ id: '4', value: 'test 4' }))
                .then(() => insertItem({ id: '5', value: 'test' }))
                // WHEN
                .then(() => dynamoDbRepository.findBy('value', 'estimate'))
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results).toEqual([]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('save function', () => {

        it('should save objects in database', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                // WHEN
                .then(() => dynamoDbRepository.save({id: 'test', value: 'myValue'}))
                .then(() => dynamoDbRepository.save({id: 'test2', value: 'myValue2'}))
                .then(() => listAll())
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results.length).toEqual(2);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should an object with same id multiple times just one time in database', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                // WHEN
                .then(() => dynamoDbRepository.save({id: 'test', value: 'myValue'}))
                .then(() => dynamoDbRepository.save({id: 'test', value: 'myValue2'}))
                .then(() => listAll())
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results.length).toEqual(1);
                    expect(results).toEqual([{id: 'test', value: 'myValue2'}]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('deleteById function', () => {

        it('should delete an object with its id', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: 'a', value: 'myValue'}))
                .then(() => insertItem({id: 'b', value: 'myValue2'}))
                // WHEN
                .then(() => dynamoDbRepository.deleteById('a'))
                .then(() => listAll())
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results.length).toEqual(1);
                    expect(results).toEqual([{id: 'b', value: 'myValue2'}]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });

        it('should not delete anything with an id that does not exist', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: 'a', value: 'myValue'}))
                .then(() => insertItem({id: 'b', value: 'myValue2'}))
                // WHEN
                .then(() => dynamoDbRepository.deleteById('c'))
                .then(() => listAll())
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results.length).toEqual(2);
                    expect(results).toEqual([{id: 'b', value: 'myValue2'}, {id: 'a', value: 'myValue'}]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });

    describe('deleteAll function', () => {

        it('should delete all data from tables', done => {
            // GIVEN
            createTableIfNotExist()
                .then(() => emptyTable())
                .then(() => insertItem({id: 'c', value: 'myValue'}))
                .then(() => insertItem({id: 'd', value: 'myValue2'}))
                // WHEN
                .then(() => dynamoDbRepository.deleteAll())
                .then(() => listAll())
                // THEN
                .then(results => {
                    expect(results).not.toBeNull();
                    expect(results.length).toEqual(0);
                    expect(results).toEqual([]);
                    done();
                })
                .catch(exception => {
                    fail(exception);
                    done();
                });
        });
    });
});

const createTableIfNotExist = (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    return dynamoDbClient.listTables({}).promise()
        .then(results => results.TableNames)
        .then(tableNames => {
            if (tableNames.some(name => name === tableName)) {
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
                return dynamoDbClient.createTable(createTableParams).promise()
                    .then(() => dynamoDbClient.waitFor('tableExists', {TableName: tableName}).promise());
            }
        });
};

const emptyTable = (): Promise<any> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    return dynamoDbClient.scan({ TableName: tableName })
        .promise()
        .then(results =>
            Promise.all(results.Items.map(item => dynamoDbClient.delete({TableName: tableName, Key: {id: item.id}}).promise())));
};

const deleteTableIfExist = (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    return dynamoDbClient.listTables({}).promise()
        .then(results => results.TableNames)
        .then(tableNames => {
            if (tableNames.some(name => name === tableName)) {
                const deleteTableParams: DeleteTableInput = {
                    TableName : tableName
                };
                return dynamoDbClient.deleteTable(deleteTableParams).promise()
                    .then(() => dynamoDbClient.waitFor('tableNotExists', {TableName: tableName}).promise());
            } else {
                return Promise.resolve({});
            }
        });
};

const insertItem = (item: object): Promise<any> =>  {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    const putParams: PutItemInput = {
        TableName: tableName,
        Item: item
    };
    return dynamoDbClient.put(putParams).promise();
};

const listAll = (): Promise<any> => {
    const dynamoDbClient = new DocumentClient({region: process.env.AWS_REGION});
    return dynamoDbClient.scan({TableName: tableName}).promise().then(result => result.Items);
};

const listTables = (): Promise<any> => {
    const dynamoDbClient = new DynamoDB({region: process.env.AWS_REGION});
    return dynamoDbClient.listTables({}).promise()
        .then(results => results.TableNames);
};
