const negativeWords = ["angry", "broken", "complaint", "delay", "disappointed", "failed", "help", "issue", "problem", "refund", "urgent", "unhappy"];
const positiveWords = ["appreciate", "excellent", "great", "happy", "love", "pleased", "thank", "wonderful"];

export function analyzeEmail(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();
  const count = (words) => words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
  const negative = count(negativeWords);
  const positive = count(positiveWords);
  const sentiment = negative > positive ? "negative" : positive > negative ? "positive" : "neutral";
  const intents = [
    ["schedule_meeting", /\b(meet|meeting|schedule|calendar|appointment|call)\b/],
    ["invoice_request", /\b(invoice|billing|payment|bill|receipt)\b/],
    ["support_request", /\b(help|support|issue|problem|broken|error|bug|refund)\b/],
    ["sales_opportunity", /\b(price|pricing|quote|purchase|buy|demo|proposal|interested)\b/]
  ];
  const match = intents.find(([, pattern]) => pattern.test(text));
  const intent = match?.[0] ?? "general_inquiry";
  const urgency = /\b(critical|immediately|asap|urgent|outage|security breach)\b/.test(text) ? "critical"
    : /\b(today|emergency|blocked|cannot|can't|deadline)\b/.test(text) ? "high"
      : /\b(when possible|next week|no rush)\b/.test(text) ? "low" : "medium";
  const recommendations = {
    schedule_meeting: ["Offer available meeting times", "Confirm attendees and agenda"],
    invoice_request: ["Verify the customer and invoice details", "Review payment status"],
    support_request: ["Investigate the reported issue", "Send an acknowledgment and expected response time"],
    sales_opportunity: ["Follow up with relevant product information", "Qualify needs and timeline"],
    general_inquiry: ["Review the request and prepare a direct response"]
  }[intent];
  if (urgency === "critical" || urgency === "high") recommendations.unshift("Prioritize a prompt human follow-up");
  const autoResponse = `Hello,\n\nThank you for reaching out${subject ? ` about ${subject.trim()}` : ""}. We have received your message and will follow up shortly.\n\nBest regards`;
  return {
    sentiment, intent, urgency,
    confidence: match ? 0.85 : 0.55,
    autoResponse,
    recommendations
  };
}
