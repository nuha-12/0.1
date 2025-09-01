const num = 3; // Number of spam hits before banning
const timee = 10; // Time window in seconds
const unbanHours = 10; // Auto-unban after 10 hours
const OWNER_ID = "61557991443492"; // Owner ID

module.exports.config = {
    name: "antispam",
    version: "1.0.0",
    permission: 0,
    credits: "nayan",
    description: "Automatically ban spammers and auto-unban after 10 hours",
    prefix: true,
    category: "system",
    usages: "none",
    cooldowns: 0
};

module.exports.languages = {
    "vi": {},
    "en": {}
};

module.exports.run = async function({ api, event, args, Users }) {
    const prefix = global.config.PREFIX;
    const threadID = event.threadID;
    const senderID = event.senderID;

    if (!args[0]) {
        return api.sendMessage(
            `Anti-spam module active.\nSpam ${num} times in ${timee}s => auto-ban.\nAuto-unban after ${unbanHours} hours.\n\nCommands:\n${prefix}unban <userID> - Admin/Owner can unban manually.`,
            threadID
        );
    }

    // Manual unban command
    if (args[0] === "unban") {
        if (senderID != OWNER_ID && !global.config.ADMINBOT.includes(senderID)) {
            return api.sendMessage("You don't have permission to unban users.", threadID);
        }
        const targetID = args[1];
        if (!targetID) return api.sendMessage("Please provide a user ID to unban.", threadID);
        const dataUser = await Users.getData(targetID);
        if (!dataUser.data.banned) return api.sendMessage("This user is not banned.", threadID);
        dataUser.data.banned = false;
        await Users.setData(targetID, { data: dataUser.data });
        global.data.userBanned.delete(targetID);
        return api.sendMessage(`User ${dataUser.name} (${targetID}) has been manually unbanned.`, threadID);
    }
};

module.exports.handleEvent = async function({ Users, Threads, api, event }) {
    const { senderID, threadID } = event;
    const datathread = (await Threads.getData(threadID)).threadInfo;

    // Skip owner
    if (senderID == OWNER_ID) return;

    if (!global.client.autoban) global.client.autoban = {};

    if (!global.client.autoban[senderID]) {
        global.client.autoban[senderID] = {
            timeStart: Date.now(),
            number: 0
        };
    }

    const threadSetting = global.data.threadData.get(threadID) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;

    // Only count messages starting with prefix as spam
    if (!event.body || event.body.indexOf(prefix) != 0) return;

    // Reset counter if time window passed
    if ((global.client.autoban[senderID].timeStart + (timee * 1000)) <= Date.now()) {
        global.client.autoban[senderID] = {
            timeStart: Date.now(),
            number: 0
        };
    } else {
        global.client.autoban[senderID].number++;

        // Ban if number exceeds limit
        if (global.client.autoban[senderID].number >= num) {
            const moment = require("moment-timezone");
            const timeDate = moment.tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");
            const dataUser = await Users.getData(senderID) || {};
            const data = dataUser.data || {};

            if (data.banned) return;

            data.banned = true;
            data.reason = `spam bot ${num} times/${timee}s`;
            data.dateAdded = timeDate;
            await Users.setData(senderID, { data });
            global.data.userBanned.set(senderID, { reason: data.reason, dateAdded: data.dateAdded });

            // Auto-unban after 10 hours
            setTimeout(async () => {
                const dataUserUnban = await Users.getData(senderID);
                if (dataUserUnban.data.banned) {
                    dataUserUnban.data.banned = false;
                    await Users.setData(senderID, { data: dataUserUnban.data });
                    global.data.userBanned.delete(senderID);
                    api.sendMessage(`User ${dataUserUnban.name} has been automatically unbanned.`, threadID);
                }
            }, unbanHours * 3600000); // 10 hours

            global.client.autoban[senderID] = {
                timeStart: Date.now(),
                number: 0
            };

            // Notify the thread
            api.sendMessage(`${dataUser.name} (${senderID}) has been banned for spamming ${num} times within ${timee}s.\nWill be unbanned after ${unbanHours} hours.`, threadID);

            // Notify admins
            for (let adminID of global.config.ADMINBOT) {
                api.sendMessage(`Spam ban notification\n\nOffender: ${dataUser.name}\nUser ID: ${senderID}\nGroup: ${datathread.threadName}\nGroup ID: ${threadID}\nTime: ${timeDate}`, adminID);
            }
        }
    }
};
