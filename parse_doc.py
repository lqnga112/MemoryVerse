import re

with open(r"C:\Users\admin\.gemini\antigravity\brain\1598ac18-ac18-4329-a47d-8e59e05fb34b\.system_generated\steps\1503\content.md", "r", encoding="utf-8") as f:
    text = f.read()

# Strip HTML tags simply
clean_text = re.sub(r'<[^>]+>', '\n', text)
clean_text = re.sub(r'\n+', '\n', clean_text)

# Find heading matches
lines = clean_text.split('\n')
with open("headings.txt", "w", encoding="utf-8") as out:
    for i, line in enumerate(lines):
        if any(w in line for w in ["PHẦN", "Phần", "Mục tiêu", "Đối tượng", "Khái quát", "Giới thiệu"]):
            out.write(f"Line {i}: {line[:120]}\n")
print("Done writing to headings.txt")
