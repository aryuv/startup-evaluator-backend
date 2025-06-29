# 🚀 Startup Evaluator Web App

A decision-support tool that helps investors and founders quickly evaluate the viability of early-stage startup ideas.

> 🔍 Scoring logic powered by a hybrid backend: Python (Flask) + Node.js  
> 🧠 Designed to simulate a structured investor thought process

---

### 🧭 Purpose

Most founders and VCs evaluate ideas based on intuition.  
**Startup Evaluator** turns that intuition into data.

By quantifying signals like:
- Founder's background
- Problem scale
- Monetization clarity
- Competitive edge
- Speed of execution

…it delivers a clear, actionable **startup viability score**.

---

### 💻 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js (with styled-components & Tailwind for UI polish) |
| Backend (Scoring Logic) | Python (Flask) |
| Backend (Data Handling / APIs) | Node.js |
| Hosting | Render (Frontend) + Railway (APIs) |

---

### 📸 Screenshots

| Home | Evaluation Result |
|------|-------------------|
| ![Home](./assets/home.png) | ![Result](./assets/result.png) |

---

### ✨ Features

- 🌟 Dynamic scoring model (custom-weighted)
- 📝 Easy-to-fill form, no login required
- 📊 Visual feedback for each evaluation
- 📁 JSON output to integrate with future databases or investor CRMs

---

### 🚧 Status

- ✅ MVP completed and deployed  
- 🔄 Currently improving scoring logic using feedback from startup mentors  
- 🧠 Future update: GPT integration for qualitative idea breakdowns

---

### 📂 Repo Structure

```bash
/client         # React Frontend
/server-flask   # Python scoring logic
/server-node    # Node.js for auth + data APIs
