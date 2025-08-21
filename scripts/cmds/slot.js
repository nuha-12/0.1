const OWNER_IDS = ["61557991443492"]; // Owner ID
const MAX_OWNER_JACKPOT = 10;
const USER_SPIN_LIMIT = 20; // Max 20 spins per 12 hours
const RULE_BREAK_FINE = 120_000_000; // Fine for breaking rules

let ownerJackpotCounter = {};
let userStats = {};
let userSpins = {};
let globalStats = {};
let lastSpinTime = {}; // Track last spin timestamp

module.exports = {
  config: {
    name: "slot",
    aliases: [],
    version: "10.0",
    author: "Hasib",
    description: { role: 2, en: "Playing slot game" },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "Enter a valid amount of money to play. ❗ Fine applied!",
      not_enough_money: "Check your balance if you have that amount",
      spin_limit_reached: `Sorry! You have reached your 20-spin limit for 12 hours. ❗ Fine $${RULE_BREAK_FINE} applied!`,
      balance_set: "✅ Balance set successfully!",
      fine_applied: `💸 You broke the rules! $${RULE_BREAK_FINE} has been deducted as fine.`,
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;

    if (!userSpins[senderID]) userSpins[senderID] = 0;
    if (!ownerJackpotCounter[senderID]) ownerJackpotCounter[senderID] = 0;
    if (!userStats[senderID]) userStats[senderID] = { wins: 0, total: 0 };
    if (!globalStats[senderID]) globalStats[senderID] = { wins: 0, total: 0 };
    if (!lastSpinTime[senderID]) lastSpinTime[senderID] = 0;

    const now = Date.now();

    // Reset user spins if 12 hours passed
    if (!OWNER_IDS.includes(senderID) && now - lastSpinTime[senderID] > 12 * 60 * 60 * 1000) {
      userSpins[senderID] = 0;
      lastSpinTime[senderID] = now;
    }

    // --- OWNER SET BALANCE ---
    if (OWNER_IDS.includes(senderID)) {
      if (args[0] && args[0].toLowerCase() === "setbalance") {
        let targetID;

        // Reply to user
        if (event.messageReply) targetID = event.messageReply.senderID;

        // Tag a user
        if (!targetID && event.mentions && Object.keys(event.mentions).length > 0) {
          targetID = Object.keys(event.mentions)[0];
        }

        const amount = parseInt(args[1]); // amount is second argument
        if (!targetID || isNaN(amount)) {
          return message.reply("❗ Usage: reply or tag a user and type: setbalance [amount]");
        }

        await setBalance(usersData, targetID, amount);
        return message.reply(`✅ Balance of user has been set to $${amount}`);
      }
    }

    // Subcommands
    if (args[0]) {
      const sub = args[0].toLowerCase();
      if (sub === "info") return message.reply(slotInfo());
      if (sub === "rules") return message.reply(slotRules());
      if (sub === "list") {
        if (args[1] && args[1].toLowerCase() === "-g") return message.reply(slotGlobalList());
        return message.reply(slotList());
      }
    }

    // Check user spin limit (owners have unlimited spins)
    if (!OWNER_IDS.includes(senderID) && userSpins[senderID] >= USER_SPIN_LIMIT) {
      await applyFine(usersData, senderID, RULE_BREAK_FINE); // automatic fine
      return message.reply(getLang("spin_limit_reached"));
    }

    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      await applyFine(usersData, senderID, RULE_BREAK_FINE); // automatic fine
      return message.reply(getLang("invalid_amount"));
    }
    if (amount > userData.money) return message.reply(getLang("not_enough_money"));

    const slotsArray = ["💚", "🧡", "❤️", "💜", "💙", "💛"];
    let slots = [];

    // HIDDEN OWNER LOGIC: unlimited spins & jackpot
    if (OWNER_IDS.includes(senderID)) {
      const jackpot = ownerJackpotCounter[senderID] < MAX_OWNER_JACKPOT;
      const sym1 = slotsArray[Math.floor(Math.random() * slotsArray.length)];
      const sym2 = jackpot ? sym1 : slotsArray[Math.floor(Math.random() * slotsArray.length)];
      const sym3 = jackpot ? sym1 : slotsArray[Math.floor(Math.random() * slotsArray.length)];
      slots = [sym1, sym2, sym3];
      if (jackpot) ownerJackpotCounter[senderID]++;
    } else {
      // USER LOGIC
      const isWin = Math.random() < 0.5;
      if (isWin) {
        const jackpotChance = Math.random() < 0.1;
        if (jackpotChance) {
          const sym = slotsArray[Math.floor(Math.random() * slotsArray.length)];
          slots = [sym, sym, sym];
        } else {
          const sym1 = slotsArray[Math.floor(Math.random() * slotsArray.length)];
          const sym2 = sym1;
          const sym3 = slotsArray[Math.floor(Math.random() * slotsArray.length)];
          slots = [sym1, sym2, sym3];
        }
      } else {
        slots = [
          slotsArray[Math.floor(Math.random() * slotsArray.length)],
          slotsArray[Math.floor(Math.random() * slotsArray.length)],
          slotsArray[Math.floor(Math.random() * slotsArray.length)],
        ];
      }
    }

    const winnings = calculateWinnings(slots, amount);
    await usersData.set(senderID, { money: userData.money + winnings, data: userData.data });

    // Update stats
    userStats[senderID].total++;
    globalStats[senderID].total++;
    if (winnings > 0) {
      userStats[senderID].wins++;
      globalStats[senderID].wins++;
    }
    if (!OWNER_IDS.includes(senderID)) {
      userSpins[senderID]++;
      lastSpinTime[senderID] = now;
    }

    const messageText = formatResult(slots, winnings, senderID);
    return message.reply(messageText);
  },
};

