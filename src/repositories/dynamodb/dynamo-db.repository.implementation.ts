import { DynamoDbRepository } from './dynamo-db.repository';
import { DynamoDbTableCaracteristicsModel, GENERATED_SORT_KEY } from '../../models/dynamo-db-table-caracteristics.model';
import { v4 as uuid } from 'uuid';
import {
  BatchWriteItemCommand, DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand, GetItemCommandInput,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput
} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';

export class DynamoDbRepositoryImplementation implements DynamoDbRepository {

  public constructor(private caracteristics: DynamoDbTableCaracteristicsModel,
                     private dynamoDbClient: DynamoDBClient = new DynamoDBClient({region: process.env.AWS_REGION})) {
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
    getParams.Key[this.partitionKeyName] = {
      'S': partitionKeyValue
    };
    const command = new GetItemCommand(getParams);
    const result = await this.dynamoDbClient.send(command);
    if (result.Item) {
      return unmarshall(result.Item);
    }
    return undefined;
  }

  async findOneByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any> {
    const getParams: any = {
      TableName: this.tableName
    };
    getParams.Key = {};
    getParams.Key[this.partitionKeyName] = {
      'S': partitionKeyValue
    };
    getParams.Key[this.sortKeyName] = {
      'S': sortKeyValue
    };
    const command = new GetItemCommand(getParams);
    const result = await this.dynamoDbClient.send(command);
    if (result.Item) {
      return unmarshall(result.Item);
    }
    return undefined;
  }

  async findAllByPartitionKey(partitionKeyValue: string): Promise<Array<any>> {
    let queryParams: QueryCommandInput;
    queryParams = {
      TableName: this.tableName,
      KeyConditionExpression: `${this.partitionKeyName} = :pk`,
      ExpressionAttributeValues: {
        // @ts-ignore
        ':pk': {'S': partitionKeyValue}
      }
    };
    const command = new QueryCommand(queryParams);
    const results = await this.dynamoDbClient.send(command);
    return results.Items.map(item => unmarshall(item));
  }

  save(entity: object): Promise<any> {
    // @ts-ignore
    const putParams: PutItemInput = {
      TableName: this.tableName,
    };
    putParams.Item = marshall(entity);
    if (this.withGeneratedSortKey) {
      putParams.Item[`${GENERATED_SORT_KEY}`] = {'S': uuid()};
    }
    const command = new PutItemCommand(putParams);
    return this.dynamoDbClient.send(command);
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
            Item: marshall(entity)
          }
        };
        if (this.withGeneratedSortKey) {
          putRequest.PutRequest.Item[GENERATED_SORT_KEY] = {'S': uuid()};
        }
        return putRequest;
      });
      const command = new BatchWriteItemCommand(putParams);
      await this.dynamoDbClient.send(command);
    }
  }

  deleteByPartitionKey(partitionKeyValue: string): Promise<any> {
    const deleteParams: any = {
      TableName: this.tableName,
    };
    deleteParams.Key = {};
    deleteParams.Key[this.partitionKeyName] = {
      'S': partitionKeyValue
    };
    const command = new DeleteItemCommand(deleteParams);
    return this.dynamoDbClient.send(command);
  }

  deleteByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any> {
    const deleteParams: any = {
      TableName: this.tableName,
    };
    deleteParams.Key = {};
    deleteParams.Key[this.partitionKeyName] = {
      'S': partitionKeyValue
    };
    deleteParams.Key[this.sortKeyName] = {
      'S': sortKeyValue
    };
    const command = new DeleteItemCommand(deleteParams);
    return this.dynamoDbClient.send(command);
  }
}
