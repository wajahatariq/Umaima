function createBackgroundShapes() {
    const bg = document.getElementById('bg-animations');
    for (let i = 0; i < 20; i++) {
        let shape = document.createElement('div');
        shape.className = 'css-heart';
        shape.style.left = Math.random() * 100 + 'vw';
        shape.style.animationDuration = (Math.random() * 3 + 4) + 's';
        shape.style.animationDelay = Math.random() * 5 + 's';
        bg.appendChild(shape);
    }
}
createBackgroundShapes();

function dodgeElement(id) {
    const el = document.getElementById(id);
    const newLeft = Math.random() * 150 - 75;
    const newTop = Math.random() * 80 - 40;
    el.style.transform = `translate(${newLeft}px, ${newTop}px)`;
}

function goToStep(nextStepId) {
    document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
    document.getElementById(nextStepId).classList.remove('hidden');
}

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

function verifyIceCream() {
    const input = document.getElementById('icecream-input').value.toLowerCase().trim();
    if (input === 'pista') {
        document.getElementById('btn-verify').style.transform = 'none';
        document.getElementById('btn-verify').onclick = startSurprise;
        document.getElementById('btn-verify').innerText = "Correct! Enter";
        document.getElementById('btn-verify').style.backgroundColor = "#ff4d94";
        document.getElementById('btn-verify').style.color = "white";
    } else {
        dodgeElement('btn-verify');
    }
}

// Transition to Chat, Force Play Music, and Blast Confetti
function startSurprise() {
    goToStep('chat-screen');
    
    // Play Music
    const music = document.getElementById('bg-music');
    music.volume = 0.5;
    music.load(); 
    let playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => console.log("Audio play blocked."));
    }

    // Trigger Massive Confetti Blast
    if (typeof confetti === "function") {
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#ff4d94', '#ffb3d9', '#ffffff', '#e6005c']
        });
    }
}

// --- Chat Features ---

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const message = inputField.value.trim();
    if (!message) return;

    addMessageToChat(message, 'user-message');
    inputField.value = '';
    const loadingId = addMessageToChat('Thinking...', 'bot-message');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        document.getElementById(loadingId).innerText = data.response;
    } catch (error) {
        document.getElementById(loadingId).innerText = "Network issue.";
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
    if (e.key === 'Enter') sendMessage();
});

// --- Bonus Features ---

function generateCoupon() {
    const coupons = [
        "1 Free Plate of Biryani",
        "Get Out of 1 Night Shift Argument Free Card",
        "10 Minutes of Continuous Ummmahhhhhhhhhhh",
        "One Free Pizza Date",
        "Miyan G admits Umaima is always right (Valid once)"
    ];
    const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)];
    addMessageToChat(`SYSTEM ALERT: You claimed a coupon! [ ${randomCoupon} ] Take a screenshot and send it to Wajahat!`, 'bot-message');
}

function triggerGuccha() {
    document.getElementById('guccha-screen').classList.remove('hidden');
    document.getElementById('bg-music').pause();
}

function cancelGuccha() {
    document.getElementById('guccha-screen').classList.add('hidden');
    document.getElementById('bg-music').play();
}

function openVault() {
    const startDate = new Date('2024-03-08');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    document.getElementById('days-counter').innerText = `We have been together for exactly ${diffDays} days.`;
    document.getElementById('vault-modal').classList.remove('hidden');
}

function closeVault() {
    document.getElementById('vault-modal').classList.add('hidden');
}
