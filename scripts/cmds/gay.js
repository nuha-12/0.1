const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61557991443492"; // Owner's UID

module.exports = {
    config: {
        name: "gay",
        version: "1.1",
        author: "@tas33n",
        countDown: 1,
        role: 0,
        shortDescription: "Find gay",
        longDescription: "",
        category: "box chat",
        guide: "{pn} {{[on | off]}}",
        envConfig: {
            deltaNext: 5
        }
    },

    langs: {
        vi: {
            noTag: "Bạn phải tag người bạn muốn tát",
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

            // Prevent targeting the owner
            if (uid === OWNER_UID) {
                return message.reply(getLang("blocked"));
            }

            // Get the user's avatar URL
            let avatarUrl = await usersData.getAvatarUrl(uid);

            // Generate the "gay" image
            const gayImageBuffer = await new DIG.Gay().getImage(avatarUrl);

            // Ensure tmp folder exists
            const tmpDir = path.join(__dirname, "tmp");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

            const pathSave = path.join(tmpDir, "gay.png");
            fs.writeFileSync(pathSave, Buffer.from(gayImageBuffer));

            // Prepare message body
            let body = "Look... I found a gay";
            if (!Object.keys(event.mentions).length && event.type !== "message_reply") {
                body = "Baka, you are gay 😜\nForgot to reply or mention someone";
            }

            // Send the message
            message.reply(
                {
                    body,
                    attachment: fs.createReadStream(pathSave)
                },
                () => fs.unlinkSync(pathSave) // Delete the temporary file after sending
            );
        } catch (err) {
            console.error(err);
            message.reply("Something went wrong while generating the image.");
        }
    }
};
