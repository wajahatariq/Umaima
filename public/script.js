// The Trick Button Logic
function dodgeButton() {
    const btnNo = document.getElementById('btn-no');
    
    // Generate random coordinates within the container
    const newLeft = Math.random() * 200 - 100;
    const newTop = Math.random() * 100 - 50;
    
    btnNo.style.transform = `translate(${newLeft}px, ${newTop}px)`;
}

// Transition to Chat and Play Music
function startSurprise() {
    document.getElementById('trick-screen').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    
    // Start the romantic background music
    const music = document.getElementById('bg-music');
    music.volume = 0.5;
    music.play().catch(error => console.log("Audio autoplay blocked until interaction"));
}

// Chatbot Logic
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim();
    if (!message) return;

    // Display user message
    addMessageToChat(message, 'user-message');
    inputField.value = '';

    // Add a temporary loading message
    const loadingId = addMessageToChat('Thinking...', 'bot-message');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Replace loading message with real response
        document.getElementById(loadingId).innerText = data.response;
        
    } catch (error) {
        document.getElementById(loadingId).innerText = "Oops, something went wrong connecting to the AI.";
    }
}

function addMessageToChat(text, className) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    const uniqueId = 'msg-' + Date.now();
    
    msgDiv.id = uniqueId;
    msgDiv.className = 'message ' + className;
    msgDiv.innerText = text;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return uniqueId;
}

// Allow pressing Enter to send
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
