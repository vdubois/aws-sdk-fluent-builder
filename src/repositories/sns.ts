export interface Sns {

    /**
     * Publish a message object to a topic using a JSON conversion
     * @param {object} message
     * @returns {Promise<any>}
     */
    publishMessage(message: object): Promise<any>;
}
