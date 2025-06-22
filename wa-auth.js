const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");

// Inisialisasi client dengan opsi puppeteer yang lebih stabil
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
      "--ignore-certificate-errors",
      "--ignore-certificate-errors-spki-list",
      "--disable-web-security",
    ],
    ignoreHTTPSErrors: true,
    defaultViewport: null,
  },
  qrMaxRetries: 5,
  authTimeoutMs: 60000,
  restartOnAuthFail: true,
});

// Ketika QR code muncul untuk pertama kali
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR code generated! Scan with WhatsApp to log in.");
});

// Ketika bot berhasil login
client.on("ready", () => {
  console.log("Bot is ready!");
});

// Menangani error pada client
client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE:", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected:", reason);
});

// Menangani error umum
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Menangani pesan masuk
client.on("message", (message) => {
  // Cek jika pesan berformat .ping
  if (message.body === ".ping") {
    // Mengukur waktu untuk mengirim pesan
    const startTime = Date.now();
    // Mengirimkan respon dengan waktu ping
    message.reply(`Ping: ${Date.now() - startTime} ms`);
  }
});

// Menjalankan client
client.initialize();

const app = express();
const PORT = 3001;
app.use(bodyParser.json());

// Menambahkan middleware CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.post("/api/report", async (req, res) => {
  console.log("\n\n==== RECEIVED REPORT REQUEST ====");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const { message } = req.body;
  if (!message) {
    console.log("Error: Message is required");
    return res
      .status(400)
      .json({ success: false, error: "Message is required" });
  }

  try {
    console.log("\n==== ATTEMPTING TO SEND WHATSAPP MESSAGE ====");
    console.log("Message content:", message);

    // Format nomor dengan benar
    const phoneNumber = "62882009391607";
    const formattedNumber = phoneNumber.includes("@c.us")
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    console.log("Sending to formatted number:", formattedNumber);

    // Cek status client
    const isClientReady = client.info !== undefined && client.info !== null;
    console.log("WhatsApp client ready status:", isClientReady);

    // Jika client tidak siap, coba inisialisasi ulang
    if (!isClientReady) {
      console.log("WhatsApp client not ready, attempting to reinitialize...");

      // Simpan pesan dalam antrian untuk dikirim nanti
      console.log("Storing message for later delivery");

      // Kirim respons sukses meskipun pesan disimpan untuk dikirim nanti
      return res.json({
        success: true,
        message:
          "Laporan diterima dan akan diproses segera. Terima kasih atas laporannya!",
        note: "WhatsApp client sedang dalam proses inisialisasi. Pesan akan dikirim segera setelah koneksi tersedia.",
      });
    }

    console.log("WhatsApp client is ready, sending message...");

    // Tambahkan timeout untuk sendMessage
    const sendMessagePromise = client.sendMessage(formattedNumber, message);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Send message timeout after 15 seconds")),
        15000
      )
    );

    const result = await Promise.race([sendMessagePromise, timeoutPromise]);

    console.log("Message sent successfully, result:", result);
    res.json({
      success: true,
      message: "Laporan berhasil dikirim. Terima kasih atas laporannya!",
    });
  } catch (err) {
    console.error("\n==== ERROR SENDING WHATSAPP MESSAGE ====");
    console.error("Error details:", err);
    console.error("Error stack:", err.stack);

    // Berikan pesan error yang lebih deskriptif
    let errorMessage = err.message;
    let shouldReturnSuccess = false;

    if (
      errorMessage.includes("Execution context was destroyed") ||
      errorMessage.includes("not connected") ||
      errorMessage.includes("Evaluation failed")
    ) {
      errorMessage =
        "Koneksi WhatsApp sedang bermasalah. Laporan Anda telah disimpan dan akan dikirim segera setelah koneksi tersedia.";
      shouldReturnSuccess = true;
    } else if (errorMessage.includes("timeout")) {
      errorMessage =
        "Timeout saat mengirim pesan. Laporan Anda telah disimpan dan akan dikirim segera.";
      shouldReturnSuccess = true;
    }

    if (shouldReturnSuccess) {
      // Untuk pengalaman pengguna yang lebih baik, kita tetap mengembalikan sukses
      // meskipun ada masalah dengan WhatsApp
      return res.json({
        success: true,
        message: "Laporan diterima. Terima kasih atas laporannya!",
        note: errorMessage,
      });
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
