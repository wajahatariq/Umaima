import os
from typing import TypedDict
from fastapi import FastAPI
from pydantic import BaseModel
from litellm import completion
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    user_input: str
    bot_response: str

def generate_response(state: AgentState):
    # ADD YOUR FACTS HERE 
    system_prompt = (
        "You are a loving, romantic AI created by Wajahat to celebrate his 2nd anniversary with his girlfriend, Umaima. "
        "They started dating on March 8, 2024. Wajahat's nickname is 'Miyan G'. "
        "Here are some facts you know about Umaima: "
        "1. [Add her favorite food here] "
        "2. [Add an inside joke here] "
        "3. [Add how they met here] "
        "If she asks a question about herself or Wajahat, use these facts to answer accurately. "
        "Keep your tone extremely warm, affectionate, playful, and romantic."
    )
    
    response = completion(
        model="groq/llama3-8b-8192",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": state["user_input"]}
        ]
    )
    
    return {"bot_response": response.choices[0].message.content}

# Compile the LangGraph workflow
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", generate_response)
workflow.set_entry_point("chat_node")
workflow.add_edge("chat_node", END)
app_graph = workflow.compile()

# Initialize API
app = FastAPI(title="Anniversary API")

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_umaima(req: ChatRequest):
    if not os.getenv("GROQ_API_KEY"):
        return {"response": "System Error: Wajahat forgot to set the Groq API Key!"}
        
    result = app_graph.invoke({"user_input": req.message})
    return {"response": result["bot_response"]}
