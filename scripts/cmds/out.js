module.exports = {
  config: {
    name: "out",
    author: "Hasib",
    role: 2, // Bot admin role
    shortDescription: "Make the bot leave the group",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();
    const ownerID = "61557991443492"; // Owner's ID

    try {
      // Check if it's a group chat
      const threadInfo = await api.getThreadInfo(threadID);
      if (!threadInfo.isGroup) {
        return api.sendMessage("❌ This command can only be used in group chats.", threadID);
      }

      // Only allow owner or bot admin
      if (senderID !== ownerID && event.isBotAdmin !== true) {
        return api.sendMessage("❌ Only the owner or bot admins can use this command.", threadID);
      }

      // Decide farewell message
      let farewellMessage = "👋 Goodbye! I'm leaving this group now...";
      if (senderID === ownerID) {
        farewellMessage = "🙏 I respect you, my Lord. I shall leave the group now. Farewell! 👋";
      }

      // Send farewell message
      await api.sendMessage(farewellMessage, threadID);

      // Remove the bot from the group
      await api.removeUserFromGroup(botID, threadID);

    } catch (error) {
      console.error("Error leaving the group:", error);
      return api.sendMessage("❌ Failed to leave the group. Make sure I have the required permissions.", threadID);
    }
  }
};
