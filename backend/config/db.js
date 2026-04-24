const mongoose = require('mongoose');

function buildMongoUriFromParts() {
  const user = process.env.ATLAS_DB_USER;
  const password = process.env.ATLAS_DB_PASSWORD;
  const clusterHost = process.env.ATLAS_CLUSTER_HOST;
  const dbName = process.env.ATLAS_DB_NAME || 'healthcare-system';

  if (!user || !password || !clusterHost) {
    return null;
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  return `mongodb+srv://${encodedUser}:${encodedPassword}@${clusterHost}/${dbName}?retryWrites=true&w=majority`;
}

function getMongoUri() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }

  if (process.env.MONGO_URI && process.env.MONGO_URI.trim()) {
    return process.env.MONGO_URI.trim();
  }

  const built = buildMongoUriFromParts();
  if (built) return built;

  return null;
}

async function connectDB() {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    throw new Error(
      'MongoDB connection is not configured. Set MONGODB_URI or ATLAS_DB_USER/ATLAS_DB_PASSWORD/ATLAS_CLUSTER_HOST.'
    );
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected successfully');
  return true;
}

module.exports = { connectDB, getMongoUri };
