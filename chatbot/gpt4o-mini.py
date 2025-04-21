import os
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from openai import OpenAI
from dotenv import load_dotenv

#Ná Prática:
    #1º Gerar o banco de dados
    #2º Busca por similaridade
    #3º Mandar o resultado da busca por similaridade para a LLM e a sua LLM, vai responder a pergunta

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

chunk_size = 1000
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
    arquivo = "pug.txt"

    texto = open_file(arquivo)
    filename = os.path.basename(arquivo)
    metadatas = [{"nome do arquivo": filename}]


    text_splitter = CharacterTextSplitter(separator="\n", chunk_size=chunk_size,
    #text_splitter = RecursiveCharacterTextSplitter(separators=["}\n{"],chunk_size=chunk_size ,
                                        chunk_overlap=int(chunk_size * percentual_overlap),
                                        length_function=len,
                                        is_separator_regex=False,
                                        )


    all_splits = text_splitter.create_documents([texto], metadatas=metadatas)
    #for index, text in enumerate(all_splits):
    #    print("#####", index + 1, "#####")
    #    print(text.page_content)
    #    print(text.metadata)

    vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings(api_key=api_key), persist_directory="chroma")

else:
    print("Não criou o BD")
    vectorstore = Chroma(embedding_function=OpenAIEmbeddings(api_key=api_key), persist_directory="chroma")

question = "Quais frutas o pug pode comer?"

docs = vectorstore.similarity_search_with_score(question, k=4)

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
        resposta_texto = resposta.choices[0].message.content

        return resposta_texto
    
    except Exception as e:
        return f"Ocorreu um erro: {e}"

resposta = enviar_pergunta(question + " \nUse os dados a seguir como referência para a resposta" + str(docs))

print("Resposta:", resposta)