document.getElementById('form-upload-txt').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById('arquivoUpload');

    formData.append('arquivoTxt', fileInput.files[0]);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            headers: {
                'x-user-email': localStorage.getItem("userEmail")
            },
            body: formData
        });

        const resultText = await response.text();
        console.log("Resposta bruta do servidor:", resultText);

        if (response.ok) {
            window.location.href = 'selecionaragente.html';
        } else {
            alert("Erro ao processar o arquivo: " + resultText);
        }
    } catch (error) {
        console.error("Erro no upload:", error);
        alert("Erro ao enviar arquivo.");
    }
});
