const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "3.0",
    author: "Hasib",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage Owners and Bot Operators"
    },
    category: "system",
    guide: {
      en: `   {pn} owner add <uid | @tag>: Add new owner (only owner can use)
   {pn} owner remove <uid | @tag>: Remove owner (cannot remove root owner)
   {pn} owner list: List all owners

   {pn} add <uid | @tag>: Add operator
   {pn} remove <uid | @tag>: Remove operator
   {pn} list: List owners & operators`
    }
  },

  langs: {
    en: {
      addedOwner: "✅ | Added owner role for %1 users:\n%2",
      alreadyOwner: "\n⚠️ | %1 users already owners:\n%2",
      removedOwner: "✅ | Removed owner role from %1 users:\n%2",
      notOwner: "⚠️ | %1 users are not owners or cannot be removed:\n%2",
      missingIdOwner: "⚠️ | Please enter ID or tag user to manage owners",

      added: "✅ | Added operator role for %1 users:\n%2",
      alreadyAdmin: "\n⚠️ | %1 users already operators:\n%2",
      removed: "✅ | Removed operator role from %1 users:\n%2",
      notAdmin: "⚠️ | %1 users are not operators:\n%2",
      missingId: "⚠️ | Please enter ID or tag user to manage operators",

      listAdmin: "👑 | Owners:\n%1\n\n🛠 | Bot Operators:\n%2"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const senderID = event.senderID;
    const rootOwner = "61557991443492"; // Root owner UID

    // ✅ Only owners can manage owners
    const isOwner = config.ownerBot.includes(senderID) || senderID === rootOwner;
    const isOperator = config.adminBot.includes(senderID);

    // OWNER MANAGEMENT
    if (args[0] === "owner") {
      if (!isOwner) return message.reply("❌ | Only owners can manage owners.");
      const sub = args[1];
      if (!sub) return message.reply(getLang("missingIdOwner"));

      // --- Add Owner
      if (sub === "add") {
        let uids = [];
        if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
        else if (event.messageReply) uids.push(event.messageReply.senderID);
        else uids = args.filter(arg => !isNaN(arg));

        const newOwners = [];
        const alreadyOwners = [];

        for (const uid of uids) {
          if (config.ownerBot.includes(uid) || uid === rootOwner) {
            alreadyOwners.push(uid);
          } else {
            config.ownerBot.push(uid);
            newOwners.push(uid);
          }
        }

        const getNames = await Promise.all(
          uids.map(async uid => {
            try {
              const name = await usersData.getName(uid);
              return { uid, name };
            } catch {
              return { uid, name: "Unknown User" };
            }
          })
        );

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(
          (newOwners.length > 0
            ? getLang(
                "addedOwner",
                newOwners.length,
                getNames
                  .filter(u => newOwners.includes(u.uid))
                  .map(({ uid, name }) => `• ${name} (${uid})`)
                  .join("\n")
              )
            : "") +
            (alreadyOwners.length > 0
              ? getLang(
                  "alreadyOwner",
                  alreadyOwners.length,
                  getNames
                    .filter(u => alreadyOwners.includes(u.uid))
                    .map(({ uid, name }) => `• ${name} (${uid})`)
                    .join("\n")
                )
              : "")
        );
      }

      // --- Remove Owner
      if (sub === "remove") {
        let uids = [];
        if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
        else if (event.messageReply) uids.push(event.messageReply.senderID);
        else uids = args.filter(arg => !isNaN(arg));

        const removed = [];
        const notOwners = [];

        for (const uid of uids) {
          if (uid === rootOwner) {
            notOwners.push(uid); // root owner can't be removed
          } else if (config.ownerBot.includes(uid)) {
            config.ownerBot.splice(config.ownerBot.indexOf(uid), 1);
            removed.push(uid);
          } else {
            notOwners.push(uid);
          }
        }

        const getNames = await Promise.all(
          uids.map(async uid => {
            try {
              const name = await usersData.getName(uid);
              return { uid, name };
            } catch {
              return { uid, name: "Unknown User" };
            }
          })
        );

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(
          (removed.length > 0
            ? getLang(
                "removedOwner",
                removed.length,
                getNames
                  .filter(u => removed.includes(u.uid))
                  .map(({ uid, name }) => `• ${name} (${uid})`)
                  .join("\n")
              )
            : "") +
            (notOwners.length > 0
              ? getLang(
                  "notOwner",
                  notOwners.length,
                  getNames
                    .filter(u => notOwners.includes(u.uid))
                    .map(({ uid, name }) => `• ${name} (${uid})`)
                    .join("\n")
                )
              : "")
        );
      }

      // --- List Owners
      if (sub === "list") {
        const getOwners = await Promise.all(
          [rootOwner, ...config.ownerBot].map(async uid => {
            try {
              const name = await usersData.getName(uid);
              return `• ${name} (${uid})`;
            } catch {
              return `• Unknown User (${uid})`;
            }
          })
        );
        return message.reply("👑 | Owners:\n" + getOwners.join("\n"));
      }
    }

    // OPERATOR MANAGEMENT
    if (["add", "-a"].includes(args[0])) {
      if (!isOwner && !isOperator) return message.reply("❌ | Only owners or operators can add operators.");
      if (!args[1]) return message.reply(getLang("missingId"));
      let uids = [];
      if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
      else if (event.messageReply) uids.push(event.messageReply.senderID);
      else uids = args.filter(arg => !isNaN(arg));

      const newOps = [];
      const alreadyOps = [];

      for (const uid of uids) {
        if (config.adminBot.includes(uid) || config.ownerBot.includes(uid) || uid === rootOwner) {
          alreadyOps.push(uid);
        } else {
          config.adminBot.push(uid);
          newOps.push(uid);
        }
      }

      const getNames = await Promise.all(
        uids.map(async uid => {
          try {
            const name = await usersData.getName(uid);
            return { uid, name };
          } catch {
            return { uid, name: "Unknown User" };
          }
        })
      );

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      return message.reply(
        (newOps.length > 0
          ? getLang(
              "added",
              newOps.length,
              getNames
                .filter(u => newOps.includes(u.uid))
                .map(({ uid, name }) => `• ${name} (${uid})`)
                .join("\n")
            )
          : "") +
          (alreadyOps.length > 0
            ? getLang(
                "alreadyAdmin",
                alreadyOps.length,
                getNames
                  .filter(u => alreadyOps.includes(u.uid))
                  .map(({ uid, name }) => `• ${name} (${uid})`)
                  .join("\n")
            )
            : "")
      );
    }

    if (["remove", "-r"].includes(args[0])) {
      if (!isOwner && !isOperator) return message.reply("❌ | Only owners or operators can remove operators.");
      if (!args[1]) return message.reply(getLang("missingId"));
      let uids = [];
      if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
      else if (event.messageReply) uids.push(event.messageReply.senderID);
      else uids = args.filter(arg => !isNaN(arg));

      const removed = [];
      const notAdmins = [];

      for (const uid of uids) {
        if (config.adminBot.includes(uid)) {
          config.adminBot.splice(config.adminBot.indexOf(uid), 1);
          removed.push(uid);
        } else {
          notAdmins.push(uid);
        }
      }

      const getNames = await Promise.all(
        uids.map(async uid => {
          try {
            const name = await usersData.getName(uid);
            return { uid, name };
          } catch {
            return { uid, name: "Unknown User" };
          }
        })
      );

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      return message.reply(
        (removed.length > 0
          ? getLang(
              "removed",
              removed.length,
              getNames
                .filter(u => removed.includes(u.uid))
                .map(({ uid, name }) => `• ${name} (${uid})`)
                .join("\n")
            )
          : "") +
          (notAdmins.length > 0
            ? getLang(
                "notAdmin",
                notAdmins.length,
                getNames
                  .filter(u => notAdmins.includes(u.uid))
                  .map(({ uid, name }) => `• ${name} (${uid})`)
                  .join("\n")
            )
            : "")
      );
    }

    if (["list", "-l"].includes(args[0])) {
      const getOwners = await Promise.all(
        [rootOwner, ...config.ownerBot].map(async uid => {
          try {
            const name = await usersData.getName(uid);
            return `• ${name} (${uid})`;
          } catch {
            return `• Unknown User (${uid})`;
          }
        })
      );

      const getOperators = await Promise.all(
        config.adminBot.map(async uid => {
          try {
            const name = await usersData.getName(uid);
            return `• ${name} (${uid})`;
          } catch {
            return `• Unknown User (${uid})`;
          }
        })
      );

      return message.reply(getLang("listAdmin", getOwners.join("\n"), getOperators.join("\n") || "No Operators"));
    }

    return message.SyntaxError();
  }
};
