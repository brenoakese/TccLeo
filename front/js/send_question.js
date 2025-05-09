let chat = document.querySelector('#chat');
let input = document.querySelector('#input');
let botaoEnviar = document.querySelector('#botao-enviar');

async function enviarMensagem() {
    if(input.value.trim() === "") return;

    const mensagem = input.value;
    input.value = "";

    let novaBolha = criarBolhaUsuario();
    novaBolha.innerHTML = mensagem;
    chat.appendChild(novaBolha);

    let novaBolhaBot = criarBolhaBot();
    novaBolhaBot.innerHTML = "Analisando..."
    chat.appendChild(novaBolhaBot);
    vaiParaFinalDoChat();
    

    // Obter nome do arquivo do localStorage
    const nomeArquivo = localStorage.getItem("arquivo");

    if (!nomeArquivo) {
        novaBolhaBot.innerHTML = "Erro: nenhum arquivo carregado.";
        return;
    }


    

    console.log("ENVIANDO AO FLASK:", {
        pergunta: mensagem,
        filename: nomeArquivo
    });    





    try {
        // Envia requisição com a mensagem para a API do ChatBot
        const resposta = await fetch ("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pergunta: mensagem,
                filename: nomeArquivo
            }),
        });

        const json = await resposta.json();
        const textoResposta = json.resposta || json.erro || "Erro desconhecido.";

        novaBolhaBot.innerHTML = textoResposta.replace(/\n/g, '<br>');
        vaiParaFinalDoChat();
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