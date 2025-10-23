// // 🧩 Fix necesario para compatibilidad con Baileys
// const crypto = require("crypto");
// global.crypto = crypto;

// // Importaciones
// const baileys = require("@whiskeysockets/baileys");
// const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;
// const express = require("express");
// const qrcode = require("qrcode-terminal");

// const app = express();
// app.use(express.json());

// let sock;

// // 🔹 Inicializa la conexión con WhatsApp
// async function startBot() {
//   const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

//   sock = makeWASocket({
//     printQRInTerminal: true,
//     auth: state,
//   });

//   // Evento de conexión
//   sock.ev.on("connection.update", (update) => {
//     const { connection, lastDisconnect, qr } = update;

//     if (qr) {
//       console.log("📱 Escanea este QR con tu WhatsApp:");
//       qrcode.generate(qr, { small: true });
//     }

//     if (connection === "close") {
//       const shouldReconnect =
//         lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
//       console.log("Conexión cerrada. Reintentando...", shouldReconnect);
//       if (shouldReconnect) startBot();
//     } else if (connection === "open") {
//       console.log("✅ Bot conectado correctamente a WhatsApp");
//     }
//   });

//   sock.ev.on("creds.update", saveCreds);
// }

// // Iniciar bot
// startBot();

// // 🔹 Endpoint para enviar mensajes
// app.post("/send-message", async (req, res) => {
//   try {
//     const { groupId, message } = req.body;

//     if (!groupId || !message) {
//       return res
//         .status(400)
//         .json({ error: "Faltan parámetros: groupId y message son requeridos." });
//     }

//     await sock.sendMessage(groupId, { text: message });
//     res.json({ success: true, message: "Mensaje enviado correctamente ✅" });
//   } catch (error) {
//     console.error("Error enviando mensaje:", error);
//     res.status(500).json({ error: "Error enviando mensaje" });
//   }
// });

// // 🔹 Servidor HTTP
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
// 🧩 Fix necesario para compatibilidad con Baileys
const crypto = require("crypto");
global.crypto = crypto;

// 📦 Importaciones
const baileys = require("@whiskeysockets/baileys");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;
const express = require("express");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(express.json());

let sock;

// 🚀 Inicializa la conexión con WhatsApp
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  // 📡 Eventos de conexión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Escanea este QR con tu WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode || "desconocido";
      console.log("❌ Conexión cerrada. Motivo:", reason);

      const shouldReconnect =
        reason !== DisconnectReason.loggedOut && reason !== 401;

      if (shouldReconnect) {
        console.log("🔄 Reintentando conexión...");
        startBot();
      } else {
        console.log("⚠️ Debes volver a escanear el código QR.");
      }
    } else if (connection === "open") {
      console.log("✅ Bot conectado correctamente a WhatsApp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

// 🟢 Iniciar bot
startBot();

// 💬 Endpoint para enviar mensajes
app.post("/send-message", async (req, res) => {
  try {
    const { groupId, message } = req.body;

    if (!groupId || !message) {
      return res.status(400).json({
        error: "Faltan parámetros: groupId y message son requeridos.",
      });
    }

    if (!sock?.user) {
      return res.status(503).json({
        error: "El bot aún no está conectado a WhatsApp.",
      });
    }

    await sock.sendMessage(groupId, { text: message });
    res.json({ success: true, message: "Mensaje enviado correctamente ✅" });
  } catch (error) {
    console.error("🚫 Error enviando mensaje:", error);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
});

// 🌍 Servidor HTTP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