// --- OWNER COMMANDS ---
async function setBalance(usersData, targetID, amount) {
  const user = await usersData.get(targetID);
  await usersData.set(targetID, { money: amount, data: user.data });
}

async function applyFine(usersData, targetID, amount) {
  const user = await usersData.get(targetID);
  const newBalance = Math.max(user.money - amount, 0);
  await usersData.set(targetID, { money: newBalance, data: user.data });
  return newBalance;
}

// --- Winnings calculation ---
function calculateWinnings(slots, bet) {
  if (slots[0] === slots[1] && slots[1] === slots[2]) {
    const multipliers = { "💚": 20, "💛": 15, "💙": 10, "❤️": 7, "💜": 7, "🧡": 5 };
    return bet * (multipliers[slots[0]] || 7);
  }
  if (slots[0] === slots[1] || slots[1] === slots[2] || slots[0] === slots[2]) {
    return bet * 2;
  }
  return -bet;
}

// --- Format result ---
function formatResult(slots, winnings, userID) {
  const stats = userStats[userID];
  const winRate = ((stats.wins / stats.total) * 100).toFixed(1);
  const slotLine = `[ ${slots.join(" | ")} ]`;

  let resultLine;
  if (winnings > 0) {
    if (slots[0] === slots[1] && slots[1] === slots[2]) {
      const emojiText = {
        "💚": "💚 Green Luck",
        "💛": "💛 Yellow Fortune",
        "💙": "💙 Blue Treasure",
        "❤️": "❤️ Red Love",
        "💜": "💜 Purple Magic",
        "🧡": "🧡 Orange Charm"
      }[slots[0]] || slots[0];

      resultLine = `🎰 𝐉𝐚𝐜𝐤𝐩𝐨𝐭! 𝐘𝐨𝐮 𝐰𝐨𝐧 $${winnings} 𝐟𝐨𝐫 𝐭𝐡𝐫𝐞𝐞 ${emojiText} symbols 😻`;
    } else {
      resultLine = `• 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮 𝐰𝐨𝐧 $${winnings}`;
    }
  } else {
    resultLine = `• 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮 𝐥𝐨𝐬𝐭 $${-winnings}`;
  }

  return `${resultLine}\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: ${slotLine}\n🎯 𝐖𝐢𝐧 𝐑𝐚𝐭𝐞 𝐓𝐨𝐝𝐚𝐲: ${winRate}% (${stats.wins}/${stats.total})`;
}

// --- Slot rules ---
function slotRules() {
  return `🎰 𝐒𝐥𝐨𝐭 𝐆𝐚𝐦𝐞 𝐑𝐮𝐥𝐞𝐬 🎰

1⃣ 𝐁𝐞𝐭 𝐋𝐢𝐦𝐢𝐭: Maximum bet is $6,000,000 (6M).

2⃣ 𝐋𝐢𝐦𝐢𝐭𝐬: Maximum 20 spins per 12 hours. Owners have unlimited spins.

3⃣ 𝐅𝐢𝐧𝐞: Breaking any rules (exceeding spin limit or invalid bets) automatically applies a fine of $120,000,000.

❗ Please play responsibly and avoid rule-breaking. Good luck! 🍀`;
}

// --- Slot info ---
function slotInfo() {
  return `╭──✦ [ Command: SLOT ]
├‣ 📜 Name: slot
├‣ 🪶 Aliases: None
├‣ 👤 Credits: Dipto
╰‣ 🔑 Permission: Everyone

╭─✦ [ INFORMATION ]
├‣ Cost: Depends on your bet
├‣ Description: Play the slot game
╰‣ Guide:
│   !slot [amount] - Spin the slot
│   !slot rules - View game rules
│   !slot list - Local leaderboard
│   !slot list -g - Global leaderboard
│   setbalance [amount] - Owner only (reply/tag user)

╭─✦ [ SETTINGS ]
├‣ 🚩 Spin Limit: 20 per 12 hours (users), unlimited (owner)
├‣ ⚜ Premium: Free
├‣ 💸 Fine: $120,000,000 for rule-breaking`;
}

// --- Local leaderboard ---
function slotList() {
  let ranking = Object.entries(userStats)
    .map(([id, stats]) => ({ id, wins: stats.wins, total: stats.total }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);

  let message = "╭──✦ [ LOCAL WIN RANKINGS ]\n";
  ranking.forEach((user, index) => {
    message += `├‣ ${index + 1}. User: ${user.id} | Wins: ${user.wins} | Spins: ${user.total}\n`;
  });
  message += "╰─✦";
  return message;
}

// --- Global leaderboard ---
function slotGlobalList() {
  let ranking = Object.entries(globalStats)
    .map(([id, stats]) => ({ id, wins: stats.wins, total: stats.total }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);

  let message = "╭──✦ [ GLOBAL WIN RANKINGS ]\n";
  ranking.forEach((user, index) => {
    message += `├‣ ${index + 1}. User: ${user.id} | Wins: ${user.wins} | Spins: ${user.total}\n`;
  });
  message += "╰─✦";
  return message;
}
