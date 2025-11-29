// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (_e) {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  if (!body || typeof body !== "object") {
    return new Response("Invalid request body", { status: 400, headers: corsHeaders });
  }

  const { quote, pagePath, sectionUrl, question, contact, userAgent, version } = body;

  if (!question || typeof question !== "string") {
    return new Response("Question is required", { status: 400, headers: corsHeaders });
  }

  if (!quote || typeof quote !== "string") {
    return new Response("Quote is required", { status: 400, headers: corsHeaders });
  }

  // Truncate quote for display, show first 500 chars
  const truncatedQuote = quote.length > 500 
    ? quote.substring(0, 500) + "..." 
    : quote;

  const embed: Record<string, unknown> = {
    title: "New Sunder rules question",
    description: String(question).substring(0, 1024),
    color: 0x5a2d82, // Sunder purple
    fields: [
      { 
        name: "Quoted text", 
        value: `"${truncatedQuote}"`, 
        inline: false 
      },
      { 
        name: "Page", 
        value: String(pagePath || "(not specified)").substring(0, 256), 
        inline: true 
      },
    ],
    timestamp: new Date().toISOString(),
  };

  if (sectionUrl) {
    (embed.fields as Array<Record<string, unknown>>).push({
      name: "Section URL",
      value: String(sectionUrl).substring(0, 256),
      inline: false,
    });
  }

  if (contact) {
    (embed.fields as Array<Record<string, unknown>>).push({
      name: "Contact",
      value: String(contact).substring(0, 256),
      inline: true,
    });
  }

  if (version) {
    (embed.fields as Array<Record<string, unknown>>).push({
      name: "Site version",
      value: String(version),
      inline: true,
    });
  }

  if (userAgent) {
    (embed.fields as Array<Record<string, unknown>>).push({
      name: "User-Agent",
      value: String(userAgent).substring(0, 256),
      inline: false,
    });
  }

  const discordPayload = {
    content: "",
    embeds: [embed],
  };

  const webhookUrl = Deno.env.get("DISCORD_QUESTIONS_WEBHOOK_URL");
  if (!webhookUrl) {
    return new Response("Webhook not configured", { status: 500, headers: corsHeaders });
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Discord error:", res.status, text);
    return new Response("Discord error", { status: 502, headers: corsHeaders });
  }

  return new Response("OK", { status: 200, headers: corsHeaders });
});
