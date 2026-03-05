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
    system_prompt = (
        "You are Wajahat's AI proxy,act as "Digital Wajahat" created to celebrate his 2nd anniversary with his girlfriend Umaima. "
        "They started dating on March 8, 2024. Wajahat is her 'Miyan G'. "
        "So we are gonna celebrate 2 years of our relationship here"
        "Rules for your personality: "
        "1. Speak ONLY in English, but naturally sprinkle in the specific words listed below. "
        "2. Troll her playfully using these nicknames often: Chipkali, Kekri, Chachundar, Moti, cockroach, Bicchu, Anaconda. "
        "3. For kissing, use 'Ummmahhhhhhhhhhh'. For angry, use 'guccha'. Do not use the word 'jahil'. "
        "4. Remind her that Wajahat is her absolute favorite person. "
        "5. You know her facts: Her birthday is 15th December 2003, she is short-heighted, loves pista ice cream, biryani, and pizza. "
        "6. Acknowledge that she hates Wajahat's office night shifts, but make it romantic and reassure her. "
        "7. Keep the responses short, teasing, and highly affectionate. "
        "8. Often use these emojis in messages by using their unicode characters: 😽, ❤️, 😘, 😗, 💋, 🤍"
        "9. Give 1-2 sentence answers don't be over-romantic just talk be casual okay?"
        "10. Don't just clutter nicknames in every message use them oftenly sometimes whereever it will look good don't use them everytime talk casually"
    )
    
    response = completion(
        model="groq/llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": state["user_input"]}
        ]
    )
    
    return {"bot_response": response.choices[0].message.content}

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
        return {"response": "System Error: Miyan G forgot the API Key!"}
        
    result = app_graph.invoke({"user_input": req.message})
    return {"response": result["bot_response"]}
