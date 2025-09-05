const { isVip } = require("./vip"); // ✅ Import VIP system

const OWNER_UID = "61557991443492"; // 👑 Owner UID

function canUseCommand(uid) {
  if (uid === OWNER_UID) return true;
  return isVip(uid);
}

module.exports = {
  config: {
    name: "gc",
    author: "Hasib",
    category: "fakechat",
    version: "2.6",
    countDown: 5,
    role: 0,
    guide: {
      en: `<text> ++ <text> | reply | --user <uid> | --theme <theme number> | --attachment <image url> | --time <true or false> | blank
THEMES:
0. lo-fi
1. bubble tea
2. swimming
3. lucky pink
4. default
5. monochrome
Adding more themes soon`
    }
  },

  onStart: async function({ message, usersData, event, args, api }) {
    // 🔒 VIP + Owner check
    if (!canUseCommand(event.senderID)) {
      const userName = await usersData.getName(event.senderID);
      return message.reply(`❌ Sorry ${userName}, you are not allowed to use this command because you are not a VIP!`);
    }

    let prompt = args.join(" ").split("\n").join("++");
    if (!prompt) return message.reply("❌ | provide a text");

    let id = event.senderID;

    // Handle --user parameter or reply sender
    if (event.messageReply) {
      if (prompt.match(/--user/)) {
        const userPart = prompt.split("--user ")[1].split(" ")[0];
        if (userPart.includes(".com")) id = await api.getUID(userPart);
        else id = userPart;
      } else {
        id = event.messageReply.senderID;
      }
    } else if (prompt.match(/--user/)) {
      const userPart = prompt.split("--user ")[1].split(" ")[0];
      if (userPart.includes(".com")) id = await api.getUID(userPart);
      else id = userPart;
    }

    // Default themeID = 4 (default)
    let themeID = 4;
    if (prompt.match(/--theme/)) themeID = (prompt.split("--theme ")[1]).split(" ")[0];

    // Special user check (original logic)
    if (event?.messageReply?.senderID === "100063840894133" || event?.messageReply?.senderID === "100083343477138") {
      if (event.senderID !== "100063840894133" && event.senderID !== "100083343477138") {
        prompt = "hi guys I'm gay";
        id = event.senderID;
      }
    }

    const name = (await usersData.getName(id)).split(" ")[0];
    const avatarUrl = await usersData.getAvatarUrl(id);

    let replyImage;
    if (event?.messageReply?.attachments[0]) replyImage = event.messageReply.attachments[0].url;
    else if (prompt.match(/--attachment/)) replyImage = (prompt.split("--attachment ")[1]).split(" ")[0];

    let time = prompt.split("--time ")[1];
    time = (time === "true" || !time) ? "true" : "";

    // Clean prompt text
    prompt = prompt.split("--")[0].trim();

    message.reaction("⏳", event.messageID);

    try {
      let url = `https://tawsifz-fakechat.onrender.com/image?theme=${themeID}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}&text=${encodeURIComponent(prompt)}&time=${time}`;
      if (replyImage) url += `&replyImageUrl=${encodeURIComponent(replyImage)}`;

      message.reply({ attachment: await global.utils.getStreamFromURL(url, 'gc.png') });
      message.reaction("✅", event.messageID);
    } catch (error) {
      message.send("❌ | " + error.message);
    }
  }
};
