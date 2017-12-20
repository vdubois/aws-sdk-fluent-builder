import { Sns } from './sns';
import SNS = require('aws-sdk/clients/sns');

export class SnsImplementation implements Sns {

    constructor(private _topicName: string, private snsClient = new SNS({ region: process.env.AWS_REGION })) {
    }

    publishMessage(message: object): Promise<any> {
        return this.snsClient.publish({Message: JSON.stringify(message)}).promise();
    }

    get topicName(): string {
        return this._topicName;
    }
}
