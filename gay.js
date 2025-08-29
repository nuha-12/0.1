const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "gay",
    aliases: ["rainbow"],
    version: "2.0",
    author: "Rasin",
    countDown: 3,
    role: 0,
    shortDescription: "Apply rainbow filter to user's avatar",
    longDescription: "Adds a rainbow overlay to the target's profile picture",
    category: "fun",
    guide: "{pn} [reply | mention | uid | fb-link]"
  },

  onStart: async function ({ event, message, usersData, args, api }) {
    try {
      const input = args.join(" ");
      let uid = null;

      // ✅ Detect user
      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else if (/^\d+$/.test(input)) {
        uid = input;
      } else if (input.includes("facebook.com")) {
        try {
          const res = await api.getUID(input);
          if (!res) throw new Error("Invalid Facebook link.");
          uid = res;
        } catch (err) {
          console.error("Error resolving Facebook link:", err);
          return message.reply("⚠️ Couldn't find the user from the Facebook link. Try using a UID instead.");
        }
      }

      if (!uid) {
        return message.reply("👉 Mention someone, reply to a message, or provide UID.");
      }

      // ✅ Protect Boss
      if (uid === "100060606189407" , "61557991443492") {
        return message.reply("😒 Hey! You can't rainbow my Boss!", "you gay 🙄 not my boss");
      }

      // ✅ Get avatar
      const avatarUrl = await usersData.getAvatarUrl(uid);
      if (!avatarUrl) return message.reply("⚠️ Couldn't fetch avatar of this user.");

      // ✅ Apply rainbow effect
      const imgBuffer = await new DIG.Gay().getImage(avatarUrl);
      const pathSave = `${__dirname}/tmp/gay_${uid}.png`;
      await fs.outputFile(pathSave, imgBuffer);

      // ✅ Get name & reply
      const name = await usersData.getName(uid);
      return message.reply({
        body: `🌈 ${name} just got rainbowed! 😂`,
        mentions: [{ tag: name, id: uid }],
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlink(pathSave, () => {}));

    } catch (error) {
      console.error("Error in gay command:", error);
      return message.reply("⚠️ An error occurred while generating the rainbow image.");
    }
  }
};
