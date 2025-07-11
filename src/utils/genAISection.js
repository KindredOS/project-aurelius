// utils/genAISection.js
import { ScienceAPI } from '../api/ApiMaster';

/**
 * Query the backend AI model with a prompt and return the result.
 * Uses the ScienceAPI.queryModel helper.
 *
 * @param {string} prompt - The input prompt to send to the model.
 * @param {string} model_key - The model key to use (e.g., 'hermes', 'phi', 'gpt2').
 * @param {number} maxTokens - Maximum number of tokens to generate.
 * @returns {Promise<string>} - The model's response.
 */
export async function generateAISection(prompt, model_key = 'hermes', maxTokens = 750) {
  try {
    const response = await ScienceAPI.queryModel(prompt, model_key, maxTokens);
    return response;
  } catch (error) {
    console.error('generateAISection error:', error);
    return 'Error generating section.';
  }
}
