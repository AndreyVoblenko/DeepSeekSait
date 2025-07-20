document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyBtn = document.getElementById('save-key');
    
    // Загрузка сохраненного API ключа
    if(localStorage.getItem('deepseek_api_key')) {
        apiKeyInput.value = localStorage.getItem('deepseek_api_key');
    }
    
    // Сохранение API ключа
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if(key) {
            localStorage.setItem('deepseek_api_key', key);
            alert('Ключ сохранён!');
        } else {
            alert('Введите API ключ');
        }
    });
    
    // Отправка сообщения
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    async function sendMessage() {
        const message = userInput.value.trim();
        const apiKey = localStorage.getItem('deepseek_api_key');
        
        if(!message) return;
        if(!apiKey) {
            alert('Сначала сохраните API ключ');
            return;
        }
        
        // Добавление сообщения пользователя в чат
        addMessage(message, 'user');
        userInput.value = '';
        
        try {
            // Отправка запроса в DeepSeek API
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: message }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            if (!response.ok) throw new Error('Ошибка API');
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Добавление ответа ИИ
            addMessage(aiResponse, 'bot');
            
        } catch (error) {
            addMessage(`❌ Ошибка: ${error.message}`, 'bot');
            console.error('API Error:', error);
        }
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
});
