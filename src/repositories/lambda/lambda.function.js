"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaFunction = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
const util_1 = require("util");
class LambdaFunction {
    constructor(name, lambda = new client_lambda_1.LambdaClient({ region: process.env.AWS_REGION })) {
        this.name = name;
        this.lambda = lambda;
    }
    invoke(payload) {
        return this.lambda.send(new client_lambda_1.InvokeCommand({
            FunctionName: this.name,
            Payload: new util_1.TextEncoder().encode(JSON.stringify({ body: JSON.stringify(payload) }))
        }));
    }
}
exports.LambdaFunction = LambdaFunction;
