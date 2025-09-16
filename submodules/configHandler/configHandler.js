const fs = require('fs/promises');
const path = require('path');
const { json } = require('stream/consumers');

 async function loadConfig(guildId) {
    const configPath = path.join(__dirname, '../../configs', 'guildConfig.json');

    try {
        const configData = await fs.readFile(configPath, 'utf8');
        // console.log(configData);
        const config = JSON.parse(configData);
        return config[guildId];
    } catch (err) {
        console.error("error:",err);
        return 404;
    }
}

module.exports = { loadConfig }