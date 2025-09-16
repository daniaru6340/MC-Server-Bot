const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function getinfo(api) {
    try {
        const response = await axios.get(api);
        return response.data;
    } catch (err) {
        console.error(err);
    }
}


module.exports = { getinfo };