const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "help",
    aliases: ["menu"],
    version: "3.0",
    author: "Hasib",
    usePrefix: false,
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Advanced help system for all bot commands"
    },
    longDescription: {
      en: "Displays a full categorized menu of commands with pages, search, and details. Also shows VIP-only commands if user is VIP."
    },
    category: "info",
    guide: {
      en: "help [command/category/page]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const { commands, aliases } = global.GoatBot;
    const totalCommands = commands.size;

    // Check VIP (you can replace with your own VIP system)
    const VIP_USERS = ["61557991443492", "100080875636629"];
    const isVIP = VIP_USERS.includes(senderID);

    // Group commands
    const categories = {};
    for (const [name, cmd] of commands) {
      const category = cmd.config.category || "other";
      if (!categories[category]) categories[category] = [];
      // VIP check: hide vip-only commands if not VIP
      if (cmd.config.role === 2 && !isVIP) continue;
      categories[category].push(name);
    }

    // --- If no args: show menu with categories ---
    if (args.length === 0) {
      let response = `✨ 𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐁𝐨𝐭 𝐌𝐞𝐧𝐮 ✨\n\n`;

      // Emojis for categories
      const emojiCategory = {
        info: "📘",
        fun: "🎮",
        admin: "🛠️",
        utility: "⚡",
        music: "🎵",
        image: "🖼️",
        other: "📂"
      };

      // Sort categories alphabetically
      const sortedCategories = Object.keys(categories).sort();

      for (const category of sortedCategories) {
        const cmds = categories[category].sort();
        response += `\n╭──『 ${emojiCategory[category] || "📂"} ${category.toUpperCase()} 』\n`;
        response += cmds.map((c) => `│ • ${c}`).join("\n") + "\n";
        response += `╰─────────────⭓\n`;
      }

      response += `\n╭───────────────➣\n` +
                  `│ 🔹 Total Commands: ${totalCommands}\n` +
                  `│ 💡 Usage: help (command)\n` +
                  `│ 🔎 Search: help (category)\n` +
                  `│ 👑 Creator: ${this.config.author}\n` +
                  (isVIP ? "│ 🌟 Status: VIP User\n" : "│ ⚡ Status: Normal User\n") +
                  `╰───────────────➣`;

      return api.sendMessage(response, threadID, messageID);
    }

    // --- If searching by category ---
    const arg = args[0].toLowerCase();
    if (categories[arg]) {
      const cmds = categories[arg].sort();
      let response = `📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${arg.toUpperCase()}\n\n`;
      response += cmds.map((c) => `• ${c}`).join("\n");
      return api.sendMessage(response, threadID, messageID);
    }

    // --- If searching for a specific command ---
    const command = commands.get(arg) || commands.get(aliases.get(arg));
    if (command) {
      const config = command.config;
      const guide = config.guide?.en || "No usage guide available.";
      const description = config.longDescription?.en || "No description available.";

      const response =
        `✿──────────────────✿ \n\n` +
        `🔍 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 🔎\n\n` +
        `🌟 | Name: ${config.name}\n` +
        `🔀 | Aliases: ${config.aliases?.join(", ") || "None"}\n` +
        `📜 | Description: ${description}\n` +
        `🛠️ | Usage: ${guide}\n` +
        `🗂️ | Category: ${config.category || "other"}\n` +
        `📌 | Version: ${config.version || "1.0"}\n` +
        `✍️ | Author: ${config.author || "Unknown"}\n` +
        `⏳ | Cooldown: ${config.countDown || 0}s\n` +
        `🔑 | Role: ${config.role || 0}\n\n` +
        `✿──────────────────✿`;

      return api.sendMessage(response, threadID, messageID);
    }

    // --- If nothing found ---
    return api.sendMessage(`❌ No command or category found for "${arg}".`, threadID, messageID);
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
