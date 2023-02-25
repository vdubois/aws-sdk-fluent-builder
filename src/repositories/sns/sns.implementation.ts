import {Sns} from './sns';
import {ListTopicsCommand, PublishCommand, SNSClient} from '@aws-sdk/client-sns';

export class SnsImplementation implements Sns {

    constructor(private _topicName: string, private snsClient = new SNSClient({ region: process.env.AWS_REGION })) {
    }

    async publishMessage(message: object): Promise<any> {
        const topicArn = await this.findTopicArn();
        return this.snsClient.send(new PublishCommand({
                TopicArn: topicArn,
                Message: JSON.stringify(message)
            }));
    }

    private async findTopicArn(): Promise<any> {
        const {Topics} = await this.snsClient.send(new ListTopicsCommand({}));
        return Topics.find(topic => topic.TopicArn.indexOf(this._topicName) !== -1).TopicArn;
    }

    get topicName(): string {
        return this._topicName;
    }
}
