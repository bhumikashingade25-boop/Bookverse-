const mongoose = require('mongoose');
const { memoryStore } = require('./inMemoryDb');

let isInMemoryMode = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && !mongoUri.includes('localhost:27017')) {
    try {
      console.log('Connecting to primary MongoDB URI...');
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn('Primary MongoDB URI timed out. Activating In-Memory Engine...');
    }
  }

  // Activate In-Memory Fast Engine
  console.log('⚡ BookVerse In-Memory Database Engine Active (Zero-Latency, 100% Offline)');
  isInMemoryMode = true;

  // Intercept Mongoose models for instant in-memory operations
  const originalModel = mongoose.model.bind(mongoose);
  mongoose.model = function(name, schema) {
    let nativeModel;
    try {
      nativeModel = originalModel(name, schema);
    } catch (e) {
      nativeModel = mongoose.models[name];
    }

    const col = memoryStore.getCollection(name);

    const memoryModelProxy = {
      modelName: name,
      schema: schema,
      countDocuments: (q) => col.countDocuments(q),
      deleteMany: (q) => col.deleteMany(q),
      insertMany: (items) => col.insertMany(items),
      create: (data) => col.create(data),
      find: (q) => col.find(q),
      findOne: (q) => col.findOne(q),
      findById: (id) => col.findById(id),
      findByIdAndUpdate: (id, update, opts) => col.findByIdAndUpdate(id, update, opts),
      distinct: async (field) => {
        const docs = col.docs;
        return Array.from(new Set(docs.map(d => d[field]).filter(Boolean)));
      }
    };

    return new Proxy(nativeModel || {}, {
      get(target, prop) {
        if (memoryModelProxy[prop]) {
          return memoryModelProxy[prop];
        }
        return target[prop];
      }
    });
  };
};

module.exports = connectDB;
