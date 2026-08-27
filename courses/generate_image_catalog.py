import os
from PIL import Image
from pathlib import Path
import json

# Caminho das imagens selecionadas
images_folder = r"C:\Users\leona\OneDrive\Documentos\CEAB\2026\Turmas\2° Ano Médio\IFA - Programação\Projetos\2° Tri\images\pdf_extracted"

# Listar imagens
image_files = sorted([f for f in os.listdir(images_folder) if f.endswith(('.jpeg', '.jpg', '.png'))])

image_catalog = []

print("Gerando catálogo de imagens...\n")

for img_file in image_files:
    img_path = os.path.join(images_folder, img_file)
    
    try:
        with Image.open(img_path) as img:
            width, height = img.size
            file_size = os.path.getsize(img_path) / 1024  # KB
            aspect_ratio = width / height
            
            # Categorizar baseado no aspect ratio
            if aspect_ratio > 1.5:
                category = "widescreen_diagram"
                suggestion = "Seção Fisiologia ou Física (diagramas horizontais)"
            elif 0.9 < aspect_ratio < 1.1:
                category = "square_icon"
                suggestion = "Ícones, ilustrações ou galeria"
            elif aspect_ratio < 0.67:
                category = "vertical_diagram"
                suggestion = "Diagramas verticais ou banners laterais"
            else:
                category = "standard"
                suggestion = "Uso geral em cards ou seções"
            
            # Categorizar baseado no tamanho
            if file_size > 100:
                quality = "high"
            elif file_size > 50:
                quality = "medium"
            else:
                quality = "low"
            
            image_catalog.append({
                "name": img_file,
                "path": f"images/pdf_extracted/{img_file}",
                "width": width,
                "height": height,
                "size_kb": round(file_size, 1),
                "aspect_ratio": round(aspect_ratio, 2),
                "category": category,
                "quality": quality,
                "suggestion": suggestion
            })
            
    except Exception as e:
        print(f"Erro ao processar {img_file}: {e}")

# Salvar catálogo JSON
json_path = os.path.join(images_folder, "image_catalog.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(image_catalog, f, indent=2, ensure_ascii=False)

print(f"Catálogo JSON salvo: {json_path}")
print(f"Total de imagens catalogadas: {len(image_catalog)}")

# Gerar relatório textual
report_path = os.path.join(images_folder, "RELATORIO_IMAGENS.md")
with open(report_path, "w", encoding="utf-8") as f:
    f.write("# RELATÓRIO DE IMAGENS EXTRAÍDAS DOS PDFS\n\n")
    f.write(f"**Total de imagens extraídas:** {len(image_catalog)}\n\n")
    f.write("## Categorias de Imagens\n\n")
    
    # Agrupar por categoria
    categories = {}
    for img in image_catalog:
        cat = img["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(img)
    
    for cat, imgs in categories.items():
        f.write(f"### {cat.upper().replace('_', ' ')} ({len(imgs)} imagens)\n\n")
        f.write(f"**Sugestão de uso:** {imgs[0]['suggestion']}\n\n")
        
        for img in imgs[:5]:  # Mostrar primeiras 5 de cada categoria
            f.write(f"- **{img['name']}**\n")
            f.write(f"  - Dimensões: {img['width']}x{img['height']}px\n")
            f.write(f"  - Tamanho: {img['size_kb']}KB\n")
            f.write(f"  - Qualidade: {img['quality']}\n\n")
        
        if len(imgs) > 5:
            f.write(f"... e mais {len(imgs) - 5} imagens nesta categoria\n\n")
    
    f.write("\n## Recomendações de Uso no Site\n\n")
    f.write("### Seção Fisiologia do Olho\n")
    f.write("- Use imagens widescreen (aspect ratio ~1.77) para diagramas de anatomia ocular\n")
    f.write("- Imagens quadradas podem ser usadas como ícones para cada componente (córnea, cristalino, etc.)\n\n")
    
    f.write("### Seção Problemas de Visão\n")
    f.write("- Diagramas mostrando miopia, hipermetropia e astigmatismo\n")
    f.write("- Ilustrações comparativas de visão normal vs deficiente\n\n")
    
    f.write("### Seção Bengala Inteligente\n")
    f.write("- Fotos de protótipos (se disponíveis)\n")
    f.write("- Esquemas de circuito eletrônico\n")
    f.write("- Diagramas de funcionamento do sensor ultrassônico\n\n")
    
    f.write("### Seção Galeria\n")
    f.write("- Todas as imagens quadradas de alta qualidade podem ser usadas na galeria\n")
    f.write("- Organize por tema: anatomia, física, eletrônica, protótipos\n\n")
    
    f.write("## Imagens em Destaque (Alta Qualidade)\n\n")
    high_quality = [img for img in image_catalog if img["quality"] == "high"]
    for img in high_quality[:10]:
        f.write(f"### {img['name']}\n")
        f.write(f"- **Dimensões:** {img['width']}x{img['height']}px\n")
        f.write(f"- **Tamanho:** {img['size_kb']}KB\n")
        f.write(f"- **Sugestão:** {img['suggestion']}\n\n")

print(f"Relatório Markdown salvo: {report_path}")

# Mostrar estatísticas
print(f"\n{'='*60}")
print("ESTATÍSTICAS:")
print(f"{'='*60}")
print(f"Total de imagens: {len(image_catalog)}")
print(f"Imagens de alta qualidade (>100KB): {len([i for i in image_catalog if i['quality'] == 'high'])}")
print(f"Imagens widescreen (diagramas): {len([i for i in image_catalog if i['category'] == 'widescreen_diagram'])}")
print(f"Imagens quadradas (ícones): {len([i for i in image_catalog if i['category'] == 'square_icon'])}")
print(f"Imagens verticais: {len([i for i in image_catalog if i['category'] == 'vertical_diagram'])}")
