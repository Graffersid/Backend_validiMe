import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'idea';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'knZiJUjV5WREoXPe';
const MONGO_URL = 'mongodb://127.0.0.1:27017/ideaDB'
//const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.okpii.mongodb.net/?retryWrites=true&w=majority`;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 9090;

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    }
}
