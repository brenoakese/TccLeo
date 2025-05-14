document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");

    chats.forEach((chat, index) => {
        const chatDiv = document.createElement("div");
        chatDiv.className = "content-chats";

        chatDiv.innerHTML = `
            <h3 class="title-chats title-h3">${chat.nome}</h3>
            <h4 class="title-chats title-h4">Banco de dados - ${chat.arquivo}</h4>
            <p class="description description-chats">Chat iniciado com um agente de perfil ${chat.agente}</p>
            <button class="btn btn-second" data-index="${index}">Ir para chat</button>
        `;

        container.insertBefore(chatDiv, document.getElementById("btn-novochat"));
    });

    ocument.querySelectorAll(".btn-second[data-index]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = e.target.getAttribute("data-index");
            const chats = JSON.parse(localStorage.getItem("chats") || "[]");
            const chatSelecionado = chats[index];

            // Salva esse chat como o atual
            localStorage.setItem("arquivo", chatSelecionado.arquivo);
            localStorage.setItem("agenteSelecionado", chatSelecionado.agente);

            // Vai para o chat
            window.location.href = "conversa_chatbot.html";
        });
    });

});


document.getElementById("btn-novochat").addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = 'selecionaragente.html';
});