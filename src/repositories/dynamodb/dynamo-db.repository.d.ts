export interface DynamoDbRepository {
    /**
     * Returns all items of a table
     * @returns {Promise<Array<any>>}
     */
    findAll(): Promise<Array<any>>;
    /**
     * Returns an item of a table using its id
     * @param {string} id
     * @returns {Promise<any>}
     */
    findById(id: string): Promise<any>;
    /**
     * Returns some items filtered by field/value
     * @param {string} field
     * @param {string} value
     * @returns {Promise<Array<any>>}
     */
    findBy(field: string, value: string): Promise<Array<any>>;
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
    saveAll(entities: Array<object>, byChunkOf?: number): Promise<any>;
    /**
     * Deletes an item from a table using its id
     * @param {string} id
     * @returns {Promise<any>}
     */
    deleteById(id: string): Promise<any>;
    /**
     * Deletes all items from a table
     * @returns {Promise<any>}
     */
    deleteAll(): Promise<any>;
}
