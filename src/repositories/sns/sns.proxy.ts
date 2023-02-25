import {Sns} from './sns';
import {SnsImplementation} from './sns.implementation';
import {CreateTopicCommand, ListTopicsCommand, SNSClient} from '@aws-sdk/client-sns';

export class SnsProxy implements Sns {

    constructor(private sns: SnsImplementation, private snsClient = new SNSClient({ region: process.env.AWS_REGION })) {
    }

    async createIfNotExists(): Promise<any> {
        const {Topics} = await this.snsClient.send(new ListTopicsCommand({}));
        if (Topics.some(topic => topic.TopicArn.indexOf(this.sns.topicName) !== -1)) {
            return Promise.resolve({});
        } else {
            return this.snsClient.send(new CreateTopicCommand({Name: this.sns.topicName}));
        }
    }

    async publishMessage(message: object): Promise<any> {
        await this.createIfNotExists();
        return this.sns.publishMessage(message);
    }
}
