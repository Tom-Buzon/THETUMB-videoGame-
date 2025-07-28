import os

# Point de départ : dossier où est lancé le script
base_dir = os.path.abspath(os.path.dirname(__file__))
tree_output = os.path.join(base_dir, "arborescence.txt")
code_output = os.path.join(base_dir, "code_sources.txt")

arbo_lines = []
code_blocks = []

def walk(dir_path, indent=""):
    try:
        for entry in sorted(os.listdir(dir_path)):
            full_path = os.path.join(dir_path, entry)
            rel_path = os.path.relpath(full_path, base_dir)

            if os.path.isdir(full_path):
                arbo_lines.append(f"{indent}📁 {entry}")
                walk(full_path, indent + "  ")
            else:
                arbo_lines.append(f"{indent}📄 {entry}")

                if entry.endswith(".js") or entry == "index.html":
                    with open(full_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    code_blocks.append(f"\n===== {rel_path} =====\n{content}")
    except PermissionError:
        pass  # Ignore dossiers protégés

# Lancer le parcours
walk(base_dir)

# Sauvegarde des fichiers
with open(tree_output, "w", encoding="utf-8") as f:
    f.write("\n".join(arbo_lines))

with open(code_output, "w", encoding="utf-8") as f:
    f.write("\n".join(code_blocks))

print("✅ Arborescence écrite dans arborescence.txt")
print("✅ Code source extrait dans code_sources.txt")