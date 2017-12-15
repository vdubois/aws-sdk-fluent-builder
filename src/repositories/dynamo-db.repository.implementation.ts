import {DynamoDbRepository} from './dynamo-db.repository';
import {DocumentClient, ScanInput} from 'aws-sdk/clients/dynamodb';
import {DynamoDbTableCaracteristicsModel} from '../models/dynamo-db-table-caracteristics.model';

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
            TableName: this.caracteristics.tableName
        };
        return this.dynamoDbClient.scan(scanParams)
            .promise()
            .then(scanResult => scanResult.Items);
    }
}
