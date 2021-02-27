import { DynamoDbRepository } from '../../repositories/dynamodb/dynamo-db.repository';
import { DynamoDbRepositoryImplementation } from '../../repositories/dynamodb/dynamo-db.repository.implementation';
import { DynamoDbRepositoryProxy } from '../../repositories/dynamodb/dynamo-db.repository.proxy';
import { GENERATED_SORT_KEY } from '../../models/dynamo-db-table-caracteristics.model';

export class DynamoDbBuilder {

    private tableName: string;
    private partitionKeyName = 'id';
    private sortKeyName?: string;
    private readCapacity = 1;
    private writeCapacity = 1;
    private mustCreateBeforeUse = false;

    withTableName(tableName: string): DynamoDbBuilder {
        this.tableName = tableName;
        return this;
    }

    withPartitionKeyName(partitionKeyName: string): DynamoDbBuilder {
        this.partitionKeyName = partitionKeyName;
        return this;
    }

    withSortKeyName(sortKeyName: string): DynamoDbBuilder {
        this.sortKeyName = sortKeyName;
        return this;
    }

    withGeneratedSortKey(): DynamoDbBuilder {
        this.sortKeyName = GENERATED_SORT_KEY;
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
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.tableName) {
            throw new Error('Table name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new DynamoDbRepositoryProxy(
                new DynamoDbRepositoryImplementation({
                    tableName: this.tableName,
                    partitionKeyName: this.partitionKeyName,
                    sortKeyName: this.sortKeyName,
                    readCapacity: this.readCapacity,
                    writeCapacity: this.writeCapacity
                }));
        }
        return new DynamoDbRepositoryImplementation({
            tableName: this.tableName,
            partitionKeyName: this.partitionKeyName,
            sortKeyName: this.sortKeyName,
            readCapacity: this.readCapacity,
            writeCapacity: this.writeCapacity
        });
    }
}
