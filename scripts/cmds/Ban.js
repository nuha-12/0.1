const { findUid } = global.utils;
const moment = require("moment-timezone");

const OWNER_ID = "61557991443492"; // Owner UID here

function parseDuration(str) {
	const match = str.match(/^(\d+)([smhd])$/);
	if (!match) return null;
	const value = parseInt(match[1]);
	const unit = match[2];
	switch (unit) {
		case "s": return value * 1000;
		case "m": return value * 60 * 1000;
		case "h": return value * 60 * 60 * 1000;
		case "d": return value * 24 * 60 * 60 * 1000;
		default: return null;
	}
}

module.exports = {
	config: {
		name: "ban",
		version: "2.0",
		author: "NTKhang + modified by Hasib",
		countDown: 5,
		role: 1,
		description: {
			vi: "Cấm thành viên khỏi box chat (có thời hạn)",
			en: "Ban user from box chat (with optional duration)"
		},
		category: "box chat",
		guide: {
			en: "{pn} [@tag|uid|fb link|reply] [duration?] [reason?]\n"
				+ "Example: {pn} @user 1d Spamming\n"
				+ "{pn} unban @user\n"
				+ "{pn} list\n"
				+ "{pn} check"
		}
	},

	langs: {
		en: {
			notFoundTarget: "⚠️ | Please tag the person to ban or enter uid or fb link or reply.",
			notFoundTargetUnban: "⚠️ | Please tag the person to unban or enter uid or fb link or reply.",
			userNotBanned: "⚠️ | The person with id %1 is not banned from this box chat",
			unbannedSuccess: "✅ | Unbanned %1 from box chat!",
			cantSelfBan: "⚠️ | You can't ban yourself!",
			cantBanAdmin: "❌ | You can't ban an admin!",
			existedBan: "❌ | This person has already been banned!",
			noReason: "No reason",
			bannedSuccess: "✅ | Banned %1 from box chat!",
			needAdmin: "⚠️ | Bot needs administrator permission to kick banned members",
			noName: "Facebook user",
			noData: "📑 | No banned members in this box chat",
			listBanned: "📑 | List of banned members (page %1/%2)",
			content: "%1/ %2 (%3)\nReason: %4\nBan time: %5\nExpire: %6\n\n",
			needAdminToKick: "⚠️ | Member %1 (%2) is banned, but the bot has no admin permission to kick them.",
			bannedKick: "⚠️ | %1 was already banned!\nUID: %2\nReason: %3\nBan time: %4\nExpire: %5\n\nBot auto-kicked this member"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
		const { members, adminIDs } = await threadsData.get(event.threadID);
		const { senderID } = event;
		let target;
		let reason;
		let duration = null;

		let dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);

		// Clean expired bans
		const now = Date.now();
		dataBanned = dataBanned.filter(b => !b.expire || b.expire > now);
		await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');

		// ==== UNBAN ====
		if (
