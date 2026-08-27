import os
from PIL import Image
from pathlib import Path

# Caminho da pasta com as imagens extraídas
extracted_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\courses\extracted_images"

# Lista de pastas de PDFs
pdf_folders = [
    "2_6558___2a_SERIE_AULA_22_2026",
    "2_6558___2a_SERIE_AULA_23_2026",
    "2_6558___2a_SERIE_AULA_24_2026"
]

print("Analisando imagens extraídas...\n")

for pdf_folder in pdf_folders:
    pdf_path = os.path.join(extracted_folder, pdf_folder)
    
    if not os.path.exists(pdf_path):
        continue
    
    print(f"\n{'='*60}")
    print(f"Pasta: {pdf_folder}")
    print(f"{'='*60}")
    
    # Listar arquivos
    image_files = sorted([f for f in os.listdir(pdf_path) if f.endswith(('.jpeg', '.jpg', '.png'))])
    
    print(f"Total de imagens: {len(image_files)}")
    print(f"\nPrimeiras 10 imagens (amostra):")
    
    for i, img_file in enumerate(image_files[:10]):
        img_path = os.path.join(pdf_path, img_file)
        
        try:
            with Image.open(img_path) as img:
                width, height = img.size
                file_size = os.path.getsize(img_path) / 1024  # KB
                
                print(f"{i+1}. {img_file}")
                print(f"   Dimensões: {width}x{height}px | Tamanho: {file_size:.1f}KB")
                
                # Analisar se parece ser diagrama/esquema (baseado em proporção)
                aspect_ratio = width / height
                if aspect_ratio > 1.5 or aspect_ratio < 0.67:
                    print(f"   Possível diagrama/esquema (aspect ratio: {aspect_ratio:.2f})")
                
        except Exception as e:
            print(f"{i+1}. {img_file} - Erro ao abrir: {e}")
    
    print(f"\n... (mais {len(image_files) - 10} imagens)")

print(f"\n{'='*60}")
print("Análise concluída!")
