import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('Role_Master_API_Frontend_Integration_Guide.docx') as z:
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    text = '\n'.join(root.itertext())
    with open('role_guide.txt', 'w', encoding='utf-8') as f:
        f.write(text)
print("SUCCESSFULLY WRITTEN role_guide.txt")
