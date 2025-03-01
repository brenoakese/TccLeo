document.getElementById("btn-login").addEventListener("click", async (event) => {
   event.preventDefault();

   // Capturar os dados do usuário
   const userData = {
       email: document.getElementById("email-login").value,
       password: document.getElementById("password-login").value,
   };

   // Limpar os campos do formulário
   document.getElementById("email-login").value = "";
   document.getElementById("password-login").value = "";

   try {
       // Fazer a requisição para o servidor
       const response = await fetch('http://127.0.0.1:3000/login', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify(userData),
       });
       


       // Processar a resposta
       const result = await response.json();
       if (response.ok) {
           console.log(result.message); // Exibe mensagem de sucesso

           window.location.href = 'telainicial.html'; // Redirecionar para a página inicial
       } else {
           console.error(result.message); // Exibe mensagem de erro
       }
   } catch (error) {
       console.log('Erro ao fazer login:', error);
   }
});


document.getElementById("btn-cadastro").addEventListener("click", async (event) => {

   event.preventDefault()

   const UserData = {
        name: document.getElementById("name-cadastro").value,
        email: document.getElementById("email-cadastro").value,
        password: document.getElementById("password-cadastro").value,
   };

   try {
       const response = await fetch('http://127.0.0.1:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(UserData),
        });
   
        const result = await response.json();
        if (response.ok) {
            alert(result.message); // Exibe mensagem de sucesso
        } else {
            alert(result.message); // Exibe mensagem de erro
            console.error(result.message); // Exibe mensagem de erro
        }
    } catch (error) {
        console.log('Erro ao fazer cadastro:', error);
    }


})