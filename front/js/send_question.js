// IR CHAT
document.getElementById("btn-send-question").addEventListener("click",  async (event) => {
    event.preventDefault()

    const user_message = document.getElementById("input-user-question").value

    const data = { message: user_message }

    document.getElementById("input-user-question").value = " "

    try {
        const response = await fetch('http://127.0.0.1:3000/user-question', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(data),
        });

    } catch (error) {
        console.log('Erro', error);
    }


    
});