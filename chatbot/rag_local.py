import os
from langchain_text_splitters import RecursiveCharacterTextSplitter, CharacterTextSplitter
#Chroma = banco de dados local
from langchain_chroma import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import sys

load_dotenv()

chunk_size = 1000

# Percentual de overlap = é um recorte que pega um pouco do texto de baixo (inicio) com um pouco do texto de cima (final)
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

arquivo = sys.argv[1]

texto = open_file(arquivo)
filename = os.path.basename(arquivo)
metadatas = [{"nome do arquivo": filename}]

text_splitter = CharacterTextSplitter(separator=".", chunk_size=chunk_size, #text_splitter = RecursiveCharacterTextSplitter(separators=["}\n{"],chunk_size=chunk_size ,
                                      chunk_overlap=int(chunk_size * percentual_overlap),
                                      length_function=len,
                                      is_separator_regex=False,
                                      )


all_splits = text_splitter.create_documents([texto], metadatas=metadatas)
for index, text in enumerate(all_splits):
    print("#####", index + 1, "#####")
    print(text.page_content)
    print(text.metadata)

vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())

question = "Quais as características do fisioculturismo?"
docs = vectorstore.similarity_search_with_score(question, k=4)
len(docs)

for index, doc in enumerate(docs):
    print("Resultado", index + 1)
    print(doc)