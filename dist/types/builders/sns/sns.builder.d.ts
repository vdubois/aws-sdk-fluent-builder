import { Sns } from '../../repositories/sns/sns';
export declare class SnsBuilder {
    private topicName;
    private mustCreateBeforeUse;
    withTopicName(topicName: string): SnsBuilder;
    createIfNotExists(): SnsBuilder;
    build(): Sns;
}
