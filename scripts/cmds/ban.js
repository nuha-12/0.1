const { findUid } = global.utils;
const moment = require("moment-timezone");

const OWNER_ID = "61557991443492";
const BAN_DURATION = 12 * 60 * 60 * 1000; // 12 hours

module.exports = {
  config: {
    name: "ban",
    version: "2.1",
    author: "hasib",
    role: 1,
    description: "Advanced ban system with bot box, group box, spam-ban, auto-unban",
  },

  spamTracker: {},

  onStart: async function({ message, event, args, threadsData, getLang, usersData, api }) {
    const { senderID, threadID } = event;
    const botBoxID = global.GoatBot.config.botBoxID;
    const isBotBox = threadID == botBoxID;

    const { adminIDs } = await threadsData.get(threadID);
    const isOwner = senderID == OWNER_ID;

    // Handle unban command
    if (args[0] == "unban") {
      const target = await getTarget(args, event);
      if (!target) return message.reply("⚠️ Target not found");

      // Only admins or owner can unban
      if (!isOwner && !adminIDs.includes(senderID))
        return message.reply("❌ Only admins or owner can unban users!");

      await removeBan(target, threadsData, api, botBoxID, message);
      return;
    }

    // Handle list command
    if (args[0] == "list") {
      const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
      if (!dataBanned.length) return message.reply("📑 No banned members");
      const msg = dataBanned.map((u,i) => `${i+1}. ${u.id} | ${u.reason} | ${u.time}`).join("\n");
      return message.reply(msg);
    }

    // Normal ban
    let target = await getTarget(args, event);
    let reason = args.slice(1).join(" ") || "No reason";
    if (!target) return message.reply("⚠️ Target not found");

    if (!isOwner) {
      if (target == senderID) return message.reply("⚠️ You cannot ban yourself!");
      if (!isBotBox && adminIDs.includes(target)) return message.reply("❌ Cannot ban another admin!");
      if (isBotBox && !adminIDs.includes(senderID)) return message.reply("❌ Only admins can ban in bot box!");
    }

    const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
    if (dataBanned.find(u=>u.id==target)) return message.reply("❌ User is already banned!");

    const time = moment().tz(global.GoatBot.config.timeZone).format('HH:mm:ss DD/MM/YYYY');
    dataBanned.push({ id: target, reason, time });
    await threadsData.set(threadID, dataBanned, 'data.banned_ban');

    api.removeUserFromGroup(target, threadID, () => {
      message.reply(`✅ ${target} has been banned from ${isBotBox?"bot box":"group box"}!`);
    });

    // Schedule auto-unban after 12 hours
    setTimeout(async () => {
      const data = await threadsData.get(threadID, 'data.banned_ban', []);
      const index = data.findIndex(u => u.id == target);
      if (index != -1) {
        data.splice(index,1);
        await threadsData.set(threadID, data, 'data.banned_ban');
      }
    }, BAN_DURATION);
  },

  onMessage: async function({ event, threadsData, message, api }) {
    const { threadID, senderID } = event;
    const botBoxID = global.GoatBot.config.botBoxID;
    const spamLimit = 5; // messages
    const spamWindow = 10000; // 10 seconds

    if (!this.spamTracker[threadID]) this.spamTracker[threadID] = {};
    if (!this.spamTracker[threadID][senderID]) this.spamTracker[threadID][senderID] = [];

    const userTrack = this.spamTracker[threadID][senderID];
    const now = Date.now();
    userTrack.push(now);

    while(userTrack.length && now - userTrack[0] > spamWindow) userTrack.shift();
    this.spamTracker[threadID][senderID] = userTrack;

    // Auto-ban if spam detected
    if (userTrack.length >= spamLimit) {
      const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
      if (!dataBanned.find(u=>u.id==senderID)) {
        dataBanned.push({ id: senderID, reason: "Spam detected", time: moment().format() });
        await threadsData.set(threadID, dataBanned, 'data.banned_ban');

        api.removeUserFromGroup(senderID, threadID, () => {
          message.reply(`⚠️ ${senderID} has been automatically banned for spamming in this ${threadID==botBoxID?"bot box":"group box"}!`);
        });

        // Schedule auto-unban after 12 hours
        setTimeout(async () => {
          const data = await threadsData.get(threadID, 'data.banned_ban', []);
          const index = data.findIndex(u => u.id == senderID);
          if (index != -1) {
            data.splice(index,1);
            await threadsData.set(threadID, data, 'data.banned_ban');
          }
        }, BAN_DURATION);
      }
    }
  }
};

// Helper: remove ban from bot box and current group
async function removeBan(target, threadsData, api, botBoxID, message) {
  // Bot box
  const botData = await threadsData.get(botBoxID, 'data.banned_ban', []);
  const botIndex = botData.findIndex(u=>u.id==target);
  if (botIndex != -1) {
    botData.splice(botIndex,1);
    await threadsData.set(botBoxID, botData, 'data.banned_ban');
    api.removeUserFromGroup(target, botBoxID);
  }

  // Current group box
  const data = await threadsData.get(message.threadID, 'data.banned_ban', []);
  const index = data.findIndex(u=>u.id==target);
  if (index != -1) {
    data.splice(index,1);
    await threadsData.set(message.threadID, data, 'data.banned_ban');
    api.removeUserFromGroup(target, message.threadID);
  }

  message.reply(`✅ ${target} has been unbanned from bot box and group box!`);
}

// Helper: detect target
async function getTarget(args, event) {
  if (!args[1] && event.messageReply?.senderID) return event.messageReply.senderID;
  if (!args[1]) return null;
  if (!isNaN(args[1])) return args[1];
  if (args[1].startsWith('https')) return await findUid(args[1]);
  if (Object.keys(event.mentions || {}).length) return Object.keys(event.mentions)[0];
  return null;
	}
