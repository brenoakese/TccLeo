// IR PARA O CHAT BOT


document.addEventListener("DOMContentLoaded", () => {
    const btnAgente = document.getElementById("btn-selecionaragente");
    const mensagemStatus = document.getElementById("mensagem-status");
    const spinner = document.getElementById("spinner");

    if (!btnAgente) {
        console.warn("Botão 'Selecionar Agente' não encontrado.");
        return;
    }

    const nomeArquivo = localStorage.getItem("arquivo");
    btnAgente.disabled = !nomeArquivo;


    btnAgente.addEventListener("click", async () => {

        btnAgente.disabled = true;

        mensagemStatus.textContent = "⏳ Preparando ambiente..."
        mensagemStatus.style.color = "#2c3e50";
        spinner.style.display = "block";

        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const response = await fetch("http://localhost:5501/iniciar-flask", {
                method: "POST"
            });

            const json = await response.json();
            console.log("Resposta do servidor Flask:", json);

            if (json.status === "success") {
                mensagemStatus.textContent = "✅ Servidor Flask pronto!";
                mensagemStatus.style.color = "green";
                spinner.style.display = "none";
                setTimeout(() => {
                    window.location.href = 'selecionaragente.html';
                }, 1000);
            } else {
                mensagemStatus.textContent = "❌ Erro ao iniciar o servidor Flask: ", + json.message;
                mensagemStatus.style.color = "red";
                spinner.style.display = "none";
            }
        } catch (error) {
            console.error("Erro ao iniciar Flask:", error);
            mensagemStatus.textContent = "❌ Erro ao iniciar servidor Flask. Verifique se ele está rodando.";
            mensagemStatus.style.color = "red";
            spinner.style.display = "none";
        }
    });
});