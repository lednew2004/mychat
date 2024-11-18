// login elements
const login = document.querySelector(".login");
const loginForm = document.querySelector(".login_form");
const loginInput = document.querySelector(".login_input");

// chat elements
const chat = document.querySelector(".CHAT");
const chatForm = document.querySelector(".chat_form");
const chatInput = document.querySelector(".chat_input");
const chatMessages = document.querySelector(".chat_messages");

const colors = [
    "cadetblue", 
    "aqua",
    "blueviolet",
    "burlywood",
    "chocolate",
    "bisque",
    "pink",
    "royalblue",
    "goldenrod",
    "greenyellow",
    "sieena",
    "gold",
    "darkkhaki"
];
const user = {id: "", name: "", color: ""};
let webSocket;

// Função para criar mensagem própria
function createMessageSelfElement(content){
    const div = document.createElement("div");
    div.classList.add("message_self");
    div.innerHTML = content;
    return div;
}

// Função para criar mensagem de outro usuário
function createMessageOtherement(content, sender, senderColor){
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message_other");
    span.classList.add("message_send");
    span.style.color = senderColor;

    div.appendChild(span);
    span.innerHTML = sender;
    div.innerHTML += content;

    return div;
}

// Função para obter uma cor aleatória para o usuário
function getColor(){
    const indexColor = Math.floor(Math.random() * colors.length);
    return colors[indexColor];
}

// Função para rolar para o fundo da tela
function scrollScreen(){
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}

// Função para processar e exibir a mensagem
function processMessage({ data }) {
    const { userId, userName, userColor, content } = JSON.parse(data);
    const message = 
        userId === user.id 
        ? createMessageSelfElement(content)
        : createMessageOtherement(content, userName, userColor);

    chatMessages.appendChild(message);

    // Salvar as mensagens no localStorage
    saveMessagesToStorage(userId, userName, userColor, content);

    scrollScreen();
}

// Função para salvar as mensagens no localStorage
function saveMessagesToStorage(userId, userName, userColor, content) {
    let allMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    allMessages.push({ userId, userName, userColor, content });
    localStorage.setItem("chatMessages", JSON.stringify(allMessages));
}

// Função para carregar as mensagens armazenadas do localStorage
function loadMessagesFromStorage() {
    const allMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    allMessages.forEach(message => {
        const { userId, userName, userColor, content } = message;
        const messageElement = 
            userId === user.id
            ? createMessageSelfElement(content)
            : createMessageOtherement(content, userName, userColor);

        chatMessages.appendChild(messageElement);
    });

    scrollScreen();
}

// Função de login (quando o usuário submete o formulário)
function loginSubmit(event){
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getColor();

    login.style.display = "none";
    chat.style.display = "flex";

    // Criar o WebSocket
    webSocket = new WebSocket("wss://frontend-z67l.onrender.com");
    webSocket.onmessage = processMessage;
    
    // Salvar o nome no sessionStorage
    sessionStorage.setItem("name", loginInput.value);
}

// Função para recuperar o nome do usuário do sessionStorage
function storageSave(){
    const nameStorage = sessionStorage.getItem("name");
    if(nameStorage){
        user.name = nameStorage;
        login.style.display = "none";
        chat.style.display = "flex";

        // Caso já tenha o nome, você pode estabelecer a conexão do WebSocket
        webSocket = new WebSocket("wss://frontend-z67l.onrender.com");
        webSocket.onmessage = processMessage;
    }
}

// Função para enviar a mensagem
function sendMessage(event){
    event.preventDefault();

    // Verificar se o WebSocket está aberto antes de tentar enviar
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        // Criar a mensagem localmente (para exibição imediata)
        const messageContent = chatInput.value;
        const messageElement = createMessageSelfElement(messageContent);
        chatMessages.appendChild(messageElement);

        // Rolando para o fundo após enviar
        scrollScreen();

        // Enviar a mensagem para o servidor
        const messages = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: messageContent
        };

        webSocket.send(JSON.stringify(messages));

        // Limpar o campo de input
        chatInput.value = "";
    } else {
        console.error("WebSocket não está aberto.");
    }
}

// Chamar a função storageSave() para verificar se o nome já está no sessionStorage
storageSave();

// Carregar mensagens armazenadas no localStorage ao iniciar
loadMessagesFromStorage();

// Adicionar eventos de submit para login e envio de mensagens
loginForm.addEventListener("submit", loginSubmit);
chatForm.addEventListener("submit", sendMessage);
