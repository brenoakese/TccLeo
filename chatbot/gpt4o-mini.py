import os
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from openai import OpenAI
from dotenv import load_dotenv
from utils import latest_file
from flask import Flask, request, jsonify
from flask_cors import CORS

from rag_local import *
from separadores import *


app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "*"}})


#Ná Prática:
    #1º Gerar o banco de dados
    #2º Busca por similaridade
    #3º Mandar o resultado da busca por similaridade para a LLM e a sua LLM, vai responder a pergunta

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

vectorstores = {}

chunk_size = 500
percentual_overlap = 0.2


def carregar_arquivo_em_memoria(file_path):
    """Gera banco vetorial para um arquivo específico"""
    with open(file_path, "r", encoding="utf-8") as file:
        texto = file.read();  

    filename = os.path.basename(file_path)
    metadatas = [{"nome do arquivo": filename}]

    text_splitter = CharacterTextSplitter(separator="\n", chunk_size=chunk_size,
                                        chunk_overlap=int(chunk_size * percentual_overlap),
                                        length_function=len,
                                        is_separator_regex=False,
                                        )
    
    all_splits = text_splitter.create_documents([texto], metadatas=metadatas)

    vectorstore = Chroma.from_documents(
        documents=all_splits,
        embedding=OpenAIEmbeddings(api_key=api_key),
        persist_directory=f"chroma/{filename}"
    )

    vectorstores[filename] = vectorstore
    return True


@app.route("/load-file", methods=["POST"])
def load_file():
    data = request.json
    filename = data.get("filename")

    if not filename:
        return jsonify({ "erro": "Nome do arquivo não fornecido"}), 400
    
    file_path = os.path.join("files", filename)
    if not os.path.exists(file_path):
        return jsonify({ "erro": "Arquivo não encontrado." }), 404
    
    try:
        carregar_arquivo_em_memoria(file_path)
        return jsonify({ "status": "ok", "message": f"Arquivo {filename} carregado." })
    except Exception as e:
        return jsonify({ "erro": str(e) }), 500


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    pergunta = data.get("pergunta")
    filename = data.get("filename")

    if not pergunta or not filename:
        return jsonify({ "erro": "Pergunta ou arquivo não fornecidos" }), 400
    
    vectorstore = vectorstores.get(filename)
    if not vectorstore:
        return jsonify({ "erro": "Arquivo ainda não carregado." }), 400
    
    docs = vectorstore.similarity_search_with_score(question, k=4)

    # Obter contexto dos documentos retornados
    contexto = "\n\n".join([doc[0].page_content for doc in docs])

    # Criar o prompt com base no contexto e na pergunta
    prompt = f"""
    Responda à pergunta com base nas informações fornecidas no contexto abaixo. 
    Se a resposta não estiver no contexto, diga que não encontrou essa informação.

    ### CONTEXTO

    {contexto}

    ### PERGUNTA

    {pergunta}
    """

    try:
        client = OpenAI(api_key=api_key)
        resposta = client.chat.completions.create(
            model="gpt-4o-mini", # Especifica o modelo a ser utilizado
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return jsonify({ "resposta": resposta.choices[0].message.content })
    
    except Exception as e:
        return jsonify({ "erro": str(e) }), 500


if __name__ == "__main__":
    print("Servidor FLASK rodando em http://127.0.0.1")
    app.run(debug=True, host="127.0.0.1", port=5000)