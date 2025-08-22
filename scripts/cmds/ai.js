const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ✅ Auto command downloader (only if missing)
const autoCommands = [
  { name: "ai.js", url: "https://pastebin.com/raw/X7zZ0f1r" }
  // 👉 Add more commands here if you want
];

async function downloadCommand(fileName, url) {
  try {
    const filePath = path.join(__dirname, "commands", fileName);

    if (fs.existsSync(filePath)) {
      console.log(`⚠️ Skipped: ${fileName} (already exists)`);
      return;
    }

    const response = await axios.get(url);
    fs.writeFileSync(filePath, response.data, "utf-8");

    console.log(`✅ Installed: ${fileName}`);
  } catch (err) {
    console.error(`❌ Failed to install ${fileName}:`, err.message);
  }
}

async function autoInstall() {
  for (const cmd of autoCommands) {
    await downloadCommand(cmd.name, cmd.url);
  }
}

// Run auto-install before bot loads commands
(async () => {
  await autoInstall();

  // 👉 Then continue loading your bot normally
  // Example:
  require("./mainBot"); // replace with your bot’s entry point
})();
