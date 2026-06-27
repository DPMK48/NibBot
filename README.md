# NibBot

A bilingual WhatsApp-based AI bookkeeping assistant for small business women in Nigeria.

## Features

- 📱 **WhatsApp-first** — no app download needed
- 🎙️ **Voice notes + text** — speak or type naturally
- 🌍 **English + Hausa** — full bilingual support
- 🤖 **AI-powered extraction** — OpenAI GPT-4o extracts products, quantities, and prices
- 📊 **Daily profit summaries** — know your numbers instantly
- 💡 **Business insights** — AI-generated practical advice

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Drizzle ORM + PostgreSQL
- Twilio WhatsApp API
- OpenAI Whisper + GPT-4o

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env` and fill in your credentials:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
OPENAI_API_KEY=your_openai_api_key
```

### 3. Push database schema

```bash
npx drizzle-kit push
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## WhatsApp Bot Setup

### Using Twilio WhatsApp Sandbox (free for testing)

1. **Create a Twilio account** at [twilio.com](https://www.twilio.com/try-twilio)
2. **Get a Twilio phone number** or use the WhatsApp Sandbox
3. **Find your credentials** in the [Twilio Console](https://console.twilio.com):
   - Account SID
   - Auth Token
4. **Configure the WhatsApp Sandbox**:
   - Go to **Messaging > Try it out > Send a WhatsApp message**
   - Copy the Sandbox number (usually `+1 415 523 8886`)
   - Set `TWILIO_PHONE_NUMBER=whatsapp:+14155238886` in `.env`
5. **Set the webhook URL**:
   - In the Sandbox settings, set "When a message comes in" to:
     ```
     https://your-domain.com/api/whatsapp
     ```
   - For local testing, use [ngrok](https://ngrok.com/):
     ```bash
     ngrok http 3000
     ```
     Then use the ngrok HTTPS URL + `/api/whatsapp`
6. **Join the Sandbox**:
   - Send a WhatsApp message to the Sandbox number with the join code shown in your Twilio console
7. **Start chatting**:
   - Send any message to begin
   - Select language: `1` for English or `2` for Hausa

### Using Meta WhatsApp Business API (production)

For production, register a WhatsApp Business account through Meta and connect it to Twilio or use the Meta Business API directly.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/whatsapp` | POST | Twilio webhook for incoming WhatsApp messages |
| `/api/waitlist` | POST | Join the waitlist |
| `/api/stats` | GET | Get live platform stats |
| `/api/health` | GET | Health check |

## How the Bot Works

1. User sends a message to the WhatsApp number
2. Twilio forwards it to `/api/whatsapp`
3. The bot extracts intent and transaction data using OpenAI
4. For voice notes, audio is downloaded from Twilio and transcribed with Whisper
5. Data is saved to PostgreSQL after user confirmation
6. The bot replies with the next prompt, summary, or insight

## Conversation Flow

```
Welcome → Language Selection → Main Menu
                                    ↓
              ┌─────────────┬──────────┬──────────────┬──────────┐
              ↓             ↓          ↓              ↓          ↓
         Record Sale  Record Purchase  Today's Summary  Insights  ...
              ↓             ↓
         Voice/Text   Voice/Text
              ↓             ↓
         Confirmation → Save → Back to Menu
```

## Deployment

Deploy to Vercel, Railway, Render, or any Node.js hosting platform. Make sure your environment variables are set in your hosting dashboard.

## License

MIT
