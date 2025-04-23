import os, glob


def latest_file():
    # Caminho da pasta onde os arquivos .txt são armazenados
    folder_path = os.path.join(os.path.dirname(__file__), "../back/files")
    folder_path = os.path.abspath(folder_path)

    # Pega todos os arquivos txt na pasta
    txt_files = glob.glob(os.path.join(folder_path, "*txt"))

    # Verifica se há arquivos
    if not txt_files:
        raise FileNotFoundError("Nenhum arquivo encontrado na pasta 'files'.")

    # Pega o arquivo mais recente
    return max(txt_files, key = os.path.getmtime)