module.exports = {
  config: {
    name: "block",
    author: "anne/zed",
    role: 3, // Owner-only
    shortDescription: "Block or unblock a user (Owner only)",
    longDescription: "",
    category: "hidden", // Hidden from help
    guide: "{pn} block/unblock [uid/fb link/mention] or reply to user"
  },

  onStart: async function ({ api, event, args }) {
    const ownerID = "YOUR_FACEBOOK_ID"; // <-- Replace with your FB ID
    if (event.senderID !== ownerID) 
      return api.sendMessage("❌ Only the bot owner can use this command!", event.threadID, event.messageID);

    const axios = require("axios");
    let id;

    // If reply, get sender ID
    if (event.type === "message_reply" && event.messageReply) {
      id = event.messageReply.senderID;
    } 
    // If mention
    else if (Object.keys(event.mentions).length > 0) {
      id = Object.keys(event.mentions)[0];
    } 
    // If link or UID in args
    else if (args[1] && args[1].includes(".com/")) {
      try {
        const res = await axios.get(`https://eurix-api.diciper09.repl.co/finduid?link=${args[1]}`);
        id = res.data.result || args[1];
      } catch (err) {
        return api.sendMessage(`❌ Failed to fetch UID from link: ${err}`, event.threadID, event.messageID);
      }
    } else {
      id = args[1];
    }

    if (!id) 
      return api.sendMessage(
        `❌ Wrong format!\nUsage:\n${this.config.name} block [uid/fb link/mention] or reply to message\n${this.config.name} unblock [uid/fb link/mention] or reply`,
        event.threadID,
        event.messageID
      );

    if (args[0] === "block") {
      api.changeBlockedStatus(id, true, (err) => {
        if (err) return api.sendMessage(`❌ Error: ${err}`, event.threadID, event.messageID);
        return api.sendMessage("✅ Successfully blocked user", event.threadID, event.messageID);
      });
    } else if (args[0] === "unblock") {
      api.changeBlockedStatus(id, false, (err) => {
        if (err) return api.sendMessage(`❌ Error: ${err}`, event.threadID, event.messageID);
        return api.sendMessage("✅ Successfully unblocked user", event.threadID, event.messageID);
      });
    } else {
      return api.sendMessage(
        `❌ Wrong format!\nUsage:\n${this.config.name} block [uid/fb link/mention] or reply to message\n${this.config.name} unblock [uid/fb link/mention] or reply`,
        event.threadID,
        event.messageID
      );
    }
  },
};
