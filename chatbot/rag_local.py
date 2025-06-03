import os
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from utils import latest_file
import os
from PyPDF2 import PdfReader
import pandas as pd
from langchain_core.documents import Document

load_dotenv()

chunk_size = 1000

# Percentual de overlap = é um recorte que pega um pouco do texto de baixo (inicio) com um pouco do texto de cima (final)
percentual_overlap = 0.2


def carregar_documento_dinamicamente(file_path):
    """Carrega arquivos .txt, .pdf ou .csv como documentos LangChain"""
    filename = os.path.basename(file_path)

    if file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            conteudo = f.read()
        return [Document(page_content=conteudo, metadata={"nome do arquivo": filename})]

    elif file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        textos = [page.extract_text() or "" for page in reader.pages]
        return [Document(page_content=t, metadata={"nome do arquivo": filename}) for t in textos]

    elif file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
        conteudo = df.to_string()
        return [Document(page_content=conteudo, metadata={"nome do arquivo": filename})]
    
    else:
        raise ValueError(f"Formato de arquivo não suportado: {file_path}")


arquivo = latest_file()

docs = carregar_documento_dinamicamente(arquivo)

# Exibir conteúdo original
print(f"📄 Carregado: {arquivo}")
for i, doc in enumerate(docs):
    print(f"--- Documento {i+1} ---")
    print(doc.page_content[:500])
    print(doc.metadata)

# Fragmentação dos documentos
text_splitter = CharacterTextSplitter(
    separator=".",
    chunk_size=chunk_size,
    chunk_overlap=int(chunk_size * percentual_overlap),
    length_function=len,
    is_separator_regex=False,
)

all_splits = text_splitter.split_documents(docs)

# Exibir fragmentos
for i, split in enumerate(all_splits):
    print(f"##### Fragmento {i+1} #####")
    print(split.page_content)
    print(split.metadata)

# Criar vectorstore
vectorstore = Chroma.from_documents(
    documents=all_splits,
    embedding=OpenAIEmbeddings(),
    persist_directory="chroma"
)

print("✅ Vectorstore criado com sucesso!")