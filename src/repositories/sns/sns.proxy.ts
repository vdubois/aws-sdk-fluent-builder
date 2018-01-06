import { Sns } from './sns';
import { SnsImplementation } from './sns.implementation';
import * as SNS from 'aws-sdk/clients/sns';

export class SnsProxy implements Sns {

    constructor(private sns: SnsImplementation, private snsClient = new SNS({ region: process.env.AWS_REGION })) {
    }

    createIfNotExists(): Promise<any> {
        return this.snsClient.listTopics().promise()
            .then(results => {
                if (results.Topics.some(topic => topic.TopicArn.indexOf(this.sns.topicName) !== -1)) {
                    return Promise.resolve({});
                } else {
                    return this.snsClient.createTopic({Name: this.sns.topicName}).promise();
                }
            });
    }

    publishMessage(message: object): Promise<any> {
        return this.createIfNotExists()
            .then(() => this.sns.publishMessage(message));
    }
}
