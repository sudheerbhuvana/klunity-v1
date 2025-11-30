import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
// We go up two levels from src/config to backend root
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    // In production/docker, .env might not exist as vars are injected
    if (result.error.code === 'ENOENT') {
        console.log('No .env file found, using system environment variables.');
    } else {
        console.error('Error loading .env file:', result.error);
    }
} else {
    console.log(`Environment variables loaded from: ${envPath}`);
}

export default result;
