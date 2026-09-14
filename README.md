AI Business Idea Market Analyzer

An AI-powered chat application that helps entrepreneurs and business professionals generate business ideas, analyze market potential, evaluate competitors, create financial projections, and develop marketing strategies — all through an interactive conversational interface.

Overview

AI Business Idea Market Analyzer is a full-stack web application that combines a Python Flask backend with a vanilla HTML/CSS/JavaScript frontend. It leverages Google's Gemini 1.5 Flash model to provide intelligent business analysis and idea generation in real time.

The application features a chat-based interface with conversation history, a collapsible sidebar for managing multiple chat sessions, and a clean, dark-themed UI optimized for readability and focus.

Features

· AI-Powered Business Analysis — Generate unique business ideas, analyze market potential, evaluate competitors, and develop marketing strategies
· Financial Projections — Create realistic financial models, revenue forecasts, and cost structures
· Conversational Context — Maintains conversation history (last 3 exchanges) for contextually aware responses
· Multi-Chat Support — Start new chats and maintain a history of previous conversations
· File Upload Support — Upload CSV, TXT, and JSON files for data analysis (UI ready)
· API Health Check — Real-time connection status indicator showing whether the Gemini API key is configured
· Responsive Dark UI — Clean, modern interface with collapsible sidebar and smooth transitions
· Serverless Deployment — Configured for Vercel with separate API and static frontend builds

Architecture

The application follows a simple client-server architecture:

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Frontend      │  HTTP   │   Flask Backend      │  API    │   Google Gemini │
│   (HTML/CSS/JS) │ ──────> │   (api/chat.py)      │ ──────> │   1.5 Flash     │
│                 │ <────── │                      │ <────── │                 │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
        │                            │
        │                            │
   Serves static files         Handles /api/chat
   on Vercel                   and /api/health
```

The Flask backend serves both the API endpoints and the static frontend files. On Vercel, the routing is configured so that /api/* requests go to the Python backend and all other requests serve the static frontend.

Tech Stack

Layer Technology
Backend Python 3, Flask 3.0, Flask-CORS
AI Model Google Gemini 1.5 Flash (google-generativeai)
Frontend HTML5, CSS3, Vanilla JavaScript
Environment python-dotenv
Deployment Vercel (serverless functions + static hosting)

Project Structure

```
AI-Business-Idea-Market-Analyzer/
├── api/
│   ├── .env.example          # Environment variable template
│   └── chat.py               # Flask application with chat and health endpoints
├── frontend/
│   ├── app.js                # Client-side logic (chat, history, API calls)
│   ├── index.html            # Main HTML structure
│   └── styles.css            # Dark-themed UI styles
├── .gitignore
├── README.md
├── requirements.txt          # Python dependencies
└── vercel.json               # Vercel deployment configuration
```

Setup Instructions

Prerequisites

· Python 3.8 or higher
· A Google Gemini API key (get one from Google AI Studio)

Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/bhousxrenz/AI-Business-Idea-Market-Analyzer.git
   cd AI-Business-Idea-Market-Analyzer
   ```
2. Create and activate a virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate        # On Windows: venv\Scripts\activate
   ```
3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables
   ```bash
   cp api/.env.example api/.env
   ```
   Edit api/.env and replace the placeholder with your actual Gemini API key:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```
5. Run the Flask server
   ```bash
   python api/chat.py
   ```
   The application will be available at http://localhost:5000.

Environment Variables

Variable Description Required
GOOGLE_API_KEY Your Google Gemini API key from Google AI Studio Yes

The .env.example file in the api/ directory contains a template. Note: the template contains a sample key — replace it with your own credential before running.

Deployment

This project is pre-configured for deployment on Vercel. The vercel.json file defines:

· Python serverless functions for api/**/*.py
· Static hosting for the frontend/ directory
· Routing: /api/* → api/chat.py, everything else → frontend/$1

Deploy to Vercel

1. Push your code to a GitHub repository.
2. Import the repository in Vercel.
3. Add the GOOGLE_API_KEY environment variable in the Vercel project settings.
4. Deploy.

The frontend automatically detects the environment: when running on localhost, it points to http://localhost:5000; in production on Vercel, it uses relative paths for API calls.

Usage

1. Open the application in your browser.
2. The sidebar shows your chat history — click ➕ New Chat to start a fresh conversation.
3. Type your business question or idea in the input field and press Enter (or click the send button).
4. The AI will respond with business insights, analysis, or suggestions based on your query.

Example Prompts

· "I want to start a SaaS business for remote team management. What market opportunities exist?"
· "Analyze the competitive landscape for an AI-powered personal finance app."
· "Create a financial projection for a subscription-based meal planning service."
· "What marketing strategies would work for a B2B cybersecurity startup?"

Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch (git checkout -b feature/amazing-feature).
3. Commit your changes (git commit -m 'Add amazing feature').
4. Push to the branch (git push origin feature/amazing-feature).
5. Open a Pull Request.

License

This project is provided as-is for educational and commercial use. See the repository for license details.

---
