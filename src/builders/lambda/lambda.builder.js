"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaBuilder = void 0;
const lambda_function_1 = require("../../repositories/lambda/lambda.function");
class LambdaBuilder {
    withName(name) {
        this.name = name;
        return this;
    }
    build() {
        if (!process.env.AWS_REGION) {
            throw new Error('AWS_REGION environment variable must be set');
        }
        if (!this.name) {
            throw new Error('Lambda name is mandatory');
        }
        return new lambda_function_1.LambdaFunction(this.name);
    }
}
exports.LambdaBuilder = LambdaBuilder;
