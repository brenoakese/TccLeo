import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pkg from 'pg';
import path from 'path';
import  fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


import filesPayloadExists from './middleware/filesPayloadExists.js';
import fileExtLimiter from './middleware/fileExtLimiter.js';
import fileSizeLimiter from './middleware/fileSizeLimiter.js';




const { Pool } = pkg;



// Configuração do pool de conexões



const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Chabot',
    password: 'testralio',
    port: 5432,
});


const app = express();
const PORT = process.env.PORT || 5501;


app.use(cors());
app.use(bodyParser.json());



// LOGIN



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



// CADASTRO



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



// ESQUECEU SENHA



app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    if (!newPassword) {
        return res.status(400).json({ message: 'Senha é obrigatória.' });
    }

    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email, senha e nome são obrigatórios.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    try {

        const client = await pool.connect();

        try {
            // Verificar se o email existe no banco de dados
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Email não encontrado.' });
            }

            // Atualizar a senha do usuário
            await client.query('UPDATE users SET password = $1 WHERE email = $2', [newPassword, email]);

            res.status(200).json({ message: 'Senha atualizada com sucesso!' });
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }

});



// BARRA DE OPÇÕES



app.post('/logout', async (req, res) => {
    res.status(200).json({ message: 'Logout realizado com sucesso!' });
});



// MOSTRAR INFORMAÇÕES DA CONTA

app.get('/user-info', async (req, res) => {

    const email = req.query.email; // Captura o email

    if (!email) {
        return res.status(400).json({ message: 'Erro: Email não encontrado.' });
    }

    try {
        const client = await pool.connect();

        try {
            console.log("Buscando informações do usuário: ", email);

            // Consulta no banco de dados para buscar nome e email do usuário
            const result = await client.query('SELECT name, email FROM users WHERE email = $1' ,[email]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado.' }); 
            }

            // Retorna os dados do usuário
            res.status(200).json(result.rows[0]);

        } finally {
            client.release();
        }
    } catch(error) {
        console.error('Erro ao buscar informações do usuário: ', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }

});



// ATUALIZAR INFORMAÇÕES DA CONTA



app.post('/update-account', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório para atualizar a conta.' });
    }

    try {

        const client = await pool.connect();

        try {
            // Verificar se o email existe no banco de dados
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Email não encontrado.' });
            }

            // Array de campos a serem atualizados
            const fields = [];
            const values = [];
            let index = 1;

            if (name) {
                fields.push(`name = $${index}`);
                values.push(name);
                index++;
            }

            if (password) {
                fields.push(`password = $${index}`);
                values.push(password);
                index++;
            }

            if (fields.length === 0) {
                return res.status(400).json({ message: "Nenhuma informação foi enviada para atualização." });
            }

            values.push(email);
            const query = `UPDATE users SET ${fields.join(", ")} WHERE email = $${index}`;

            await client.query(query, values);

            res.status(200).json({ message: "Conta atualizada com sucesso!" });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
    
});



// DELETAR A CONTA



app.post('/delete-account', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Erro: Email não encontrado.' });
    }

    try {

        const client = await pool.connect();

        try {

            console.log("Recebendo requisição para deletar:", email); // Verifique no servidor
            
            // Verificar se o email existe no banco de dados
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            // Deletar a conta do usuário
            await client.query('DELETE FROM users WHERE email = $1', [email]);

            res.status(200).json({ message: 'Conta deletada com sucesso!' });
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Erro ao apagar a conta:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }

});



// ARQUIVOS
// CONFIGURAÇÃO DE ARMAZENAMENTO E UPLOAD



/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "back/uploads");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.filename + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage });

app.use(express.static(__dirname));

const upload = multer({
    storage: storage, 
    limits: null,
    fileFilter: (req, file, cb) => {
        const allowedMime = ['text/plain'];
        const allowedExt = /\.txt$/;

        const isMimeValid = allowedMime.includes(file.mimetype);
        const isExtValid = allowedExt.test(path.extname(file.originalname).toLowerCase());

        if (isMimeValid && isExtValid) {
            return cb(null, true);
        } else {
            cb("Error: apenas .txt");
        }
    },
});
*/



import fetch from 'node-fetch';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "novaconversa.html"));
});

app.post("/upload",
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter(['.txt']),
    fileSizeLimiter,
    async (req, res) => {
        const files = req.files;
        const uploadedFileNames = [];

        try {
            const savePromises = Object.keys(files).map(key => {
                const filepath = path.join(__dirname, 'files', files[key].name);
                uploadedFileNames.push(files[key].name);

                return new Promise((resolve, reject) => {
                    files[key].mv(filepath, (err) => {
                        if (err) return reject(err);
                        resolve(filepath);
                    });
                });
            });        

            await Promise.all(savePromises);
            console.log("Arquivo(s) salvo(s) com sucesso!");

            const filename = uploadedFileNames[0];
            const flaskResponse = await fetch("http://localhost:5000/load-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename })
            });

            const flaskJson = await flaskResponse.json();
            console.log("Resposta do Flask: ", flaskJson);

            console.log("Arquivo recebido para carregar:", filename)

            res.status(200).json({
                status: "success",
                message: `Arquivo ${filename} processado com sucesso.`
            });

        } catch (err) {
            console.error("❌ Erro no upload ou ao chamar o Flask", err);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                status: "success",
                message: `Arquivo ${filename} processado com sucesso.`
            });
        }
    }
);


app.use(express.static(__dirname));

// exec('python3 chatbot/gpt4o-mini.py', (error, stdout, stderr) => {
//    if (error) {
//        console.error(`Erro ao executar Python: ${error.message}`);
//        return res.status(500).json({ status: "error", message: "Erro ao rodar o Python." });
//    }
//    if (stderr) {
//        console.warn(`stderr do Python: ${stderr}`);
//    }
//    console.log(`stdout do Python:\n${stdout}`);
//
//    return res.status(200).json({
//        status: "success",
//        message: uploadedFileNames.join(', '),
//        python_output: stdout
//    });
//});

app.listen(PORT, () => {
    console.log(`Servidor NODE JS rodando em http://localhost:${PORT}`);
}); 

