"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
var dynamo_db_repository_implementation_1 = require("./dynamo-db.repository.implementation");
var dynamo_db_repository_proxy_1 = require("./dynamo-db.repository.proxy");
var DynamoDB = require("aws-sdk/clients/dynamodb");
describe('DynamoDbRepositoryProxy', function () {
    describe('findAll function', function () {
        it('should return transformed information from aws sdk after calling creation and table does not exist', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'listTables').and.returnValues({
                promise: function () { return Promise.resolve({ TableNames: [] }); }
            }, {
                promise: function () { return Promise.resolve({ TableNames: ['toto'] }); }
            });
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedDynamoDb, 'waitFor').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: function () { return Promise.resolve({ Items: [{ myProperty: 'myValue' }] }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            // WHEN
            dynamoDbRepositoryProxy.findAll()
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{ myProperty: 'myValue' }]);
                expect(mockedDynamoDb.listTables).toHaveBeenCalledTimes(1);
                expect(mockedDynamoDb.createTable).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.scan).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.scan).toHaveBeenCalledWith({ TableName: 'toto' });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should return transformed information from aws sdk after calling creation and table does exist', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'listTables').and.returnValue({
                promise: function () { return Promise.resolve({ TableNames: ['toto'] }); }
            });
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            spyOn(mockedDynamoDb, 'waitFor').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: function () { return Promise.resolve({ Items: [{ myProperty: 'myValue' }] }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            // WHEN
            dynamoDbRepositoryProxy.findAll()
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{ myProperty: 'myValue' }]);
                expect(mockedDynamoDb.listTables).toHaveBeenCalledTimes(1);
                expect(mockedDynamoDb.createTable).toHaveBeenCalledTimes(0);
                expect(mockedDocumentClient.scan).toHaveBeenCalledTimes(1);
                expect(mockedDocumentClient.scan).toHaveBeenCalledWith({ TableName: 'toto' });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('findById function', function () {
        it('should return transformed information from aws sdk after calling creation', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'get').and.returnValue({
                promise: function () { return Promise.resolve({ Item: { myProperty: 'myValue' } }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());
            // WHEN
            dynamoDbRepositoryProxy.findById('3')
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual({ myProperty: 'myValue' });
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('findBy function', function () {
        it('should return transformed information from aws sdk after calling creation', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: function () { return Promise.resolve({ Items: [{ myProperty: 'myValue' }] }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());
            // WHEN
            dynamoDbRepositoryProxy.findBy('field', 'value')
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{ myProperty: 'myValue' }]);
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('save function', function () {
        it('should call put function from aws sdk after calling creation', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'put').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());
            // WHEN
            dynamoDbRepositoryProxy.save({ myField: 'myValue' })
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.put).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Item: {
                        myField: 'myValue'
                    }
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('deleteById function', function () {
        it('should call delete function from aws sdk after calling creation', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto',
                keyName: 'id'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'delete').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());
            // WHEN
            dynamoDbRepositoryProxy.deleteById('2')
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        id: '2'
                    }
                });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('deleteAll function', function () {
        it('should call delete function from aws sdk for all items after calling creation', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto',
                keyName: 'id'
            };
            var mockedDynamoDb = new DynamoDB();
            spyOn(mockedDynamoDb, 'createTable').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: function () { return Promise.resolve({
                    Items: [
                        {
                            id: '2',
                            field: 'value'
                        },
                        {
                            id: '3',
                            field: 'other value'
                        }
                    ]
                }); }
            });
            spyOn(mockedDocumentClient, 'delete').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            var dynamoDbRepositoryProxy = new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(dynamoDbRepositoryImplementation, mockedDynamoDb);
            spyOn(dynamoDbRepositoryProxy, 'createIfNotExists').and.returnValue(Promise.resolve());
            // WHEN
            dynamoDbRepositoryProxy.deleteAll()
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(dynamoDbRepositoryProxy.createIfNotExists).toHaveBeenCalled();
                expect(mockedDocumentClient.delete).toHaveBeenCalledTimes(2);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
});
//# sourceMappingURL=dynamo-db.repository.proxy.spec.js.map