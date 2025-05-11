// IR PARA O CHAT BOT


document.addEventListener("DOMContentLoaded", () => {
    const btnAgente = document.getElementById("btn-selecionaragente");

    if (!btnAgente) {
        console.warn("Botão 'Selecionar Agente' não encontrado.");
        return;
    }

    const nomeArquivo = localStorage.getItem("arquivo");
    if (nomeArquivo) {
        btnAgente.disabled = false;
    } else {
        btnAgente.disabled = true;
    }

    btnAgente.addEventListener("click", async () => {
        try {
            const response = await fetch("http://localhost:5501/iniciar-flask", {
                method: "POST"
            });

            const json = await response.json();
            console.log("Resposta do servidor Flask:", json);

            if (json.status === "success") {
                window.location.href = 'selecionaragente.html';
            } else {
                alert("Erro ao iniciar o servidor Flask." + json.message);
            }
        } catch (error) {
            console.error("Erro ao iniciar Flask:", error);
            alert("Erro ao iniciar servidor Flask." + error.message);
        }
    });
});