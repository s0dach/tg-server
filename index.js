const { Telegraf } = require("telegraf");
const axios = require("axios");

const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";

const bot = new Telegraf(token);

const uniqueIds = new Set();

bot.on("message", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.from.id;
  if (text === "/start") {
    bot.telegram.sendMessage(chatId, "Добро пожаловать");
    axios.get(`http://95.163.234.208:3500/userId/1`).then((res) => {
      if (res.data.usersId.indexOf(chatId) === -1) {
        res.data.usersId.push(chatId);
        axios.patch(`http://95.163.234.208:3500/userId/1`, {
          usersId: res.data.usersId,
        });
      }
    });
  }

  if (
    text === "/userids" &&
    (ctx.from.username === "astrocowboiii" ||
      ctx.from.username === "s0dach" ||
      ctx.from.username === "SadovoyDmitry")
  ) {
    await axios.get("http://95.163.234.208:3500/userId/1").then((res) => {
      res.data.usersId.forEach((data) =>
        bot.telegram.sendMessage(chatId, `${data}`)
      );
    });
  }
  bot.telegram.sendMessage(
    507304240,
    "https://www.youtube.com/watch?v=iUO3_Ub85I8&ab_channel=Fad3nHD"
  );

  // Добавляем айдишники пользователей для рассылки
  if (text === "/startlection") {
    bot.telegram.sendMessage(chatId, "Выберите лекцию из списка");
    await axios.get("http://95.163.234.208:3500/lists").then((res) => {
      res.data.forEach((data) => {
        bot.telegram.sendMessage(chatId, `Лекция "${data.name}"`, {
          reply_markup: JSON.stringify({
            inline_keyboard: [[{ text: data.name, callback_data: data.id }]],
          }),
        });
      });
    });
  }

  if (text === "/quit") {
    await axios.get("http://95.163.234.208:3500/lists").then((res) => {
      bot.telegram.sendMessage(chatId, "Вы покинули лекцию");
      res.data.forEach((data) => {
        if (data.usersId) {
          axios.patch(`http://95.163.234.208:3500/lists/${data.id}`, {
            usersId: data.usersId.filter((name) => name !== chatId),
          });
        }
      });
    });
  }

  // @deprecated Завершаем лекцию, очищаем айдишники.
  // if (
  //   text === "/stoplection" &&
  //   (ctx.from.username === "astrocowboiii" ||
  //     ctx.from.username === "s0dach" ||
  //     ctx.from.username === "SadovoyDmitry")
  // ) {
  //   bot.telegram.sendMessage(chatId, "Вы завершили сессию для всех.");
  //   usersId = [];
  //   axios.patch("http://95.163.234.208:3500/userId/1", { usersId: usersId });
  //   uniqueIds.clear();
  // }
  // Работаем с документами
  // if (ctx.message.document) {
  //   uniqueIds.forEach((userId) => {
  //     ctx.telegram.sendDocument(userId, ctx.message.document.file_id);
  //   });
  // }
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.update.callback_query.data;
  const chatId = ctx.from.id;
  let usersId = [];
  const uniqueIds = new Set();

  await axios.get(`http://95.163.234.208:3500/lists/${data}`).then((res) => {
    if (res.data.usersId) {
      if (res.data.usersId.indexOf(chatId) === -1) {
        usersId.push(chatId);
        bot.telegram.sendMessage(chatId, `Лекция "${res.data.name}" выбрана`);
        res.data.usersId.push(chatId);
        uniqueIds.add(usersId);
        axios.patch(`http://95.163.234.208:3500/lists/${data}`, {
          usersId: res.data.usersId,
        });
        axios.patch(`http://95.163.234.208:3500/lists/${data}`, {
          usersId: res.data.usersId,
        });
      } else {
        bot.telegram.sendMessage(
          chatId,
          `Вы уже находитесь в лекции "${res.data.name}"`
        );
      }
    }
  });
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
