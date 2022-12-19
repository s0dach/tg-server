const { Telegraf } = require("telegraf");
const axios = require("axios");

const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";

let usersId = [];
let lectionName = [];
const uniqueIds = new Set();
const bot = new Telegraf(token);

bot.on("message", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.from.id;

  // Добавляем айдишники пользователей для рассылки
  if (text === "/startlection") {
    await axios.get("http://95.163.234.208:3500/lists").then((res) => {
      res.data.forEach((data) => {
        lectionName.push(data.name);
      });
    });
    let inlineMessageRatingKeyboard = [];
    let uniqueNameLection = new Set(lectionName);

    let i = 1;
    uniqueNameLection.forEach((name) => {
      inlineMessageRatingKeyboard.push([
        { text: name + ` [${i}]`, callback_data: i },
      ]);
      i++;
    });

    bot.telegram.sendMessage(chatId, "Вы вошли в сессию, выберите лекцию.", {
      reply_markup: JSON.stringify({
        inline_keyboard: inlineMessageRatingKeyboard,
      }),
    });
  }

  // Выход с лекции
  if (text === "/quit") {
    await axios.get("http://95.163.234.208:3500/userId/1").then((res) => {
      usersId = res.data.usersId.filter(
        (value) => value.slice(0, -3) !== `${chatId}`
      );
    });
    await axios.patch("http://95.163.234.208:3500/userId/1", {
      usersId: usersId,
    });
    await bot.telegram.sendMessage(chatId, "Вы покинули лекцию");
  }

  // @deprecated Завершаем лекцию, очищаем айдишники.
  if (
    text === "/stoplection" &&
    (ctx.from.username === "astrocowboiii" ||
      ctx.from.username === "s0dach" ||
      ctx.from.username === "SadovoyDmitry")
  ) {
    bot.telegram.sendMessage(chatId, "Вы завершили сессию для всех.");
    usersId = [];
    axios.patch("http://95.163.234.208:3500/userId/1", { usersId: usersId });
    uniqueIds.clear();
  }
  // Работаем с документами
  if (ctx.message.document) {
    uniqueIds.forEach((userId) => {
      ctx.telegram.sendDocument(userId, ctx.message.document.file_id);
    });
  }
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.update.callback_query.data;
  const chatId = ctx.from.id;
  await bot.telegram.sendMessage(
    chatId,
    `Лекция под номером [${data}] выбрана`
  );

  await axios.get("http://95.163.234.208:3500/userId").then((res) => {
    usersId = res.data[0].usersId;
    usersId.push(chatId + `, ${data}`);
  });
  uniqueIds.add(chatId);
  console.log(usersId);
  axios.patch("http://95.163.234.208:3500/userId/1", { usersId: usersId });
});
bot.launch();

// //   else {
// //     await bot.sendMessage(chatId, "Нет доступа.");
// //   }

// // Панель админа
// if (
//   text === "/startadmin" &&
//   (ctx.from.username === "astrocowboiii" ||
//     ctx.from.username === "s0dach" ||
//     ctx.from.username === "SadovoyDmitry")
// ) {
//   await bot.sendMessage(
//     chatId,
//     "Ниже появится кнопка для перехода в админ раздел.",
//     {
//       reply_markup: {
//         keyboard: [
//           [{ text: "Панель администратора", web_app: { url: webAppUrl } }],
//         ],
//       },
//     }
//   );
// }
// //   else {
// //     await bot.sendMessage(chatId, "Нет доступа.");
// //   }

// if (ctx.document) {
//   usersId.forEach((userId) => {
//     bot.sendDocument(userId, ctx.document.file_id);
//   });
// }

// if (ctx?.web_app_data?.data) {
//   try {
//     const data = JSON.parse(ctx?.web_app_data?.data);
//     const text = data.text;
//     console.log(text);
//     if (text) {
//       //Забираем ссылку с строки
// const links = text.match(/https:\/\/[^\s\Z]+/i);
//       const first_link = links?.[0];

//       usersId.forEach((userId) => {
//         if (first_link !== undefined) {
//           // Обрезаем конечный текст с картинкой

//           const firstFinishText = text.replace("<img src=" + first_link, "");
//           const lastFinishText = firstFinishText.replace(
//             ">" + first_link,
//             ""
//           );
//           const finishedText = lastFinishText.replace("<span><span>", "");

//           bot.sendPhoto(userId, first_link, {
//             caption: finishedText,
//             parse_mode: "Markdown",
//           });
//         }

//         if (first_link === undefined) {
//           bot.sendMessage(userId, text, {
//             parse_mode: "Markdown",
//           });
//         }
//       });
//     }
//   } catch (e) {
//     console.warn(e);
//   }
// }
