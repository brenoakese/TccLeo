// Barra de Opções
// => Botão Tela Inicial



document.getElementById("btn-telainicial").addEventListener("click", async (event) => {
    event.preventDefault()

    window.location.href = 'telainicial.html';
})



// => Botão Configurações



document.getElementById("btn-configuracoes").addEventListener("click", async (event) => {
    event.preventDefault()

    window.location.href = 'configuracoes.html';
})



// => Botão Sair

document.getElementById("btn-sair-conta").addEventListener("click", async (event) => {
    event.preventDefault()

    // Remover dados do usuário => localStorage
    localStorage.removeItem("userEmail");
    localStorage.removeItem("arquivo");
    localStorage.removeItem("agenteSelecionado");

    // Redirecionar para login
    window.location.href = "index.html";
    
});



