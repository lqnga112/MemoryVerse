import json
import re

with open(r"C:\Users\admin\.gemini\antigravity\brain\1598ac18-ac18-4329-a47d-8e59e05fb34b\.system_generated\steps\1503\content.md", "r", encoding="utf-8") as f:
    html = f.read()

chunks = re.findall(r'DOCS_modelChunk\s*=\s*({[^;]+});', html)

full_text = ""
for chunk_str in chunks:
    try:
        chunk_json = json.loads(chunk_str)
        for item in chunk_json.get("chunk", []):
            if "s" in item:
                full_text += item["s"]
    except Exception as e:
        pass

with open("reconstructed_doc.txt", "w", encoding="utf-8") as out:
    out.write(full_text)

print("Reconstructed length:", len(full_text))

lines = full_text.split('\n')
with open("headings_reconstructed.txt", "w", encoding="utf-8") as out:
    for i, line in enumerate(lines):
        if any(w in line for w in ["PHẦN", "Phần", "Đối tượng"]):
            if len(line) < 150:
                out.write(f"Line {i}: {line}\n")
