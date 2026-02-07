const API_KEY = "AIzaSyA15QfpCavEcC8qPg65RINsXKtY6OaH1OA";
const chatDisplay = document.getElementById('chat-display');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Get Settings from Sidebar
const getAIConfig = () => ({
    temperature: parseFloat(document.getElementById('temp-range').value),
    lengthHint: document.getElementById('length-select').value
});

async function askNakshaktra(prompt) {
    const config = getAIConfig();
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    role: "user", 
                    parts: [{ text: `System Instructions: You are Nakshaktra AI. Do NOT use greetings like Namaste if the conversation has already started. Be ${config.lengthHint}. Respond to: ${prompt}` }] 
                }],
                generationConfig: { temperature: config.temperature }
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        return "Connection lost to the stars.";
    }
}

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    if (document.querySelector('.welcome-screen')) chatDisplay.innerHTML = '';
    appendMsg('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';

    const thinking = document.createElement('div');
    thinking.className = 'message-row bot-row';
    thinking.innerHTML = '<div class="content"><i>Nakshaktra is calculating...</i></div>';
    chatDisplay.appendChild(thinking);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    const result = await askNakshaktra(text);
    chatDisplay.removeChild(thinking);
    appendMsg('bot', result);
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `message-row ${role}-row`;
    const content = document.createElement('div');
    content.className = 'content';
    
    if (role === 'bot') {
        let htmlContent = marked.parse(text);
        // Inject Copy Button into Code Blocks
        htmlContent = htmlContent.replace(/<pre><code/g, '<div class="code-container"><button class="copy-btn" onclick="copyCode(this)">Copy</button><pre><code');
        htmlContent = htmlContent.replace(/<\/code><\/pre>/g, '</code></pre></div>');
        content.innerHTML = htmlContent;
    } else {
        content.innerText = text;
    }
    
    div.appendChild(content);
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function copyCode(btn) {
    const code = btn.nextElementSibling.innerText;
    navigator.clipboard.writeText(code);
    const toast = document.getElementById('copy-toast');
    toast.style.display = 'block';
    btn.innerText = "Copied!";
    setTimeout(() => { 
        toast.style.display = 'none'; 
        btn.innerText = "Copy";
    }, 2000);
}

sendBtn.onclick = handleChat;
userInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } };