const TelegramBot = require("node-telegram-bot-api");

const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";
const webAppUrl = "https://coruscating-cactus-88b025.netlify.app/";

const bot = new TelegramBot(token, { polling: true });

const usersId = new Set();

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  // Добавляем айдишники пользователей для рассылки
  if (text === "/startlection") {
    bot.sendMessage(chatId, "Вы вошли в сессию.");
    usersId.add(msg.from.id);
  }

  // Завершаем лекцию, очищаем айдишники.
  if (
    text === "/stoplection" &&
    (msg.from.username === "astrocowboiii" ||
      msg.from.username === "s0dach" ||
      msg.from.username === "SadovoyDmitry")
  ) {
    await bot.sendMessage(chatId, "Вы завершили сессию для всех.");
    usersId.clear();
  }
  //   else {
  //     await bot.sendMessage(chatId, "Нет доступа.");
  //   }

  // Панель админа
  if (
    text === "/startadmin" &&
    (msg.from.username === "astrocowboiii" ||
      msg.from.username === "s0dach" ||
      msg.from.username === "SadovoyDmitry")
  ) {
    await bot.sendMessage(
      chatId,
      "Ниже появится кнопка для перехода в админ раздел.",
      {
        reply_markup: {
          keyboard: [
            [{ text: "Панель администратора", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }
  //   else {
  //     await bot.sendMessage(chatId, "Нет доступа.");
  //   }

  if (msg.document) {
    usersId.forEach((userId) => {
      bot.sendDocument(userId, msg.document.file_id);
    });
  }

  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      const text = data.text;
      console.log(text);
      if (text) {
        //Забираем ссылку с строки
        const links = text.match(/https:\/\/[^\s\Z]+/i);
        const first_link = links?.[0];

        usersId.forEach((userId) => {
          if (first_link !== undefined) {
            // Обрезаем конечный текст с картинкой

            const firstFinishText = text.replace("<img src=" + first_link, "");
            const lastFinishText = firstFinishText.replace(
              ">" + first_link,
              ""
            );
            const finishedText = lastFinishText.replace("<span><span>", "");

            bot.sendPhoto(userId, first_link, {
              caption: finishedText,
              parse_mode: "Markdown",
            });
          }

          if (first_link === undefined) {
            bot.sendMessage(userId, text, {
              parse_mode: "Markdown",
            });
          }
        });
      }
    } catch (e) {
      console.warn(e);
    }
  }
});
