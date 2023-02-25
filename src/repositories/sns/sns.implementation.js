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
exports.SnsImplementation = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
class SnsImplementation {
    constructor(_topicName, snsClient = new client_sns_1.SNSClient({ region: process.env.AWS_REGION })) {
        this._topicName = _topicName;
        this.snsClient = snsClient;
    }
    publishMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const topicArn = yield this.findTopicArn();
            return this.snsClient.send(new client_sns_1.PublishCommand({
                TopicArn: topicArn,
                Message: JSON.stringify(message)
            }));
        });
    }
    findTopicArn() {
        return __awaiter(this, void 0, void 0, function* () {
            const { Topics } = yield this.snsClient.send(new client_sns_1.ListTopicsCommand({}));
            return Topics.find(topic => topic.TopicArn.indexOf(this._topicName) !== -1).TopicArn;
        });
    }
    get topicName() {
        return this._topicName;
    }
}
exports.SnsImplementation = SnsImplementation;
