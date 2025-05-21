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


def reescrever_pergunta(pergunta):
    prompt_reescrita = f"""
Reescreva a seguinte pergunta de forma mais clara, objetiva e focada, mantendo o significado original:

Pergunta original: {pergunta}

Nova pergunta:
"""
    client = OpenAI(api_key=api_key)
    resposta = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Você é um assistente que reformula perguntas de forma clara e objetiva."},
            {"role": "user", "content": prompt_reescrita}
        ],
        temperature=0.3,
        max_tokens=100
    )

    nova_pergunta = resposta.choices[0].message.content.strip()
    return nova_pergunta


vectorstore_ready = False
vectorstore = None


try:
    vectorstore = Chroma (
        embedding_function=OpenAIEmbeddings(api_key=api_key),
        persist_directory = "chroma"
    )
    vectorstore_ready = True
        
    print("✅ Vectorstore carregado com sucesso!")
except Exception as e:
    print("❌ Erro ao carregar vectorstore:", e)


@app.route("/ready", methods=["GET"])
def ready():
    if vectorstore_ready:
        return jsonify({ "status": "ready" }), 200
    else:
        return jsonify({ "status": "loading" }), 503


# Bot 
def enviar_pergunta(nova_pergunta):
    try:
        # Envia a pergunta para a API
        client = OpenAI(api_key=api_key)
        resposta = client.chat.completions.create(
            model="gpt-4o-mini", # Especifica o modelo a ser utilizado
            messages=[
                {"role": "user", "content": nova_pergunta}
            ]
        )

        # Extrai a resposta gerada pelo GPT-4
        return resposta.choices[0].message.content

    except Exception as e:
        return f"Ocorreu um erro: {e}"



@app.route("/chat", methods=["POST"])
def chat():
    if not vectorstore_ready:
        return jsonify({ "erro": "Vectorstore ainda não está pronto" }), 503

    data = request.get_json()
    pergunta_original = data.get("pergunta")
    pergunta_refinada = reescrever_pergunta(pergunta_original)
    print(f"❓ Pergunta original: {pergunta_original}")
    print(f"✏️ Pergunta reescrita: {pergunta_refinada}")

    if not pergunta_original:
        return jsonify({ "erro": "Pergunta não fornecida" }), 400
    
    docs = vectorstore.similarity_search_with_score(pergunta_refinada, k=4)

    # Obter contexto dos documentos retornados
    contexto = "\n\n".join([doc[0].page_content for doc in docs])

    # Obter o agente para resposta
    agente = data.get("agente", "Padrão")

    if agente == "Informal":
        estilo = "linguagem informal, amigável, com emojis e gírias leves."
    else:
        estilo = "lingaugem clara, objetiva e profissional, mas sempre respeitoso e educado."

    # Criar o prompt com base no contexto e na pergunta
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

    resposta = enviar_pergunta(prompt)
    return jsonify({ "resposta": resposta })


if __name__ == "__main__":
    print("Servidor FLASK rodando em http://127.0.0.1")
    app.run(debug=True, host="127.0.0.1", port=5000)