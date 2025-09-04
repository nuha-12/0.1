const fs = require("fs-extra");
const axios = require("axios");

const OWNER_IDS = ["100060606189407", "61557991443492"]; // <-- put your FB UIDs here

module.exports = {
  config: {
    name: "postfb",
    version: "1.0",
    author: "jfhigtfdv",
    countDown: 5,
    role: 2, // keep this
    shortDescription: {
      en: "Create a new post on Facebook."
    },
    longDescription: {
      en: "Create a new post on Facebook with text, images, and video."
    },
    category: "Social",
    guide: {
      en: "{pn}: post"
    }
  },

  onStart: async function ({ event, api, commandName }) {
    const { threadID, messageID, senderID } = event;

    // 🔐 owner-only check
    if (!OWNER_IDS.includes(senderID)) {
      return api.sendMessage("❌ Only the bot owner can use this command.", threadID, messageID);
    }

    const uuid = getGUID();
    const formData = { ... /* your formData here */ };

    return api.sendMessage(`Choose an audience that can see this article of yours\n1. Everyone\n2. Friend\n3. Only me`, threadID, (e, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: senderID,
        formData,
        type: "whoSee"
      });
    }, messageID);
  },

  onReply: async function ({ Reply, event, api, commandName }) {
    const handleReply = Reply;
    const { type, author, formData } = handleReply;

    // 🔐 owner-only check again
    if (!OWNER_IDS.includes(event.senderID)) {
      return api.sendMessage("❌ Only the bot owner can use this command.", event.threadID, event.messageID);
    }

    if (event.senderID != author) return;

    // ... (rest of your reply handling code)
  }
};

function getGUID() {
  var sectionLength = Date.now();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    return (c == "x" ? r : (r & 7) | 8).toString(16);
  });
}
