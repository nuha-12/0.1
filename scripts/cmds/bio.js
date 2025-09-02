const OWNER_ID = '61557991443492'; // replace with your actual owner ID

module.exports = {
  config: {
    name: "bio",
    version: "1.7",
    author: "xemon",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: " ",
      en: "change bot bio",
    },
    longDescription: {
      vi: " ",
      en: "change bot bio",
    },
    category: "owner",
    guide: {
      en: "{pn} (text)",
    },
  },

  onStart: async function ({ args, message, api, event }) {
    if (event.senderID !== OWNER_ID) {
      return api.sendMessage("❌ Only the owner can use this command.", event.threadID, event.messageID);
    }

    const newBio = args.join(" ");
    api.changeBio(newBio);
    message.reply("✅ Bot bio changed to: " + newBio);
  },
};
