import bot from "../lib/bot.js";
import { STUDENT_SCHEDULES, TIMEZONE } from "../config/schedule.js";

function getLocalTime(tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    day: dayMap[get("weekday")],
    totalMinutes: parseInt(get("hour")) * 60 + parseInt(get("minute")),
  };
}

function buildMessage(minutesBefore, lessonTime) {
  if (minutesBefore === 60) return `📚 Через 1 час урок (в ${lessonTime}). Готовься!`;
  if (minutesBefore === 10) return `⏰ Через 10 минут урок (в ${lessonTime}). Пора подключаться!`;
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!process.env.CRON_SECRET_TOKEN || token !== process.env.CRON_SECRET_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { day, totalMinutes } = getLocalTime(TIMEZONE);

  const sends = [];

  // Для каждого ученика проверяем его личное расписание
  for (const [chatId, weekSchedule] of Object.entries(STUDENT_SCHEDULES)) {
    const todayLessons = weekSchedule[day] ?? [];

    for (const timeStr of todayLessons) {
      const [lh, lm] = timeStr.split(":").map(Number);
      const diff = lh * 60 + lm - totalMinutes;

      if (diff === 60 || diff === 10) {
        const message = buildMessage(diff, timeStr);
        if (message) sends.push(bot.telegram.sendMessage(chatId, message));
      }
    }
  }

  if (sends.length === 0) {
    return res.status(200).json({ ok: true, sent: 0, message: "No reminders right now" });
  }

  const results = await Promise.allSettled(sends);
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return res.status(200).json({ ok: true, sent: succeeded, failed });
}
