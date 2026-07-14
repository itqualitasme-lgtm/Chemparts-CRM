// A small rule-based assistant for the website chat. It greets, answers a few
// common questions, points people to the quote form, and hands off to a real
// agent on request. No LLM — deterministic and free to run. The reply is shown
// as a BOT message; `requestAgent` flags the conversation for a human.

export type BotResult = { reply: string; requestAgent: boolean }

const AGENT = /\b(agent|human|person|someone|representative|rep|real|talk to|speak to|call me)\b/i
const QUOTE = /\b(quote|price|pricing|cost|buy|purchase|order|supply|stock|available)\b/i
const SERVICE = /\b(service|repair|calibrat|install|maintenance|amc|fix|breakdown|fault)\b/i
const HOURS = /\b(hour|open|timing|time|available|when)\b/i
const GREET = /\b(hi|hello|hey|salaam|salam|good (morning|afternoon|evening))\b/i
const THANKS = /\b(thanks|thank you|shukran|appreciate)\b/i

export function getBotReply(text: string): BotResult {
  const t = (text || '').trim()

  if (AGENT.test(t)) {
    return {
      requestAgent: true,
      reply: "Connecting you to a Chemparts specialist — someone will reply right here shortly. Feel free to keep typing your question in the meantime.",
    }
  }
  if (QUOTE.test(t)) {
    return {
      requestAgent: false,
      reply: "Happy to help with a quote. Tell me the instrument, spare part or consumable you need and I'll pass it to our team — or use the “Get a quote” button at the top of the page for a formal request. Want a specialist to join? Just type “agent”.",
    }
  }
  if (SERVICE.test(t)) {
    return {
      requestAgent: false,
      reply: "For installation, calibration, AMC or repairs, our service team can help. Share the instrument and the issue and I'll log it — or type “agent” to talk to a service engineer.",
    }
  }
  if (HOURS.test(t)) {
    return {
      requestAgent: false,
      reply: "Our team is available Mon–Sat, 8AM–5PM GST. Leave your question here and we'll reply by email or in this chat. Type “agent” to reach a person now.",
    }
  }
  if (GREET.test(t)) {
    return {
      requestAgent: false,
      reply: "Hello! I'm the Chemparts assistant. I can help with quotes, spare parts, consumables and service. What are you looking for? (Or type “agent” to chat with a real person.)",
    }
  }
  if (THANKS.test(t)) {
    return { requestAgent: false, reply: "You're welcome! Anything else I can help with? Type “agent” anytime to reach the team." }
  }

  return {
    requestAgent: false,
    reply: "Thanks — I've noted your message for the Chemparts team. If you'd like to speak with a person, type “agent”, or leave your email and we'll follow up.",
  }
}

/** Opening line shown when a visitor first opens the chat. */
export const BOT_GREETING =
  "Hi 👋 I'm the Chemparts assistant. Ask me about instruments, spare parts, consumables or service — or type “agent” to chat with a real person."
