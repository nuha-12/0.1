const axios = require("axios");

module.exports.config = {
  name: "flux",
  version: "1.0",
  credits: "Rasin",
  hasPermission: 0,
  description: "Gen image using flux",
  commandCategory: "flux",
  cooldowns: 8,
};

module.exports.run = async function ({ api, event, args, message }) {
  const rasinAPI = "https://rasin-x-apis.onrender.com/api/rasin/flux";

  try {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt!", event.threadID, event.messageID);

    const startTime = Date.now();
    const waitMsg = await api.sendMessage("𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞...", event.threadID);

    api.setMessageReaction("⌛", event.messageID, () => {}, true);

    const apiurl = `${rasinAPI}?prompt=${encodeURIComponent(prompt)}&apikey=rs_pkb9hpp2-0wu2-ziyk-dven-wg`;
    const response = await axios.get(apiurl, { responseType: "stream" });

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    await api.unsendMessage(waitMsg.messageID);

    return api.sendMessage(
      {
        body: `✅ 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐢𝐦𝐚𝐠𝐞`,
        attachment: response.data,
      },
      event.threadID,
      event.messageID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage(`Error: ${e.message || "Failed to generate image. Try again later."}`, event.threadID, event.messageID);
  }
};
