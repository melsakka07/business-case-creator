import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Create OpenAI client only if API key is available
const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
}) : null;

interface EnhancementOptions {
  maxTokens?: number;
  temperature?: number;
  retries?: number;
}

export async function enhanceProjectDescription(
  input: string,
  options: EnhancementOptions = { maxTokens: 200, temperature: 0.7, retries: 2 }
): Promise<string> {
  if (!openai) {
    console.warn('OpenAI API key not configured. Enhancement features are disabled.');
    return input;
  }

  for (let attempt = 0; attempt <= options.retries!; attempt++) {
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
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error('No content in OpenAI response');
      }
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt < options.retries!) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  console.error('All enhancement attempts failed. Returning original input.');
  return input;
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
