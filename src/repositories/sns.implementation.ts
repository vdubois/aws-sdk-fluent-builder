import { Sns } from './sns';
import SNS = require('aws-sdk/clients/sns');

export class SnsImplementation implements Sns {

    constructor(private _topicName: string, private snsClient = new SNS({ region: process.env.AWS_REGION })) {
    }

    publishMessage(message: object): Promise<any> {
        return this.findTopicArn()
            .then(topicArn => this.snsClient.publish({
                TopicArn: topicArn,
                Message: JSON.stringify(message)
            }).promise());
    }

    private findTopicArn(): Promise<any> {
        return this.snsClient.listTopics().promise()
            .then(results => results.Topics.find(topic => topic.TopicArn.indexOf(this._topicName) !== -1))
            .then(topic => topic.TopicArn);
    }
    get topicName(): string {
        return this._topicName;
    }
}
