import os
from PIL import Image
from pathlib import Path
import shutil

# Caminhos
candidate_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\courses\candidate_images"
target_images_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\images"

# Criar pasta de imagens relevantes
relevant_folder = os.path.join(target_images_folder, "pdf_extracted")
os.makedirs(relevant_folder, exist_ok=True)

# Lista de pastas de PDFs
pdf_folders = [
    "2_6558___2a_SERIE_AULA_22_2026",
    "2_6558___2a_SERIE_AULA_23_2026",
    "2_6558___2a_SERIE_AULA_24_2026"
]

print("Selecionando imagens relevantes para o site...\n")

# Critérios de seleção:
# 1. Imagens grandes (aspect ratio próximo a 16:9 ou 4:3 para diagramas)
# 2. Imagens quadradas (possíveis ícones/ilustrações)
# 3. Imagens com tamanho > 50KB (provavelmente diagramas complexos)

selected_images = []

for pdf_folder in pdf_folders:
    pdf_path = os.path.join(candidate_folder, pdf_folder)
    
    if not os.path.exists(pdf_path):
        continue
    
    print(f"\n{'='*60}")
    print(f"Analisando: {pdf_folder}")
    print(f"{'='*60}")
    
    # Listar arquivos
    image_files = sorted([f for f in os.listdir(pdf_path) if f.endswith(('.jpeg', '.jpg', '.png'))])
    
    for img_file in image_files:
        img_path = os.path.join(pdf_path, img_file)
        
        try:
            with Image.open(img_path) as img:
                width, height = img.size
                file_size = os.path.getsize(img_path) / 1024  # KB
                aspect_ratio = width / height
                
                # Critérios de seleção
                is_large = file_size > 50  # Imagens grandes
                is_widescreen = 1.5 < aspect_ratio < 2.0  # Proporção widescreen (diagramas)
                is_square = 0.9 < aspect_ratio < 1.1  # Proporção quadrada (ícones/illustrações)
                is_high_res = min(width, height) > 500  # Alta resolução
                
                if is_large or (is_widescreen and is_high_res) or (is_square and file_size > 20):
                    selected_images.append({
                        'file': img_file,
                        'width': width,
                        'height': height,
                        'size': file_size,
                        'aspect': aspect_ratio,
                        'source': pdf_folder,
                        'path': img_path
                    })
                    
                    # Copiar para pasta de relevantes
                    new_name = f"{pdf_folder}_{img_file}"
                    dest_path = os.path.join(relevant_folder, new_name)
                    shutil.copy2(img_path, dest_path)
                    
                    print(f"✓ Selecionada: {img_file}")
                    print(f"  {width}x{height}px | {file_size:.1f}KB | Aspect: {aspect_ratio:.2f}")
                    
        except Exception as e:
            continue

print(f"\n{'='*60}")
print(f"Total de imagens selecionadas: {len(selected_images)}")
print(f"Salvas em: {relevant_folder}")

# Criar relatório detalhado
report_path = os.path.join(candidate_folder, "selecao_relatorio.txt")
with open(report_path, "w", encoding="utf-8") as f:
    f.write("RELATÓRIO DE SELEÇÃO DE IMAGENS\n")
    f.write("="*60 + "\n\n")
    f.write(f"Total de imagens selecionadas: {len(selected_images)}\n\n")
    
    for i, img in enumerate(selected_images, 1):
        f.write(f"{i}. {img['file']}\n")
        f.write(f"   Origem: {img['source']}\n")
        f.write(f"   Dimensões: {img['width']}x{img['height']}px\n")
        f.write(f"   Tamanho: {img['size']:.1f}KB\n")
        f.write(f"   Aspect Ratio: {img['aspect']:.2f}\n")
        f.write(f"   Caminho: {img['path']}\n\n")

print(f"Relatório salvo em: {report_path}")
