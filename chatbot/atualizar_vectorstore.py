import os
import sys
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv


load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

chunk_size = 500
percentual_overlap = 0.2


def open_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            contents = file.read()
        return contents
    except FileNotFoundError:
        return "File not found."
    except Exception as e:
        return f"Error: {e}"


def gerar_vectorstore(nome_arquivo):
    caminho_arquivo = os.path.join("files", nome_arquivo)
    texto = open_file(caminho_arquivo)
    metadatas = [{"nome do arquivo": nome_arquivo}]

    splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=chunk_size,
        chunk_overlap=int(chunk_size * percentual_overlap),
        length_function=len,
        is_separator_regex=False,
    )

    splits = splitter.create_documents([texto], metadatas=metadatas)

    Chroma.from_documents(
        documents=splits,
        embedding=OpenAIEmbeddings(api_key=api_key),
        persist_directory="chroma"
    )

    print(f"✅ Vectorstore atualizado para o arquivo: {nome_arquivo}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python3 atualizar_vectorstore.py <nome_do_arquivo>")
    else:
        gerar_vectorstore(sys.argv[1])
