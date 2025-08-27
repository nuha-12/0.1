module.exports.config = {
    name: "spamkick",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Hasib",
    description: "Automatically kick users who spam messages in the group",
    commandCategory: "group",
    usages: "[on/off]",
    cooldowns: 5
};

if (!global.antispam) global.antispam = new Map();

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID } = event;

    // Only work if anti-spam is enabled in this thread
    if (!global.antispam.has(threadID)) return;

    let threadData = global.antispam.get(threadID);
    if (!threadData.users) threadData.users = {};

    if (!threadData.users[senderID]) {
        threadData.users[senderID] = { count: 1, time: Date.now() };
    } else {
        let user = threadData.users[senderID];
        let now = Date.now();

        // If within 80 seconds
        if (now - user.time < 80000) {
            user.count++;
            if (user.count >= 14) {
                try {
                    await api.removeUserFromGroup(senderID, threadID);
                    api.sendMessage(`⚠️ User ${senderID} has been kicked for spamming.`, threadID);
                } catch (err) {
                    api.sendMessage(`❌ Could not kick user ${senderID}. Make sure I have admin rights.`, threadID);
                }
                // reset user
                threadData.users[senderID] = { count: 0, time: now };
            }
        } else {
            // Reset if more than 80s passed
            threadData.users[senderID] = { count: 1, time: now };
        }
    }

    global.antispam.set(threadID, threadData);
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;

    if (args[0] === "on") {
        global.antispam.set(threadID, { enabled: true, users: {} });
        return api.sendMessage("✅ SpamKick is now ON for this group.", threadID);
    } else if (args[0] === "off") {
        global.antispam.delete(threadID);
        return api.sendMessage("❌ SpamKick is now OFF for this group.", threadID);
    } else {
        return api.sendMessage("Usage: spamkick [on/off]", threadID);
    }
};
