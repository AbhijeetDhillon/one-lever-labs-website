const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdsV4uRZWHN8aCZ-YxjrykNPYTuWOo9BgDJTcll6TAo38bECA/formResponse";
const subscriptionAnswer = "Send me emails about new One Lever Labs apps and tools.";
const maxBodyBytes = 1024;

function reply(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers
    }
  });
}

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) return body + decoder.decode();

    bytes += value.byteLength;
    if (bytes > maxBodyBytes) {
      await reader.cancel();
      return null;
    }

    body += decoder.decode(value, { stream: true });
  }
}

export async function onRequest({ request }) {
  if (request.method !== "POST") {
    return reply(405, { error: "Use the signup form to subscribe." }, { Allow: "POST" });
  }

  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return reply(403, { error: "Open One Lever Labs to subscribe." });
  }

  const contentType = request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return reply(415, { error: "Use the signup form to subscribe." });
  }

  let email;
  try {
    const body = await readBody(request);
    if (body === null) return reply(413, { error: "The signup is too large." });

    const fields = JSON.parse(body);
    email = typeof fields?.email === "string" ? fields.email.trim() : "";
  } catch {
    return reply(400, { error: "Enter a valid email address." });
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(400, { error: "Enter a valid email address." });
  }

  const fields = new URLSearchParams({
    emailAddress: email,
    // Clicking Subscribe supplies the affirmative answer for the existing form.
    "entry.1028153978": subscriptionAnswer,
    fvv: "1",
    pageHistory: "0"
  });

  try {
    const response = await fetch(formUrl, {
      method: "POST",
      body: fields,
      redirect: "manual",
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      // Google includes the confirmation copy in configuration scripts on the blank form too.
      const visibleHtml = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
      if (/<div\b[^>]*>\s*Thanks for signing up\./i.test(visibleHtml)) {
        return reply(200, { ok: true });
      }
    }
  } catch {
    // Keep the visitor's address out of logs and error responses.
  }

  return reply(502, { error: "We couldn’t confirm your signup. Try again in a moment." });
}
