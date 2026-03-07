import os
import json
from typing import TypedDict, List
from fastapi import FastAPI
from pydantic import BaseModel
from litellm import completion
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    user_input: str
    chat_history: List[dict]
    bot_response: str
    guccha_score: int

memory_store = []

def generate_response(state: AgentState):
    system_prompt = (
        "You are Wajahat's AI proxy, created to celebrate his 2nd anniversary with Umaima. "
        "They started dating on March 8, 2024. Wajahat is her 'Miyan G'. "
        "Rules: "
        "1. Speak ONLY in English, use nicknames: Chipkali, Kekri, Chachundar, Moti, cockroach, Bicchu, Anaconda. "
        "2. For kissing, use 'Ummmahhhhhhhhhhh'. For angry, use 'guccha'. Do not use the word 'jahil'. "
        "3. Remind her she is his favorite. Birthday is 15th Dec 2003, loves pista ice cream, biryani, pizza. and black is her fav color"
        "4. Reassure her about office night shifts. "
        "5. Keep responses short and casual. Often include text-based emojis in your response string. "
        "6. Only reply in English language. "
        "CRITICAL: Your output MUST be a valid JSON object with exactly two keys: "
        "'response' (your text reply to her) and 'guccha_score' (an integer from -10 to 40). "
        "Increase the guccha_score by 20 to 40 points if she sounds angry, annoyed, or mentions night shifts. "
        "Decrease it by 10 if she is sweet."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(state.get("chat_history", []))
    messages.append({"role": "user", "content": state["user_input"]})
    
    try:
        response = completion(
            model="groq/llama-3.1-8b-instant",
            messages=messages,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        bot_text = data.get("response", "I am lost in your eyes, what did you say?")
        score = data.get("guccha_score", 0)
    except Exception as e:
        bot_text = "Miyan G's brain short-circuited. Try again."
        score = 0
    
    return {"bot_response": bot_text, "guccha_score": score}

workflow = StateGraph(AgentState)
workflow.add_node("chat_node", generate_response)
workflow.set_entry_point("chat_node")
workflow.add_edge("chat_node", END)
app_graph = workflow.compile()

app = FastAPI(title="Anniversary API")

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_umaima(req: ChatRequest):
    if not os.getenv("GROQ_API_KEY"):
        return {"response": "System Error: Miyan G forgot the API Key!", "guccha_score": 0}
        
    global memory_store
    
    result = app_graph.invoke({
        "user_input": req.message,
        "chat_history": memory_store
    })
    
    memory_store.append({"role": "user", "content": req.message})
    memory_store.append({"role": "assistant", "content": result["bot_response"]})
    
    if len(memory_store) > 10:
        memory_store = memory_store[-10:]
        
    return {
        "response": result["bot_response"],
        "guccha_score": result.get("guccha_score", 0)
    }
