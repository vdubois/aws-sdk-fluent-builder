"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
class LambdaFunction {
    constructor(name, lambda = new aws_sdk_1.Lambda({ region: process.env.AWS_REGION })) {
        this.name = name;
        this.lambda = lambda;
    }
    invoke(payload) {
        return this.lambda.invoke({
            FunctionName: this.name,
            Payload: JSON.stringify({ body: JSON.stringify(payload) })
        }).promise();
    }
}
exports.LambdaFunction = LambdaFunction;
