import re

with open("reconstructed_doc.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

placeholder_patterns = [r"<<", r">>", r"<Sinh viên", r"\[ghi", r"your_secret_key"]

with open("placeholders.txt", "w", encoding="utf-8") as out:
    for i, line in enumerate(lines):
        matched = False
        for pattern in placeholder_patterns:
            if re.search(pattern, line):
                out.write(f"Line {i+1}: {line.strip()}\n")
                matched = True
                break
print("Done searching placeholders")
