import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getinfo(api:string) {
    try {
        const response = await axios.get(api);
        return response.data;
    } catch (err) {
        console.error(err);
    }
}


export { getinfo };