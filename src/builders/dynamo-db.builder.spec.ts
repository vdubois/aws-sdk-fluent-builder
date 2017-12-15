import {DynamoDbBuilder} from './dynamo-db.builder';

describe('DynamoDBBuilder', () => {

    describe('build function', () => {

        it('should throw an error on build when prerequisites are not met', done => {
            // GIVEN

            // WHEN
            try {
                const dynamoDbRepository = new DynamoDbBuilder().build();
                fail('we should never arrive here because an exception should have happened');
                done();
            } catch(exception) {
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
            expect(dynamoDbRepository.keyName).toEqual('id');
            expect(dynamoDbRepository.readCapacity).toEqual(1);
            expect(dynamoDbRepository.writeCapacity).toEqual(1);
            done();
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
            expect(dynamoDbRepository.tableName).not.toBeNull();
            expect(dynamoDbRepository.tableName).toEqual('toto');
            done();
        });
    });

    describe('withKeyName function', () => {
        it('should store key name when called', done => {
            // GIVEN

            // WHEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .withKeyName('myKey')
                .build();

            // THEN
            expect(dynamoDbRepository.keyName).not.toBeNull();
            expect(dynamoDbRepository.keyName).toEqual('myKey');
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
            expect(dynamoDbRepository.readCapacity).not.toBeNull();
            expect(dynamoDbRepository.readCapacity).toEqual(12);
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
            expect(dynamoDbRepository.writeCapacity).not.toBeNull();
            expect(dynamoDbRepository.writeCapacity).toEqual(15);
            done();
        });
    });

    describe('findAll function', () => {

        it('should call create table when invoked if create if not exists option was selected', done => {
            // GIVEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .createIfNotExists()
                .build();
            spyOn(dynamoDbRepository, 'createIfNotExists').and.callThrough();
            spyOn(dynamoDbRepository, 'findAll').and.callThrough();

            // WHEN
            dynamoDbRepository.findAll().then(result => {
                // THEN
                expect(dynamoDbRepository.createIfNotExists).toHaveBeenCalled();
                done();
            }).catch(exception => {
                fail(exception);
                done();
            })
        });

        it('should not call create table when invoked if create if not exists option was not selected', done => {
            // GIVEN
            const dynamoDbRepository = new DynamoDbBuilder()
                .withTableName('toto')
                .build();
            spyOn(dynamoDbRepository, 'findAll').and.callThrough();

            // WHEN
            dynamoDbRepository.findAll().then(result => {
                // THEN
                expect(dynamoDbRepository.createIfNotExists).toBeUndefined();
                done();
            }).catch(exception => {
                fail(exception);
                done();
            })
        });
    });
});