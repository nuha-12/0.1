const axios = require("axios");

module.exports = {
  config: {
    name: "block",
    author: "anne/zed",
    role: 3, // Owner-only
    shortDescription: "Block or unblock a user (Owner only)",
    longDescription: "",
    category: "hidden", // Hidden from help
    guide: "{pn} [block/unblock] [uid/fb link/mention] or reply"
  },

  onStart: async function ({ api, event, args }) {
    const ownerIDs = ["61557991443492"]; // <-- Replace/add your FB IDs
    if (!ownerIDs.includes(event.senderID)) {
      return api.sendMessage("❌ Only the bot owner can use this command!", event.threadID, event.messageID);
    }

    let id;

    try {
      if (event.type === "message_reply" && event.messageReply) {
        id = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        id = Object.keys(event.mentions)[0];
      } else if (args[1] && args[1].includes(".com/")) {
        const res = await axios.get(`https://eurix-api.diciper09.repl.co/finduid?link=${args[1]}`);
        id = res.data?.result || args[1];
      } else {
        id = args[1];
      }
    } catch (err) {
      return api.sendMessage(`❌ Failed to fetch UID: ${err.message}`, event.threadID, event.messageID);
    }

    if (!id) {
      return api.sendMessage(
        `❌ Wrong format!\nUsage:\n${this.config.guide}`,
        event.threadID,
        event.messageID
      );
    }

    if (ownerIDs.includes(id)) {
      return api.sendMessage("⚠️ You cannot block an owner!", event.threadID, event.messageID);
    }

    if (args[0] === "block") {
      api.changeBlockedStatus(id, true, (err) => {
        if (err) return api.sendMessage(`❌ Error: ${err}`, event.threadID, event.messageID);
        return api.sendMessage(`✅ Successfully blocked user: ${id}`, event.threadID, event.messageID);
      });
    } else if (args[0] === "unblock") {
      api.changeBlockedStatus(id, false, (err) => {
        if (err) return api.sendMessage(`❌ Error: ${err}`, event.threadID, event.messageID);
        return api.sendMessage(`✅ Successfully unblocked user: ${id}`, event.threadID, event.messageID);
      });
    } else {
      return api.sendMessage(
        `❌ Wrong format!\nUsage:\n${this.config.guide}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
