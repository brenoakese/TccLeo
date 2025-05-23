document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector(".container");
    const email = localStorage.getItem("userEmail");

    if(!email) {
        alert("Usuário não logado.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5501/chats?email=${encodeURIComponent(email)}`);
        const chats = await response.json();

        document.querySelectorAll(".content-chats").forEach(el => el.remove());

        chats.forEach((chat, index) => {
            const nomeArquivo = chat.arquivo_nome|| "undefinetd.txt";
            const partes = nomeArquivo.split(".");
            const antesPonto = partes[0] || "undefined";
            const depoisPonto = partes[1] || "txt";
            const agente = chat.agente || "desconhecido";

            const chatDiv = document.createElement("div");
            chatDiv.className = "content-chats";

            chatDiv.innerHTML = `
                <h3 class="title-chats title-h3">${antesPonto}</h3>
                <h4 class="title-chats title-h4">Banco de dados - ${depoisPonto}</h4>
                <p class="description description-chats">Chat iniciado com um agente de perfil ${agente}</p>
                <button class="btn btn-second btn-ir-chat" data-index="${chats.length - 1 - index}">Ir para chat</button>
            `;

            container.appendChild(chatDiv);
        });

        document.querySelectorAll(".btn-ir-chat").forEach(botao => {
            botao.addEventListener("click", () => {
                const arquivo = botao.getAttribute("data-arquivo");
                const agente = botao.getAttribute("data-agente");

                localStorage.setItem("arquivo", arquivo);
                localStorage.setItem("agenteSelecionado", agente);

                window.location.href = "conversa_chatbot.html";

            });
        });

    } catch (err) {
        console.error("Erro ao carregar chats:", err);
        alert("Erro ao carregar seus chats.");
    }
    
});