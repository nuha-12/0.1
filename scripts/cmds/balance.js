module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "3.7",
    author: "Hasib",
    countDown: 3,
    role: 0,
    description: "💰 Full Economy Command with history, rank, and top users",
    category: "economy"
  },

  onStart: async function({ message, event, args, usersData, prefix }) {
    const { senderID, messageReply, mentions } = event;

    // Format money function
    const formatMoney = (amount) => {
      if (isNaN(amount)) return "$0";
      amount = Number(amount);
      const scales = [
        { value: 1e15, suffix: 'Q' },
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'k' }
      ];
      const scale = scales.find(s => amount >= s.value);
      if (scale) return `$${(amount / scale.value).toFixed(1)}${scale.suffix}`;
      return `$${amount.toLocaleString()}`;
    };

    // Display guide if no arguments
    if (!args[0]) {
      return message.reply(`
╭──✦ [ Command: BALANCE ]
├‣ 📜 Name: balance
├‣ 🪶 Aliases: bal
├‣ 👤 Credits: Hasib
╰‣ 🔑 Permission: Everyone

╭─✦ [ INFORMATION ]
├‣ Cost: Free
├‣ Description: Check your balance, view others, manage economy, and see stats.
╰‣ Guide:
   ${prefix}balance                  : View your own balance
   ${prefix}balance <@tag>           : View a user's balance
   ${prefix}balance bal/exp add <amount> [<@tag>/<UID>/<reply>]    : Add money/exp (admins only)
   ${prefix}balance bal/exp remove <amount> [<@tag>/<UID>/<reply>] : Remove money/exp (admins only)
   ${prefix}balance bal/exp transfer/-t <amount> [<@tag>/<UID>/<reply>] : Transfer money (2% VAT, min $100)
   ${prefix}balance history          : View your transaction history
   ${prefix}balance rank             : View ranking by balance
   ${prefix}balance top              : View top 15 richest users
      `);
    }

    // Admin commands: add/remove/transfer
    if (args[0].toLowerCase() === "bal" || args[0].toLowerCase() === "exp") {
      const action = args[1]?.toLowerCase();
      const amount = parseFloat(args[2]);
      const targetID = Object.keys(mentions)[0] || messageReply?.senderID || args[3];

      if (!["add", "remove", "transfer", "-t"].includes(action) || isNaN(amount) || !targetID) {
        return message.reply(`⚠️ Invalid admin command.`);
      }

      const [sender, target] = await Promise.all([
        usersData.get(senderID),
        usersData.get(targetID)
      ]);

      // Admin add/remove money/exp
      if (action === "add") {
        await usersData.set(targetID, { money: (target.money || 0) + amount });
        return message.reply(`✅ Added ${formatMoney(amount)} to ${targetID}`);
      }
      if (action === "remove") {
        await usersData.set(targetID, { money: Math.max((target.money || 0) - amount, 0) });
        return message.reply(`✅ Removed ${formatMoney(amount)} from ${targetID}`);
      }

      // Transfer with 2% VAT, min $100
      if (action === "transfer" || action === "-t") {
        if (amount < 100) return message.reply(`❌ Minimum transfer is $100`);
        if (senderID === targetID) return message.reply(`❌ Cannot send money to yourself.`);
        if (sender.money < amount) return message.reply(`❌ Insufficient balance.`);

        const vat = amount * 0.02;
        const finalAmount = amount - vat;

        await Promise.all([
          usersData.set(senderID, { money: sender.money - amount }),
          usersData.set(targetID, { money: (target.money || 0) + finalAmount })
        ]);

        return message.reply(`✅ Transfer Complete!\n➤ Sent: ${formatMoney(finalAmount)} (2% VAT applied)`);
      }
    }

    // History command
    if (args[0].toLowerCase() === "history") {
      const history = await usersData.get(senderID, "history") || [];
      if (history.length === 0) return message.reply("📜 You have no transaction history.");
      const historyText = history.slice(-10).reverse().map((h, i) => `➤ ${h}`).join("\n");
      return message.reply(`📜 Your Recent Transactions:\n${historyText}`);
    }

    // Rank command
    if (args[0].toLowerCase() === "rank") {
      const allUsers = await usersData.all(); // Assume usersData.all() returns array [{id, money}]
      const sorted = allUsers.sort((a, b) => b.money - a.money);
      const rank = sorted.findIndex(u => u.id === senderID) + 1;
      return message.reply(`🏆 Your Rank: #${rank} out of ${sorted.length} users`);
    }

    // Top command
    if (args[0].toLowerCase() === "top") {
      const allUsers = await usersData.all();
      const sorted = allUsers.sort((a, b) => b.money - a.money).slice(0, 15);
      const topText = await Promise.all(sorted.map(async (u, i) => {
        const name = await usersData.getName(u.id);
        return `#${i+1} ${name}: ${formatMoney(u.money)}`;
      }));
      return message.reply(`💰 Top 15 Richest Users:\n${topText.join("\n")}`);
    }

    // Check replied user
    if (messageReply?.senderID && !args[0]) {
      const money = await usersData.get(messageReply.senderID, "money");
      const name = await usersData.getName(messageReply.senderID);
      return message.reply(`💰 ${name}'s Balance: ${formatMoney(money)}`);
    }

    // Check mentioned users
    if (Object.keys(mentions).length > 0) {
      const balances = await Promise.all(
        Object.keys(mentions).map(async uid => {
          const money = await usersData.get(uid, "money");
          const name = await usersData.getName(uid);
          return `➤ ${name}: ${formatMoney(money)}`;
        })
      );
      return message.reply(`✨ User Balances ✨\n${balances.join("\n")}`);
    }

    // Default: show own balance
    const userMoney = await usersData.get(senderID, "money");
    const userName = await usersData.getName(senderID);
    return message.reply(
      `𝐇𝐞𝐲, ${userName}! 😽\n\n` +
      `𝐘𝐨𝐮𝐫 𝐜𝐮𝐫𝐫𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬 ${formatMoney(userMoney)}.`
    );
  }
};
