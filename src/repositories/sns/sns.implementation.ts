import { Sns } from './sns';
import * as SNS from 'aws-sdk/clients/sns';

export class SnsImplementation implements Sns {

    constructor(private _topicName: string, private snsClient = new SNS({ region: process.env.AWS_REGION })) {
    }

    async publishMessage(message: object): Promise<any> {
        const topicArn = await this.findTopicArn();
        return this.snsClient.publish({
                TopicArn: topicArn,
                Message: JSON.stringify(message)
            }).promise();
    }

    private async findTopicArn(): Promise<any> {
        const {Topics} = await this.snsClient.listTopics().promise();
        return Topics.find(topic => topic.TopicArn.indexOf(this._topicName) !== -1).TopicArn;
    }

    get topicName(): string {
        return this._topicName;
    }
}
