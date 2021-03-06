import { DynamoDbBuilder } from './dynamo-db.builder';
import { GENERATED_SORT_KEY } from '../../models/dynamo-db-table-caracteristics.model';

describe('DynamoDBBuilder', () => {

    beforeEach(() => {
        process.env.AWS_REGION = 'test';
    });

    describe('build function', () => {

        it('should throw an error on build when table name is not set', done => {
            // GIVEN

            // WHEN
            try {
                const dynamoDbRepository = new DynamoDbBuilder().build();
                fail('we should never arrive here because an exception should have happened');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception).toEqual(new Error('Table name is mandatory'));
                done();
            }
        });

        it('should build a valid repository when prerequisites are met', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('foo')
                .build();

            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepositoryImplementation');
            done();
        });

        it('should build a proxy repository when creation if not exists is asked', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('foo')
                .createIfNotExists()
                .build();

            // THEN
            expect(dynamoDbRepository).not.toBeNull();
            expect(dynamoDbRepository.constructor.name).toEqual('DynamoDbRepositoryProxy');
            done();
        });

        it('should build a repository with default values when prerequisites are met', done => {
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
            done();
        });

        it('should throw an error if AWS region is not defined', done => {
            // GIVEN
            process.env = {};

            // WHEN
            try {
                const dynamoDbRepository = new DynamoDbBuilder()
                    .withTableName('foo')
                    .build();
                fail('Web should never reach here because build function should throw an error when AWS_REGION env variable is not set');
                done();
            } catch (exception) {
                // THEN
                expect(exception).not.toBeNull();
                expect(exception.message).toEqual('AWS_REGION environment variable must be set');
                done();
            }
        });
    });

    describe('withTableName function', () => {
        it('should store table name when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .build();

            // THEN
            expect(dynamoDbRepository['tableName']).not.toBeNull();
            expect(dynamoDbRepository['tableName']).toEqual('toto');
            done();
        });
    });

    describe('withPartitionKeyName function', () => {
        it('should store partition key name when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withPartitionKeyName('myKey')
                .build();

            // THEN
            expect(dynamoDbRepository['partitionKeyName']).not.toBeNull();
            expect(dynamoDbRepository['partitionKeyName']).toEqual('myKey');
            done();
        });
    });

    describe('withSortKeyName function', () => {
        it('should store sort key name when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withSortKeyName('sortKey')
                .build();

            // THEN
            expect(dynamoDbRepository['sortKeyName']).not.toBeNull();
            expect(dynamoDbRepository['sortKeyName']).toEqual('sortKey');
            done();
        });
    });

    describe('withGeneratedSortKey function', () => {
        it('should store sort key name when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withGeneratedSortKey()
                .build();

            // THEN
            expect(dynamoDbRepository['sortKeyName']).not.toBeNull();
            expect(dynamoDbRepository['sortKeyName']).toEqual(GENERATED_SORT_KEY);
            done();
        });
    });

    describe('withReadCapacity function', () => {
        it('should store read capacity when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withReadCapacity(12)
                .build();

            // THEN
            expect(dynamoDbRepository['readCapacity']).not.toBeNull();
            expect(dynamoDbRepository['readCapacity']).toEqual(12);
            done();
        });
    });

    describe('withWriteCapacity function', () => {
        it('should store write capacity when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
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
