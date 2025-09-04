const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ['boxinfo'],
    version: "1.4",
    author: "xemon",
    countDown: 5,
    role: 0, // Everyone by default, but we restrict manually
    shortDescription: "See group info (Admin & Owner only)",
    longDescription: "Displays information about the current group (admins, members, messages, etc).",
    category: "box chat",
    guide: {
      en: "{p}groupinfo"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);

      // 🔒 Allowed owners (hardcoded)
      const owners = ["100060606189407", "61557991443492"];

      // Sender
      const senderID = event.senderID;

      // Check if admin
      const isAdmin = threadInfo.adminIDs.some(ad => ad.id === senderID);

      // Check if owner
      const isOwner = owners.includes(senderID);

      if (!isAdmin && !isOwner) {
        return api.sendMessage(
          "❌ Only group admins or bot owner can use this command.",
          event.threadID,
          event.messageID
        );
      }

      const memLength = threadInfo.participantIDs.length;

      // Count genders
      let males = 0, females = 0, others = 0;
      for (const user of threadInfo.userInfo) {
        if (user.gender === "MALE") males++;
        else if (user.gender === "FEMALE") females++;
        else others++;
      }

      // Admin list
      let listAdmins = "";
      for (const ad of threadInfo.adminIDs) {
        const user = await api.getUserInfo(ad.id);
        listAdmins += `• ${user[ad.id].name}\n`;
      }

      const approval = threadInfo.approvalMode ? "On ✅" : "Off ❌";
      const icon = threadInfo.emoji || "😃";
      const threadName = threadInfo.threadName || "Unnamed Group";
      const groupID = threadInfo.threadID;
      const totalMessages = threadInfo.messageCount || "N/A";

      const infoText =
        `🔧「 Group Name 」: ${threadName}\n` +
        `🔧「 Group ID 」: ${groupID}\n` +
        `🔧「 Approval Mode 」: ${approval}\n` +
        `🔧「 Emoji 」: ${icon}\n` +
        `🔧「 Members 」: ${memLength}\n` +
        `🔧「 Males 」: ${males}\n` +
        `🔧「 Females 」: ${females}\n` +
        `🔧「 Others 」: ${others}\n` +
        `🔧「 Total Admins 」: ${threadInfo.adminIDs.length}\n` +
        `🔧「 Admin List 」:\n${listAdmins}\n` +
        `🔧「 Total Messages 」: ${totalMessages} msgs\n\n` +
        `✨ Made with ❤️ by ${this.config.author}`;

      const sendInfo = (attachment = null) => {
        api.sendMessage(
          { body: infoText, attachment },
          event.threadID,
          attachment ? () => fs.unlinkSync(__dirname + "/cache/1.png") : null,
          event.messageID
        );
      };

      if (threadInfo.imageSrc) {
        // Download group image if exists
        request(encodeURI(threadInfo.imageSrc))
          .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
          .on("close", () => sendInfo(fs.createReadStream(__dirname + "/cache/1.png")));
      } else {
        sendInfo(); // No image
      }

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ Failed to fetch group info!", event.threadID, event.messageID);
    }
  }
};
