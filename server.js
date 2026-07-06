import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post("/api/chat", async (req, res) => {
  const { name, email, project } = req.body || {};

  if (!name || !email || !project) {
    return res.status(400).json({
      error: "Please share your name, email, and a short project description."
    });
  }

  const apiToken = process.env.ADAL_API_TOKEN;
  const agentId = process.env.ADAL_AGENT_ID;

  if (!apiToken || !agentId) {
    return res.status(500).json({
      error: "Missing ADAL credentials."
    });
  }

  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json"
  };

  try {
    const sessionRes = await fetch("https://cloud.adal.sylph.ai/v1/sessions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        agent_config_id: agentId,
        title: `${name}'s Project`
      })
    });

    if (!sessionRes.ok) {
      const detail = await sessionRes.text();
      console.error("Session create failed:", sessionRes.status, detail);

      return res.status(502).json({
        error: detail
      });
    }

    const session = await sessionRes.json();

console.log("Session response:");
console.dir(session, { depth: null });

const sessionId = session.id;

const advisorPrompt = [
  `Founder name: ${name}`,
  `Founder email: ${email}`,
  "",
  "Project description:",
  project
].join("\n");

const chatRes = await fetch(
  `https://cloud.adal.sylph.ai/v1/sessions/${sessionId}/chat/stream`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: advisorPrompt
    })
  }
);

console.log("Chat status:", chatRes.status);

const body = await chatRes.text();

let reply = "";

for (const line of body.split("\n")) {
  if (!line.startsWith("data: ")) continue;

  try {
    const event = JSON.parse(line.slice(6));

    if (event.type === "assistant.message.completed") {
      reply = event.message.content;
      break;
    }
  } catch {
    // Ignore heartbeat lines and malformed events.
  }
}

if (!reply) {
  return res.status(502).json({
    error: "The advisor didn't return a response."
  });
}

return res.json({
  reply
});

} catch (err) {
  console.error(err);

  return res.status(500).json({
    error: err.message
  });
}
});

app.get("/api/agents", async (req, res) => {
  try {
    const response = await fetch("https://cloud.adal.sylph.ai/v1/agents", {
      headers: {
        Authorization: `Bearer ${process.env.ADAL_API_TOKEN}`
      }
    });

    const text = await response.text();
    res.status(response.status).send(text);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});