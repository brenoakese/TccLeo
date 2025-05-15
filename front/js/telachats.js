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

        container.insertBefore(chatDiv, document.getElementById("btn-novochat"));
    });

    document.querySelectorAll(".btn-ir-chat").forEach(botao => {
        botao.addEventListener("click", async (e) => {
            const index = e.target.getAttribute("data-index");
            const chats = JSON.parse(localStorage.getItem("chats") || "[]");
            const chatSelecionado = chats[index];

            if (chatSelecionado) {
                localStorage.setItem("arquivo", chatSelecionado.arquivo);
                localStorage.setItem("agenteSelecionado", chatSelecionado.agente);
                
                try {
                    const response = await fetch("http://localhost:5501/gerar-vectorstore", {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ arquivo: chatSelecionado.arquivo })
                    });

                    const json = await response.json();

                    if (response.ok) {
                        console.log("\u2705 Vecstore criado:", json.message);
                        window.location.href = "conversa_chatbot.html";
                    } else {
                        alert("Erro ao preparar contexto: " + json.message);
                    }
                } catch (err) {
                    console.error("Erro ao chamar gerar-vectorstore:", err);
                    alert("Erro ao tentar carregar contexto.");
                }
            }  
        });
    });

    document.getElementById("btn-novoChat").addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "novaconversa.html";
    });
});