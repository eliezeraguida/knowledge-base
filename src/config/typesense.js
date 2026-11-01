
import 'dotenv/config';
import Typesense from 'typesense';

const typesense = new Typesense.Client({
    nodes: [
        {
            host: 'localhost',
            port: 8108,
            protocol: 'http'
        }
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 5
});

export default typesense;

