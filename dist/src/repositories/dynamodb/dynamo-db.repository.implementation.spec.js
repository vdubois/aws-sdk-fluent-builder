"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
var dynamo_db_repository_implementation_1 = require("./dynamo-db.repository.implementation");
describe('DynamoDbRepositoryImplementation', function () {
    describe('findAll function', function () {
        it('should return transformed information from aws sdk', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: function () { return Promise.resolve({ Items: [{ myProperty: 'myValue' }] }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // WHEN
            dynamoDbRepositoryImplementation.findAll()
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{ myProperty: 'myValue' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('findById function', function () {
        it('should return transformed information from aws sdk', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'get').and.returnValue({
                promise: function () { return Promise.resolve({ Item: { myProperty: 'myValue' } }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // WHEN
            dynamoDbRepositoryImplementation.findById('2')
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual({ myProperty: 'myValue' });
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('findBy function', function () {
        it('should return transformed information from aws sdk', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'scan').and.returnValue({
                promise: function () { return Promise.resolve({ Items: [{ myProperty: 'myValue' }] }); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // WHEN
            dynamoDbRepositoryImplementation.findBy('field', 'value')
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(result).toEqual([{ myProperty: 'myValue' }]);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('save function', function () {
        it('should call put function from aws sdk', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto'
            };
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'put').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // WHEN
            dynamoDbRepositoryImplementation.save({ myField: 'myValue' })
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
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
        it('should call delete function from aws sdk', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto',
                keyName: 'id'
            };
            var mockedDocumentClient = new dynamodb_1.DocumentClient();
            spyOn(mockedDocumentClient, 'delete').and.returnValue({
                promise: function () { return Promise.resolve({}); }
            });
            var dynamoDbRepositoryImplementation = new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation(caracteristics, mockedDocumentClient);
            // WHEN
            dynamoDbRepositoryImplementation.deleteById('2')
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.delete).toHaveBeenCalledWith({
                    TableName: 'toto',
                    Key: {
                        'id': '2'
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
        it('should call delete function from aws sdk for all items', function (done) {
            // GIVEN
            var caracteristics = {
                tableName: 'toto',
                keyName: 'id'
            };
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
            // WHEN
            dynamoDbRepositoryImplementation.deleteAll()
                .then(function (result) {
                // THEN
                expect(result).not.toBeNull();
                expect(mockedDocumentClient.scan).toHaveBeenCalled();
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
//# sourceMappingURL=dynamo-db.repository.implementation.spec.js.map