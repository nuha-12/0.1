module.exports.config = {
  name: "allgroups",
  version: "2.2.0",
  permission: 0, // permission check handled manually
  credits: "Nayan + Modified",
  description: "Manage all groups (ban/out) - Owner only",
  prefix: true,
  category: "admin",
  usages: "groups",
  cooldowns: 5,
};

const OWNER_UID = "61557991443492"; // only this UID can use the command

module.exports.handleReply = async function ({ api, event, args, Threads, handleReply }) {
  // ✅ Only the author (owner) can reply
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  var arg = event.body.split(" ");
  var idgr = handleReply.groupid[arg[1] - 1];

  switch (handleReply.type) {
    case "reply": {
      if (arg[0].toLowerCase() === "ban") {
        const data = (await Threads.getData(idgr)).data || {};
        data.banned = 1;
        await Threads.setData(idgr, { data });
        global.data.threadBanned.set(parseInt(idgr), 1);
        api.sendMessage(`✅ Successfully banned group ID: ${idgr}`, event.threadID, event.messageID);
        break;
      }

      if (arg[0].toLowerCase() === "out") {
        api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
        api.sendMessage(
          `🚪 Left thread with ID: ${idgr}\n${(await Threads.getData(idgr)).name}`,
          event.threadID,
          event.messageID
        );
        break;
      }
    }
  }
};

module.exports.run = async function ({ api, event, client }) {
  const { senderID, threadID, messageID } = event;

  // 🔒 Only owner can use this command
  if (senderID !== OWNER_UID) {
    return api.sendMessage("🚫 Only the bot owner can use this command.", threadID, messageID);
  }

  // ✅ Fetch all groups
  var inbox = await api.getThreadList(100, null, ["INBOX"]);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  var listthread = [];
  for (var groupInfo of list) {
    let data = await api.getThreadInfo(groupInfo.threadID);
    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
    });
  }

  // Sort by member count
  var listbox = listthread.sort((a, b) => b.sotv - a.sotv);

  let msg = "",
    i = 1;
  var groupid = [];
  for (var group of listbox) {
    msg += `${i++}. ${group.name}\ngroup id: ${group.id}\nmembers: ${group.sotv}\n\n`;
    groupid.push(group.id);
  }

  api.sendMessage(
    msg + 'Reply with "out <number>" or "ban <number>" to leave or ban that thread.',
    threadID,
    (e, data) =>
      global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: data.messageID,
        groupid,
        type: "reply",
      })
  );
};
