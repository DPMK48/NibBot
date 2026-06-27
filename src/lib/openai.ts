import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export type ExtractedTransaction = {
  type: "SALE" | "PURCHASE" | null;
  product: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  total: number | null;
  missing_fields: string[];
  is_vague: boolean;
  clarification_question: string | null;
};

export async function transcribeAudio(audioBuffer: Buffer, contentType: string): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const extension = contentType.includes("ogg") ? "ogg" : contentType.includes("mp3") ? "mp3" : "m4a";
  const file = new File([audioBuffer as unknown as BlobPart], `audio.${extension}`, { type: contentType });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "en", // Whisper auto-detects; this is a fallback hint
  });

  return transcription.text;
}

export async function extractTransactionData(
  message: string,
  language: "English" | "Hausa" = "English"
): Promise<ExtractedTransaction> {
  if (!openai) {
    // Fallback rule-based extraction when OpenAI is unavailable
    return ruleBasedExtraction(message);
  }

  const prompt = `You are a transaction extraction assistant for a Nigerian small business bookkeeping app called NibBot.

Extract the transaction details from this message. The user may speak English, Hausa, Pidgin, or a mix. Translate everything to English for storage.

Message: """${message}"""

Rules:
- Determine if this is a SALE or PURCHASE. If unclear, infer from words like "sold", "buy", "purchase", "sayar", "saya".
- Extract product name (singular, capitalized).
- Extract quantity as a number.
- Extract unit (bags, crates, sachets, loaves, pieces, etc.).
- Extract unit_price (price per unit). If only total is given, calculate unit_price = total / quantity.
- Extract total (total amount). If only unit price is given, calculate total = unit_price * quantity.
- If information is missing or vague, set is_vague to true and provide a short clarification_question in ${language}.

Respond ONLY with a JSON object in this exact format:
{
  "type": "SALE" | "PURCHASE" | null,
  "product": string | null,
  "quantity": number | null,
  "unit": string | null,
  "unit_price": number | null,
  "total": number | null,
  "missing_fields": string[],
  "is_vague": boolean,
  "clarification_question": string | null
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // cost-effective for hackathons; upgrade to gpt-4o if needed
    messages: [
      { role: "system", content: "You extract structured transaction data from informal business messages. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content) as ExtractedTransaction;
  return parsed;
}

function ruleBasedExtraction(message: string): ExtractedTransaction {
  const lower = message.toLowerCase();
  
  const isSale = /\b(sold|sell|sale|sayar|siyar|sayarwa)\b/.test(lower);
  const isPurchase = /\b(bought|buy|purchase|saya|sayi|siya)\b/.test(lower);
  
  const type = isSale ? "SALE" : isPurchase ? "PURCHASE" : null;
  
  const quantityMatch = lower.match(/(\d+)\s*(bags?|crates?|sachets?|loaves?|pieces?|packs?|cartons?|bottles?|units?)/);
  const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : null;
  const unit = quantityMatch ? quantityMatch[2] : null;
  
  const priceMatches = [...lower.matchAll(/(?:₦|naira|n)\s*(\d[\d,]*(?:\.\d{2})?)/g)];
  const amounts = priceMatches.map(m => parseFloat(m[1].replace(/,/g, "")));
  
  let unit_price: number | null = null;
  let total: number | null = null;
  
  if (amounts.length === 1 && quantity) {
    total = amounts[0];
    unit_price = quantity > 0 ? total / quantity : null;
  } else if (amounts.length >= 2) {
    unit_price = amounts[0];
    total = amounts[1];
  }
  
  const productMatch = lower.match(/(?:sold|bought|buy|purchase|sayar|saya)\s+(\w+(?:\s+\w+){0,3})/);
  const product = productMatch ? productMatch[1].trim() : null;
  
  const missingFields: string[] = [];
  if (!type) missingFields.push("type");
  if (!product) missingFields.push("product");
  if (!quantity) missingFields.push("quantity");
  if (!unit_price) missingFields.push("unit_price");
  if (!total) missingFields.push("total");
  
  const isVague = missingFields.length > 0;
  const clarificationQuestion = isVague
    ? "Please tell me: what did you sell/buy, how many, and for how much?"
    : null;
  
  return {
    type,
    product,
    quantity,
    unit,
    unit_price,
    total,
    missing_fields: missingFields,
    is_vague: isVague,
    clarification_question: clarificationQuestion,
  };
}

export async function generateInsights(
  userId: string,
  transactionsSummary: string,
  language: "English" | "Hausa" = "English",
  businessName: string = "My Business",
  businessType: string = "retail"
): Promise<string> {
  if (!openai) {
    const isHausa = language === "Hausa";
    const typeLower = businessType.toLowerCase();
    
    if (typeLower.includes("provision") || typeLower.includes("shop") || typeLower.includes("store")) {
      return isHausa
        ? "1. Kula da kayan da mutane suka fi saya kuma ka tabbatar ba ka rasa su a shago.\n2. Tattauna farashin sari da dillalai don samun riba mai kyau.\n3. Raba kudin shago da kudin gida domin kasuwancinka ya bunkasa."
        : "1. Monitor your fastest-moving items and keep them in stock.\n2. Negotiate bulk pricing with suppliers to increase your profit margin.\n3. Separate business money from personal expenses to keep the store healthy.";
    }
    if (typeLower.includes("food") || typeLower.includes("stall") || typeLower.includes("restaurant") || typeLower.includes("abinci")) {
      return isHausa
        ? "1. Rage barnar abinci ta hanyar dafa daidai adadin da kake sayarwa a rana.\n2. Tabbatar da tsafta koyaushe don jawo hankalin sabbin abokan ciniki.\n3. Kula da farashin kayan abinci a kasuwa don daidaita farashin abincinka."
        : "1. Reduce food waste by preparing only what you expect to sell daily.\n2. Keep high hygiene standards to attract and retain customers.\n3. Track food ingredient prices closely to keep your meal prices profitable.";
    }
    if (typeLower.includes("fabric") || typeLower.includes("cloth") || typeLower.includes("dinki") || typeLower.includes("fashion")) {
      return isHausa
        ? "1. Tattara bayanan abokan ciniki don tuntuɓar su lokacin da sabbin yadi suka zo.\n2. Bayar da rangwame ga masu siyan kaya da yawa don ƙara yawan siyarwa.\n3. Kula da yayi ko launuka da mutane suka fi buƙata a wannan lokacin."
        : "1. Save customer contacts and notify them when new fabrics or styles arrive.\n2. Offer packages or small discounts for bulk purchases to speed up sales.\n3. Track seasonal colors and trends that are highly requested right now.";
    }
    if (typeLower.includes("vegetable") || typeLower.includes("fruit") || typeLower.includes("marmari") || typeLower.includes("ganye")) {
      return isHausa
        ? "1. Sayi kayan marmari kaɗan-kaɗan akai-akai don hana su lalacewa kafin siyarwa.\n2. Zuba ruwa akai-akai a jikin ganye don ya kasance da sabo da kyau.\n3. Rage farashin kayan da suka kusa lalacewa da yamma don dawo da kuɗin tsarinka."
        : "1. Purchase fresh stock in smaller, frequent batches to prevent decay.\n2. Sprinkle water on leafy greens regularly to keep them fresh and appealing.\n3. Discount older stock in the late afternoon to recover costs before they spoil.";
    }
    
    // Default fallback
    return isHausa
      ? "1. Ka ci gaba da rubuta siyarwa da siyayyarka kowace rana.\n2. Kula da kayan da mutane suka fi saya don ka fi mayar da hankali a kansu.\n3. Kwatanta siyarwar kowane mako don sanin ci gaban kasuwancinka."
      : "1. Keep recording your daily sales and purchases.\n2. Track which products sell the most to optimize your inventory.\n3. Compare weekly sales trends to see how your business is growing.";
  }

  const prompt = `You are a helpful business advisor for small Nigerian business owners. 
The business is named "${businessName}" and operates in the category of "${businessType}".

Based on their transaction summary for the last 7 days, generate 3 short, highly practical business insights in ${language}.
These insights should be specific to their business type "${businessType}". For example:
- If they sell food or fruits, give advice on freshness, storage, shelf-life, or daily inventory rotations.
- If they sell fabrics/clothing, give advice on seasonal designs, restocks, promotions, or customer loyalty.
- If they operate a provisions store, give advice on top-moving items, wholesale restocking cycles, or cash flow.
- If it is other categories, tailor advice accordingly.

Transaction Summary: """${transactionsSummary}"""

Keep each insight to 1-2 sentences. Be encouraging, action-oriented, and write them in clear, simple terms. Do not use complex financial jargon. Number them 1, 2, 3.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful business advisor for small Nigerian business owners." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content?.trim() || "No insights available.";
}
