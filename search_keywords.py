with open("reconstructed_doc.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

keywords = ["ollama", "offline", "llama", "local"]
with open("matches.txt", "w", encoding="utf-8") as out:
    for i, line in enumerate(lines):
        for kw in keywords:
            if kw in line.lower():
                out.write(f"Line {i}: {line.strip()}\n")
                break
print("Done")
