import {DynamoDbRepository} from './dynamo-db.repository';
import {DocumentClient, ScanInput} from 'aws-sdk/clients/dynamodb';
import {DynamoDbTableCaracteristicsModel} from '../../models/dynamo-db-table-caracteristics.model';
import PutItemInput = DocumentClient.PutItemInput;

export class DynamoDbRepositoryImplementation implements DynamoDbRepository {

  public constructor(private caracteristics: DynamoDbTableCaracteristicsModel,
                     private dynamoDbClient: DocumentClient = new DocumentClient({region: process.env.AWS_REGION})) {

  }

  get tableName(): string {
    return this.caracteristics.tableName;
  }

  get keyName(): string {
    return this.caracteristics.keyName;
  }

  get readCapacity(): number {
    return this.caracteristics.readCapacity;
  }

  get writeCapacity(): number {
    return this.caracteristics.writeCapacity;
  }

  findAll(): Promise<Array<any>> {
    const scanParams: ScanInput = {
      TableName: this.tableName
    };
    return this.scan(scanParams);
  }

  async findById(id: string): Promise<any> {
    const getParams: any = {
      TableName: this.tableName,
    };
    getParams.Key = {};
    getParams.Key[this.keyName] = id;
    const result = await this.dynamoDbClient.get(getParams).promise();
    return result.Item;
  }

  findBy(field: string, value: string): Promise<Array<any>> {
    const scanParams: ScanInput = {
      TableName: this.tableName
    };
    scanParams.ScanFilter = {};
    scanParams.ScanFilter[field] = {
      ComparisonOperator: 'EQ',
      AttributeValueList: [value]
    } as any;
    return this.scan(scanParams);
  }

  save(entity: object): Promise<any> {
    const putParams: PutItemInput = {
      TableName: this.tableName,
      Item: entity
    };
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
      putParams.RequestItems[this.tableName] = entitiesToSave.map(entity => ({
          PutRequest: {
            Item: entity
          }
        }));
      await this.dynamoDbClient.batchWrite(putParams).promise();
    }
  }

  deleteById(id: string): Promise<any> {
    const deleteParams: any = {
      TableName: this.tableName
    };
    deleteParams.Key = {};
    deleteParams.Key[this.keyName] = id;
    return this.dynamoDbClient.delete(deleteParams).promise();
  }

  async deleteAll(): Promise<void> {
    const items = await this.findAll();
    for (const item of items) {
      await this.deleteById(item[this.keyName]);
    }
  }

  private async scan(scanParams: ScanInput, alreadyScannedItems?: Array<any>): Promise<any> {
    const scannedItems: Array<any> = alreadyScannedItems || [];
    scanParams.ConsistentRead = true;
    const result = await this.dynamoDbClient.scan(scanParams).promise();
    scannedItems.push(result.Items);
    if (result.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = result.LastEvaluatedKey;
      return this.scan(scanParams, scannedItems);
    } else {
      return Promise.resolve(this.flattenArray(scannedItems));
    }
  }

  private flattenArray(arrayOfArray): Array<any> {
    return [].concat.apply([], arrayOfArray);
  }
}
