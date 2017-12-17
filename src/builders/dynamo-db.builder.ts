import {DynamoDbRepository} from '../repositories/dynamo-db.repository';
import {DynamoDbRepositoryImplementation} from '../repositories/dynamo-db.repository.implementation';
import {DynamoDbRepositoryProxy} from '../repositories/dynamo-db.repository.proxy';

export class DynamoDbBuilder {

    private tableName: string;
    private keyName = 'id';
    private readCapacity = 1;
    private writeCapacity = 1;
    private mustCreateBeforeUse = false;

    withTableName(tableName: string): DynamoDbBuilder {
        this.tableName = tableName;
        return this;
    }

    withKeyName(keyname: string): DynamoDbBuilder {
        this.keyName = keyname;
        return this;
    }

    withReadCapacity(readCapacity: number): DynamoDbBuilder {
        this.readCapacity = readCapacity;
        return this;
    }

    withWriteCapacity(writeCapacity: number): DynamoDbBuilder {
        this.writeCapacity = writeCapacity;
        return this;
    }

    createIfNotExists(): DynamoDbBuilder {
        this.mustCreateBeforeUse = true;
        return this;
    }

    build(): DynamoDbRepository {
        if (!this.tableName) {
            throw new Error('Table name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new DynamoDbRepositoryProxy(
                new DynamoDbRepositoryImplementation({
                    tableName: this.tableName,
                    keyName: this.keyName,
                    readCapacity: this.readCapacity,
                    writeCapacity: this.writeCapacity
                }));
        }
        return new DynamoDbRepositoryImplementation({
            tableName: this.tableName,
            keyName: this.keyName,
            readCapacity: this.readCapacity,
            writeCapacity: this.writeCapacity
        });
    }
}
