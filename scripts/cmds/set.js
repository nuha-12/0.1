module.exports = {
  config: {
    name: "setbalance",
    version: "1.0",
    author: "Hasib + ChatGPT",
    shortDescription: "Admin-only balance setter",
    longDescription: "Only specific admins can set user balance (money)",
    category: "Admin",
    guide: {
      en: "{p}setbalance [amount] [@user/reply]"
    },
    role: 2
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      // Only these 2 users can use
      const ALLOWED_UIDS = ["100060606189407", "61557991443492"];

      if (!ALLOWED_UIDS.includes(event.senderID.toString())) {
        return api.sendMessage("⛔ Access Denied: You are not allowed to use this command.", event.threadID);
      }

      // Parse inputs
      const amount = parseFloat(args[0]);
      const targetID =
        Object.keys(event.mentions)[0] ||
        (event.messageReply?.senderID) ||
        event.senderID;

      if (isNaN(amount)) {
        return api.sendMessage("❌ Invalid amount. Example: {p}setbalance 500 @user", event.threadID);
      }

      // Get user
      const userData = await usersData.get(targetID);
      if (!userData) return api.sendMessage("❌ User not found in database.", event.threadID);

      // Update balance (money)
      await usersData.set(targetID, { ...userData, money: amount });

      return api.sendMessage(
        `💰 Balance set to ${amount} for ${userData.name}`,
        event.threadID
      );

    } catch (error) {
      console.error("Set Balance Error:", error);
      return api.sendMessage("⚠️ Command failed: " + error.message, event.threadID);
    }
  }
};
