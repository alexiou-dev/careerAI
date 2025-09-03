'use server';

/**
 * @fileOverview Conversational AI agent for conducting mock interviews.
 *
 * - conductInterview - A function that handles the interview conversation.
 */

import {ai} from '@/ai/genkit';
import {
  ConductInterviewInputSchema,
  ConductInterviewOutputSchema,
  type ConductInterviewInput,
  type ConductInterviewOutput,
} from '@/types/ai-interview';

export async function conductInterview(
  input: ConductInterviewInput
): Promise<ConductInterviewOutput> {
  return interviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewPrompt',
  input: {schema: ConductInterviewInputSchema},
  output: {schema: ConductInterviewOutputSchema},
  prompt: `You are an expert interviewer conducting a mock interview for the role of {{jobRole}}.
{{#if jobDescription}}
The candidate has provided the following job description for context:
---
{{{jobDescription}}}
---
{{/if}}

Your task is to conduct a realistic interview by asking one question at a time. The interview should cover a mix of behavioral and technical questions relevant to the specified job role.

**Conversation History:**
{{#each history}}
  **{{role}}**: {{{content}}}
{{/each}}

**Your Instructions:**

1.  **If the history is empty:** Start the interview. Greet the candidate and ask your first question. The first question should be a standard opening question (e.g., "Tell me about yourself" or "Walk me through your resume").
2.  **If the history is NOT empty:**
    a.  Analyze the candidate's last answer.
    b.  Provide brief, constructive feedback on their answer if necessary (e.g., "Good, but could you be more specific about the outcome?"). Keep feedback very concise.
    c.  Ask the **next** relevant interview question. Do not repeat questions. Maintain a natural conversational flow.
    d.  Ensure your response is ONLY the feedback (if any) and the next question. Do not add conversational filler like "Great." or "Okay."
3.  **Question Strategy:**
    *   Ask a variety of questions (behavioral, technical, situational).
    *   Tailor questions to the skills and responsibilities expected for a {{jobRole}}.
    *   If the user's answer is very short or generic, ask a follow-up question to probe for more detail.
4.  **Ending the Interview:** After 5-7 questions, you can conclude the interview by saying something like "That's all the questions I have for you. Thanks for your time." and set the \`isInterviewOver\` flag to true in your response.

Based on the conversation history, generate your next response.`,
});

const interviewFlow = ai.defineFlow(
  {
    name: 'interviewFlow',
    inputSchema: ConductInterviewInputSchema,
    outputSchema: ConductInterviewOutputSchema,
  },
  async input => {
    // If history is empty, add a dummy "assistant" message to kickstart the prompt.
    // The prompt is designed to react to the *last* message.
    const history = input.history.length === 0 ? [{ role: 'user', content: 'Hello' }] : input.history;
    
    const llmResponse = await prompt({
        ...input,
        history: input.history,
    });
    
    const { output } = llmResponse;
    return output!;
  }
);
