import { NextResponse } from "next/server";
import { 
  Document, 
  VectorStoreIndex, 
  OpenAIAgent, 
  QueryEngineTool,
  Settings,
  OpenAI
} from "llamaindex";

// Globally bind the model configuration to the LlamaIndex framework
Settings.llm = new OpenAI({
  model: "gpt-4o-mini",
  temperature: 0.1,
});

export async function POST(req: Request) {
  try {
    const { textToSummarize } = await req.json();

    if (!textToSummarize || textToSummarize.trim() === "") {
      return NextResponse.json({ error: "Missing source context payload" }, { status: 400 });
    }

    // 1. Ingest raw text data dynamically into a LlamaIndex document node
    const document = new Document({ text: textToSummarize });
    
    // 2. Index the node components into an in-memory vector space
    const index = await VectorStoreIndex.fromDocuments([document]);
    const queryEngine = index.asQueryEngine({ similarityTopK: 2 });

    // 3. Package the Query Engine as a tool that the Agent can decide to invoke
    const documentTool = new QueryEngineTool({
      queryEngine: queryEngine,
      metadata: {
        name: "document_deep_search",
        description: "Searches through the provided source text payload to extract exact details, statistics, and sub-contexts.",
      },
    });

    // 4. Initialize the Agent with tools and system rules optimized for summary parsing
    const agent = new OpenAIAgent({
      tools: [documentTool],
      systemPrompt: `You are an expert executive research agent. Your explicit goal is to generate crisp, high-impact technical summaries.
        Execute your plan step-by-step:
        1. Query the 'document_deep_search' tool to scan the full context.
        2. Extract core constraints, high-level structural metrics, and primary themes.
        3. Compile the summary into a structured markdown layout using clear headings and bullet points. 
        Be concise. Do not add boilerplate fluff.`,
    });

    // 5. Trigger the agentic execution loop
    const agentResponse = await agent.chat({
      message: "Analyze the uploaded document context and generate a comprehensive executive summary."
    });

    return NextResponse.json({ 
      summary: agentResponse.response.text 
    });

  } catch (error: any) {
    console.error("LlamaIndex Agent Execution Exception:", error);
    return NextResponse.json({ error: error.message || "Internal Server Failure" }, { status: 500 });
  }
}
