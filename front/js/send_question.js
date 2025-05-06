let chat = document.querySelector('#chat');
let input = document.querySelector('#input');
let botaoEnviar = document.querySelector('#botao-enviar');

async function enviarMensagem() {

    if(input.value == "" || input.value == null) return;
    let mensagem = input.value;
    input.value = "";

    let novaBolha = criarBolhaUsuario();
    novaBolha.innerHTML = mensagem;
    chat.appendChild(novaBolha);

    let novaBolhaBot = criarBolhaBot();
    chat.appendChild(novaBolhaBot);
    vaiParaFinalDoChat();
    novaBolhaBot.innerHTML = "Analisando..."


    try {
        // Envia requisição com a mensagem para a API do ChatBot
        const resposta = await fetch ("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 'pergunta': mensagem }),
        });

        const data = await resposta.json();
        console.log(data);
        novaBolhaBot.innerHTML = data.resposta.replace(/\n/g, '<br>');
        vaiParaFinalDoChat();
    } catch (error) {
        console.error("Erro na requisição:", error);
        novaBolhaBot.innerHTML = "Desculpe, ocorreu um erro.";
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
    event.preventDefault()

    if (event.keyCode == 13) {
        botaoEnviar.click();
    }

});