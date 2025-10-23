import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import express from "express";
import qrcode from "qrcode-terminal";

const app = express();
app.use(express.json());

let sock;

// 🔹 Inicializa la conexión con WhatsApp
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  // Muestra el QR en consola
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("Escanea este QR con tu WhatsApp 📱");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexión cerrada. Reintentando...", shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot conectado correctamente a WhatsApp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

await startBot();

// 🔹 Ruta para enviar mensajes
app.post("/send-message", async (req, res) => {
  try {
    const { groupId, message } = req.body;

    if (!groupId || !message) {
      return res.status(400).json({ error: "Faltan parámetros: groupId y message son requeridos." });
    }

    await sock.sendMessage(groupId, { text: message });
    res.json({ success: true, message: "Mensaje enviado correctamente ✅" });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
});

// 🔹 Servidor HTTP (para Koyeb)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
