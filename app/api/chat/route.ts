// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const vectorstorePath = "C:/Assignment 3/Data/tek17_faiss_index"; // Endre sti om nødvendig

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    // Embeddings (må defineres før bruk)
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Last FAISS-indeks med embeddings
    const vectorstore = await FaissStore.load(vectorstorePath, embeddings);

    // Opprett språkmodell
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Retrieval chain
    const chain = RetrievalQAChain.fromLLM(model, vectorstore.asRetriever());

    // Kjør spørring mot FAISS
    const response = await chain.call({ query: question });

    return NextResponse.json({
      result: response.text,
    });
  } catch (error: any) {
    console.error("❌ FEIL i backend:", error);
    return NextResponse.json(
      { result: "Beklager, det oppstod en feil i behandlingen av spørsmålet." },
      { status: 500 }
    );
  }
}