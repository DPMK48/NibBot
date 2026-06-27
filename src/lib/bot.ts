import { db } from "@/db";
import { conversations, transactions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { extractTransactionData, generateInsights, transcribeAudio, type ExtractedTransaction } from "./openai";
import { downloadMedia } from "./twilio";
import { sql } from "drizzle-orm";

export type BotState =
  | "welcome"
  | "awaiting_name"
  | "awaiting_business_type"
  | "menu"
  | "awaiting_sale"
  | "awaiting_purchase"
  | "confirming_sale"
  | "confirming_purchase"
  | "clarifying";

type Conversation = {
  id: number;
  phone: string;
  language: "English" | "Hausa";
  state: BotState;
  pendingData: ExtractedTransaction | null;
};

const MESSAGES = {
  English: {
    welcome:
      "Welcome to nibBot 👋\n\nYour smart business assistant.\n\nPlease select your language:\n1. English\n2. Hausa",
    askName:
      "What is the name of your business? (For example: Mama Ngozi Store)",
    askBusinessType:
      "What type of business is it? (For example: Provisions, Food, Fabrics, Fruits, or write your own)",
    menu:
      "What would you like to do today?\n\n1. Record Sales\n2. Record Purchases\n3. View Today's Summary\n4. View Insights",
    askSale:
      "Please type what you sold today, or send a voice note.\n\nExample:\n\"I sold 5 bags of rice at 35,000 each and 10 sachets of milk at 200 each.\"",
    askPurchase:
      "Please type what you bought today, or send a voice note.\n\nExample:\n\"I bought 3 bags of beans at 28,000 each.\"",
    invalidOption: "Please reply with a number from 1 to 4.",
    thankYou: "Saved! Your record has been saved.\n\nWhat would you like to do next?\n\n1. Record Sales\n2. Record Purchases\n3. View Today's Summary\n4. View Insights",
    redo: "Let's try again.\n\n1. Record Sales\n2. Record Purchases",
    noRecords: "You haven't recorded any transactions today yet. Send 1 to record a sale or 2 to record a purchase.",
    voiceError: "Sorry, I couldn't understand that voice note. Please try again or type your message.",
  },
  Hausa: {
    welcome:
      "Barka da zuwa nibBot 👋\n\nAbokin kasuwancinku na waya.\n\nDa fatan za a zaɓi harshe:\n1. Turanci\n2. Hausa",
    askName:
      "Menene sunan kasuwancinku? (Misali: Shago Mama Ngozi)",
    askBusinessType:
      "Wane irin kasuwanci ne? (Misali: Shago, Abinci, Yadiddiga, Kayan marmari, ko ku rubuta naku)",
    menu:
      "Me kuke son yi a yau?\n\n1. Shigar da Siyarwa\n2. Shigar da Siya\n3. Duba Taƙaitaccen Yau\n4. Duba Bayanai",
    askSale:
      "Da fatan za a rubuta abinda kuka sayar a yau, ko ku aika saƙon sauti.\n\nMisali:\n\"Na sayar da kwano 5 na shinkafa 35,000 kowanne.\"",
    askPurchase:
      "Da fatan za a rubuta abinda kuka saya a yau, ko ku aika saƙon sauti.\n\nMisali:\n\"Na saya kwano 3 na wake 28,000 kowanne.\"",
    invalidOption: "Da fatan za a amsa da lamba 1 zuwa 4.",
    thankYou:
      "An adana! An adana rubutun ku.\n\nMe kuke so ku yi gaba?\n\n1. Shigar da Siyarwa\n2. Shigar da Siya\n3. Duba Taƙaitaccen Yau\n4. Duba Bayanai",
    redo: "Bari mu sake gwada.\n\n1. Shigar da Siyarwa\n2. Shigar da Siya",
    noRecords:
      "Baku da rubutun kasuwanci na yau ba. Aika 1 don shigar da siyarwa ko 2 don shigar da siya.",
    voiceError:
      "Ban fahimta sautin ba. Da fatan za a sake gwada ko a rubuta saƙo.",
  },
};

export async function getOrCreateConversation(phone: string): Promise<Conversation> {
  const normalizedPhone = phone.replace("whatsapp:", "");
  const existing = await db.select().from(conversations).where(eq(conversations.phone, normalizedPhone));

  if (existing.length > 0) {
    return {
      ...existing[0],
      language: (existing[0].language as "English" | "Hausa") || "English",
      state: (existing[0].state as BotState) || "welcome",
      pendingData: (existing[0].pendingData as ExtractedTransaction | null) || null,
    };
  }

  const created = await db
    .insert(conversations)
    .values({ phone: normalizedPhone, language: "English", state: "welcome" })
    .returning();

  // Also create user record
  await db
    .insert(users)
    .values({ phone: normalizedPhone, language: "English" })
    .onConflictDoNothing({ target: users.phone });

  return {
    ...created[0],
    language: "English",
    state: "welcome",
    pendingData: null,
  };
}

async function updateConversation(
  phone: string,
  updates: Partial<Pick<Conversation, "language" | "state" | "pendingData">>
): Promise<void> {
  const normalizedPhone = phone.replace("whatsapp:", "");
  await db
    .update(conversations)
    .set({
      ...updates,
      lastActivity: new Date(),
    })
    .where(eq(conversations.phone, normalizedPhone));
}

async function updateUserLanguage(phone: string, language: "English" | "Hausa"): Promise<void> {
  const normalizedPhone = phone.replace("whatsapp:", "");
  await db
    .update(users)
    .set({ language })
    .where(eq(users.phone, normalizedPhone));
}

export async function handleIncomingMessage(
  from: string,
  body: string,
  mediaUrl: string | null,
  mediaContentType: string | null
): Promise<string> {
  const conversation = await getOrCreateConversation(from);
  const lang = conversation.language;
  const msg = body.trim();

  // Handle voice notes
  let messageText = msg;
  if (mediaUrl && mediaContentType) {
    try {
      const { buffer, contentType } = await downloadMedia(mediaUrl);
      messageText = await transcribeAudio(buffer, contentType);
    } catch (error) {
      console.error("Voice transcription error:", error);
      return MESSAGES[lang].voiceError;
    }
  }

  // Welcome / language selection
  if (conversation.state === "welcome") {
    if (msg === "1" || msg.toLowerCase() === "english") {
      await updateConversation(from, { language: "English", state: "awaiting_name" });
      await updateUserLanguage(from, "English");
      return MESSAGES.English.askName;
    }
    if (msg === "2" || msg.toLowerCase() === "hausa") {
      await updateConversation(from, { language: "Hausa", state: "awaiting_name" });
      await updateUserLanguage(from, "Hausa");
      return MESSAGES.Hausa.askName;
    }
    return MESSAGES[lang].welcome;
  }

  // Onboarding: Business Name
  if (conversation.state === "awaiting_name") {
    const normalizedPhone = from.replace("whatsapp:", "");
    await db
      .update(users)
      .set({ name: msg })
      .where(eq(users.phone, normalizedPhone));

    await updateConversation(from, { state: "awaiting_business_type" });
    return MESSAGES[lang].askBusinessType;
  }

  // Onboarding: Business Type
  if (conversation.state === "awaiting_business_type") {
    const normalizedPhone = from.replace("whatsapp:", "");
    await db
      .update(users)
      .set({ businessType: msg })
      .where(eq(users.phone, normalizedPhone));

    await updateConversation(from, { state: "menu" });
    return MESSAGES[lang].menu;
  }

  // Main menu
  if (conversation.state === "menu") {
    if (msg === "1") {
      await updateConversation(from, { state: "awaiting_sale" });
      return MESSAGES[lang].askSale;
    }
    if (msg === "2") {
      await updateConversation(from, { state: "awaiting_purchase" });
      return MESSAGES[lang].askPurchase;
    }
    if (msg === "3") {
      return await getTodaysSummary(from, lang);
    }
    if (msg === "4") {
      return await getInsights(from, lang);
    }
    return MESSAGES[lang].invalidOption;
  }

  // Recording sales or purchases
  if (conversation.state === "awaiting_sale" || conversation.state === "awaiting_purchase") {
    const expectedType = conversation.state === "awaiting_sale" ? "SALE" : "PURCHASE";
    const extracted = await extractTransactionData(messageText, lang);
    
    // Default to expected type if not detected
    if (!extracted.type) {
      extracted.type = expectedType;
    }

    if (extracted.is_vague || extracted.missing_fields.length > 0) {
      await updateConversation(from, {
        state: "clarifying",
        pendingData: extracted,
      });
      return (
        extracted.clarification_question ||
        (lang === "Hausa"
          ? "Da fatan za a ba ni ƙarin bayani: me kuka sayar/saya, nawa, kuma nawa kowanne?"
          : "Please give me more details: what did you sell/buy, how many, and how much each?")
      );
    }

    await updateConversation(from, {
      state: conversation.state === "awaiting_sale" ? "confirming_sale" : "confirming_purchase",
      pendingData: extracted,
    });

    return formatConfirmation(extracted, lang);
  }

  // Clarification state
  if (conversation.state === "clarifying" && conversation.pendingData) {
    const mergedText = `${JSON.stringify(conversation.pendingData)} ${messageText}`;
    const extracted = await extractTransactionData(mergedText, lang);
    
    if (!extracted.type && conversation.pendingData.type) {
      extracted.type = conversation.pendingData.type;
    }

    if (extracted.is_vague || extracted.missing_fields.length > 0) {
      await updateConversation(from, { pendingData: extracted });
      return (
        extracted.clarification_question ||
        (lang === "Hausa"
          ? "Ina bukatar ƙarin bayani. Da fatan za a ba cikakken bayani."
          : "I need a bit more information. Please provide the complete details.")
      );
    }

    await updateConversation(from, {
      state: conversation.pendingData.type === "SALE" ? "confirming_sale" : "confirming_purchase",
      pendingData: extracted,
    });

    return formatConfirmation(extracted, lang);
  }

  // Confirmation states
  if (conversation.state === "confirming_sale" || conversation.state === "confirming_purchase") {
    if (msg === "1" || msg.toLowerCase() === "yes") {
      if (conversation.pendingData) {
        await saveTransaction(from, conversation.pendingData, mediaUrl ? "voice" : "text", lang);
      }
      await updateConversation(from, { state: "menu", pendingData: null });
      return MESSAGES[lang].thankYou;
    }
    if (msg === "2" || msg.toLowerCase() === "no") {
      await updateConversation(from, { state: "menu", pendingData: null });
      return MESSAGES[lang].redo;
    }
    return formatConfirmation(conversation.pendingData, lang);
  }

  return MESSAGES[lang].menu;
}

function formatConfirmation(data: ExtractedTransaction | null, lang: "English" | "Hausa"): string {
  if (!data) return MESSAGES[lang].menu;

  const currency = "₦";
  const qty = data.quantity ?? "?";
  const unit = data.unit ?? "";
  const unitPrice = data.unit_price ? `${currency}${Number(data.unit_price).toLocaleString()}` : "?";
  const total = data.total ? `${currency}${Number(data.total).toLocaleString()}` : "?";
  const product = data.product ?? "?";
  const type = data.type ?? "?";

  if (lang === "Hausa") {
    return `Ga abinda na rubuta:\n\nKaya: ${product}\nYawa: ${qty} ${unit}\nFarashi: ${unitPrice} kowanne\nJimla: ${total}\nNau'i: ${type}\n\nShin haka ne?\n1. Eh, adana\n2. A'a, sake yi`;
  }

  return `Here is what I recorded:\n\nProduct: ${product}\nQuantity: ${qty} ${unit}\nPrice: ${unitPrice} each\nTotal: ${total}\nType: ${type}\n\nIs this correct?\n1. Yes, Save it\n2. No, Let me redo it`;
}

async function saveTransaction(
  from: string,
  data: ExtractedTransaction,
  inputType: "voice" | "text",
  lang: "English" | "Hausa"
): Promise<void> {
  const normalizedPhone = from.replace("whatsapp:", "");
  await db.insert(transactions).values({
    userId: normalizedPhone,
    type: data.type || "SALE",
    product: data.product || "Unknown",
    quantity: data.quantity || 1,
    unit: data.unit || "pieces",
    unitPrice: data.unit_price?.toString() || "0",
    total: data.total?.toString() || "0",
    language: lang,
    inputType,
  });
}

async function getTodaysSummary(from: string, lang: "English" | "Hausa"): Promise<string> {
  const normalizedPhone = from.replace("whatsapp:", "");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sales = await db
    .select({ total: sql`COALESCE(SUM(${transactions.total}), 0)` })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.type} = 'SALE' AND ${transactions.date} >= ${today}`
    );

  const purchases = await db
    .select({ total: sql`COALESCE(SUM(${transactions.total}), 0)` })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.type} = 'PURCHASE' AND ${transactions.date} >= ${today}`
    );

  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(transactions)
    .where(sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.date} >= ${today}`);

  const topProduct = await db
    .select({ product: transactions.product, total: sql`SUM(${transactions.total})` })
    .from(transactions)
    .where(sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.type} = 'SALE' AND ${transactions.date} >= ${today}`)
    .groupBy(transactions.product)
    .orderBy(sql`SUM(${transactions.total}) DESC`)
    .limit(1);

  const totalSales = Number(sales[0]?.total || 0);
  const totalPurchases = Number(purchases[0]?.total || 0);
  const profit = totalSales - totalPurchases;
  const transactionCount = Number(countResult[0]?.count || 0);
  const top = topProduct[0]?.product || (lang === "Hausa" ? "Babu" : "None");

  if (transactionCount === 0) {
    return MESSAGES[lang].noRecords;
  }

  if (lang === "Hausa") {
    return `Taƙaitaccen Kasuwancin Yau\n\nJimlar Siyarwa:     ₦${totalSales.toLocaleString()}\nJimlar Sayayya:    ₦${totalPurchases.toLocaleString()}\nRibarku:           ₦${profit.toLocaleString()}\n\nRubutun da aka yi: ${transactionCount}\nFitaccen kayan yau: ${top}\n\nKu ci gaba!`;
  }

  return `Today's Business Summary\n\nTotal Sales:     ₦${totalSales.toLocaleString()}\nTotal Purchases: ₦${totalPurchases.toLocaleString()}\nYour Profit:     ₦${profit.toLocaleString()}\n\nTransactions recorded: ${transactionCount}\nTop product today: ${top}\n\nKeep it up!`;
}

