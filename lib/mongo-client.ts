// lib/mongo-client.ts
import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

const uri = process.env.MONGODB_URI;
const options = {}; // keep minimal; you can add tls / replicaSet options for Atlas

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Invalid/Missing MONGODB_URI");
}

client = new MongoClient(uri, options);

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so that the client is reused across module reloads
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, it's fine to create a new client
  clientPromise = client.connect();
}

export default clientPromise;
export type MongoDB = Db;
