import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    console.log(`[${new Date().toISOString()}] Login attempt - Email: ${email}`);

    if (email === 'test@example.com' && password === 'password123') {
        res.status(200).json({ message: 'Login bem-sucedido!' });
    } else {
        res.status(401).json({ message: 'Credenciais inválidas.' });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo deu errado no servidor.' });
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
