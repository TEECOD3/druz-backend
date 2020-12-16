import mongoose from "mongoose";
const MONGO_BASE_URI = process.env.MONGO_BASE_URI;

// beforeAll
export const createConnection = async (dbName: string): Promise<void> => {
  const url = `${MONGO_BASE_URI}${dbName}`;
  console.log(MONGO_BASE_URI);
  await mongoose.createConnection(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// afterEach
export const removeCollections = async (): Promise<void> => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[`${collectionName}`];
    await collection.deleteMany({});
  }
};

// after all test have completed(afterAll)
export const dropAllCollections = async (): Promise<void> => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[`${collectionName}`];
    try {
      await collection.drop();
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped. Happens infrequently.
      // Safe to ignore.
      if (error.message === "ns not found") return;

      // This error happens when you use it.todo.
      // Safe to ignore.
      if (error.message.includes("a background operation is currently running"))
        return;

      console.log(error.message);
    }
  }
};
