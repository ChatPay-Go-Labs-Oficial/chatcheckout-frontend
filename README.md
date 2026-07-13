# ChatCheckout

**AI-powered conversational checkout for digital creators, secured by a Stellar escrow smart contract.**

🔗 Live app: [checkout.chatpaygolabs.com](https://checkout.chatpaygolabs.com/login)
🏗️ Built by [ChatPay Go Labs](https://github.com/ChatPay-Go-Labs-Oficial) · 🏆 Winner, Stellar Instawards 2026

---

## What is ChatCheckout?

Digital creators lose revenue and buyers in three ways: platform fees of 10–30% per sale, payouts that take 15–30 days to land, and checkout flows that are cold, form-heavy, and easy to abandon. ChatCheckout replaces the traditional checkout form with a conversational, AI-driven experience: an assistant reads the seller's landing page and product info, answers buyer questions and objections in real time, and closes the sale — while funds move through an audited on-chain escrow on Stellar with instant settlement instead of a multi-week payout cycle.

In short, ChatCheckout combines:
- A **RAG-based AI sales assistant** that talks buyers through a purchase using the seller's own content, instead of a static form.
- A **Soroban (Stellar) escrow smart contract** that holds funds securely until fulfillment conditions are met, with built-in dispute resolution.
- An **event indexer** that turns on-chain escrow events into a queryable, real-time data feed for the app.

## This repository

This repo is the **ChatCheckout Frontend** — the web application buyers and sellers interact with. It's a Next.js (App Router) + TypeScript + TailwindCSS application that talks to the backend API, renders the conversational checkout, and integrates with the escrow flow.

## The ChatCheckout ecosystem

ChatCheckout is split across five repositories. Start here for the big picture, then jump into whichever service you need to work on.

| Repository | What it does | Stack |
|---|---|---|
| **[chatcheckout-frontend](.)** (this repo) | Web app: product pages, conversational checkout UI, buyer/seller dashboards | Next.js, TypeScript, TailwindCSS |
| **[chatcheckout-backend](https://github.com/ChatPay-Go-Labs-Oficial/chatcheckout-backend)** | Core API: auth, users, products, orchestrates the chat AI and file uploads | NestJS, PostgreSQL, Redis |
| **[chatcheckout-contract](https://github.com/ChatPay-Go-Labs-Oficial/chatcheckout-contract)** | Soroban escrow smart contract: creates, releases, refunds and resolves disputes over escrowed payments | Rust (Soroban), TypeScript SDK (auto-generated) |
| **[chatcheckout-indexer](https://github.com/ChatPay-Go-Labs-Oficial/chatcheckout-indexer)** | Listens to escrow contract events on Stellar and indexes them into Postgres, exposing a real-time SSE feed | Node.js, PostgreSQL, Express (SSE) |
| **[scrapper-agent](https://github.com/ChatPay-Go-Labs-Oficial/scrapper-agent)** | RAG AI agent service: ingests seller landing pages/product info and powers the conversational objection-handling assistant | Python |

### How they fit together

```
Buyer/Seller
     │
     ▼
┌─────────────────────┐        ┌──────────────────────┐
│  chatcheckout-       │◄──────►│  chatcheckout-        │
│  frontend (this repo)│  REST  │  backend (NestJS)     │
└─────────────────────┘        └──────────┬────────────┘
                                            │ orchestrates
                                            ▼
                                 ┌───────────────────────┐
                                 │  scrapper-agent (RAG)  │
                                 │  reads landing pages,  │
                                 │  handles objections    │
                                 └───────────────────────┘

Backend / Frontend  ──────────────►  chatcheckout-contract (Soroban escrow on Stellar)
                                            │ emits events
                                            ▼
                                 chatcheckout-indexer
                                 (events → Postgres → SSE)
                                            │
                                            └──────────► back to frontend/backend (real-time status)
```

The frontend and backend talk to the escrow contract to create/release/refund payments; the indexer watches the chain and streams status updates back over SSE so the UI can show real-time payment states without polling the blockchain directly.

## Tech stack (this repo)

- [Next.js](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com)
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

## Getting started

```bash
npm install
npm run dev
```

App will be running at [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ChatCheckout
```

> Point `NEXT_PUBLIC_API_URL` at your local or deployed instance of [chatcheckout-backend](https://github.com/ChatPay-Go-Labs-Oficial/chatcheckout-backend). See that repo's README for its own setup (Postgres, Redis, JWT config, etc.).

## Project structure

```
src/
  app/         # Next.js routes, pages, and layouts
  components/  # Reusable UI components
  hooks/       # Custom React hooks
  utils/       # Utility functions
  services/    # API/backend integration
  types/       # Shared types and interfaces
```

## Code standards

- ESLint + Prettier for consistent formatting
- Import alias `@/` maps to `src/`
- Components, hooks, and utils organized by responsibility

## Best practices

- Prefer reusable components over one-off UI
- Keep business logic in hooks and services, not components
- Types and interfaces live in `src/types`
- Environment variables always use the `NEXT_PUBLIC_` prefix when they need to reach the browser

## Roadmap context

This repo, along with the contract and indexer, was originally scoped and delivered as part of a [Stellar Instawards](https://stellar.org) 30-day sprint: an audited escrow contract deployed to Stellar mainnet, a RAG-powered conversational checkout, and an off-chain escrow indexer for real-time status. ChatCheckout went on to win the **Stellar Instawards 2026**.

## Tools & docs

- [Next.js docs](https://nextjs.org/docs)
- [TailwindCSS docs](https://tailwindcss.com/docs)
- [TypeScript docs](https://www.typescriptlang.org/docs)
- [Stellar / Soroban docs](https://developers.stellar.org/docs/build/smart-contracts)

---

Questions about structure or conventions? Check this README first, or reach out to the team.
