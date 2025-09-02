const axios = require("axios");
const fs = require("fs");
const request = require("request");

// Format date function
function convert(time) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${day < 10 ? "0"+day : day}/${month < 10 ? "0"+month : month}/${year} || ${hours < 10 ? "0"+hours : hours}:${minutes < 10 ? "0"+minutes : minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
}

// FB Graph API headers
const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like) Version/12.0 eWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
  "accept": "application/json, text/plain, /"
};

// VIP / Owner IDs
const VIPS = ["61557991443492"]; // add owner or VIP IDs here

module.exports = {
  config: {
    name: "stalk",
    aliases: ["fbstalk"],
    version: "1.1",
    author: "Deku X kshitiz + Nayan",
    countDown: 5,
    role: 0,
    shortDescription: "Get info using UID/mention/reply",
    longDescription: {
      en: "Get Facebook user info using UID, mention, or replying to a message.",
    },
    category: "info",
    guide: {
      en: "{pn}reply/uid/@mention",
    },
  },

  onStart: async function({ api, event, args }) {
    // VIP / Owner check
    if (!VIPS.includes(event.senderID)) {
      return api.sendMessage("❌ Only VIP/Owner can use this command!", event.threadID, event.messageID);
    }

    let path = __dirname + `/cache/info.png`;
    const token = "EAAD6V7os0gcBO3eucJGzKLfpftCar1KBIyMGal4jNQk2I0KAJ0W9a79h0CGP0oG6oXYT4ZBEUZB7ZCImWMiChtH8u5lfKAMNe9FUsznt0ht1XcwMXQFK0mpuOzLjZCJ9EpxvLNdkmVqZA2J1qhVohlZBZCTPAuOEZADuQKCTc1Eqk5K6KZC11KBy2DwoZBIgZDZD"; // replace with valid token

    let id;
    if (args.join().includes("@")) {
      id = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      id = event.messageReply.senderID;
    } else {
      id = args[0] || event.senderID;
    }

    try {
      const resp = await axios.get(`https://graph.facebook.com/${id}?fields=id,is_verified,cover,created_time,work,hometown,username,link,name,locale,location,about,website,birthday,gender,relationship_status,significant_other,quotes,first_name,subscribers.limit(0)&access_token=${token}`, { headers });

      const data = resp.data;
      const avatar = `https://graph.facebook.com/${id}/picture?width=1500&height=1500&access_token=${token}`;

      const cb = function () {
        api.sendMessage({
          body: `•——INFORMATION——•
Name: ${data.name}
First name: ${data.first_name}
Creation Date: ${convert(data.created_time)}
Profile link: ${data.link}
Gender: ${data.gender}
Relationship Status: ${data.relationship_status || "No data!"}
Birthday: ${data.birthday || "No data!"}
Follower(s): ${data.subscribers ? data.subscribers.summary.total_count : "No data!"}
Hometown: ${data.hometown ? data.hometown.name : "No data!"}
Locale: ${data.locale || "No data!"}
About: ${data.about || "No data!"}
Quotes: ${data.quotes || "No data!"}
•——END——•`,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      };

      request(encodeURI(avatar)).pipe(fs.createWriteStream(path)).on("close", cb);

    } catch (err) {
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
