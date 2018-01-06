"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamo_db_builder_1 = require("./dynamo-db.builder");
describe('DynamoDBBuilder', function () {
    describe('build function', function () {
        it('should throw an error on build when prerequisites are not met', function (done) {
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
            new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('foo')
                .build()
                .then(function (dynamoDbRepository) {
                // THEN
                expect(dynamoDbRepository).not.toBeNull();
                expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepository');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
        it('should build a repository with default values when prerequisites are met', function (done) {
            // GIVEN
            // WHEN
            new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('foo')
                .build()
                .then(function (dynamoDbRepository) {
                // THEN
                expect(dynamoDbRepository).not.toBeNull();
                expect(dynamoDbRepository.keyName).toEqual('id');
                expect(dynamoDbRepository.readCapacity).toEqual(1);
                expect(dynamoDbRepository.writeCapacity).toEqual(1);
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
        });
    });
    describe('withTableName function', function () {
        it('should store table name when called', function (done) {
            // GIVEN
            // WHEN
            new dynamo_db_builder_1.DynamoDbBuilder()
                .withTableName('toto')
                .build()
                .then(function (dynamoDbRepository) {
                // THEN
                expect(dynamoDbRepository.tableName).not.toBeNull();
                expect(dynamoDbRepository.tableName).toEqual('toto');
                done();
            })
                .catch(function (exception) {
                fail(exception);
                done();
            });
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
            expect(dynamoDbRepository.keyName).not.toBeNull();
            expect(dynamoDbRepository.keyName).toEqual('myKey');
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
            expect(dynamoDbRepository.readCapacity).not.toBeNull();
            expect(dynamoDbRepository.readCapacity).toEqual(12);
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
            expect(dynamoDbRepository.writeCapacity).not.toBeNull();
            expect(dynamoDbRepository.writeCapacity).toEqual(15);
            done();
        });
    });
});
//# sourceMappingURL=dynamo-db.builder.spec.js.map