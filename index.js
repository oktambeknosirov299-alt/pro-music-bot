const TelegramBot = require('node-telegram-bot-api');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');

// ⚠️ BU YERGA YANGI TOKENINGNI QO‘Y
const token = '8978562927:AAFF9FAEzROXLYFSEoVH-j6QWMWtgmjJURU';

const bot = new TelegramBot(token, { polling: true });

// session storage
let userData = {};

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🎧 PRO MAX MUSIC BOT

Qo‘shiq nomi yoki so‘zini yozing 🔎
Men topib beraman va MP3 yuboraman ⚡

Misol:
Adele Hello
BTS Dynamite`
  );
});

// SEARCH
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  bot.sendMessage(chatId, "🔎 Qidirilmoqda...");

  try {
    const result = await ytSearch(text);

    if (!result.videos.length) {
      return bot.sendMessage(chatId, "❌ Topilmadi");
    }

    const video = result.videos[0];
    userData[chatId] = video;

    // 🎯 CHIROYLI UI + RASM + ARTIST
    bot.sendPhoto(chatId, video.thumbnail, {
      caption:
`🎵 TOPILDI

🎶 ${video.title}
👤 Artist: ${video.author.name}
👀 Views: ${video.views.toLocaleString()}
⏱ ${video.timestamp}

👇 Tugmani bosing`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📥 MP3 yuklab olish", callback_data: "download" }
          ],
          [
            { text: "▶️ YouTube ochish", url: video.url }
          ],
          [
            { text: "❌ Bekor qilish", callback_data: "cancel" }
          ]
        ]
      }
    });

  } catch (err) {
    console.log(err);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi");
  }
});

// BUTTONS
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "cancel") {
    delete userData[chatId];
    return bot.sendMessage(chatId, "❌ Bekor qilindi");
  }

  if (data === "download") {
    const video = userData[chatId];

    if (!video) {
      return bot.sendMessage(chatId, "❌ Avval qo‘shiq qidiring");
    }

    bot.sendMessage(chatId, "📥 Yuklanmoqda...");

    try {
      const stream = ytdl(video.url, {
        filter: 'audioonly',
        quality: 'highestaudio'
      });

      bot.sendAudio(chatId, stream, {
        caption: `🎶 ${video.title}`
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ Yuklab bo‘lmadi");
    }
  }
});

console.log("🚀 PRO MAX MUSIC BOT ISHGA TAYYOR");