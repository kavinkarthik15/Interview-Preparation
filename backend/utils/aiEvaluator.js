const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const evaluateWithAI = async (question, answer) => {
  const prompt = `
You are an interview coach.

Question: ${question}
Answer: ${answer}

Give:
1. Score out of 10
2. Feedback
3. Suggestion to improve

Respond in JSON:
{
  "score": number,
  "feedback": "text",
  "suggestion": "text"
}
`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.choices?.[0]?.message?.content || '';

  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      score: 5,
      feedback: text,
      suggestion: 'Could not parse structured response',
    };
  }
};

module.exports = evaluateWithAI;
