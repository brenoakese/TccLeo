// LÓGICA DE MOSTRAR AS CREDENCIAIS

document.addEventListener("DOMContentLoaded", async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Erro: Nenhum usuário logado encontrado.");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5501/user-info?email=${email}`);

        const result = await response.json();

        if(response.ok) {
            console.log("Dados do usuário recebidos: ", result);

            // Preenche os campos do formulário com os dados do usuário
            document.getElementById("name-cadastro").value = result.name;
            document.getElementById("email-cadastro").value = result.email;

        } else {
            console.error("Erro ao buscar informações: ", result.message);
            alert(result.message);
        }
    } catch (error) {
        console.error("Erro ao buscar informações do usuário: ", error);
        alert("Erro ao carregar informações.");
    }
});



// LÓGICA DE ALTERAR AS CREDENCIAIS



document.getElementById("btn-redefinir").addEventListener("click", async (event) => {

    event.preventDefault()

    // Capturar email salvo no localStorage
    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Erro: Nenhum usuário logado encontrado.");
        return;
    }

    // Capturar os dados do usuário
    const UserData = {
        email: email,
        name: document.getElementById("name-update").value.trim() || null,
        password: document.getElementById("password-update").value.trim() || null,
    };

    // Se ambos os campos estiverem vazios, impede a atualização
    if (!UserData.name && !UserData.password) {
        alert("Por favor, preencha pelo menos um campo para atualizar.");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5501/update-account', {
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

            window.location.href = 'configuracoes.html'; // Redirecionar para a página de login
        } else {
            console.error(result.message); // Exibe mensagem de erro
        }
    } catch (error) {
        console.log('Erro ao redefinir senha:', error);
    }

     // Limpar os campos do formulário
     document.getElementById("name-update").value = "";
     document.getElementById("email-update").vakue = "";
     document.getElementById("password-update").value = "";


});



// LÓGICA DE DELETAR CONTA



document.getElementById("btn-deletar-conta").addEventListener("click", async (event) => {

    event.preventDefault()

    // Capturar os dados do usuário
    const email = localStorage.getItem("userEmail");

    if (!email) {
        alert("Erro: Nenhum usuário logado encontrado.");
        return;
    }

    console.log("Tentando deletar conta do email:", email); // Verifique no console se o email está correto

    if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita!")) {
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5501/delete-account', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });


        // Processar a resposta
        const result = await response.json();
        if (response.ok) {
            console.log(result.message); // Exibe a mensagem de sucesso

            // Remover email salvo e redirecionar para a página de login
            localStorage.removeItem("userEmail");

            window.location.href = 'index.html';
        } else {
            console.error(result.message);  // Exibe mensagem de erro
        }
    } catch (error) {
        console.log('Erro ao deletar a conta:', error);
    }
});