import { HfInference } from "@huggingface/inference"; // Import Hugging Face inference library

export const streamAIResponse = async (apiUrl, userInput) => {
  const client = new HfInference("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"); // Hugging Face API client

  const aiInputText = "You are an AI; respond to the inquiries given.";
  const fullPrompt = `${aiInputText} ${userInput}`;

  try {
    const stream = client.chatCompletionStream({
      model: "microsoft/Phi-3.5-mini-instruct",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.7
    });

    return stream; // Return the stream directly for consumption by the caller
  } catch (error) {
    console.error("Error communicating with AI backend:", error);
    throw new Error("Unable to connect to AI backend.");
  }
};
