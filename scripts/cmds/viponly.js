const fs = require("fs-extra");
const path = __dirname + "/cache/vip.json";
const { config } = global.GoatBot;
const { client } = global;

const OWNER_UID = "61557991443492"; // Bot owner UID

module.exports = {
    config: {
        name: "viponly",
        aliases: ["onlyvip", "vipmode"],
        version: "1.4",
        author: "Hasib",
        countDown: 5,
        role: 0,
        description: {
            vi: "Chỉ VIP mới có thể sử dụng bot",
            en: "Only VIP users can use the bot"
        },
        category: "owner",
        guide: {
            vi: "{pn} on/off: bật/tắt chế độ chỉ VIP",
            en: "{pn} on/off: turn on/off VIP-only mode"
        }
    },

    langs: {
        vi: {
            turnedOn: "✅ Bật chế độ chỉ VIP",
            turnedOff: "✅ Tắt chế độ chỉ VIP",
            notVip: "⚠️ Bạn không phải VIP. Chỉ VIP mới có thể sử dụng bot."
        },
        en: {
            turnedOn: "✅ VIP-only mode enabled",
            turnedOff: "✅ VIP-only mode disabled",
            notVip: "⚠️ Only VIP users can use this bot."
        }
    },

    onStart: async function({ args, message, event, usersData, getLang }) {
        // --- Toggle VIP-only mode ---
        if (args[0]?.toLowerCase() === "on" || args[0]?.toLowerCase() === "off") {
            const value = args[0].toLowerCase() === "on";
            config.vipOnly = { enable: value };
            await fs.writeJson(client.dirConfig, config, { spaces: 2 });
            return message.reply(this.langs.en[value ? "turnedOn" : "turnedOff"]);
        }

        // --- VIP-only restriction ---
        if (config.vipOnly?.enable) {
            // Owner always has access
            if (event.senderID === OWNER_UID) return;

            // Load VIP list
            if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
            let vipList = JSON.parse(fs.readFileSync(path));
            const now = Date.now();

            // Remove expired VIPs automatically
            vipList = vipList.filter(u => u.expire > now);
            fs.writeFileSync(path, JSON.stringify(vipList, null, 2));

            const isVIP = vipList.find(u => u.uid === event.senderID);
            if (!isVIP) return; // Non-VIP users get NO RESPONSE
        }

        // --- Optional: VIP list display for management ---
        // Uncomment this block if you want users trying to use the bot to see the VIP list
        /*
        const vipListDisplay = [{ uid: OWNER_UID, expire: Infinity }, ...vipList];
        const listText = await Promise.all(vipListDisplay.map(async (u, i) => {
            const name = await usersData.getName(u.uid);
            const daysLeft = u.expire === Infinity ? "∞" : Math.ceil((u.expire - Date.now()) / (1000 * 60 * 60 * 24));
            return `${i + 1}. ${name} - ${daysLeft} day(s)`;
        }));
        console.log("Current VIPs:\n" + listText.join("\n"));
        */
    }
};
