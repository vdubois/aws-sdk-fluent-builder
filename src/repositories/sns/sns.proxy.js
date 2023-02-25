"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnsProxy = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
class SnsProxy {
    constructor(sns, snsClient = new client_sns_1.SNSClient({ region: process.env.AWS_REGION })) {
        this.sns = sns;
        this.snsClient = snsClient;
    }
    createIfNotExists() {
        return __awaiter(this, void 0, void 0, function* () {
            const { Topics } = yield this.snsClient.send(new client_sns_1.ListTopicsCommand({}));
            if (Topics.some(topic => topic.TopicArn.indexOf(this.sns.topicName) !== -1)) {
                return Promise.resolve({});
            }
            else {
                return this.snsClient.send(new client_sns_1.CreateTopicCommand({ Name: this.sns.topicName }));
            }
        });
    }
    publishMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createIfNotExists();
            return this.sns.publishMessage(message);
        });
    }
}
exports.SnsProxy = SnsProxy;
