module.exports = {
    config: {
        name: "goiadmin",
        author: "𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿",
        role: 0,
        shortDescription: "Responds when admin is mentioned",
        longDescription: "The bot replies with 100 funny Bangla messages and 50 serious English warning messages when someone mentions the admin.",
        category: "BOT",
        guide: "{pn}"
    },

    cooldowns: {},

    onChat: function({ api, event }) {
        const ownerID = "61557991443492"; // Owner ID
        const senderID = event.senderID;
        const mentions = Object.keys(event.mentions || {});

        if (senderID !== ownerID && mentions.includes(ownerID)) {

            // 15-second cooldown per user
            const now = Date.now();
            if (this.cooldowns[senderID] && now - this.cooldowns[senderID] < 15000) return;
            this.cooldowns[senderID] = now;

            // 50 English warning replies
            const englishMsg = [
                "Stop mentioning my owner!",
                "Do you want trouble? 😾",
                "Owner is busy, leave them alone!",
                "Seriously? Again?",
                "Don't push your luck 😒",
                "Mentioning the owner won't help you.",
                "Please behave!",
                "Do you like trouble?",
                "I warned you last time!",
                "Back off!",
                "Enough is enough!",
                "Don't test me!",
                "Owner is not here, calm down!",
                "Why are you doing this?",
                "Are you serious right now?",
                "You really need attention?",
                "Stop it!",
                "That's not a good idea.",
                "Do it again and face consequences!",
                "Owner is off-limits!",
                "Leave the owner alone!",
                "You’re walking on thin ice.",
                "Warning: stop now!",
                "I will not let this go!",
                "This is your last warning!",
                "Owner is busy, go away!",
                "Mind your own business!",
                "Do you want me to block you?",
                "Think before you mention.",
                "Not a good move!",
                "Seriously, stop!",
                "Owner doesn’t like this.",
                "Back off immediately!",
                "You are asking for trouble!",
                "Please refrain from mentioning!",
                "You’ve crossed the line!",
                "Owner is untouchable!",
                "Keep your distance!",
                "Stop bothering the owner!",
                "Do you want a problem?",
                "This behavior is not allowed.",
                "Owner time is private!",
                "Don't mess with the admin!",
                "Mentioning is forbidden!",
                "Behave yourself!",
                "Your mention is inappropriate!",
                "Don't push it!",
                "This is harassment!",
                "Owner is not your friend!",
                "Keep it cool!",
                "You’ll regret this!",
                "Owner doesn’t want attention right now!"
            ];

            // 100 Bangla funny replies
            const banglaMsg = [
                "আমার owner কে disturb করো না 😼",
                "Owner busy, তুমি chill করো 😎",
                "বারবার mention করলে punch পাবো 🥊",
                "Owner এর দিকে চোখও দিও না 😏",
                "Tumi abar mention করলে বড্ড খারাপ হবে 😡",
                "Owner কে disturb করা মানা! 🚫",
                "Ami warning দিলাম, আর mention করলে action হবে! ⚠️",
                "Owner er gf নও, তাহলে maintain কিসের? 😹",
                "Owner busy, তুমি chill করো 😎",
                "Mention করছ কেন? তুমি কি serious? 😳",
                "Owner কে attack করতে চাও নাকি? 😼",
                "এবার আর mention করলে block পাবে 🔒",
                "Owner এর peace respect করো! 🙏",
                "Stop disturbing my owner 😤",
                "Owner busy, তুমি chill bro 😎",
                "Owner কে disturb করা মানা, মনে রাখো 😏",
                "Mention again and face consequences! 🥵",
                "Owner er gf নও, তাহলে maintain করো না 😹",
                "Tumi abar mention করলে আমি reaction দিবো 😼",
                "Owner busy, তুমি খালি থাকো 😎",
                "Owner কে chase করো না 😏",
                "Mention করা off-limits 😤",
                "Owner এর time valuable, respect করো! ⏰",
                "Owner কে tag করার দরকার নাই 😼",
                "Owner কে disturb করলে খারাপ লাগবে 😡",
                "Stop bothering my owner 😤",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে attack করা মানা! ⚠️",
                "Owner কে tag করলে reaction পাবো 😏",
                "Owner busy, তুমি quiet থাকো 😎",
                "Mention বন্ধ করো না? তাহলে consequences পাবে 😼",
                "Owner কে disturb করো না! 🚫",
                "Owner er gf নও, তাহলে maintain কিসের? 😹",
                "Owner কে disturb করলে আমি active হবো 😡",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে chase করো না 😏",
                "Mention again and I will react! 🥵",
                "Owner কে tag করার দরকার নাই 😼",
                "Owner এর peace respect করো! 🙏",
                "Owner busy, তুমি quiet থাকো 😎",
                "Stop disturbing my owner 😤",
                "Owner busy, তুমি chill bro 😎",
                "Owner কে disturb করা মানা, মনে রাখো 😏",
                "Owner কে attack করতে চাও নাকি? 😼",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে tag করলে reaction পাবো 😏",
                "Owner er gf নও, তাহলে maintain করো না 😹",
                "Owner কে disturb করলে আমি active হবো 😡",
                "Owner busy, তুমি quiet থাকো 😎",
                "Mention বন্ধ করো না? তাহলে consequences পাবে 😼",
                "Owner কে disturb করো না! 🚫",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে chase করো না 😏",
                "Owner কে attack করা মানা! ⚠️",
                "Owner busy, তুমি quiet থাকো 😎",
                "Owner কে disturb করলে reaction পাবো 😡",
                "Owner er gf নও, maintain দেওয়ার দরকার নাই 😹",
                "Owner busy, তুমি chill করো 😎",
                "Stop disturbing my owner 😤",
                "Owner কে tag করার দরকার নাই 😼",
                "Owner কে disturb করলে খারাপ লাগবে 😡",
                "Owner busy, তুমি quiet থাকো 😎",
                "Mention again and face consequences! 🥵",
                "Owner কে disturb করো না! 🚫",
                "Owner er gf নও, maintain দেওয়ার দরকার নাই 😹",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে chase করো না 😏",
                "Owner কে attack করতে চাও নাকি? 😼",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে tag করলে reaction পাবো 😏",
                "Owner er gf নও, maintain দেওয়ার দরকার নাই 😹",
                "Owner কে disturb করলে আমি active হবো 😡",
                "Owner busy, তুমি quiet থাকো 😎",
                "Mention বন্ধ করো না? তাহলে consequences পাবে 😼",
                "Owner কে disturb করো না! 🚫",
                "Owner busy, তুমি chill করো 😎",
                "Owner কে chase করো না 😏",
                "Owner কে attack করা মানা! ⚠️",
                "Owner busy, তুমি quiet থাকো 😎",
                "Owner কে disturb করলে reaction পাবো 😡",
                "Owner er gf নও, maintain দেওয়ার দরকার নাই 😹"
            ];

            // Randomly choose either English or Bangla
            const combined = Math.random() < 0.5 ? englishMsg : banglaMsg;
            const randomMsg = combined[Math.floor(Math.random() * combined.length)];

            return api.sendMessage(
                { body: `@${senderID} ${randomMsg}`, mentions: [{ tag: `@${senderID}`, id: senderID }] },
                event.threadID,
                event.messageID
            );
        }
    },

    onStart: async function({}) {
        console.log("goiadmin module loaded with 100 Bangla + 50 English replies!");
    }
};
