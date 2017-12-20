import { Sns } from './sns';
import { SnsImplementation } from './sns.implementation';
import SNS = require('aws-sdk/clients/sns');

export class SnsProxy implements Sns {

    constructor(private sns: SnsImplementation, private snsClient = new SNS({ region: process.env.AWS_REGION })) {
    }

    createIfNotExists(): Promise<any> {
        return this.snsClient.createTopic({Name: this.sns.topicName}).promise();
    }

    publishMessage(message: object): Promise<any> {
        return this.createIfNotExists()
            .then(() => this.sns.publishMessage(message));
    }
}
