import {DynamoDbRepository} from './dynamo-db.repository';
import {DocumentClient, ScanInput} from 'aws-sdk/clients/dynamodb';
import {DynamoDbTableCaracteristicsModel} from '../models/dynamo-db-table-caracteristics.model';
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
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(scanResult => scanResult.Items);
    }

    findById(id: string): Promise<any> {
        const getParams: any = {
          TableName: this.tableName,
        };
        getParams.Key = {};
        getParams.Key[this.keyName] = id;
        return this.dynamoDbClient.get(getParams)
            .promise()
            .then(getResult => getResult.Item);
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
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(queryResult => queryResult.Items);
    }

    save(entity: object): Promise<any> {
        const putParams: PutItemInput = {
            TableName: this.tableName,
            Item: entity
        };
        return this.dynamoDbClient.put(putParams).promise();
    }

    deleteById(id: string): Promise<any> {
        const deleteParams: any = {
          TableName: this.tableName
        };
        deleteParams.Key = {};
        deleteParams.Key[this.keyName] = id;
        return this.dynamoDbClient.delete(deleteParams).promise();
    }

    deleteAll(): Promise<any> {
        return this.findAll()
            .then(items => Promise.all(items.map(item => this.deleteById(item[this.keyName]))));
    }
}
