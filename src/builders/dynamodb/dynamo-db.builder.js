"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDbBuilder = void 0;
const dynamo_db_repository_implementation_1 = require("../../repositories/dynamodb/dynamo-db.repository.implementation");
const dynamo_db_repository_proxy_1 = require("../../repositories/dynamodb/dynamo-db.repository.proxy");
const dynamo_db_table_caracteristics_model_1 = require("../../models/dynamo-db-table-caracteristics.model");
class DynamoDbBuilder {
    constructor() {
        this.partitionKeyName = 'id';
        this.readCapacity = 1;
        this.writeCapacity = 1;
        this.mustCreateBeforeUse = false;
    }
    withTableName(tableName) {
        this.tableName = tableName;
        return this;
    }
    withPartitionKeyName(partitionKeyName) {
        this.partitionKeyName = partitionKeyName;
        return this;
    }
    withSortKeyName(sortKeyName) {
        this.sortKeyName = sortKeyName;
        return this;
    }
    withGeneratedSortKey() {
        this.sortKeyName = dynamo_db_table_caracteristics_model_1.GENERATED_SORT_KEY;
        return this;
    }
    withReadCapacity(readCapacity) {
        this.readCapacity = readCapacity;
        return this;
    }
    withWriteCapacity(writeCapacity) {
        this.writeCapacity = writeCapacity;
        return this;
    }
    createIfNotExists() {
        this.mustCreateBeforeUse = true;
        return this;
    }
    build() {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.tableName) {
            throw new Error('Table name is mandatory');
        }
        if (this.mustCreateBeforeUse) {
            return new dynamo_db_repository_proxy_1.DynamoDbRepositoryProxy(new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation({
                tableName: this.tableName,
                partitionKeyName: this.partitionKeyName,
                sortKeyName: this.sortKeyName,
                readCapacity: this.readCapacity,
                writeCapacity: this.writeCapacity
            }));
        }
        return new dynamo_db_repository_implementation_1.DynamoDbRepositoryImplementation({
            tableName: this.tableName,
            partitionKeyName: this.partitionKeyName,
            sortKeyName: this.sortKeyName,
            readCapacity: this.readCapacity,
            writeCapacity: this.writeCapacity
        });
    }
}
exports.DynamoDbBuilder = DynamoDbBuilder;
