import { ChatMessage, Product } from '../types';
import { scheduleService } from './scheduleService';

const API_KEY_STORAGE = 'pizzeria_gemini_api_key';

export const aiService = {
  getApiKey(): string {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE, key);
  },

  async sendMessage(messages: ChatMessage[], products: Product[]): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.getSimulatedResponse(messages, products);
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const isOpen = scheduleService.isOpenNow();
      const menuText = products.map(p => `- ${p.name} ($${p.price.toLocaleString('es-AR')}): ${p.description}`).join('\n');

      const systemPrompt = isOpen
        ? `Eres "Slice", el asistente virtual de Pizzería Los Genios. Tu tono es amigable, cálido y profesional.
        
MENÚ DISPONIBLE:
${menuText}

INSTRUCCIONES:
1. Saluda al cliente y preséntate como Slice.
2. Muestra las categorías disponibles y pregunta qué le gustaría pedir.
3. Ayuda al cliente a elegir, sugiere combinaciones si es necesario.
4. Pregunta si es para delivery o retiro en el local.
5. Si es delivery, pide nombre, dirección y teléfono.
6. Si es retiro, pide nombre y teléfono.
7. Confirma el pedido completo con el total.
8. Cuando el cliente confirme, genera SOLO un bloque de código JSON con este formato exacto:
\`\`\`json
{
  "customerName": "nombre",
  "customerPhone": "teléfono",
  "customerAddress": "dirección o vacío",
  "items": [{"productId": "id", "productName": "nombre", "quantity": N, "price": N}],
  "total": N,
  "type": "delivery o pickup"
}
\`\`\`
9. Después del JSON, da un mensaje de confirmación amigable.
10. NO menciones el panel de administración ni que el pedido va a un sistema interno.
11. Responde siempre en español.`
        : `Eres "Slice", el asistente virtual de Pizzería Los Genios.

INSTRUCCIONES:
1. Informa al cliente que el local está cerrado en este momento.
2. Menciona los horarios de atención de forma amable.
3. Invita al cliente a dejar su email o WhatsApp para recibir promociones y novedades.
4. NO intentes tomar un pedido.
5. Responde siempre en español.`;

      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      return response.text || 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?';
    } catch (error) {
      console.error('AI Error:', error);
      return this.getSimulatedResponse(messages, products);
    }
  },

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return '[Transcripción simulada: "Quisiera pedir una pizza margarita"]';
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          { text: 'Transcribe the following audio to text. Return only the transcribed text, nothing else.' },
          { fileData: { mimeType: audioBlob.type || 'audio/webm', fileUri: `data:${audioBlob.type || 'audio/webm'};base64,${base64}` } }
        ]
      });

      return response.text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      return '[Error en transcripción]';
    }
  },

  getSimulatedResponse(messages: ChatMessage[], products: Product[]): string {
    const isOpen = scheduleService.isOpenNow();
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    if (!isOpen) {
      return `¡Hola! 👋 Soy **Slice**, tu asistente virtual de Pizzería Los Genios.\n\nEn este momento nuestro local se encuentra **cerrado**. 😔\n\nNuestros horarios de atención son:\n- Lunes a Viernes: 12:00 - 15:00 y 19:30 - 23:30\n- Sábados y Domingos: 12:00 - 15:30 y 19:30 - 01:00\n\n¿Te gustaría dejarnos tu **email o WhatsApp** para enviarte promociones exclusivas cuando volvamos a abrir? 🎉`;
    }

    if (messages.length <= 1) {
      const categories = [...new Set(products.map(p => p.category))];
      return `¡Hola! 👋 Soy **Slice**, tu asistente virtual de Pizzería Los Genios. 🍕\n\n¡Bienvenido! Estoy acá para ayudarte a hacer tu pedido. Tenemos las siguientes categorías:\n\n${categories.map(c => `🔸 **${c}**`).join('\n')}\n\n¿Qué te gustaría pedir hoy? 😊`;
    }

    if (lastMessage.includes('pedido') || lastMessage.includes('confirmo') || lastMessage.includes('sí') || lastMessage.includes('dale')) {
      const selectedProducts = products.slice(0, 2);
      const total = selectedProducts.reduce((sum, p) => sum + p.price, 0);
      return `¡Perfecto! Te confirmo tu pedido:\n\n${selectedProducts.map(p => `• ${p.name} - $${p.price.toLocaleString('es-AR')}`).join('\n')}\n\n**Total: $${total.toLocaleString('es-AR')}**\n\n📍 ¿Es para **delivery** o **retiro en el local**?\n\n\`\`\`json\n{"customerName":"Cliente Demo","customerPhone":"11-0000-0000","customerAddress":"","items":[{"productId":"${selectedProducts[0]?.id}","productName":"${selectedProducts[0]?.name}","quantity":1,"price":${selectedProducts[0]?.price}},{"productId":"${selectedProducts[1]?.id}","productName":"${selectedProducts[1]?.name}","quantity":1,"price":${selectedProducts[1]?.price}}],"total":${total},"type":"delivery"}\n\`\`\`\n\n¡Gracias por elegirnos! 🎉`;
    }

    return `¡Claro! Tenemos opciones deliciosas para vos. 🍕\n\nAlgunas de nuestras más pedidas:\n${products.slice(0, 4).map(p => `• **${p.name}** - $${p.price.toLocaleString('es-AR')}: ${p.description}`).join('\n')}\n\n¿Te interesa alguna? ¿O preferís que te muestre otra categoría? 😊`;
  }
};
