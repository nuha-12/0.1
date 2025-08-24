const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "trash",
    version: "1.6",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "Trash image",
    longDescription: "Turn mentioned user into trash (except owner 😼)",
    category: "image",
    guide: {
      en: "{pn} [@tag | reply user]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    const ownerID = "61557991443492"; // your UID

    // Check mention first
    let uid = Object.keys(event.mentions)[0];

    // If no mention, but it's a reply, use the replied user
    if (!uid && event.messageReply) {
      uid = event.messageReply.senderID;
    }

    // If still no target, ask for one
    if (!uid) return message.reply("👉 Please mention someone or reply to their message to trash them!");

    // Prevent trashing the owner
    if (uid === ownerID) {
      return message.reply("😼 Sorry, I will never trash my owner!");
    }

    const pathSave = `${__dirname}/tmp/${uid}_Trash.png`;
    fs.ensureDirSync(`${__dirname}/tmp`);

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Trash().getImage(avatarURL);

      fs.writeFileSync(pathSave, Buffer.from(img));

      await message.reply({
        body: `🗑️ Here's the trash version of <@${uid}>`,
        attachment: fs.createReadStream(pathSave)
      });

    } catch (e) {
      return message.reply("⚠️ Failed to generate image.");
    } finally {
      if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
    }
  }
};
