"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamo_db_builder_1 = require("./dynamo-db.builder");
describe('DynamoDBBuilder', function () {
    beforeEach(function () {
        process.env.AWS_REGION = 'test';
    });
    describe('build function', function () {
        it('should throw an error on build when table name is not set', function (done) {
            // GIVEN
            // WHEN
            try {
                var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder().build();
                fail('we should never arrive here because an exception should have happened');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual(new Error('Table name is mandatory'));
                done();
            }
        });
        it('should build a valid repository when prerequisites are met', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('foo')
                .build();
            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepositoryImplementation');
            done();
        });
        it('should build a proxy repository when creation if not exists is asked', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('foo')
                .createIfNotExists()
                .build();
            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepositoryProxy');
            done();
        });
        it('should build a repository with default values when prerequisites are met', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('foo')
                .build();
            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository['keyName']).toEqual('id');
            expect(dynamoDbRepository['readCapacity']).toEqual(1);
            expect(dynamoDbRepository['writeCapacity']).toEqual(1);
            done();
        });
        it('should throw an error if AWS region is not defined', function (done) {
            // GIVEN
            process.env = {};
            // WHEN
            try {
                var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                    .withTableName('foo')
                    .build();
                fail('Web should never reach here because build function should throw an error when AWS_REGION env variable is not set');
                done();
            }
            catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });
    });
    describe('withTableName function', function () {
        it('should store table name when called', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('toto')
                .build();
            // THEN
            expect(dynamoDbRepository['tableName']).not.toBeNull();
            expect(dynamoDbRepository['tableName']).toEqual('toto');
            done();
        });
    });
    describe('withKeyName function', function () {
        it('should store key name when called', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('toto')
                .withKeyName('myKey')
                .build();
            // THEN
            expect(dynamoDbRepository['keyName']).not.toBeNull();
            expect(dynamoDbRepository['keyName']).toEqual('myKey');
            done();
        });
    });
    describe('withReadCapacity function', function () {
        it('should store read capacity when called', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('toto')
                .withReadCapacity(12)
                .build();
            // THEN
            expect(dynamoDbRepository['readCapacity']).not.toBeNull();
            expect(dynamoDbRepository['readCapacity']).toEqual(12);
            done();
        });
    });
    describe('withWriteCapacity function', function () {
        it('should store write capacity when called', function (done) {
            // GIVEN
            // WHEN
            var dynamoDbRepository = new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('toto')
                .withWriteCapacity(15)
                .build();
            // THEN
            expect(dynamoDbRepository['writeCapacity']).not.toBeNull();
            expect(dynamoDbRepository['writeCapacity']).toEqual(15);
            done();
        });
    });
});
//# sourceMappingURL=dynamo-db.builder.spec.js.map