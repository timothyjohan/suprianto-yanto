const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const jokes = require("../jokes/jokes");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    try {
      // === YANTO JOKE ===
      if (message.content.toLowerCase() === "yanto joke") {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

        const lucuButton = new ButtonBuilder()
          .setCustomId("lucu")
          .setLabel("Lucu")
          .setStyle(ButtonStyle.Success);

        const garingButton = new ButtonBuilder()
          .setCustomId("garing")
          .setLabel("Garing")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(
          lucuButton,
          garingButton
        );

        await message.reply({
          content: `🤣 **Joke Bapak-Bapak:**\n${randomJoke}`,
          components: [row],
        });
      }

      // === YANTO RIZZ ===
      if (message.content.toLowerCase() === "yanto rizz") {
        const imagePath = path.join(__dirname, "../hen.png");
        if (!fs.existsSync(imagePath)) {
          return message.reply("Image hen.png not found!");
        }

        const attachment = new AttachmentBuilder(imagePath);
        await message.channel.send({
          content: `💬 hey baby girl, how's the weather ☁️`,
          files: [attachment],
        });
      }

      // === YANTO BOORU {tag1,tag2} or yanto booru nsfw {tag1,tag2} ===
      if (message.content.toLowerCase().startsWith("yanto booru")) {
        const isNSFWRequested = message.content.toLowerCase().includes("nsfw");

        if (isNSFWRequested && !message.channel.nsfw) {
          return message.reply(
            "🚫 NSFW content is only allowed in NSFW-marked channels."
          );
        }

        const match = message.content.match(/\{(.+?)\}/);
        if (!match) {
          return message.reply(
            "❌ Incorrect format! Use: `yanto booru {tag1,tag2}` or `yanto booru nsfw {tag1,tag2}`"
          );
        }

        const rawTags = match[1];
        const tagsArray = rawTags.split(",").map((tag) => tag.trim());

        if (tagsArray.length > 2) {
          return message.reply("⚠️ Maximum of 2 tags allowed.");
        }

        const ratingTag = isNSFWRequested ? "rating:explicit" : "rating:safe";
        const tagQuery = `${tagsArray.join("+")}+${ratingTag}`;
        const apiUrl = `https://danbooru.donmai.us/posts.json?tags=${tagQuery}&limit=10`;

        const loadingMessage = await message.channel.send(
          "🔍 Fetching image from Danbooru..."
        );

        try {
          const response = await axios.get(apiUrl);
          const posts = response.data;

          if (!posts || posts.length === 0) {
            return loadingMessage.edit("😔 No images found with those tags.");
          }

          const randomPost = posts[Math.floor(Math.random() * posts.length)];
          const imageUrl = randomPost?.file_url || randomPost?.large_file_url;

          if (!imageUrl) {
            return loadingMessage.edit("⚠️ Failed to retrieve image.");
          }

          await loadingMessage.edit({
            content: `🎴 **Tags:** \`${tagsArray.join(", ")}\`
🏷️ **Top Tags:** \`${
              randomPost.tag_string?.split(" ").slice(0, 5).join(", ") || "N/A"
            }\`
🔗 <https://danbooru.donmai.us/posts/${randomPost.id}>`,
            files: [imageUrl],
          });
        } catch (error) {
          console.error(error);
          return loadingMessage.edit("🚨 Error fetching image from Danbooru.");
        }
      }

      // === YANTO HELP ===
      if (message.content.toLowerCase() === "yanto help") {
        const helpMessage = `
📖 **Yanto Bot Commands:**

🃏 \`yanto joke\`  
Sends a random *bapak-bapak* joke with "Lucu" and "Garing" buttons.

💬 \`yanto rizz\`  
Sends a smooth pickup line and a spicy image.

📸 \`yanto booru {tag1,tag2}\`  
Fetches a safe-for-work image from Danbooru with the given tags.

🔞 \`yanto booru nsfw {tag1,tag2}\`  
Fetches an NSFW image (only allowed in NSFW channels).

🎮 \`yanto crack <game name>\`  
Search and show cracked game info with selection.

ℹ️ \`yanto help\`  
Shows this help message.
        `;

        await message.reply(helpMessage);
      }

      // === YANTO CRACK ===
      if (message.content.toLowerCase().startsWith("yanto crack")) {
        const query = message.content.slice("yanto crack".length).trim();
        if (!query) {
          return message.reply(
            "❌ Please provide a game name. Example: `yanto crack spiderman`"
          );
        }

        const searchPayload = { title: query };
        const searchUrl =
          "https://gamestatus.info/back/api/gameinfo/game/full_search/";

        try {
          const response = await axios.post(searchUrl, searchPayload);
          const games = response.data.result;

          if (!games || games.length === 0) {
            return message.reply("🔍 No games found with that name.");
          }

          const rows = [];
          const buttons = games.slice(0, 5).map((game) =>
            new ButtonBuilder()
              .setCustomId(`crack_detail_${game.slug}`) // ✅ use game.slug instead
              .setLabel(game.title)
              .setStyle(ButtonStyle.Primary)
          );

          for (let i = 0; i < buttons.length; i += 5) {
            rows.push(
              new ActionRowBuilder().addComponents(buttons.slice(i, i + 5))
            );
          }

          const embeds = games
            .slice(0, 5)
            .map((game) =>
              new EmbedBuilder()
                .setTitle(game.title)
                .setImage(game.short_image)
                .setColor("Blurple")
            );

          await message.reply({
            content: "🎮 Select a game to see crack info:",
            embeds,
            components: rows,
          });
        } catch (error) {
          console.error(error);
          message.reply("❌ Failed to fetch game data.");
        }
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      await message.reply(
        "🚨 An unexpected error occurred. Please try again later."
      );
    }
  },
};
