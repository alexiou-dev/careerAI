# CareerAI: Your AI-Powered Career Assistant

<p align="center">
  <img src="https://picsum.photos/seed/career-ai-logo/600/300" alt="CareerAI Banner" data-ai-hint="futuristic office" />
</p>

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
| **Interview Prep**      | Practice for interviews with an AI coach that generates role-specific questions, records your answers, and provides instant feedback.      |
| **Skill Analyzer**      | Identify skill gaps between your resume and a job description, and receive a personalized, multi-stage learning roadmap to fill them.      |
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
    ```

### Configuration

1. Create a file named `.env` in the root of your project.
2. For the AI features, you will need a Google AI (Gemini) API key. Add it to your `.env` file:
    ```
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```

### Running the Development Server

Once the installation and configuration are complete, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
