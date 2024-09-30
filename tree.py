import os

# Liste des fichiers et dossiers à ignorer
ignored_files = ['package-lock.json','README.md','.gitignore','LICENSE', 'tree.py', 'output.txt']  # Remplace par les fichiers que tu veux ignorer
ignored_dirs = ['__pycache__','node_modules']  # Remplace par les dossiers que tu veux ignorer

def list_files_recursively(directory, output_file):
    with open(output_file, 'w', encoding='utf-8') as f_out:
        for root, dirs, files in os.walk(directory):
            # Ignore les dossiers spécifiés
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            
            for file in files:
                # Ignore les fichiers spécifiés
                if file not in ignored_files:
                    relative_path = os.path.relpath(os.path.join(root, file), directory)
                    f_out.write(f"{relative_path}\n")
                    
                    # Lire et écrire le contenu du fichier
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8') as f_in:
                            content = f_in.read()
                            f_out.write(f"{content}\n\n")
                    except Exception as e:
                        f_out.write(f"Erreur de lecture du fichier: {e}\n\n")

# Exécution du script
if __name__ == "__main__":
    current_dir = os.getcwd()  # Récupère le dossier courant
    output_filename = "output.txt"  # Nom du fichier de sortie
    list_files_recursively(current_dir, output_filename)
