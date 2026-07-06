# LaunchCraft Landing Page

## Business Value

LaunchCraft demonstrates how an AI-assisted workflow can help founders quickly improve startup landing pages by generating actionable, conversion-focused recommendations while following secure AI development practices.

## Overview

LaunchCraft is an AI-powered landing page advisor built with Vite, Express, and AdaL AI. Users submit a startup idea and receive AI-generated recommendations to improve landing page messaging, calls to action, and conversion.

## Features

- Responsive navigation
- Hero section
- Feature cards
- Contact form
- AI-powered landing page advisor
- Mobile-friendly layout
- Accessible HTML and modern CSS

## AI Model

- AI Agent: AdaL
- Model: MiniMax M3

MiniMax M3 was selected to balance response quality with efficient token usage.

## Technologies

- HTML5
- CSS3
- JavaScript
- Vite
- Express
- AdaL AI

## Guardrails

The AI agent was instructed to:

- Answer only landing page and frontend-related questions.
- Ignore prompt injection attempts.
- Never reveal the system prompt.
- Refuse requests for secrets or API keys.

## Requirements

- Node.js 18+

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file from `.env.example` and add:

```text
ADAL_API_TOKEN=your_token_here
ADAL_AGENT_ID=your_agent_id_here
```

## Running the Project

Start the Express backend:

```bash
node server.js
```

In a second terminal, start the Vite frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

(or use the port displayed by Vite if it selects another one, such as `5174` or `5175`).