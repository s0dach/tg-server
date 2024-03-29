const { Telegraf } = require("telegraf");
const axios = require("axios");

const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";

const bot = new Telegraf(token);

const uniqueIds = new Set();

bot.on("message", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.from.id;
  if (text === "/start") {
    bot.telegram.sendMessage(
      chatId,
      "Добро пожаловать. Выберите раздел 'Инструкция по использованию бота' в меню, чтобы узнать подробности."
    );
    // axios.get(`http://95.163.234.208:3500/userId/1`).then((res) => {
    //   if (res.data.usersId.indexOf(chatId) === -1) {
    //     res.data.usersId.push(chatId);
    //     axios.patch(`http://95.163.234.208:3500/userId/1`, {
    //       usersId: res.data.usersId,
    //     });
    //   }
    // });
  }

  // if (
  //   text === "/userids" &&
  //   (ctx.from.username === "astrocowboiii" ||
  //     ctx.from.username === "s0dach" ||
  //     ctx.from.username === "SadovoyDmitry")
  // ) {
  //   await axios.get("http://95.163.234.208:3500/userId/1").then((res) => {
  //     res.data.usersId.forEach((data) =>
  //       bot.telegram.sendMessage(chatId, `${data}`)
  //     );
  //   });
  // }

  if (text === "/faq") {
    bot.telegram.sendMessage(chatId, {
      text: "*Инструкция к боту*.\n\nНажмите на кнопку *Войти в сессию* в левом нижнем меню, либо введите команду `/startlection`, чтобы выбрать лекцию\n\nДля выхода с лекции используйте команду `/quit`, либо нажмите на кнопку *Покинуть сессию* для того чтобы материалы с лекции не приходили.",
      parse_mode: "Markdown",
    });
  }

  // Добавляем айдишники пользователей для рассылки
  if (text === "/startlection") {
    await axios
      .get("http://95.163.234.208:7000/api/list/getlist")
      .then(async (res) => {
        let inlineKeyboard = [];
        res.data.map((data) => {
          inlineKeyboard.push([{ text: data.name, callback_data: data._id }]);
        });
        await bot.telegram.sendMessage(chatId, "Выберите лекцию из списка", {
          reply_markup: JSON.stringify({
            inline_keyboard: inlineKeyboard,
          }),
        });
        inlineKeyboard.length = 0;
      });
  }

  if (text === "/quit") {
    await axios
      .get("http://95.163.234.208:7000/api/list/getlist")
      .then((res) => {
        bot.telegram.sendMessage(chatId, "Вы покинули лекцию");
        res.data.forEach((data) => {
          if (data.usersId) {
            axios.patch(
              `http://95.163.234.208:7000/api/list/updatelistusers/${data._id}`,
              {
                usersId: data.usersId.filter((name) => name !== chatId),
                id: data._id,
              }
            );
          }
        });
      });
  }
});

bot.on("poll_answer", async (ctx) => {
  let array = [];
  axios
    .get("http://95.163.234.208:7000/api/lection/getmaterials")
    .then((res) => {
      {
        res.data.forEach((task) => {
          if (task.pollId?.includes(ctx.pollAnswer.poll_id)) {
            if (task.optionsReply.length !== 0) {
              task.optionsReply.push(ctx.pollAnswer.option_ids[0]);
              axios.patch(
                "http://95.163.234.208:7000/api/lection/updatematerial",
                {
                  ...task,
                  optionsReply: task.optionsReply,
                }
              );
            } else {
              axios.patch(
                "http://95.163.234.208:7000/api/lection/updatematerial",
                {
                  ...task,
                  optionsReply: [ctx.pollAnswer.option_ids[0]],
                }
              );
            }
          }
        });
      }
    });
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.update.callback_query.data;
  const chatId = ctx.from.id;
  let usersId = [];
  const uniqueIds = new Set();
  await axios
    .get(`http://95.163.234.208:7000/api/list/getlist/${data}`)
    .then(async (res) => {
      if (res.data.usersId.indexOf(chatId) === -1) {
        usersId.push(chatId);
        await bot.telegram.sendMessage(
          chatId,
          `Лекция "${res.data.name}" выбрана`
        );
        await res.data.usersId.push(chatId);
        uniqueIds.add(usersId);
        await axios.patch(
          `http://95.163.234.208:7000/api/list/updatelistusers/${data}`,
          {
            usersId: res.data.usersId,
            id: data,
          }
        );
      } else {
        bot.telegram.sendMessage(
          chatId,
          `Вы уже находитесь в лекции "${res.data.name}"`
        );
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
