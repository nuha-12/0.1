const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61557991443492"; // Owner UID

module.exports = {
    config: {
        name: "lesbu",
        version: "1.0",
        author: "@tas33n",
        countDown: 1,
        role: 0,
        shortDescription: "Find lesbu",
        longDescription: "",
        category: "box chat",
        guide: "{pn} {{[on | off]}}",
        envConfig: {
            deltaNext: 5
        }
    },

    langs: {
        vi: {
            noTag: "Bạn phải tag người bạn muốn sử dụng",
            blocked: "Bạn không thể dùng lệnh này với chủ sở hữu!"
        },
        en: {
            noTag: "You must tag the person you want to",
            blocked: "You cannot use this command on the owner!"
        }
    },

    onStart: async function ({ event, message, usersData, args, getLang }) {
        try {
            let uid;

            if (event.type === "message_reply") {
                uid = event.messageReply.senderID;
            } else {
                const mention = Object.keys(event.mentions);
                uid = mention[0] || event.senderID;
            }

            // Block the owner
            if (uid === OWNER_UID) {
                return message.reply(getLang("blocked"));
            }

            // Get avatar
            let avatarUrl = await usersData.getAvatarUrl(uid);

            // Generate the lesbu image
            const lesbuImageBuffer = await new DIG.Lesbian().getImage(avatarUrl);

            // Ensure tmp folder exists
            const tmpDir = path.join(__dirname, "tmp");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

            const pathSave = path.join(tmpDir, "lesbu.png");
            fs.writeFileSync(pathSave, Buffer.from(lesbuImageBuffer));

            // Message body
            let body = "Look... I found a lesbu 😏";
            if (!Object.keys(event.mentions).length && event.type !== "message_reply") {
                body = "Baka, you are lesbu 😜\nForgot to reply or mention someone";
            }

            // Send the message
            message.reply(
                {
                    body,
                    attachment: fs.createReadStream(pathSave)
                },
                () => fs.unlinkSync(pathSave)
            );
        } catch (err) {
            console.error(err);
            message.reply("Something went wrong while generating the image.");
        }
    }
};
