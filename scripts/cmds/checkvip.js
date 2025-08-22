const fs = require("fs-extra");
const path = __dirname + "/cache/vip.json";

const OWNER_UID = "61557991443492"; // Bot owner UID

module.exports = {
    config: {
        name: "checkvip",
        aliases: ["vipcheck", "isvip"],
        version: "1.1",
        author: "Hasib",
        countDown: 5,
        role: 0,
        description: {
            vi: "Kiểm tra xem người dùng có phải VIP không",
            en: "Check if a user is VIP"
        },
        category: "owner",
        guide: {
            vi: "{pn} [@tag/reply/uid]: kiểm tra VIP",
            en: "{pn} [@tag/reply/uid]: check if VIP"
        }
    },

    langs: {
        vi: {
            vip: "✅ Người dùng %1 là VIP còn %2 ngày.",
            notVip: "❌ Người dùng %1 không phải VIP hoặc đã hết hạn."
        },
        en: {
            vip: "✅ User %1 is VIP with %2 day(s) remaining.",
            notVip: "❌ User %1 is not VIP or VIP has expired."
        }
    },

    onStart: async function({ args, message, event, usersData, getLang }) {
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
        let vipList = JSON.parse(fs.readFileSync(path));
        const now = Date.now();

        // Get target UID
        const uid = event.messageReply?.senderID || event.mentions?.[Object.keys(event.mentions || {})[0]] || args[0];
        if (!uid) return message.SyntaxError();

        // Remove expired VIPs
        vipList = vipList.filter(u => u.expire > now);
        fs.writeFileSync(path, JSON.stringify(vipList, null, 2));

        const name = await usersData.getName(uid);

        // Owner is always VIP
        if (uid === OWNER_UID) return message.reply(getLang("vip", name, "∞"));

        const vip = vipList.find(u => u.uid === uid);
        if (vip) {
            const daysLeft = Math.ceil((vip.expire - now) / (1000 * 60 * 60 * 24));
            return message.reply(getLang("vip", name, daysLeft));
        } else {
            return message.reply(getLang("notVip", name));
        }
    }
};
