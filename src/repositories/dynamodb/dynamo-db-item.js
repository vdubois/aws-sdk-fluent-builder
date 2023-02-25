"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoDBItemToItem = exports.itemToDynamoDBItem = void 0;
const itemToDynamoDBItem = (item) => {
    const dynamoDBItem = {};
    for (const property in item) {
        if (typeof property === 'string') {
            dynamoDBItem[property] = { 'S': item[property] };
        }
        else if (typeof property === 'boolean') {
            dynamoDBItem[property] = { 'B': item[property] };
        }
        else if (typeof property === 'number') {
            dynamoDBItem[property] = { 'N': item[property] };
        }
        else {
            dynamoDBItem[property] = item[property];
        }
    }
    return dynamoDBItem;
};
exports.itemToDynamoDBItem = itemToDynamoDBItem;
const dynamoDBItemToItem = (dynamoDBItem) => {
    const item = {};
    for (const property in dynamoDBItem) {
        if (typeof dynamoDBItem[property] === 'object' && dynamoDBItem[property]['S']) {
            item[property] = dynamoDBItem[property]['S'];
        }
        else if (typeof dynamoDBItem[property] === 'object' && dynamoDBItem[property]['B']) {
            item[property] = dynamoDBItem[property]['B'];
        }
        else if (typeof dynamoDBItem[property] === 'object' && dynamoDBItem[property]['N']) {
            item[property] = dynamoDBItem[property]['N'];
        }
        else {
            item[property] = dynamoDBItem[property];
        }
    }
    return item;
};
exports.dynamoDBItemToItem = dynamoDBItemToItem;
