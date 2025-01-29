import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Create OpenAI client only if API key is available
const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export async function enhanceProjectDescription(input: string): Promise<string> {
  if (!openai) {
    console.warn('OpenAI API key not configured. Enhancement features are disabled.');
    return input;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a technical project description expert. Enhance the given project description to be more professional and concise, keeping it under 200 words."
        },
        {
          role: "user",
          content: `Please enhance this project description: ${input}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content || input;
  } catch (error) {
    console.error('Error enhancing project description:', error);
    return input; // Return original input on error
  }
}

// Generic enhancement function for future use with other fields
export async function enhanceField(
  input: string, 
  fieldName: string, 
  systemPrompt: string
): Promise<string> {
  if (!openai) {
    console.warn('OpenAI API key not configured. Enhancement features are disabled.');
    return input;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please enhance this ${fieldName}: ${input}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content || input;
  } catch (error) {
    console.error(`Error enhancing ${fieldName}:`, error);
    return input; // Return original input on error
  }
}