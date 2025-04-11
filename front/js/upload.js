document.getElementById('form-upload-txt').addEventListener('submit', async (event) => {
    event.preventDefault();

    console.log("Arquivo recebido:", req.file);

    const formData = new FormData();
    const fileInput = document.getElementById('arquivoTxt');

    console.log("Arquivo selecionado:", fileInput.files[0]);

    formData.append('arquivoTxt', fileInput.files[0]);

    try {
        const response = await fetch('http://localhost:3000/upload-txt', {
            method: 'POST',
            body: formData,
        });

        const resultText = await response.text();
        console.log("Resposta bruta do servidor:", resultText);

        if(response.ok) {
            alert("Arquivo enviado e processado com sucesso!\n\nSaída do script:\n" + result.output);
            console.log("Caminho do arquivo:", result.filePath);
            console.log("Saída do script:", result.output);
        } else {
            alert(result.message);
        }
    }  catch (error) {
        console.error("Erro no upload:", error);
        alert("Erro ao enviar arquivo.");
    }
});
