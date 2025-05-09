document.getElementById('form-upload-txt').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById('arquivoTxt');

    const file = fileInput.files[0];
    if (!file) {
        alert("Nenhum arquivo selecionado.");
        return;
    }

    formData.append(file.name, file);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if(response.ok && result.status === "success") {
            localStorage.setItem("arquivo", file.name);

            alert("Arquivo enviado e processado com sucesso!\n");

            window.location.href = "conversa_chatbot.html";
        } else {
            alert(result.message || "Erro desconhecido.");
        }
    }  catch (error) {
        console.error("Erro no upload:", error);
        alert("Erro ao enviar arquivo.");
    }
});
