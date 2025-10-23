
// const crypto = require("crypto");
// global.crypto = crypto;

// // 📦 Importaciones
// const baileys = require("@whiskeysockets/baileys");
// const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;
// const express = require("express");
// const qrcode = require("qrcode-terminal");

// const app = express();
// app.use(express.json());

// let sock;

// // 🚀 Inicializa la conexión con WhatsApp
// async function startBot() {
//   const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

//   sock = makeWASocket({
//     printQRInTerminal: true,
//     auth: state,
//     syncFullHistory: false,
//     markOnlineOnConnect: false,
//   });

//   // 📡 Eventos de conexión
//   sock.ev.on("connection.update", (update) => {
//     const { connection, lastDisconnect, qr } = update;

//     if (qr) {
//       console.log("📱 Escanea este QR con tu WhatsApp:");
//       qrcode.generate(qr, { small: true });
//     }

//     if (connection === "close") {
//       const reason =
//         lastDisconnect?.error?.output?.statusCode || "desconocido";
//       console.log("❌ Conexión cerrada. Motivo:", reason);

//       const shouldReconnect =
//         reason !== DisconnectReason.loggedOut && reason !== 401;

//       if (shouldReconnect) {
//         console.log("🔄 Reintentando conexión...");
//         startBot();
//       } else {
//         console.log("⚠️ Debes volver a escanear el código QR.");
//       }
//     } else if (connection === "open") {
//       console.log("✅ Bot conectado correctamente a WhatsApp");
//     }
//   });

//   sock.ev.on("creds.update", saveCreds);
// }

// // 🟢 Iniciar bot
// startBot();

// // 💬 Endpoint para enviar mensajes
// app.post("/send-message", async (req, res) => {
//   try {
//     const { groupId, message } = req.body;

//     if (!groupId || !message) {
//       return res.status(400).json({
//         error: "Faltan parámetros: groupId y message son requeridos.",
//       });
//     }

//     if (!sock?.user) {
//       return res.status(503).json({
//         error: "El bot aún no está conectado a WhatsApp.",
//       });
//     }

//     await sock.sendMessage(groupId, { text: message });
//     res.json({ success: true, message: "Mensaje enviado correctamente ✅" });
//   } catch (error) {
//     console.error("🚫 Error enviando mensaje:", error);
//     res.status(500).json({ error: "Error enviando mensaje" });
//   }
// });

// // 🌍 Servidor HTTP
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
const crypto = require("crypto");
global.crypto = crypto;

// 📦 Importaciones
const baileys = require("@whiskeysockets/baileys");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;
const express = require("express");
const qrcode = require("qrcode-terminal");
const axios = require("axios"); // <-- agregado para descargar imágenes desde URL

const app = express();
app.use(express.json({ limit: "10mb" })); // <-- permite imágenes en base64

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

// 🖼️ NUEVO: Endpoint para enviar imágenes (desde URL o base64)
app.post("/send-image", async (req, res) => {
  try {
    const { groupId, caption, imageUrl, imageBase64 } = req.body;

    if (!groupId || (!imageUrl && !imageBase64)) {
      return res.status(400).json({
        error: "Faltan parámetros: groupId y imageUrl o imageBase64 son requeridos.",
      });
    }

    if (!sock?.user) {
      return res.status(503).json({
        error: "El bot aún no está conectado a WhatsApp.",
      });
    }

    let buffer;
    if (imageUrl) {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data, "binary");
    } else if (imageBase64) {
      buffer = Buffer.from(imageBase64, "base64");
    }

    await sock.sendMessage(groupId, {
      image: buffer,
      caption: caption || "",
    });

    res.json({ success: true, message: "Imagen enviada correctamente ✅" });
  } catch (error) {
    console.error("🚫 Error enviando imagen:", error);
    res.status(500).json({ error: "Error enviando imagen" });
  }
});

// 🌍 Servidor HTTP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
