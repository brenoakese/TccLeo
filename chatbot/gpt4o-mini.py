
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import pandas as pd
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from openai import OpenAI
import psycopg2

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "*"}})

api_key = os.getenv("OPENAI_API_KEY")

def reescrever_pergunta(pergunta):
    prompt_reescrita = f"""
Reescreva a seguinte pergunta de forma mais clara, objetiva e focada, mantendo o significado original:

Pergunta original: {pergunta}

Nova pergunta:
"""
    client = OpenAI(api_key=api_key)
    resposta = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Você é um assistente que reformula perguntas de forma clara e objetiva."},
            {"role": "user", "content": prompt_reescrita}
        ],
        temperature=0.3,
        max_tokens=100
    )
    return resposta.choices[0].message.content.strip()

def carregar_documento_dinamicamente(filepath, filename):
    if filepath.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            conteudo = f.read()
        return [Document(page_content=conteudo, metadata={"source": filename})]

    elif filepath.endswith(".pdf"):
        reader = PdfReader(filepath)
        textos = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text:
                    textos.append(Document(page_content=text, metadata={"source": f"{filename}_page_{i}"}))
            except Exception as e:
                print(f"⚠️ Erro ao extrair texto da página {i}: {e}")
        return textos

    elif filepath.endswith(".csv"):
        df = pd.read_csv(filepath)
        conteudo = df.to_string()
        return [Document(page_content=conteudo, metadata={"source": filename})]

    else:
        raise ValueError("Formato de arquivo não suportado.")

@app.route("/ready", methods=["GET"])
def ready():
    return jsonify({ "status": "ready" }), 200

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    pergunta_original = data.get("pergunta")
    filename = data.get("filename")
    email = data.get("email")
    agente = data.get("agente", "Padrão")

    if not pergunta_original or not filename:
        return jsonify({ "erro": "Pergunta ou arquivo ausente" }), 400

    pergunta_refinada = reescrever_pergunta(pergunta_original)
    print(f"❓ Pergunta original: {pergunta_original}")
    print(f"✏️ Pergunta reescrita: {pergunta_refinada}")

    filepath = os.path.join(os.path.dirname(__file__), "..", "back", "files", filename)
    if not os.path.exists(filepath):
        return jsonify({ "erro": "Arquivo não encontrado" }), 404

    persist_dir = f"chroma/{os.path.splitext(filename)[0]}"
    try:
        if not os.path.exists(persist_dir):
            docs = carregar_documento_dinamicamente(filepath, filename)
            text_splitter = CharacterTextSplitter(
                separator=".",
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                is_separator_regex=False,
            )
            all_splits = text_splitter.split_documents(docs)
            vectorstore = Chroma.from_documents(
                documents=all_splits,
                embedding=OpenAIEmbeddings(api_key=api_key),
                persist_directory=persist_dir
            )
            vectorstore.persist()
        else:
            vectorstore = Chroma(
                persist_directory=persist_dir,
                embedding_function=OpenAIEmbeddings(api_key=api_key)
            )

        resultados = vectorstore.similarity_search_with_score(pergunta_refinada, k=4)
        contexto = "\n\n".join([doc[0].page_content for doc in resultados])

    except Exception as e:
        print("❌ Erro ao processar vectorstore:", e)
        return jsonify({ "erro": "Erro ao processar vectorstore" }), 500

    estilo = "linguagem informal, amigável, com emojis e gírias leves." if agente == "Informal" else "linguagem clara, objetiva e profissional, mas sempre respeitosa e educada."

    prompt = f"""
Você é um assistente inteligente que responde perguntas com base nas informações fornecidas no contexto abaixo. 
Se a resposta não estiver no contexto, diga que não encontrou essa informação.

Seu estilo de resposta deve ser: {estilo}

### CONTEXTO

{contexto}

### PERGUNTA

{pergunta_refinada}

### RESPOSTA
"""

    try:
        client = OpenAI(api_key=api_key)
        resposta = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        resposta_final = resposta.choices[0].message.content
    except Exception as e:
        print("❌ Erro na chamada à API OpenAI:", e)
        return jsonify({ "erro": "Erro ao consultar modelo de linguagem" }), 500

    try:
        conn = psycopg2.connect(
            dbname="Chabot",
            user="postgres",
            password="testralio",
            host="localhost",
            port=5432
        )
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM chats WHERE email = %s AND arquivo_nome = %s ORDER BY data_criacao DESC LIMIT 1", (email, filename))
        row = cursor.fetchone()

        if row:
            chat_id = row[0]
            cursor.execute("INSERT INTO mensagens (chat_id, autor, texto) VALUES (%s, %s, %s)", (chat_id, "usuario", pergunta_original))
            cursor.execute("INSERT INTO mensagens (chat_id, autor, texto) VALUES (%s, %s, %s)", (chat_id, "bot", resposta_final))
            conn.commit()
        else:
            print("❗ Chat não encontrado para salvar mensagens.")

        cursor.close()
        conn.close()

    except Exception as e:
        print("❌ Erro ao salvar histórico no banco:", e)

    return jsonify({ "resposta": resposta_final })

if __name__ == "__main__":
    print("Servidor FLASK rodando em http://127.0.0.1:5000")
    app.run(debug=True, host="127.0.0.1", port=5000)
