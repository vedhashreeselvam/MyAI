const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const welcome = document.getElementById("welcome");

let messages = [];

function addMessage(text, role) {

    if (welcome) {
        welcome.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    if (role === "user") {
        messageDiv.classList.add("user-message");
    } else {
        messageDiv.classList.add("ai-message");
    }

    const label = document.createElement("div");
    label.classList.add("message-label");

    label.textContent = role === "user"
        ? "You"
        : "AI Assistant";

    const content = document.createElement("div");
    content.textContent = text;

    messageDiv.appendChild(label);
    messageDiv.appendChild(content);

    chatBox.appendChild(messageDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

    return messageDiv;
}

chatForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const question = userInput.value.trim();

    if (!question) return;

    addMessage(question, "user");

    messages.push({
        role: "user",
        content: question
    });

    userInput.value = "";

    sendBtn.disabled = true;
    sendBtn.textContent = "Thinking...";

    const loadingMessage = addMessage(
        "Thinking...",
        "assistant"
    );

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                messages: messages
            })

        });

        const data = await response.json();

        loadingMessage.remove();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        addMessage(data.answer, "assistant");

        messages.push({
            role: "assistant",
            content: data.answer
        });

    } catch (error) {

        loadingMessage.remove();

        addMessage(
            "Error: " + error.message,
            "assistant"
        );

    }

    sendBtn.disabled = false;
    sendBtn.textContent = "Send ➤";

    userInput.focus();

});

newChatBtn.addEventListener("click", function() {

    messages = [];

    chatBox.innerHTML = `
        <div class="welcome" id="welcome">
            <h1>How can I help you today?</h1>
            <p>Ask me anything to get started.</p>
        </div>
    `;

});

userInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        chatForm.requestSubmit();

    }

});