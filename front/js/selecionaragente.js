document.getElementById("btn-iniciar-chat").addEventListener("click", () => {
    
    const agenteSelecionado = document.querySelector(".selected").textContent.trim();
    localStorage.setItem("agenteSelecionado", agenteSelecionado);

    if (agenteSelecionado === "Informal") {
        window.location.href = "conversa_chatbot_informal.html";
    } else {
        window.location.href = "conversa_chatbot.html";
    }
});