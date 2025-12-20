# 🎯 CareerAI: Your AI-Powered Career Assistant

<p align="center">
  <strong>Launch your dream career with smart, AI-powered tools.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

CareerAI is a comprehensive, generative AI-powered web application designed to be your ultimate co-pilot in the job search and career development journey. It provides a suite of intelligent tools that streamline every step of the process, from discovering the perfect opportunity to acing the interview.

## ✨ Features

CareerAI integrates a suite of AI-driven tools into a single, streamlined platform:

| Feature | Description |
|------|-----------|
| 🗂️ **Job Tracker** | Organize and manage applications using a drag-and-drop Kanban board. |
| 🔍 **AI Job Finder** | Discover relevant job postings using AI-powered search across multiple data sources. |
| 📄 **Resume Tailor** | Generate role-specific resume versions optimized against job descriptions. |
| ✍️ **AI Writer** | Instantly create cover letters, follow-ups, and outreach messages. |
| 🎤 **Interview Prep Coach** | Practice interviews with AI-generated questions and receive structured feedback. |
| 📊 **Skill Gap Analyzer** | Identify missing skills and receive a personalized learning roadmap. |
| 🧭 **Company Fit Analysis** | Evaluate cultural and value alignment with prospective employers. |

##  🛠️ Tech Stack

This project leverages a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) 
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **External APIs**: [Gemini](https://gemini.com), [Adzuna](https://www.adzuna.com/), [Google Custom Search](https://developers.google.com/custom-search/), [Jooble](https://jooble.org/)

##  🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js v18+
- npm or yarn
- API keys for required external services

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    npm install -D tailwindcss postcss autoprefixer
    npm install @supabase/supabase-js
    ```

### Configuration

1. Create a file named `.env` in the root of your project:
    ```
    # --- AI Integrations ---
    GEMINI_API_KEY="your_gemini_api_key_here"
    
    # --- Google Custom Search ---
    GOOGLE_API_KEY="your_google_api_key_here"
    GOOGLE_CX=your_custom_search_engine_id_here
    
    # --- Job Data Sources --
    JOOBLE_API_KEY="your_jooble_api_key_here"
    ADZUNA_APP_ID="your_adzuna_api_id_here"
    ADZUNA_APP_KEY="your_adzuna_api_key_here"
    
    # --- Database & Auth ---
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your_public_anon_key"
    NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
    
    # --- Optional ---
    SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key_here"
    CLIENT_ID="your_client_id_here"

    > Make sure to replace all placeholders with your own API keys and Supabase project credentials.
    ```

### Running the Development Server

Once the installation and configuration are complete, you can start the development server:

```bash
npm run dev
```

