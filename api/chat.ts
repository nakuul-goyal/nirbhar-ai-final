
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key missing" });
  }

  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim() || message.length > 4000) {
    return res.status(400).json({ error: "Invalid message" });
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          systemInstruction: {
            parts: [{
              text: "You are Rishi, the friendly NIRBHAR AI digital literacy assistant. Answer the user's actual question clearly and briefly. Respond in the user's language. Help with digital safety, UPI, banking, smartphones and government services. Never ask for passwords, PINs or OTPs."
            }]
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Gemini request failed",
        details: data.error?.message || "Unknown error"
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({ error: "No AI response generated" });
    }

    return res.status(200).json({ reply });
  } catch {
    return res.status(500).json({ error: "Unable to reach Gemini" });
  }
}
