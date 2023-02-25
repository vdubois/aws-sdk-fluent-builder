import { Sns } from './sns';
import { SNSClient } from '@aws-sdk/client-sns';
export declare class SnsImplementation implements Sns {
    private _topicName;
    private snsClient;
    constructor(_topicName: string, snsClient?: SNSClient);
    publishMessage(message: object): Promise<any>;
    private findTopicArn;
    get topicName(): string;
}
