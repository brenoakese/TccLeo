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
    localStorage.removeItem("userSession");

    // Requisição ao servidor para finalizar a sessão
    try {
        const response = await fetch('http://127.0.0.1:3000/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (response.ok) {
            console.log(result.message); // Exibe mensagem de sucesso

            window.location.href = 'index.html';
        } else {
            console.error(result.message); // Exibe mensagem de erro
        }
    } catch (error) {
        console.error("Erro ao sair da conta:", error);
    }
    
})



