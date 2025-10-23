# WhatsApp Bot con Baileys + Express (Deploy en Koyeb)

Este bot permite enviar mensajes de texto a grupos de WhatsApp usando Baileys.

## 🚀 Cómo usar

1. Clona el repositorio o sube este proyecto a tu GitHub.
2. En Koyeb, crea una nueva app desde tu repositorio.
3. Durante el primer despliegue, abre los logs en Koyeb.
4. Verás un **QR en consola** → escanéalo con tu WhatsApp (solo una vez).
5. Luego, podrás enviar mensajes con una llamada HTTP:

### Ejemplo con `curl`
```bash
curl -X POST https://TU-APP.koyeb.app/send-message \
-H "Content-Type: application/json" \
-d '{"groupId": "1203630XXXXXXXXX@g.us", "message": "Hola grupo 👋"}'
