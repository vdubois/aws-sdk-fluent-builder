import { Sns } from './sns';
import { SnsImplementation } from './sns.implementation';
import * as SNS from 'aws-sdk/clients/sns';
export declare class SnsProxy implements Sns {
    private sns;
    private snsClient;
    constructor(sns: SnsImplementation, snsClient?: SNS);
    createIfNotExists(): Promise<any>;
    publishMessage(message: object): Promise<any>;
}
