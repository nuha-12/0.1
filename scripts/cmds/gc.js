const fs = require("fs");
const path = __dirname + "/cache/vip.json";
const https = require("https");

const OWNER_UID = "61557991443492"; // Hasib can always use

module.exports = {
  config: {
    name: "gc",
    author: "Hasib",
    category: "fakechat",
    version: "3.1",
    countDown: 5,
    role: 0,
    guide: {
      en: `<text> ++ <text> | reply | --user <uid/fblink> | --theme <theme number> | --attachment <image url> | --time <true/false>
THEMES:
0. lo-fi
1. bubble tea
2. swimming
3. lucky pink
4. default
5. monochrome`
    }
  },

  onStart: async function ({ message, usersData, event, args, api }) {
    // --- Load VIP data ---
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([], null, 2));
    let data = JSON.parse(fs.readFileSync(path));
    const now = Date.now();

    // --- Owner bypass ---
    if (event.senderID !== OWNER_UID) {
      // Remove expired VIPs
      data = data.filter(u => u.expire > now);
      fs.writeFileSync(path, JSON.stringify(data, null, 2));

      // Check if user is VIP
      const isVIP = data.some(u => u.uid === event.senderID);
      if (!isVIP) {
        return message.reply(
          "⚠️ | Sorry, you are not a VIP.\n\n💡 Ask the owner to add you as VIP if you want to use this command."
        );
      }
    }

    // --- Normal gc code ---
    let prompt = args.join(" ").replace(/\n/g, "++");
    if (!prompt) return message.reply("❌ | Provide a text!");

    let id = event.senderID;

    // Handle --user or reply
    if (event.messageReply) {
      if (prompt.includes("--user")) {
        const userPart = prompt.split("--user ")[1]?.split(" ")[0];
        if (userPart?.includes(".com")) {
          id = await api.getUID(userPart);
        } else {
          id = userPart;
        }
      } else {
        id = event.messageReply.senderID;
      }
    } else if (prompt.includes("--user")) {
      const userPart = prompt.split("--user ")[1]?.split(" ")[0];
      if (userPart?.includes(".com")) {
        id = await api.getUID(userPart);
      } else {
        id = userPart;
      }
    }

    // Theme param
    let themeID = 4;
    if (prompt.includes("--theme")) {
      themeID = prompt.split("--theme ")[1]?.split(" ")[0] || 4;
    }

    // Special troll check
    if (
      event?.messageReply?.senderID === "100063840894133" ||
      event?.messageReply?.senderID === "100083343477138"
    ) {
      if (
        event.senderID !== "100063840894133" &&
        event.senderID !== "100083343477138"
      ) {
        prompt = "hi guys I'm gay";
        id = event.senderID;
      }
    }

    // User info
    const name = (await usersData.getName(id)).split(" ")[0];
    const avatarUrl = await usersData.getAvatarUrl(id);

    // Attachment
    let replyImage;
    if (event?.messageReply?.attachments?.[0]) {
      replyImage = event.messageReply.attachments[0].url;
    } else if (prompt.includes("--attachment")) {
      replyImage = prompt.split("--attachment ")[1]?.split(" ")[0];
    }

    // Time flag
    let time = "true";
    if (prompt.includes("--time")) {
      const t = prompt.split("--time ")[1]?.split(" ")[0];
      if (t === "false") time = "";
    }

    // Clean text
    prompt = prompt.split("--")[0].trim();

    try {
      await message.reaction("⏳", event.messageID);
    } catch {}

    try {
      let url = `https://tawsifz-fakechat.onrender.com/image?theme=${themeID}&name=${encodeURIComponent(
        name
      )}&avatar=${encodeURIComponent(avatarUrl)}&text=${encodeURIComponent(
        prompt
      )}&time=${time}`;

      if (replyImage) {
        url += `&replyImageUrl=${encodeURIComponent(replyImage)}`;
      }

      const stream = await global.utils.getStreamFromURL(url, "gc.png");
      await message.reply({ attachment: stream });

      try {
        await message.reaction("✅", event.messageID);
      } catch {}
    } catch (error) {
      message.reply("❌ | " + error.message);
    }
  }
};
