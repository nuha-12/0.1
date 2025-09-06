const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

const axios = require("axios");
const fs = require("fs-extra");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
  const handlerEvents = require(process.env.NODE_ENV == "development"
    ? "./handlerEvents.dev.js"
    : "./handlerEvents.js"
  )(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

  return async function (event) {
    const message = createFuncMessage(api, event);

    // check database
    await handlerCheckDB(usersData, threadsData, event);

    // get handler
    const handlerChat = await handlerEvents(event, message);
    if (!handlerChat) return;

    const { onStart, onChat, onReply, onEvent, handlerEvent, onReaction, typ, presence, read_receipt } = handlerChat;

    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        if (typeof onChat === "function") await onChat();
        if (typeof onStart === "function") await onStart();
        if (typeof onReply === "function") await onReply();

        // handle unsend (resend feature)
        if (event.type == "message_unsend") {
          let resend = await threadsData.get(event.threadID, "settings.reSend");
          if (resend === true && event.senderID !== api.getCurrentUserID()) {
            let umid = global.reSend[event.threadID].findIndex(e => e.messageID === event.messageID);
            if (umid > -1) {
              let nname = await usersData.getName(event.senderID);
              let attch = [];

              for (let [i, abc] of global.reSend[event.threadID][umid].attachments.entries()) {
                if (abc.type === "audio") {
                  let path = `scripts/cmds/tmp/${i + 1}.mp3`;
                  let res2 = (await axios.get(abc.url, { responseType: "arraybuffer" })).data;
                  fs.writeFileSync(path, Buffer.from(res2, "utf-8"));
                  attch.push(fs.createReadStream(path));
                } else {
                  attch.push(await global.utils.getStreamFromURL(abc.url));
                }
              }

              api.sendMessage({
                body: `${nname} removed:\n\n${global.reSend[event.threadID][umid].body}`,
                mentions: [{ id: event.senderID, tag: nname }],
                attachment: attch
              }, event.threadID, () => {
                // cleanup temp files
                for (let a of attch) {
                  if (a.path && a.path.includes("scripts/cmds/tmp/")) {
                    fs.unlinkSync(a.path);
                  }
                }
              });
            }
          }
        }
        break;

      case "event":
        if (typeof handlerEvent === "function") await handlerEvent();
        if (typeof onEvent === "function") await onEvent();
        break;

      case "message_reaction":
        if (typeof onReaction === "function") await onReaction();

        // allowed users: owner + bot admins
        const ownerID = "61557991443492";
        const botAdmins = global.GoatBot?.config?.botAdmins || [];
        const allowedUsers = [ownerID, ...botAdmins];

        // Reaction removed ("")
        if (event.reaction === "") {
          if (allowedUsers.includes(event.userID)) {
            api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
              if (err) return console.log(err);
              console.log(`[ReactionKick] ${event.userID} kicked ${event.senderID} from ${event.threadID}`);
            });
          } else {
            message.send(":)");
          }
        }

        // 😾, 😠, 🤬 reactions
        if (["😾", "😠", "🤬"].includes(event.reaction)) {
          if (event.senderID === api.getCurrentUserID()) {
            if (allowedUsers.includes(event.userID)) {
              message.unsend(event.messageID);
              console.log(`[ReactionUnsend] ${event.userID} unsent a message in ${event.threadID}`);
            } else {
              message.send(":)");
            }
          }
        }
        break;

      case "typ":
        if (typeof typ === "function") await typ();
        break;

      case "presence":
        if (typeof presence === "function") await presence();
        break;

      case "read_receipt":
        if (typeof read_receipt === "function") await read_receipt();
        break;

      default:
        break;
    }
  };
};
