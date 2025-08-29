const fs = require("fs");
const { join } = require("path");
const gTTS = require("gtts");
const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "say",
    aliases: [],
    version: "1.1",
    author: "Rasin69",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Say something in voice"
    },
    longDescription: {
      en: "Convert text to voice"
    },
    category: "tools",
    guide: {
      en: "{p}say <text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(" ");

    if (!text) {
      return api.sendMessage("🗣️ Type something", threadID, messageID);
    }

    try {
      const filePath = join(__dirname, "say.mp3");
      const isBangla = /[\u0980-\u09FF]/.test(text); // Bangla unicode checker
      const gtts = new gTTS(text, isBangla ? "bn" : "en");

      await new Promise((resolve, reject) => {
        gtts.save(filePath, err => {
          if (err) return reject(err);
          resolve();
        });
      });

      await api.sendMessage(
        {
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlink(filePath, () => {}),
        messageID
      );
    } catch (e) {
      console.error("❌ | Error", e);
      api.sendMessage("❌ | Could not generate voice.", threadID, messageID);
    }
  }
};


const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
