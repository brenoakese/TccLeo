document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");

    const chatsParaMostrar = chats.slice(-3).reverse();

    document.querySelectorAll(".content-chats").forEach(el => el.remove());


    chatsParaMostrar.forEach((chat, index) => {
        const chatDiv = document.createElement("div");
        chatDiv.className = "content-chats";

        chatDiv.innerHTML = `
            <h3 class="title-chats title-h3">${chat.nome}</h3>
            <h4 class="title-chats title-h4">Banco de dados - ${chat.arquivo}</h4>
            <p class="description description-chats">Chat iniciado com um agente de perfil ${chat.agente}</p>
            <button class="btn btn-second btn-ir-chat" data-index="${chats.length - 1 - index}">Ir para chat</button>
        `;

        const botaoNovoChat = document.getElementById("btn-container");
        container.insertBefore(chatDiv, botaoNovoChat);
    });

    document.querySelectorAll(".btn-ir-chat").forEach(botao => {
        botao.addEventListener("click", async (e) => {
            const index = e.target.getAttribute("data-index");
            const chats = JSON.parse(localStorage.getItem("chats") || "[]");
            const chatSelecionado = chats[index];

            if (chatSelecionado) {
                localStorage.setItem("arquivo", chatSelecionado.arquivo);
                localStorage.setItem("agenteSelecionado", chatSelecionado.agente);

                console.log("⏳ Enviando arquivo:", chatSelecionado.arquivo);

                window.location.href = "conversa_chatbot.html";

            }  
        });
    });

    document.getElementById("btn-novoChat").addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "novaconversa.html";
    });
});