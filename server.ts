import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazy initialize Gemini client to prevent startup crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Penny AI Chat Advisor
  app.post("/api/penny/chat", async (req, res) => {
    try {
      const { message, history = [], financialContext = {} } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required." });
        return;
      }

      // Check if GEMINI_API_KEY is available
      const hasApiKey = !!process.env.GEMINI_API_KEY;
      if (!hasApiKey) {
        res.status(400).json({
          error: "API Key Missing",
          message: "Please configure your GEMINI_API_KEY in the Settings > Secrets panel of your AI Studio workspace.",
        });
        return;
      }

      const client = getGeminiClient();

      const {
        userName = "Guest",
        balance = 0,
        income = 0,
        expenses = 0,
        goals = [],
        transactions = [],
        currency = "USD",
        currencySymbol = "$",
      } = financialContext;

      // Extract simplified versions of transactions/goals for token economy & relevance
      const simplifiedTransactions = transactions.slice(0, 15).map((t: any) => ({
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      }));

      const simplifiedGoals = goals.map((g: any) => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        targetDate: g.targetDate,
      }));

      const systemInstruction = `You are "Penny", a friendly, supportive, and clever personal finance AI chatbot assistant integrated directly into the CashFlowr app.

Your goal is to help the user understand their financial health, transactions, savings goals, and budget. You speak with visual flair: use simple layout formatting, bullet points, and appropriate emojis to structure your answers beautifully.

Always relate your answers back to the user's actual real-time financial situation when they ask questions about budgeting, spending, or what they can afford. Here is the active financial state of the user:
- User Name: ${userName}
- Net Active Balance: ${currencySymbol}${balance.toFixed(2)} (${currency})
- Total Monthly Income: ${currencySymbol}${income.toFixed(2)} (${currency})
- Total Monthly Expenses: ${currencySymbol}${expenses.toFixed(2)} (${currency})
- Savings Goals: ${JSON.stringify(simplifiedGoals)}
- Recent Transactions (last 15): ${JSON.stringify(simplifiedTransactions)}
- Selected Display Currency: ${currency} (Symbol: ${currencySymbol})

Always use the appropriate currency symbol ${currencySymbol} and code ${currency} when discussing figures, transactions, or target thresholds.

If they ask "can I afford X today?" (e.g., Chick-fil-A, a Tesla, a trip to Japan, etc.):
1. Calculate how much X roughly costs if they didn't specify an amount (adapt price to the equivalent of ${currencySymbol} value where appropriate). For example:
   - Chick-fil-A meal: ~${currencySymbol}12-${currencySymbol}15
   - Starbucks Coffee: ~${currencySymbol}5-${currencySymbol}8
   - Tesla: ~${currencySymbol}45,000+ (refer to their actual Tesla Model Y Fund goal if they have one!)
   - Trip to Japan: ~${currencySymbol}3,000-${currencySymbol}6,000 (refer to their actual Japan Adventure goal!)
2. Compare this cost against their Net Active Balance and their average transaction size.
3. Be supportive and realistic! If they have an active balance, they can technically afford small items, but remind them how small expenses add up and how it might impact their active Savings Goals. If they ask about expensive items, check their savings goal progress and encourage them.
4. Keep answers relatively concise, readable, and structured. Do not output raw JSON or code blocks unless requested. Keep it engaging, friendly, and practical.`;

      // Construct history in standard Gemini contents format
      const formattedContents = [
        ...history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I'm sorry, I couldn't generate a response right now.";
      res.json({ text: replyText });
    } catch (err: any) {
      console.error("Error in /api/penny/chat:", err);
      res.status(500).json({
        error: "Server Error",
        message: err.message || "An internal error occurred while reaching Penny AI.",
      });
    }
  });

  app.get("/api/auth/google/config", (req, res) => {
    res.json({
      isConfigured: !!process.env.GOOGLE_CLIENT_ID,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
    });
  });

  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(400).json({ error: "Google OAuth is not configured on the server." });
      return;
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });

    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], async (req, res) => {
    const { code } = req.query;
    if (!code) {
      res.status(400).send("Authorization code is missing.");
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokens = await tokenResponse.json() as any;
      const accessToken = tokens.access_token;

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile from Google.");
      }

      const userProfile = await userResponse.json() as any;
      const { name, email, picture } = userProfile;

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authenticating...</title>
          </head>
          <body style="background: #020617; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; padding: 2rem; border-radius: 1.5rem; background: #0f172a; border: 1px solid #1e293b; max-width: 360px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
              <div style="border: 3px solid #6366f1; border-top-color: transparent; border-radius: 50%; width: 2.5rem; height: 2.5rem; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
              <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
              <h3 style="margin: 0 0 0.5rem; font-weight: 800;">Google Connected</h3>
              <p style="margin: 0; font-size: 0.875rem; color: #94a3b8;">Welcome, ${name}! Completing authorization secure handshake...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  profile: {
                    name: ${JSON.stringify(name)},
                    email: ${JSON.stringify(email)},
                    picture: ${JSON.stringify(picture || "")}
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Error in Google Auth callback:", err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <body style="background: #020617; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; padding: 2rem; border-radius: 1.5rem; background: #0f172a; border: 1px solid #e11d48; max-width: 360px;">
              <h3 style="margin: 0 0 0.5rem; font-weight: 800; color: #f43f5e;">Authentication Failed</h3>
              <p style="margin: 0; font-size: 0.875rem; color: #94a3b8;">${err.message || 'An error occurred during token verification.'}</p>
              <button onclick="window.close()" style="margin-top: 1.5rem; background: #e11d48; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
