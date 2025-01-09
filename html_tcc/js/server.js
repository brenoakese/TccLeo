import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

// Configuração do pool de conexões
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Chatbot',
    password: '123456789',
    port: 5432,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    console.log(`[${new Date().toISOString()}] Login attempt - Email: ${email}`);

    try {
        // Obtém uma conexão do pool
        const client = await pool.connect();

        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

            if (result.rows.length > 0) {
                res.status(200).json({ message: 'Login bem-sucedido!' });
            } else {
                res.status(401).json({ message: 'Credenciais inválidas.' });
            }
        } finally {
            // Libera a conexão de volta ao pool
            client.release();
        }
    } catch (error) {
        console.error('Erro ao acessar o banco de dados:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Nome é obrigatório.' });
    }

    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Senha é obrigatória.' });
    }

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, senha e nome são obrigatórios.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    try {

        const client = await pool.connect();

        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            
            if (result.rows.length > 0) {
                return res.status(400).json({ message: 'Email já cadastrado.' });
            }
            else{
                await client.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, password]);
                res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
            }


        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Erro ao acessar o banco de dados:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }

});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo deu errado no servidor.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
