/**
 * GenKit AI Configuration Module
 * 
 * Central configuration file for AI/ML capabilities in CareerAI.
 * Initializes the GenKit framework with Google AI (Gemini) integration.
 * This serves as the foundation for all AI-powered features in the application.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

/**
 * AI Instance Configuration
 * 
 * Creates and exports a configured GenKit AI instance with:
 * - Google AI (Gemini) as the primary AI provider
 * - Gemini 2.5 Flash as the default model
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
