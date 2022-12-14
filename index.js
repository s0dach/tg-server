const { Telegraf } = require("telegraf");
const fs = require("fs");

const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";

const bot = new Telegraf(token);
const message = "clear,";

bot.on("message", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.from.id;
  // Добавляем айдишники пользователей для рассылки
  if (text === "/startlection") {
    bot.telegram.sendMessage(chatId, "Вы вошли в сессию.");
    fs.appendFile(
      "../web-materials/src/lectUsersId.txt",
      ctx.from.id + ",",
      function (err) {
        if (err) return console.log(err);
        console.log(
          "add user id:",
          ctx.from.id,
          "username:",
          ctx.from.username
        );
      }
    );
  }

  // // Завершаем лекцию, очищаем айдишники.
  if (
    text === "/stoplection" &&
    (ctx.from.username === "astrocowboiii" ||
      ctx.from.username === "s0dach" ||
      ctx.from.username === "SadovoyDmitry")
  ) {
    bot.telegram.sendMessage(chatId, "Вы завершили сессию для всех.");
    fs.unlink("../web-materials/src/lectUsersId.txt", function (err) {
      if (err) throw err;
      console.log("all users clear");
    });
    fs.appendFile(
      "../web-materials/src/lectUsersId.txt",
      message,
      function (err) {
        if (err) return console.log(err);
        console.log("okay add clear");
      }
    );
  }
  // Работаем с документами
  // if (ctx.document) {
  //   usersId.forEach((userId) => {
  //     bot.sendDocument(userId, ctx.document.file_id);
  //   });
  // }
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
//           [{ text: "Панель администратора", web-materials_app: { url: web-materialsAppUrl } }],
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

// if (ctx?.web-materials_app_data?.data) {
//   try {
//     const data = JSON.parse(ctx?.web-materials_app_data?.data);
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
