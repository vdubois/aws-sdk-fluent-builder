"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamo_db_builder_1 = require("../../src/builders/dynamodb/dynamo-db.builder");
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
var DynamoDB = require("aws-sdk/clients/dynamodb");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
var tableName = 'dynamo-db-module-e2e';
var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
    .withTableName(tableName)
    .build();
describe('DynamoDB module', function () {
    var originalTimeout;
    /**
     * Sets timeout to 30s.
     */
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    });
    describe('createIfNotExists function', function () {
        it('should create table if it does not exist', function (done) {
            // GIVEN
            deleteTableIfExist()
                .then(function () {
                // WHEN
                var tableRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                    .withTableName(tableName)
                    .createIfNotExists()
                    .build();
                return tableRepository.findAll();
            })
                .then(function () { return listTables(); })
                .then(function (tableNames) {
                // THEN
                expect(tableNames).toContain(tableName);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should not throw an error if table already exists', function (done) {
            // GIVEN
            var tableRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName(tableName)
                .createIfNotExists()
                .build();
            // WHEN
            try {
                createTableIfNotExist()
                    .then(function () { return tableRepository.findAll(); })
                    .then(function (results) {
                    // THEN
                    expect(results).not.toBeNull();
                    done();
                });
            }
            catch (exception) {
                fail(exception);
                done();
            }
        });
    });
    describe('findAll function', function () {
        it('should return all table objects', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: '1', value: 'test' }); })
                .then(function () { return insertItem({ id: '2', value: 'test 2' }); })
                .then(function () { return dynamoDbRepository.findAll(); })
                .then(function (results) {
                // THEN
                expect(results).not.toBeNull();
                expect(results).toEqual([{ id: '2', value: 'test 2' }, { id: '1', value: 'test' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('findById function', function () {
        it('should return an object specified by its id', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: '3', value: 'test 3' }); })
                .then(function () { return insertItem({ id: '4', value: 'test 4' }); })
                .then(function () { return dynamoDbRepository.findById('4'); })
                .then(function (result) {
                expect(result).not.toBeNull();
                expect(result).toEqual({ id: '4', value: 'test 4' });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should not return an object if its id does not exists', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function (result) { return insertItem({ id: '3', value: 'test 3' }); })
                .then(function (result) { return insertItem({ id: '4', value: 'test 4' }); })
                .then(function () { return dynamoDbRepository.findById('5'); })
                .then(function (result) {
                expect(result).toBeUndefined();
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('findBy function', function () {
        it('should return objects specified by its fields values', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: '3', value: 'test' }); })
                .then(function () { return insertItem({ id: '4', value: 'test 4' }); })
                .then(function () { return insertItem({ id: '5', value: 'test' }); })
                .then(function () { return dynamoDbRepository.findBy('value', 'test'); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                expect(results).toEqual([{ id: '5', value: 'test' }, { id: '3', value: 'test' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should not return objects based on fields values if values do not exist', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: '3', value: 'test' }); })
                .then(function () { return insertItem({ id: '4', value: 'test 4' }); })
                .then(function () { return insertItem({ id: '5', value: 'test' }); })
                .then(function () { return dynamoDbRepository.findBy('value', 'estimate'); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results).toEqual([]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('save function', function () {
        it('should save objects in database', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return dynamoDbRepository.save({ id: 'test', value: 'myValue' }); })
                .then(function () { return dynamoDbRepository.save({ id: 'test2', value: 'myValue2' }); })
                .then(function () { return listAll(); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should an object with same id multiple times just one time in database', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return dynamoDbRepository.save({ id: 'test', value: 'myValue' }); })
                .then(function () { return dynamoDbRepository.save({ id: 'test', value: 'myValue2' }); })
                .then(function () { return listAll(); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results.length).toEqual(1);
                expect(results).toEqual([{ id: 'test', value: 'myValue2' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('deleteById function', function () {
        it('should delete an object with its id', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: 'a', value: 'myValue' }); })
                .then(function () { return insertItem({ id: 'b', value: 'myValue2' }); })
                .then(function () { return dynamoDbRepository.deleteById('a'); })
                .then(function () { return listAll(); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results.length).toEqual(1);
                expect(results).toEqual([{ id: 'b', value: 'myValue2' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should not delete anything with an id that does not exist', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: 'a', value: 'myValue' }); })
                .then(function () { return insertItem({ id: 'b', value: 'myValue2' }); })
                .then(function () { return dynamoDbRepository.deleteById('c'); })
                .then(function () { return listAll(); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results.length).toEqual(2);
                expect(results).toEqual([{ id: 'b', value: 'myValue2' }, { id: 'a', value: 'myValue' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('deleteAll function', function () {
        it('should delete all data from tables', function (done) {
            // GIVEN
            createTableIfNotExist()
                .then(function () { return emptyTable(); })
                .then(function () { return insertItem({ id: 'c', value: 'myValue' }); })
                .then(function () { return insertItem({ id: 'd', value: 'myValue2' }); })
                .then(function () { return dynamoDbRepository.deleteAll(); })
                .then(function () { return listAll(); })
                .then(function (results) {
                expect(results).not.toBeNull();
                expect(results.length).toEqual(0);
                expect(results).toEqual([]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
});
var createTableIfNotExist = function () {
    var dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION });
    return dynamoDbClient.listTables({}).promise()
        .then(function (results) { return results.TableNames; })
        .then(function (tableNames) {
        if (tableNames.some(function (name) { return name === tableName; })) {
            return Promise.resolve({});
        }
        else {
            var createTableParams = {
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
                .then(function () { return dynamoDbClient.waitFor('tableExists', { TableName: tableName }).promise(); });
        }
    });
};
var emptyTable = function () {
    var dynamoDbClient = new dynamodb_1.DocumentClient({ region: process.env.AWS_REGION });
    return dynamoDbClient.scan({ TableName: tableName })
        .promise()
        .then(function (results) {
        return Promise.all(results.Items.map(function (item) { return dynamoDbClient.delete({ TableName: tableName, Key: { id: item.id } }).promise(); }));
    });
};
var deleteTableIfExist = function () {
    var dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION });
    return dynamoDbClient.listTables({}).promise()
        .then(function (results) { return results.TableNames; })
        .then(function (tableNames) {
        if (tableNames.some(function (name) { return name === tableName; })) {
            var deleteTableParams = {
                TableName: tableName
            };
            return dynamoDbClient.deleteTable(deleteTableParams).promise()
                .then(function () { return dynamoDbClient.waitFor('tableNotExists', { TableName: tableName }).promise(); });
        }
        else {
            return Promise.resolve({});
        }
    });
};
var insertItem = function (item) {
    var dynamoDbClient = new dynamodb_1.DocumentClient({ region: process.env.AWS_REGION });
    var putParams = {
        TableName: tableName,
        Item: item
    };
    return dynamoDbClient.put(putParams).promise();
};
var listAll = function () {
    var dynamoDbClient = new dynamodb_1.DocumentClient({ region: process.env.AWS_REGION });
    return dynamoDbClient.scan({ TableName: tableName }).promise().then(function (result) { return result.Items; });
};
var listTables = function () {
    var dynamoDbClient = new DynamoDB({ region: process.env.AWS_REGION });
    return dynamoDbClient.listTables({}).promise()
        .then(function (results) { return results.TableNames; });
};
//# sourceMappingURL=dynamo-db-module.spec.e2e.js.map