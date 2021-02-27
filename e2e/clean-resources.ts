import { deleteBucketIfExists, deleteTableIfExist, deleteTopicIfExist } from './clean-functions';

const cleanResources = async (): Promise<void> => {
    console.log('Cleaning resources...');
    await deleteTableIfExist('dynamo-db-module-pk-sk-e2e');
    await deleteTableIfExist('dynamo-db-module-pk-e2e');
    await deleteTopicIfExist();
    await deleteBucketIfExists('s3-configuration-module-e2e');
    await deleteBucketIfExists('s3-storage-module-e2e');
    await deleteBucketIfExists('s3-hosting-module-e2e');
};

(async () => {
    await cleanResources();
    console.log('All resources clean');
})();
