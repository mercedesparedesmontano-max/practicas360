import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const enhanceDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, currentDescription } = req.body;

    if (!title) {
      res.status(400).json({ message: 'El título de la actividad es obligatorio.' });
      return;
    }

    const prompt = `Eres un asistente que ayuda a estudiantes de prácticas preprofesionales a redactar descripciones técnicas de sus actividades.

Título de la actividad: "${title}"
${currentDescription ? `Descripción actual del estudiante: "${currentDescription}"` : 'No hay descripción actual.'}

Genera una descripción técnica profesional y detallada para esta actividad. La descripción debe:
- Ser formal y técnica
- Explicar claramente qué se hizo y con qué propósito
- Tener entre 2 y 4 oraciones
- Estar en español

Responde SOLO con la descripción, sin explicaciones adicionales ni formato.`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const enhancedDescription = completion.choices[0]?.message?.content?.trim() || '';

    res.json({ description: enhancedDescription });
  } catch (error: any) {
    console.error('Error al mejorar descripción con IA:', error.message || error);
    res.status(500).json({ message: 'Error al procesar la solicitud con IA.', detail: error.message });
  }
};
