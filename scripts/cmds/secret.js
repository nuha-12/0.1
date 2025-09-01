module.exports.config = {
    name: "secret",
    version: "1.0.0",
    permission: 3, // Owner only
    credits: "YourName",
    description: "List all hidden commands (Owner only)",
    prefix: true,
    category: "owner",
    usages: "secret",
    cooldowns: 5
};

const OWNER_ID = '61557991443492'; // Replace with your actual UID

module.exports.run = async ({ api, event }) => {
    const { senderID, threadID, messageID } = event;

    if (senderID !== OWNER_ID) return; // silently ignore if not owner

    const commands = global.client.commands;
    let hiddenCommands = [];

    commands.forEach(cmd => {
        // Hidden if permission is 2 or higher
        if (cmd.config.permission && cmd.config.permission >= 2) {
            hiddenCommands.push(cmd.config.name);
        }
    });

    if (!hiddenCommands.length) {
        return api.sendMessage("No hidden commands found.", threadID, messageID);
    }

    const list = hiddenCommands.join("\n");
    return api.sendMessage(`📜 Hidden Commands (Owner only):\n${list}`, threadID, messageID);
};
