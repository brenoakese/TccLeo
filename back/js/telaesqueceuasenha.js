// LÓGICA DE RECUPERAR A SENHA



document.getElementById("btn-renovar-senha").addEventListener("click", async (event) => {

    event.preventDefault()
 
    // Capturar os dados do usuário
    const UserData = {
         email: document.getElementById("email-nova-senha").value,
         newPassword: document.getElementById("password-nova-senha").value,
    };
 
    try {
        const response = await fetch('http://127.0.0.1:3000/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(UserData),
        });
        
        
    
        // Processar a resposta
        const result = await response.json();
        if (response.ok) {
            console.log(result.message); // Exibe mensagem de sucesso

            window.location.href = 'index.html'; // Redirecionar para a página de login
        } else {
            console.error(result.message); // Exibe mensagem de erro
        }
    } catch (error) {
        console.log('Erro ao redefinir senha:', error);
    }
 
     // Limpar os campos do formulário
    document.getElementById("email-nova-senha").value = "";
    document.getElementById("password-nova-senha").value = "";
 
     
 
 
 })