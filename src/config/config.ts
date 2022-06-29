import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'idea';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'knZiJUjV5WREoXPe';
const MONGO_URL = 'mongodb://127.0.0.1:27017/ideaDB'
//const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.okpii.mongodb.net/?retryWrites=true&w=majority`;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 80 || 9090;

const JWT_SECRET = '9e703762cd254ed1420ad1be4884fd4d'
const JWT_TOKEN_EXPIRED = '24h'

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    token: {
        JWT_SECRET: JWT_SECRET,
        JWT_TOKEN_EXPIRED: JWT_TOKEN_EXPIRED
    }
}
