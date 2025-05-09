document.getElementById("btn-iniciar-chat").addEventListener("click", () => {
    
    const agenteSelecionado = document.querySelector(".selected").textContent.trim();

    localStorage.setItem("agenteSelecionado", agenteSelecionado);

    window.location.href = "chat.html";

});