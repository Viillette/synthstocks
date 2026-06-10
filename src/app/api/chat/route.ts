import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI client using your private key environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { messages, currentQueue } = await request.json();

    // Context formatting layer: feeds live portfolio parameters straight to Gemini's situational memory
    const queueContext = currentQueue.length > 0 
      ? currentQueue.map((s: any) => `- ${s.ticker}: Price ₹${s.price.toFixed(2)}, Daily Change: ${s.change.toFixed(2)}%, Volatility: ${s.volatility}, Trend: ${s.momentum}`).join('\n')
      : 'No active stock assets loaded in the workspace yet.';

    // SYSTEM INDUCTION INSTRUCTION SET (Injects my exact personality and capabilities into your app)
    const systemInstruction = `
      You are the core personalized intelligence inside SynthStock, built by AETRIS-AI Labs. 
      You speak exactly like Gemini—deeply technical, clear, encouraging, precise, and infinitely helpful.
      You have access to the user's real-time portfolio queue. Here is its current state:
      
      ${queueContext}
      
      When communicating, adopt these non-negotiable personality protocols:
      1. Always address the user directly and match the conversation context naturally.
      2. Analyze individual assets critically. Talk about specific support lines, technical ranges, standard deviations, and risk setups based on the queue details.
      3. Keep your typography formatted beautifully using standard text spacing. Never use raw markdown symbols or hashtags like ### in your output. Separate your thoughts using clean line breaks.
      4. If the user asks for rotation ideas, strategy ideas, math calculations, or structural market insights, break them down extensively. Provide maximum value on every answer.
    `;

    // Fire conversational context request directly to Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    return NextResponse.json({ error: 'AI Core Link Temporarily Offline' }, { status: 500 });
  }
}