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

chunk_size = 500
percentual_overlap = 0.2

# Variável criada para caso você já tenha criado um banco de dados ou não, caso não criado, coloque "True"
criar_db = True

def open_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            contents = file.read()
        return contents
    except FileNotFoundError:
        return "File not found."
    except Exception as e:
        return f"Error: {e}"
        
if criar_db:
    arquivo = latest_file()
        
    texto = open_file(arquivo)
    filename = os.path.basename(arquivo)
    metadatas = [{"nome do arquivo": filename}]


    text_splitter = CharacterTextSplitter(separator="\n", chunk_size=chunk_size,
                                        chunk_overlap=int(chunk_size * percentual_overlap),
                                        length_function=len,
                                        is_separator_regex=False,
                                        )


    all_splits = text_splitter.create_documents([texto], metadatas=metadatas)

    vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings(api_key=api_key), persist_directory="chroma")

else:
    vectorstore = Chroma(embedding_function=OpenAIEmbeddings(api_key=api_key), persist_directory="chroma")


# Bot padrão
def enviar_pergunta(pergunta):
    try:
        # Envia a pergunta para a API
        client = OpenAI(api_key=api_key)
        resposta = client.chat.completions.create(
            model="gpt-4o-mini", # Especifica o modelo a ser utilizado
            messages=[
                {"role": "user", "content": pergunta}
            ]
        )

        # Extrai a resposta gerada pelo GPT-4
        return resposta.choices[0].message.content

    except Exception as e:
        return f"Ocorreu um erro: {e}"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("pergunta")

    if not question:
        return jsonify({ "erro": "Pergunta não fornecida" }), 400
    
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

    {question}
    """

    resposta = enviar_pergunta(prompt)
    return jsonify({ "resposta": resposta })


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)