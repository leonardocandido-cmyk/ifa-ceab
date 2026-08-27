import fitz  # PyMuPDF
import os
from pathlib import Path

# Caminho da pasta com os PDFs
pdf_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\courses"
output_folder = os.path.join(pdf_folder, "extracted_images")

# Criar pasta de saída
os.makedirs(output_folder, exist_ok=True)

# Lista de PDFs
pdf_files = [
    "2_6558___2a_SERIE_AULA_22_2026.pdf",
    "2_6558___2a_SERIE_AULA_23_2026.pdf",
    "2_6558___2a_SERIE_AULA_24_2026.pdf"
]

total_images = 0

for pdf_file in pdf_files:
    pdf_path = os.path.join(pdf_folder, pdf_file)
    
    if not os.path.exists(pdf_path):
        print(f"Arquivo não encontrado: {pdf_file}")
        continue
    
    print(f"\nProcessando: {pdf_file}")
    
    # Abrir o PDF
    doc = fitz.open(pdf_path)
    
    # Criar pasta específica para este PDF
    pdf_name = Path(pdf_file).stem
    pdf_output_folder = os.path.join(output_folder, pdf_name)
    os.makedirs(pdf_output_folder, exist_ok=True)
    
    image_count = 0
    
    # Iterar sobre cada página
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Extrair imagens da página
        image_list = page.get_images(full=True)
        
        if image_list:
            print(f"  Página {page_num + 1}: {len(image_list)} imagem(ns) encontrada(s)")
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                
                if base_image:
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # Salvar imagem
                    image_filename = f"page_{page_num + 1}_img_{img_index + 1}.{image_ext}"
                    image_path = os.path.join(pdf_output_folder, image_filename)
                    
                    with open(image_path, "wb") as img_file:
                        img_file.write(image_bytes)
                    
                    image_count += 1
                    print(f"    Salva: {image_filename}")
        else:
            # Tentar desenhar a página como imagem para capturar diagramas
            print(f"  Página {page_num + 1}: Renderizando página como imagem...")
            pix = page.get_pixmap()
            image_filename = f"page_{page_num + 1}_rendered.png"
            image_path = os.path.join(pdf_output_folder, image_filename)
            pix.save(image_path)
            image_count += 1
            print(f"    Salva: {image_filename}")
    
    print(f"Total de imagens extraídas de {pdf_file}: {image_count}")
    total_images += image_count
    
    doc.close()

print(f"\n{'='*50}")
print(f"Total geral de imagens extraídas: {total_images}")
print(f"Imagens salvas em: {output_folder}")
