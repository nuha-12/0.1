module.exports = {
  config: {
    name: "respect",
    aliases: [],
    version: "1.3",
    author: "AceGun x Samir Œ (Hasib)",
    countDown: 0,
    role: 0,
    shortDescription: "Give admin and show respect",
    longDescription: "Gives the root owner admin privileges in the thread and shows a respectful message.",
    category: "owner",
    guide: "{pn} respect",
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerID = "61557991443492"; // Only Owner
      if (event.senderID !== ownerID) {
        return api.sendMessage(
          "❌ | You are not the Owner. Only the root Owner can use this command.",
          event.threadID,
          event.messageID
        );
      }

      const threadID = event.threadID;

      // Promote owner to admin (bot must already be admin)
      await api.changeAdminStatus(threadID, ownerID, true);

      api.sendMessage(
        "👑 My Lord, you are now an Admin in this group! 🙇‍♂️",
        threadID
      );
    } catch (error) {
      console.error("Error promoting owner to admin:", error);
      api.sendMessage(
        "😓 My Lord, I can’t add you as an Admin. Make sure the bot is already an Admin in this group.",
        event.threadID
      );
    }
  },
};
