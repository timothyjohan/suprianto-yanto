const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const jokes = require('../jokes/jokes');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.content === '!joke') {
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

            const lucuButton = new ButtonBuilder()
                .setCustomId('lucu')
                .setLabel('Lucu')
                .setStyle(ButtonStyle.Success);

            const garingButton = new ButtonBuilder()
                .setCustomId('garing')
                .setLabel('Garing')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(lucuButton, garingButton);

            await message.reply({
                content: `🤣 **Joke Bapak-Bapak:**\n${randomJoke}`,
                components: [row],
            });
        }
    },
};
