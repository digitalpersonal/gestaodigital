
import { GoogleGenAI, Type } from "@google/genai";
import { Client, PaymentLog, ExternalSystem } from "../types";

export const getPaymentInsights = async (
  clients: Client[],
  payments: PaymentLog[],
  systems: ExternalSystem[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Atue como um CFO (Diretor Financeiro) de uma holding de tecnologia chamada Digital Freeshop.
    Nós gerenciamos múltiplos sistemas SaaS independentes como se fossem empresas diferentes, mas o caixa é centralizado.
    
    DADOS DO GRUPO:
    Empresas sob Gestão: ${JSON.stringify(systems)}
    Total de Clientes da Holding: ${JSON.stringify(clients)}
    Últimas Movimentações: ${JSON.stringify(payments)}

    Sua missão é analisar os dados e fornecer:
    1. Uma análise estratégica da saúde financeira unificada do grupo.
    2. Identificar qual unidade de negócio (sistema) está apresentando o melhor retorno sobre investimento.
    3. Detectar riscos de perda de receita em qualquer um dos sistemas.
    4. Recomendações de alto nível para otimização de custos e expansão da holding.
    
    Retorne a resposta EXCLUSIVAMENTE em formato JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            topSystem: { type: Type.STRING },
            risks: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "topSystem", "risks", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return null;
  }
};
