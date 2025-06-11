let chat = document.querySelector('#chat');
let input = document.querySelector('#input');
let botaoEnviar = document.querySelector('#botao-enviar');

async function enviarMensagem() {
    if(input.value.trim() === "") return;

    const mensagemOriginal = input.value;
    input.value = "";

    let novaBolha = criarBolhaUsuario();
    novaBolha.innerHTML = mensagemOriginal;
    chat.appendChild(novaBolha);

    let novaBolhaBot = criarBolhaBot();
    novaBolhaBot.innerHTML = "Analisando..."
    chat.appendChild(novaBolhaBot);
    vaiParaFinalDoChat();
    

    // Obter nome do arquivo do localStorage
    const nomeArquivo = localStorage.getItem("arquivo");
    const agenteSelecionado = localStorage.getItem("agenteSelecionado") || "Padrão";

    if (!nomeArquivo) {
        novaBolhaBot.innerHTML = "Erro: nenhum arquivo carregado.";
        return;
    }

    
    // Define o estilo do prompt com base no agente
    let estilo = "";
    if (agenteSelecionado === "Informal") {
        estilo = "Responda como um amigo informal, use emojis, gírias leves e linguagem descontraída.";
    } else {
        estilo = "Responda de forma clara, objetiva e profissional.";
    }

    const prompt = `
    ${estilo}

    ### RESPOSTA 

    ${mensagemOriginal}
    
    `;

    console.log("ENVIANDO AO FLASK:", {
        pergunta: prompt,
        filename: nomeArquivo,
        agente: agenteSelecionado
    });   
    
    const inicio = performance.now();

    try {
        // Envia requisição com a mensagem para a API do ChatBot
        const resposta = await fetch ("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pergunta: prompt,
                filename: nomeArquivo,
                agente: agenteSelecionado,
                email: localStorage.getItem("userEmail")
            }),
        });

        const fim = performance.now();
        const tempoResposta = (fim - inicio).toFixed(2);
        console.log(`⏱️ Tempo de resposta: ${tempoResposta} ms`);

        const json = await resposta.json();
        const textoResposta = json.resposta || json.erro || "Erro desconhecido.";

        novaBolhaBot.innerHTML = textoResposta.replace(/\n/g, '<br>');
        vaiParaFinalDoChat();

        // Salvar as conversas no histórico
        let historico = JSON.parse(localStorage.getItem(`chat_${nomeArquivo}`) || "[]");
        historico.push({ autor: "usuario", texto: mensagemOriginal });
        historico.push({ autor: "bot", texto: textoResposta });
        localStorage.setItem(`chat_${nomeArquivo}`, JSON.stringify(historico));

    } catch (error) {
        console.error("Erro na requisição:", error);
        novaBolhaBot.innerHTML = "Desculpe, ocorreu um erro ao se comunicar com o servidor.";
    }
} 

function criarBolhaUsuario() {

    let bolha = document.createElement('p');
    bolha.classList = 'chat__bolha chat__bot--usuario';
    return bolha;

}

function criarBolhaBot() {

    let bolha = document.createElement('p');
    bolha.classList = 'chat__bolha chat__bolha--bot';
    return bolha;

}

function vaiParaFinalDoChat() {

    chat.scrollTop = chat.scrollHeight;

}

botaoEnviar.addEventListener('click', enviarMensagem);
input.addEventListener("keyup", function(event) {

    if (event.keyCode == 13) {
        botaoEnviar.click();
    }

});


// Reconstrói os chats
document.addEventListener("DOMContentLoaded", () => {
    const nomeArquivo = localStorage.getItem("arquivo");
    const chat = document.querySelector('#chat');

    if (!nomeArquivo) {
        console.warn("Nenhum nome de arquivo encontrado para restaurar histórico.");
        return;
    }

    const historico = JSON.parse(localStorage.getItem(`chat_${nomeArquivo}`) || '[]');

    historico.forEach(mensagem => {
        const bolha = mensagem.autor === "usuario" ? criarBolhaUsuario() : criarBolhaBot();
        bolha.innerHTML = mensagem.texto;
        chat.appendChild(bolha);
    });

    vaiParaFinalDoChat();
});