// Часовой пояс
export const TIMEZONE = process.env.TIMEZONE || "Asia/Astana";

// Расписание каждого ученика
// Ключ — Chat ID (строка), значение — объект { день: ['HH:MM', ...] }
// Дни: 0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
export const STUDENT_SCHEDULES = {
  "-4560939511": {
    2: ["19:47", "20:30"],
  },
};
