const insults = require('../insult/insults');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const username = interaction.user.username;
        const rating = interaction.customId === 'lucu' ? 'Lucu' : 'Garing';

        // Edit original message: remove buttons, and add who reacted
        const originalMessage = interaction.message;
        const newContent = `${originalMessage.content}\n\n👤 ${username} said: **${rating}**`;

        await interaction.update({
            content: newContent,
            components: [], // remove buttons
        });

        // Public follow-up message
        if (interaction.customId === 'lucu') {
            await interaction.followUp({
                content: `🤣 xixixixixi super sekali bapak 👍`,
            });
        } else if (interaction.customId === 'garing') {
            if (username.toLowerCase() === 'wongcino') {
                await interaction.followUp({
                    content: `cino sipit kontol -_-`,
                });
            } else {
                const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                await interaction.followUp({
                    content: `💀 ${randomInsult}`,
                });
            }
        }
        
    },
};
