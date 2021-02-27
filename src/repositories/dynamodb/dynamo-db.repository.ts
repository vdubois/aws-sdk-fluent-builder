export interface DynamoDbRepository {

    /**
     * Returns an item of a table using its partitionKeyValue
     * @param {string} partitionKeyValue
     * @returns {Promise<any>}
     */
    findOneByPartitionKey(partitionKeyValue: string): Promise<any>;

    /**
     * Returns an item of a table using its partitionKeyValue and sortKeyValue
     * @param {string} partitionKeyValue
     * @param {string} sortKeyValue
     * @returns {Promise<any>}
     */
    findOneByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any>;

    /**
     * Returns all items matching a partition key
     * @param partitionKeyValue the partition key to query table
     * @returns {Promise<Array<any>>}
     */
    findAllByPartitionKey(partitionKeyValue: string): Promise<Array<any>>;

    /**
     * Saves an item into a table
     * @param {object} entity
     * @returns {Promise<any>}
     */
    save(entity: object): Promise<any>;

    /**
     * Save items into a table in chunks
     * @param entities entities to save
     * @param byChunkOf number of elements to save at a time
     */
    saveAll(entities: Array<object>, byChunkOf?: number): Promise<void>;

    /**
     * Deletes an item from a table using its partitionKeyValue
     * @param {string} partitionKeyValue
     * @returns {Promise<any>}
     */
    deleteByPartitionKey(partitionKeyValue: string): Promise<any>;

    /**
     * Deletes an item from a table using its partitionKeyValue and sortKeyValue
     * @param {string} partitionKeyValue
     * @param {string} sortKeyValue
     * @returns {Promise<any>}
     */
    deleteByPartitionKeyAndSortKey(partitionKeyValue: string, sortKeyValue: string): Promise<any>;
}
