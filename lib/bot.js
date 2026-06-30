import { Telegraf } from "telegraf";
import { STUDENT_SCHEDULES, TIMEZONE } from "../config/schedule.js";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN environment variable is required");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

bot.start((ctx) => {
  const chatId = String(ctx.chat.id);
  const hasSchedule = Boolean(STUDENT_SCHEDULES[chatId]);

  return ctx.reply(
    `👋 Привет!\n\nТвой Chat ID: \`${chatId}\`\n\n` +
    (hasSchedule
      ? "✅ Ты уже есть в системе. Напоминания придут по расписанию."
      : "❌ Тебя ещё нет в расписании. Отправь этот ID преподавателю."),
    { parse_mode: "Markdown" }
  );
});

bot.command("schedule", (ctx) => {
  const chatId = String(ctx.chat.id);
  const schedule = STUDENT_SCHEDULES[chatId];

  if (!schedule) {
    return ctx.reply("У тебя пока нет расписания. Обратись к преподавателю.");
  }

  const lines = Object.entries(schedule).map(([day, times]) => {
    return `${DAY_NAMES[day]}: ${times.join(", ")}`;
  });

  return ctx.reply(
    `📅 Твоё расписание (часовой пояс: ${TIMEZONE}):\n\n${lines.join("\n")}\n\nНапоминания: за 1 час и за 10 минут.`
  );
});

bot.help((ctx) => {
  return ctx.reply(
    "/start — узнать свой Chat ID\n" +
    "/schedule — моё расписание"
  );
});

export default bot;
