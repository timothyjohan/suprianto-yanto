const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
const insults = require("../insult/insults");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (!interaction.isButton()) return;

      // === CRACK DETAIL BUTTON ===
      if (interaction.customId.startsWith("crack_detail_")) {
        const slug = interaction.customId.replace("crack_detail_", "");

        try {
          await interaction.deferReply({ ephemeral: false });

          const response = await axios.get(
            `https://gamestatus.info/back/api/gameinfo/game/${slug}/`
          );
          const game = response.data;

          const embed = new EmbedBuilder()
            .setTitle(game.title)
            .setImage(game.short_image || null)
            .addFields(
              {
                name: "🗓 Release Date",
                value: game.release_date || "N/A",
                inline: true,
              },
              {
                name: "🔓 Crack Date",
                value: game.crack_date || "N/A",
                inline: true,
              },
              {
                name: "📌 Crack Status",
                value: game.readable_status || "Unknown",
                inline: false,
              }
            )
            .setColor("Green");

          await interaction.editReply({ embeds: [embed] });

          try {
            await interaction.message.delete();
          } catch (err) {
            console.warn("Could not delete old message:", err.message);
          }

          // Step 2: Re-send the original crack query
          await interaction.channel.send(
            `yanto crack ${interaction.customId
              .replace("crack_detail_", "")
              .replaceAll("-", " ")}`
          );

          // Step 3: Send the selected game info
          await interaction.channel.send({ embeds: [embed] });
        } catch (err) {
          console.error("Failed to fetch crack detail:", err);

          if (!interaction.replied && !interaction.deferred) {
            try {
              await interaction.reply({
                content: "❌ Failed to get game detail.",
                flags: 64, // ephemeral
              });
            } catch (innerErr) {
              console.error("Double-reply prevention failed:", innerErr);
            }
          }
        }

        return; // stop here, don’t fall through to other button logic
      }

      // === JOKE BUTTONS ===
      const username = interaction.user.username;
      const rating = interaction.customId === "lucu" ? "Lucu" : "Garing";
      const originalMessage = interaction.message;
      const newContent = `${originalMessage.content}\n\n👤 ${username} said: **${rating}**`;

      await interaction.update({
        content: newContent,
        components: [], // remove buttons
      });

      if (interaction.customId === "lucu") {
        return await interaction.followUp({
          content: `🤣 xixixixixi super sekali bapak 👍`,
        });
      }

      if (interaction.customId === "garing") {
        const response =
          username.toLowerCase() === "wongcino"
            ? `cino sipit kontol -_-`
            : insults[Math.floor(Math.random() * insults.length)];

        return await interaction.followUp({
          content: response,
        });
      }
    } catch (error) {
      console.error("Error handling interactionCreate event:", error);
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content:
              "An error occurred while processing your interaction. Please try again later.",
            ephemeral: true,
          });
        } catch (followUpError) {
          console.error("Error sending fallback reply:", followUpError);
        }
      }
    }
  },
};
