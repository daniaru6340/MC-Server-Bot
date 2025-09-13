const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function getinfo() {
    try {
        const response = await axios.get(process.env.API);
        return response.data;
    } catch (err) {
        console.error(err);
    }
}


module.exports = { getinfo };