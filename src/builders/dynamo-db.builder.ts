import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');

export class DynamoDbBuilder {

    private tableName: string;
    private keyName: string = 'id';
    private readCapacity: number = 1;
    private writeCapacity: number = 1;
    private mustCreateBeforeUse: boolean = false;

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
                new DynamoDbRepositoryImplementation(this.tableName, this.keyName, this.readCapacity, this.writeCapacity));
        }
        return new DynamoDbRepositoryImplementation(this.tableName, this.keyName, this.readCapacity, this.writeCapacity);
    }
}

export interface DynamoDbRepository {

}

class DynamoDbRepositoryProxy implements DynamoDbRepository {

    constructor(private dynamoDbRepository: DynamoDbRepositoryImplementation) {

    }


}

class DynamoDbRepositoryImplementation implements DynamoDbRepository {

    public constructor(private _tableName: string, private _keyName: string, private _readCapacity: number, private _writeCapacity: number) {

    }

    get tableName(): string {
        return this._tableName;
    }

    get keyName(): string {
        return this._keyName;
    }

    get readCapacity(): number {
        return this._readCapacity;
    }

    get writeCapacity(): number {
        return this._writeCapacity;
    }
}