const OWNER_ID = "61557991443492"; // Replace with your UID

module.exports = {
    config: {
        name: "offbot",
        version: "1.5",
        author: "Samir",
        role: 2,
        shortDescription: "Turn off bot for 1 hour or turn back on",
        longDescription: "Disables bot commands for 1 hour. Owner can use 'bot on' to bring it back immediately.",
        category: "owner",
        guide: "{p}{n} on - Turn bot back on immediately"
    },

    onStart: async function({ event, api, args, global }) {
        // Initialize global flags if not exist
        if (!global.botDisabled) global.botDisabled = false;
        if (!global.botTimeout) global.botTimeout = null;

        // Only owner can use this command
        if (event.senderID !== OWNER_ID) {
            if (global.botDisabled) {
                return api.sendMessage("❌ Bot is currently offline. Only owner can use commands.", event.threadID);
            } else return; // Allow normal command execution for non-owner
        }

        // Explicit "bot on" command
        if (args[0] && args[0].toLowerCase() === "on") {
            if (!global.botDisabled) {
                return api.sendMessage("✅ Bot is already online!", event.threadID);
            }
            clearTimeout(global.botTimeout); // Cancel offline timer
            global.botDisabled = false;
            return api.sendMessage("🔔 Owner used 'bot on': Bot is now back online immediately!", event.threadID);
        }

        // Toggle offbot
        if (global.botDisabled) {
            clearTimeout(global.botTimeout); // Cancel remaining offline time
            global.botDisabled = false;
            api.sendMessage("🔔 Owner used the bot: Bot is now back online!", event.threadID);
        } else {
            // Turn off bot for 1 hour
            global.botDisabled = true;
            api.sendMessage("📴 Bot is now OFF for 1 hour ✅", event.threadID);

            global.botTimeout = setTimeout(() => {
                global.botDisabled = false;
                api.sendMessage("🔔 Bot is now back online automatically!", event.threadID);
            }, 3600000); // 1 hour
        }
    }
};
