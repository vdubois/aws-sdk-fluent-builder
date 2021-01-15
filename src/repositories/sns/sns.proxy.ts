import { Sns } from './sns';
import { SnsImplementation } from './sns.implementation';
import * as SNS from 'aws-sdk/clients/sns';

export class SnsProxy implements Sns {

    constructor(private sns: SnsImplementation, private snsClient = new SNS({ region: process.env.AWS_REGION })) {
    }

    async createIfNotExists(): Promise<any> {
        const {Topics} = await this.snsClient.listTopics().promise();
        if (Topics.some(topic => topic.TopicArn.indexOf(this.sns.topicName) !== -1)) {
            return Promise.resolve({});
        } else {
            return this.snsClient.createTopic({Name: this.sns.topicName}).promise();
        }
    }

    async publishMessage(message: object): Promise<any> {
        await this.createIfNotExists();
        return this.sns.publishMessage(message);
    }
}