async function getInsights(from: string, lang: "English" | "Hausa"): Promise<string> {
  const normalizedPhone = from.replace("whatsapp:", "");
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sales = await db
    .select({ total: sql`COALESCE(SUM(${transactions.total}), 0)` })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.type} = 'SALE' AND ${transactions.date} >= ${sevenDaysAgo}`
    );

  const purchases = await db
    .select({ total: sql`COALESCE(SUM(${transactions.total}), 0)` })
    .from(transactions)
    .where(
      sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.type} = 'PURCHASE' AND ${transactions.date} >= ${sevenDaysAgo}`
    );

  const topProduct = await db
    .select({ product: transactions.product, total: sql`SUM(${transactions.total})` })
    .from(transactions)
    .where(sql`${transactions.userId} = ${normalizedPhone} AND ${transactions.type} = 'SALE' AND ${transactions.date} >= ${sevenDaysAgo}`)
    .groupBy(transactions.product)
    .orderBy(sql`SUM(${transactions.total}) DESC`)
    .limit(1);

  const summary = `Last 7 days: Sales ₦${Number(sales[0]?.total || 0).toLocaleString()}, Purchases ₦${Number(
    purchases[0]?.total || 0
  ).toLocaleString()}, Top product: ${topProduct[0]?.product || "None"}`;

  // Fetch user profile for tailored insights
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.phone, normalizedPhone))
    .limit(1);

  const businessName = userResult[0]?.name || "My Business";
  const businessType = userResult[0]?.businessType || "retail";

  const insights = await generateInsights(
    normalizedPhone,
    summary,
    lang,
    businessName,
    businessType
  );

  const header = lang === "Hausa" ? "Bayanan Kasuwanci" : "Your Business Insights";
  const footer =
    lang === "Hausa"
      ? "\n\nMe kuke so ku yi gaba?\n1. Shigar da Siyarwa\n2. Shigar da Siya\n3. Duba Taƙaitaccen Yau\n4. Duba Bayanai"
      : "\n\nWhat would you like to do next?\n1. Record Sales\n2. Record Purchases\n3. View Today's Summary\n4. View Insights";

  return `${header}\n\n${insights}${footer}`;
}
