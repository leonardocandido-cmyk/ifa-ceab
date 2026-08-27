import os
from PIL import Image
from pathlib import Path
import shutil

# Caminho da pasta com as imagens extraídas
extracted_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\courses\extracted_images"
output_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\courses\candidate_images"

# Criar pasta de saída
os.makedirs(output_folder, exist_ok=True)

# Lista de pastas de PDFs
pdf_folders = [
    "2_6558___2a_SERIE_AULA_22_2026",
    "2_6558___2a_SERIE_AULA_23_2026",
    "2_6558___2a_SERIE_AULA_24_2026"
]

print("Filtrando imagens grandes (potenciais diagramas/esquemas)...\n")

total_candidates = 0

for pdf_folder in pdf_folders:
    pdf_path = os.path.join(extracted_folder, pdf_folder)
    
    if not os.path.exists(pdf_path):
        continue
    
    print(f"\n{'='*60}")
    print(f"Pasta: {pdf_folder}")
    print(f"{'='*60}")
    
    # Criar pasta de saída para este PDF
    pdf_output = os.path.join(output_folder, pdf_folder)
    os.makedirs(pdf_output, exist_ok=True)
    
    # Listar arquivos
    image_files = sorted([f for f in os.listdir(pdf_path) if f.endswith(('.jpeg', '.jpg', '.png'))])
    
    candidates = []
    
    for img_file in image_files:
        img_path = os.path.join(pdf_path, img_file)
        
        try:
            with Image.open(img_path) as img:
                width, height = img.size
                file_size = os.path.getsize(img_path) / 1024  # KB
                
                # Filtrar: imagens grandes (ambas dimensões > 300px ou área > 100000px²)
                if (width > 300 and height > 300) or (width * height > 100000):
                    candidates.append({
                        'file': img_file,
                        'width': width,
                        'height': height,
                        'size': file_size,
                        'path': img_path
                    })
                    
                    # Copiar para pasta de candidatos
                    dest_path = os.path.join(pdf_output, img_file)
                    shutil.copy2(img_path, dest_path)
                    
        except Exception as e:
            continue
    
    print(f"Imagens candidatas encontradas: {len(candidates)}")
    
    if candidates:
        print(f"\nDetalhes das imagens candidatas:")
        for i, cand in enumerate(candidates[:20]):  # Mostrar primeiras 20
            print(f"{i+1}. {cand['file']}")
            print(f"   {cand['width']}x{cand['height']}px | {cand['size']:.1f}KB")
        
        if len(candidates) > 20:
            print(f"... (mais {len(candidates) - 20} imagens)")
    
    total_candidates += len(candidates)

print(f"\n{'='*60}")
print(f"Total de imagens candidatas: {total_candidates}")
print(f"Salvas em: {output_folder}")
