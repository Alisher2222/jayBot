import bot from "../lib/bot.js";

// Vercel auto-parses JSON bodies; bot.handleUpdate needs a plain object
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Pass the already-parsed body; Telegraf will call res.end() internally
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error("Webhook error:", err);
    if (!res.writableEnded) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
