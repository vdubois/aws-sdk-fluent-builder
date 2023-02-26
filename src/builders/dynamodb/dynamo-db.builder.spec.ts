import {expect, test, describe, beforeEach} from 'vitest';
import { DynamoDbBuilder } from './dynamo-db.builder';
import { GENERATED_SORT_KEY } from '../../models/dynamo-db-table-caracteristics.model';

describe('DynamoDBBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        test('should throw an error on build when table name is not set', () => {
            // GIVEN

            // WHEN
            try {
                const dynamoDbRepository = new DynamoDbBuilder().build();
                throw new Error('we should never arrive here because an exception should have happened');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual(new Error('Table name is mandatory'));
            }
        });

        test('should build a valid repository when prerequisites are met', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('foo')
                .build();

            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepositoryImplementation');
        });

        test('should build a proxy repository when creation if not exists is asked', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('foo')
                .createIfNotExists()
                .build();

            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepositoryProxy');
        });

        test('should build a repository with default values when prerequisites are met', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('foo')
                .build();

            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository['partitionKeyName']).toEqual('id');
            expect(dynamoDbRepository['readCapacity']).toEqual(1);
            expect(dynamoDbRepository['writeCapacity']).toEqual(1);
        });

        test('should throw an error if AWS region is not defined', () => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                const dynamoDbRepository = new DynamoDbBuilder()
                    .withTableName('foo')
                    .build();
                throw new Error('Web should never reach here because build function should throw an error when AWS_REGION env variable is not set');
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
            }
        });
    });

    describe('withTableName function', () => {
        test('should store table name when called', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .build();

            // THEN
            expect(dynamoDbRepository['tableName']).not.toBeNull();
            expect(dynamoDbRepository['tableName']).toEqual('toto');
        });
    });

    describe('withPartitionKeyName function', () => {
        test('should store partition key name when called', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withPartitionKeyName('myKey')
                .build();

            // THEN
            expect(dynamoDbRepository['partitionKeyName']).not.toBeNull();
            expect(dynamoDbRepository['partitionKeyName']).toEqual('myKey');
        });
    });

    describe('withSortKeyName function', () => {
        test('should store sort key name when called', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withSortKeyName('sortKey')
                .build();

            // THEN
            expect(dynamoDbRepository['sortKeyName']).not.toBeNull();
            expect(dynamoDbRepository['sortKeyName']).toEqual('sortKey');
        });
    });

    describe('withGeneratedSortKey function', () => {
        test('should store sort key name when called', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withGeneratedSortKey()
                .build();

            // THEN
            expect(dynamoDbRepository['sortKeyName']).not.toBeNull();
            expect(dynamoDbRepository['sortKeyName']).toEqual(GENERATED_SORT_KEY);
        });
    });

    describe('withReadCapacity function', () => {
        test('should store read capacity when called', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withReadCapacity(12)
                .build();

            // THEN
            expect(dynamoDbRepository['readCapacity']).not.toBeNull();
            expect(dynamoDbRepository['readCapacity']).toEqual(12);
        });
    });

    describe('withWriteCapacity function', () => {
        test('should store write capacity when called', () => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withWriteCapacity(15)
                .build();

            // THEN
            expect(dynamoDbRepository['writeCapacity']).not.toBeNull();
            expect(dynamoDbRepository['writeCapacity']).toEqual(15);
        });
    });
});
