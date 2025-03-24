const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // this one requires to be enabled in Developer Portal
    ],
});


client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Dynamically load events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.name && typeof event.execute === 'function') {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.DISCORD_TOKEN);
