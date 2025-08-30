const DIG = require("discord-image-generation");
const fs = require("fs-extra");

const OWNERS = ["100060606189407", "61557991443492"];
const SELF_REPLIES = [
  "😂 Trying to make yourself a lesbu? Cute!",
  "🌸 You already know the truth!",
  "😏 Self-love is important!"
];
const OWNER_REPLIES = [
  "🚫 This user is protected and cannot be lesbu!",
  "🙃 Sorry, no lesbu for them!",
  "❌ You can't lesbu the boss!"
];

module.exports = {
  config: {
    name: "lesbu",
    aliases: [],
    version: "1.0",
    author: "Hasib",
    countDown: 3,
    role: 0,
    shortDescription: "Make someone a lesbu 🌸",
    longDescription: "Applies a lesbu overlay on a user's avatar.",
    category: "fun",
    guide: "{pn} [mention | reply | none]"
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      let targetID;

      // ✅ Priority: reply > mention > self
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else {
        targetID = event.senderID; // fallback: self
      }

      // ❌ Owner protection
      if (OWNERS.includes(targetID)) {
        const reply = OWNER_REPLIES[Math.floor(Math.random() * OWNER_REPLIES.length)];
        return message.reply(reply);
      }

      // 😏 Self-check
      if (targetID === event.senderID) {
        const reply = SELF_REPLIES[Math.floor(Math.random() * SELF_REPLIES.length)];
        return message.reply(reply);
      }

      const name = await usersData.getName(targetID);
      const avatarUrl = await usersData.getAvatarUrl(targetID);

      if (!avatarUrl) {
        return message.reply("⚠️ Couldn't fetch this user's avatar.");
      }

      // 🌸 Generate lesbu overlay
      const img = await new DIG.Lesbian().getImage(avatarUrl); // assuming DIG has this method
      const filePath = `${__dirname}/tmp/lesbu_${targetID}_${Date.now()}.png`;

      await fs.outputFile(filePath, img);

      await message.reply({
        body: `🌸 ${name} is officially a LESBU now! 😆`,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(filePath)
      });

      await fs.unlink(filePath); // cleanup
    } catch (err) {
      console.error(err);
      message.reply("❌ Something went wrong while making them lesbu.");
    }
  }
};
