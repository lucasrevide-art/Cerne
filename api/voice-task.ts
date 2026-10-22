import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { VoiceTaskContext, VoiceTaskDraft } from "../src/features/voice/voiceContract";

/**
 * Recebe um áudio curto (WAV) + o contexto do usuário (áreas/projetos/tags),
 * manda pra Gemini (plano gratuito do Google AI Studio) transcrever e
 * extrair os campos de uma tarefa, e devolve o rascunho pro cliente revisar
 * antes de criar — a chave fica só aqui no servidor, nunca no bundle.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    notes: { type: "string" },
    whenDate: { type: "string", nullable: true },
    startTime: { type: "string", nullable: true },
    durationMinutes: { type: "integer", nullable: true },
    areaId: { type: "string", nullable: true },
    projectId: { type: "string", nullable: true },
    tagIds: { type: "array", items: { type: "string" } },
    suggestedNewTag: { type: "string", nullable: true },
    type: { type: "string", enum: ["default", "financial"] },
    amount: { type: "number", nullable: true },
    category: { type: "string", nullable: true },
  },
  required: ["title", "notes", "tagIds", "type"],
};

function buildPrompt(context: VoiceTaskContext): string {
  return `Você ouve um áudio em português (Brasil) onde alguém descreve, falando, uma tarefa pra criar num app de produtividade — e extrai dados estruturados a partir disso.

Data de hoje: ${context.today} (use isso pra resolver datas relativas como "amanhã", "sexta-feira", "semana que vem", "dia 15").

Áreas existentes: ${JSON.stringify(context.areas)}
Projetos existentes: ${JSON.stringify(context.projects)}
Tags existentes (geralmente nomes de clientes ou rótulos curtos): ${JSON.stringify(context.tags)}

Regras:
- "title" é curto e direto — o que precisa ser feito, sem repetir a data ou o cliente, que já viram outros campos.
- Só preencha areaId/projectId/tagIds com ids da lista acima, e só quando o áudio claramente corresponder a um deles. Na dúvida, deixe null / lista vazia — não adivinhe.
- Se a pessoa mencionar um cliente ou rótulo que parece uma tag mas não existe na lista, não invente um id — coloque o nome em "suggestedNewTag".
- "whenDate" só quando uma data for mencionada (absoluta ou relativa), formato YYYY-MM-DD.
- "startTime" (HH:mm) e "durationMinutes" (em minutos) só quando um horário específico for mencionado ("às 14h", "das 9 às 10", "por 1 hora").
- "type" só é "financial" se claramente envolver um valor em dinheiro a pagar ou receber; nesse caso preencha "amount" (número) e "category" se der pra inferir. Caso contrário "type" é "default" e amount/category ficam null.
- "notes" leva qualquer detalhe adicional dito que não coube nos outros campos — "" se não houver nada extra.
- Nunca invente informação que não foi dita no áudio.

Responda só com o JSON pedido pelo schema, nada além disso.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY não configurada no servidor." });
    return;
  }

  const { audioBase64, mimeType, context } = (req.body ?? {}) as {
    audioBase64?: string;
    mimeType?: string;
    context?: VoiceTaskContext;
  };

  if (!audioBase64 || !mimeType || !context) {
    res.status(400).json({ error: "Faltam campos no pedido (audioBase64, mimeType, context)." });
    return;
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: buildPrompt(context) },
                { inline_data: { mime_type: mimeType, data: audioBase64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      res
        .status(502)
        .json({ error: `A Gemini recusou o pedido (${geminiRes.status}): ${detail.slice(0, 300)}` });
      return;
    }

    const payload = (await geminiRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "A Gemini não devolveu um resultado utilizável." });
      return;
    }

    const draft = JSON.parse(text) as VoiceTaskDraft;
    res.status(200).json(draft);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Falha ao processar o áudio." });
  }
}
