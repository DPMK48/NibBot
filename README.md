# NibBot

A bilingual WhatsApp-based AI bookkeeping assistant for small business women in Nigeria.

## Features

- 📱 **WhatsApp-first** — no app download needed
- 🎙️ **Voice notes + text** — speak or type naturally
- 🌍 **English + Hausa** — full bilingual support
- 🤖 **AI-powered extraction** — OpenAI GPT-4o-mini extracts products, quantities, prices, and totals
- 🔄 **Smart Clarification** — automatically asks clarifying questions in the selected language if details are missing or vague
- 📊 **Daily profit summaries** — know your numbers instantly
- 💡 **Business insights** — AI-generated practical business advice tailored to the business type

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Drizzle ORM + PostgreSQL (Supabase)
- Twilio WhatsApp API
- OpenAI Whisper + GPT-4o-mini

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env` and fill in your credentials:

```bash
# --- Database ---
DATABASE_URL=postgresql://...

# --- Twilio (WhatsApp) ---
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# --- OpenAI ---
OPENAI_API_KEY=your_openai_api_key

# --- Public (exposed to the browser) ---
NEXT_PUBLIC_WHATSAPP_NUMBER=14155238886
```

### 3. Push database schema

Deploy the Drizzle schema to your PostgreSQL database:

```bash
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

The landing page will be available at `http://localhost:3000`.

---

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
   - Set `TWILIO_PHONE_NUMBER=whatsapp:+14155238886` and `NEXT_PUBLIC_WHATSAPP_NUMBER=14155238886` in `.env`
5. **Set the webhook URL**:
   - In the Sandbox settings, set "When a message comes in" to:
     ```
     https://your-domain.com/api/whatsapp
     ```
   - For local testing, use [ngrok](https://ngrok.com/):
     ```bash
     ngrok http 3000
     ```
     Then configure the webhook URL with the ngrok HTTPS URL + `/api/whatsapp`. Note that signature check is bypassed in local `development` mode if the header is missing.
6. **Join the Sandbox**:
   - Send a WhatsApp message to the Sandbox number with the join code shown in your Twilio console.
7. **Start chatting**:
   - Send any message (e.g. "hello") to begin the onboarding flow.

---

## How the Bot Works Under the Hood

1. **Webhook Payload Received**: The user sends a WhatsApp message or audio note. Twilio forwards it to `/api/whatsapp`.
2. **Audio Transcription**: If it's an audio note, the bot downloads the media from Twilio and transcribes it using **OpenAI Whisper**.
3. **AI Information Extraction**: The message text is sent to **OpenAI GPT-4o-mini** with system instructions to extract the transaction details (Product, Quantity, Unit, Price, Total, and Transaction Type).
4. **Clarification**: If any fields are vague or missing, the bot generates a targeted clarifying question (in English or Hausa) and pauses for the user's input.
5. **Confirmation**: Once details are complete, the bot presents the extracted details and asks for verification.
6. **Data Storage**: Upon user confirmation, the transaction is saved to PostgreSQL using **Drizzle ORM**.

---

## Conversation Flow

```
   Welcome (Hi/Hello)
          │
          ▼
  Language Selection (1. English / 2. Hausa)
          │
          ▼
  Onboarding: Business Name (e.g., Mama Aisha Store)
          │
          ▼
  Onboarding: Business Type (e.g., Provisions)
          │
          ▼
  Main Menu
   ├── [1] Record Sales ──────┐
   ├── [2] Record Purchases ──┼──► Voice/Text Input
   │                          │          │
   │                          │          ▼
   │                          │    AI Extraction (GPT-4o-mini)
   │                          │          │
   │                          │          ├─► [Vague/Missing] ──► Clarification Loop
   │                          │          │                            │
   │                          │          ▼                            ▼
   │                          └────► Confirmation (1. Yes / 2. No) ◄──┘
   │                                     │
   │                                     ├─► [Yes] ──► Save to DB & Menu
   │                                     └─► [No] ───► Discard & Menu
   │
   ├── [3] Today's Summary (Aggregates daily sales, purchases, and profit)
   └── [4] View Insights (AI-generated advice based on recent transactions)
```

## Database Management Scripts

- `npm run db:push` — Push the local schema directly to the database.
- `npm run db:studio` — Open the Drizzle Studio GUI to inspect tables.
- `npm run db:generate` — Generate SQL migrations.

## License

MIT
