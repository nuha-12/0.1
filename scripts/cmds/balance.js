const OWNER_ID = "61557991443492";
const BOT_ID = "BOT_ACCOUNT_ID"; // Replace with your bot's UID
const emoji = require("node-emoji"); // npm install node-emoji

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "set", "setbal"],
    version: "2.0",
    author: "Hasib",
    role: 0,
    description: "Check your balance, view another user's balance, or manage economy features (owner/admin only).",
    category: "economy",
    guide: "{pn}: View your own balance\n{pn} <@tag>: View someone else's balance\n{pn} set/add/remove <amount> <UID/@tag/reply>: Owner only\n{pn} transfer <amount> <UID/@tag/reply>: Transfer money (1% VAT to bot)"
  },

  langs: {
    en: {
      money: "You have %1$",
      moneyOf: "%1 has %2$",
      balanceSet: "Set %1's balance to %2$",
      insufficientFunds: "You don't have enough funds to transfer.",
      transferSuccess: "Transferred %1$ to %2 (1% VAT applied to bot)"
    }
  },

  onStart: async function({ message, usersData, event, getLang }) {

    // Bold-serif formatting
    const formatBoldSerif = (() => {
      const map = {
        a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
        k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
        u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
        A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
        K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
        U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",
        "$":"$",".":".",",":",",":":","-":"-"," ":" "
      };
      return text => text.split('').map(c => map[c] || c).join('');
    })();

    const args = event.body?.trim().split(/\s+/).slice(1);
    const senderID = event.senderID;

    // ===== OWNER COMMANDS =====
    if (senderID === OWNER_ID && args.length > 0) {
      const action = args[0].toLowerCase();

      // SET / ADD / REMOVE
      if (["set","add","remove"].includes(action) && args[1]) {
        let amount = parseInt(args[1]);
        if (isNaN(amount) || amount < 0) amount = 0;

        let targetID = event.mentions ? Object.keys(event.mentions)[0] : args[2] || senderID;
        targetID = targetID.replace(/[^0-9]/g,"");
        const current = await usersData.get(targetID, "money") || 0;

        let newBalance = current;
        if (action === "set") newBalance = amount;
        if (action === "add") newBalance += amount;
        if (action === "remove") newBalance = Math.max(0, current - amount);

        await usersData.set(targetID, newBalance, "money");
        return message.reply(formatBoldSerif(getLang("balanceSet", targetID, newBalance)));
      }

      // TRANSFER
      if (["transfer","-t"].includes(action) && args[1] && args[2]) {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount < 10) return message.reply("Minimum $10 to transfer");

        let targetID = event.mentions ? Object.keys(event.mentions)[0] : args[2];
        targetID = targetID.replace(/[^0-9]/g,"");

        const senderBalance = await usersData.get(senderID, "money") || 0;
        if (senderBalance < amount) return message.reply(getLang("insufficientFunds"));

        const vat = Math.ceil(amount * 0.01); // 1% VAT
        const receiveAmount = amount - vat;

        await usersData.set(senderID, senderBalance - amount, "money");

        const receiverBalance = await usersData.get(targetID, "money") || 0;
        await usersData.set(targetID, receiverBalance + receiveAmount, "money");

        const botBalance = await usersData.get(BOT_ID, "money") || 0;
        await usersData.set(BOT_ID, botBalance + vat, "money");

        return message.reply(formatBoldSerif(getLang("transferSuccess", amount, targetID)));
      }

      // OWNER VIEW ANY UID
      if (args[0]) {
        const targetID = args[0].replace(/[^0-9]/g,"");
        const targetData = await usersData.get(targetID);
        const targetMoney = targetData?.money || 0;
        return message.reply(formatBoldSerif(getLang("moneyOf", targetID, targetMoney)));
      }
    }

    // ===== NORMAL USERS =====
    if (Object.keys(event.mentions).length > 0) {
      let msg = "";
      for (const uid of Object.keys(event.mentions)) {
        const userMoney = await usersData.get(uid, "money") || 0;
        const name = event.mentions[uid].replace(/@/g,"");
        msg += formatBoldSerif(getLang("moneyOf", name, userMoney)) + "\n";
      }
      return message.reply(msg.trim());
    }

    // View own balance with random emoji
    const userData = await usersData.get(senderID) || {};
    const money = userData.money || 0;
    const userName = event.senderName || "User";
    const randomEmoji = emoji.random().emoji;

    const msg = `${formatBoldSerif(`Hey, ${userName}! ${randomEmoji}`)}\n\n` +
                `${formatBoldSerif(`Your current balance is $${money}.`)}`;

    return message.reply(msg);
  }
};
