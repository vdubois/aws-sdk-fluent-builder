import { DynamoDbRepository } from './dynamo-db.repository';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDbTableCaracteristicsModel, GENERATED_SORT_KEY } from '../../models/dynamo-db-table-caracteristics.model';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import PutItemInput = DocumentClient.PutItemInput;

export class DynamoDbRepositoryImplementation implements DynamoDbRepository {

  public constructor(private caracteristics: DynamoDbTableCaracteristicsModel,
                     private dynamoDbClient: DocumentClient = new DocumentClient({region: process.env.AWS_REGION})) {
  }

  get tableName(): string {
    return this.caracteristics.tableName;
  }

  get partitionKeyName(): string {
    return this.caracteristics.partitionKeyName;
  }

  get sortKeyName(): string {
    return this.caracteristics.sortKeyName;
  }

  get readCapacity(): number {
    return this.caracteristics.readCapacity;
  }

  get writeCapacity(): number {
    return this.caracteristics.writeCapacity;
  }

  private get withGeneratedSortKey(): boolean {
    return this.caracteristics.sortKeyName === GENERATED_SORT_KEY;
  }

  async findOneByPartitionKey(partitionKeyValue: string): Promise<any> {
    const getParams: any = {
      TableName: this.tableName,
    };
    getParams.Key = {};
    getParams.Key[this.partitionKeyName] = partitionKeyValue;
    const result = await this.dynamoDbClient.get(getParams).promise();
    return result.Item;
  }

  async findOneByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any> {
    const getParams: any = {
      TableName: this.tableName,
    };
    getParams.Key = {};
    getParams.Key[this.partitionKeyName] = partitionKeyValue;
    getParams.Key[this.sortKeyName] = sortKeyValue;
    const result = await this.dynamoDbClient.get(getParams).promise();
    return result.Item;
  }

  async findAllByPartitionKey(partitionKeyValue: string): Promise<Array<any>> {
    let queryParams: DynamoDB.QueryInput;
    queryParams = {
      TableName: this.tableName,
      KeyConditionExpression: `${this.partitionKeyName} = :pk`,
      ExpressionAttributeValues: {
        // @ts-ignore
        ':pk': partitionKeyValue
      }
    };
    const results = await this.dynamoDbClient.query(queryParams).promise();
    return results.Items;
  }

  save(entity: object): Promise<any> {
    // @ts-ignore
    const putParams: PutItemInput = {
      TableName: this.tableName,
    };
    putParams.Item = entity;
    if (this.withGeneratedSortKey) {
      putParams.Item[`${GENERATED_SORT_KEY}`] = uuid();
    }
    return this.dynamoDbClient.put(putParams).promise();
  }

  async saveAll(entities: Array<object>, byChunkOf: number = 25): Promise<void> {
    const chunks = function(array, size) {
      if (!array.length) {
        return [];
      }
      const head = array.slice(0, size);
      const tail = array.slice(size);

      return [head, ...chunks(tail, size)];
    };
    const chunkedEntities = chunks(entities, byChunkOf);
    for (const entitiesToSave of chunkedEntities) {
      const putParams = {
        RequestItems: {
        }
      };
      putParams.RequestItems[this.tableName] = entitiesToSave.map(entity => {
        const putRequest = {
          PutRequest: {
            Item: entity
          }
        };
        if (this.withGeneratedSortKey) {
          putRequest.PutRequest.Item[GENERATED_SORT_KEY] = uuid();
        }
        return putRequest;
      });
      await this.dynamoDbClient.batchWrite(putParams).promise();
    }
  }

  deleteByPartitionKey(partitionKeyValue: string): Promise<any> {
    const deleteParams: any = {
      TableName: this.tableName,
    };
    deleteParams.Key = {};
    deleteParams.Key[this.partitionKeyName] = partitionKeyValue;
    return this.dynamoDbClient.delete(deleteParams).promise();
  }

  deleteByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any> {
    const deleteParams: any = {
      TableName: this.tableName,
    };
    deleteParams.Key = {};
    deleteParams.Key[this.partitionKeyName] = partitionKeyValue;
    deleteParams.Key[this.sortKeyName] = sortKeyValue;
    return this.dynamoDbClient.delete(deleteParams).promise();
  }
}
