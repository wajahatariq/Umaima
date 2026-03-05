// Generate floating CSS background shapes
function createBackgroundShapes() {
    const bg = document.getElementById('bg-animations');
    for (let i = 0; i < 15; i++) {
        let shape = document.createElement('div');
        shape.className = 'css-heart';
        shape.style.left = Math.random() * 100 + 'vw';
        shape.style.animationDuration = (Math.random() * 3 + 4) + 's';
        shape.style.animationDelay = Math.random() * 5 + 's';
        bg.appendChild(shape);
    }
}
createBackgroundShapes();

// Step 1: Dodging Button
function dodgeButton() {
    const btnNo = document.getElementById('btn-no');
    const newLeft = Math.random() * 200 - 100;
    const newTop = Math.random() * 100 - 50;
    btnNo.style.transform = `translate(${newLeft}px, ${newTop}px)`;
}

// Proceed to Step 2
function goToStep2() {
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}

// Step 2: Shrinking Button
let neverScale = 1;
function shrinkButton() {
    const btnNever = document.getElementById('btn-never');
    neverScale -= 0.25;
    if (neverScale <= 0) {
        btnNever.style.display = 'none';
    } else {
        btnNever.style.transform = `scale(${neverScale})`;
    }
}

// Transition to Chat and Play Music
function startSurprise() {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    
    const music = document.getElementById('bg-music');
    music.volume = 0.5;
    music.play().catch(error => console.log("Audio play blocked"));
}

// Chatbot Logic
async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim();
    if (!message) return;

    addMessageToChat(message, 'user-message');
    inputField.value = '';

    const loadingId = addMessageToChat('Soch raha hoon...', 'bot-message');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        document.getElementById(loadingId).innerText = data.response;
        
    } catch (error) {
        document.getElementById(loadingId).innerText = "Net masla kar raha hai.";
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

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
