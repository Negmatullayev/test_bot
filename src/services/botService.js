const fs = require('fs');

let botInstance = null;

function setBotInstance(bot) {
  botInstance = bot;
}

function getBotInstance() {
  return botInstance;
}

/**
 * Send text message to a specific telegram ID
 */
async function sendTelegramMessage(telegramId, text, extra = {}) {
  if (!botInstance) {
    console.warn('[BotService] Bot instance not initialized yet');
    return false;
  }
  try {
    await botInstance.telegram.sendMessage(telegramId, text, {
      parse_mode: 'HTML',
      ...extra
    });
    return true;
  } catch (err) {
    console.error(`[BotService Error to ${telegramId}]:`, err.message);
    return false;
  }
}

/**
 * Send a document (e.g. PDF certificate) to telegram ID
 */
async function sendTelegramDocument(telegramId, filePath, caption = '') {
  if (!botInstance) return false;
  try {
    if (!fs.existsSync(filePath)) {
      console.error('[BotService] Document file does not exist:', filePath);
      return false;
    }
    await botInstance.telegram.sendDocument(
      telegramId,
      { source: filePath },
      {
        caption,
        parse_mode: 'HTML'
      }
    );
    return true;
  } catch (err) {
    console.error(`[BotService Document Error to ${telegramId}]:`, err.message);
    return false;
  }
}

/**
 * Broadcast message to multiple telegram IDs with throttle
 */
async function broadcastMessage(users, messageText, extra = {}) {
  let sentCount = 0;
  let failedCount = 0;

  for (const user of users) {
    if (!user.telegramId) continue;
    const ok = await sendTelegramMessage(user.telegramId, messageText, extra);
    if (ok) {
      sentCount++;
    } else {
      failedCount++;
    }
    // Small delay to prevent Telegram rate limit
    await new Promise((res) => setTimeout(res, 50));
  }

  return { sentCount, failedCount };
}

module.exports = {
  setBotInstance,
  getBotInstance,
  sendTelegramMessage,
  sendTelegramDocument,
  broadcastMessage
};
