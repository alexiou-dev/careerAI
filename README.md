# CareerAI: Your AI-Powered Career Assistant

<p align="center">
  <strong>Launch your dream career with smart, AI-powered tools.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a>
</p>

---

CareerAI is a comprehensive, generative AI-powered web application designed to be your ultimate co-pilot in the job search and career development journey. It provides a suite of intelligent tools that streamline every step of the process, from discovering the perfect opportunity to acing the interview.

## ✨ Features

CareerAI combines a user-friendly interface with powerful AI capabilities to give you a competitive edge.

| Feature                 | Description                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Job Tracker**         | Organize and manage all your job applications in one place with a drag-and-drop Kanban board.                                            |
| **AI Job Finder**       | Enter a role, location, and other preferences to get a curated list of relevant job postings sourced by a powerful AI agent.               |
| **Resume Tailor**       | Upload your resume and paste a job description to have an AI generate a new, optimized version specifically tailored for that role.        |
| **AI Writer**           | Generate compelling cover letters, thank-you emails, and networking outreach messages in seconds, based on your resume and the job.        |
| **Interview Prep Coach**      | Practice for interviews with an AI coach that generates role-specific questions, records your answers, and provides instant feedback.      |
| **Skill Gap Analyzer**      | Identify skill gaps between your resume and a job description, and receive a personalized, multi-stage learning roadmap to fill them.      |
| **Company Fit**         | Get an AI-powered analysis of a company's culture and values to see how well it aligns with your preferences and work style.               |

## 🛠️ Tech Stack

This project leverages a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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
    GEMINI_API_KEY="your_gemini_api_key_here"
    ADZUNA_APP_ID="your_adjuna_api_id_here"
    ADZUNA_APP_KEY="your_adjuna_api_key_here"
    GOOGLE_API_KEY="your_google_api_key_here"
    GOOGLE_CX=your_custom_search_engine_id_here
    JOOBLE_API_KEY="your_jooble_api_key_here"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
    NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
    SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key_here"
    CLIENT_ID="your_client_id_here"

    ```

### Running the Development Server

Once the installation and configuration are complete, you can start the development server:

```bash
npm run dev
```

