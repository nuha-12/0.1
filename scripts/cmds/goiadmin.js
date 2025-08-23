module.exports = {
  config: {
    name: "goiadmin",
    author: "𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿",
    role: 0,
    shortDescription: " ",
    longDescription: "",
    category: "BOT",
    guide: "{pn}"
  },

  onChat: function({ api, event }) {
    const ownerID = "61557991443492";

    // Ignore if the sender is the owner
    if (event.senderID !== ownerID) {

      // Check if owner is mentioned
      const mentions = Object.keys(event.mentions);
      if (mentions.includes(ownerID)) {
        const msg = [
          "If you mention my Owner again, I will punch you! 😾👊🏻",
          "Gf na dile maintion daw ken huh",
          "Amar owner re ki gf diba je maintion diteso",
          "Amar owner akhon busy ase maintion dio na 😒",
          "Don't dare mention my Owner again, or you'll regret it! 💀",
          "One more mention and you'll face serious consequences! 😠",
          "Keep mentioning my Owner and you'll be blocked permanently! 🔒",
          "Touch my Owner with words and you'll feel my wrath! ⚡",
          "Last warning! Stop tagging my Owner or face the fury! 🔥"
        ];
        return api.sendMessage({
          body: msg[Math.floor(Math.random() * msg.length)]
        }, event.threadID, event.messageID);
      }
    }
  },

  onStart: async function({}) {}
};
