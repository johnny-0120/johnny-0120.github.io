"""用中文版頁面 ＋ en/strings.json（中→英對照）產生英文版。
處理：index.html → en/index.html，projects/*.html → en/projects/*.html
中文版改完之後跑：  python build_en.py
有沒翻到的中文會列出來，把它加進 en/strings.json 再跑一次。"""
import json, re, pathlib, sys
here = pathlib.Path(__file__).parent
S = json.loads((here / 'en' / 'strings.json').read_text(encoding='utf-8'))
SHORT = json.loads((here / 'en' / 'short.json').read_text(encoding='utf-8'))
CJK = re.compile(r'[一-鿿]')
ALLOW = ['徐專洧 · Johnny', '(陳永祥)', '中文版', '中文']
missing = set()

def tr(t):
    k = t.strip()
    if not k or not CJK.search(k) or k == '洧': return t
    if k in S: return t.replace(k, S[k])
    missing.add(k); return t

def convert(src, depth):
    out = src
    parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>)', out, flags=re.S)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r'>([^<]+)<', lambda m: '>' + tr(m.group(1)) + '<', parts[i])
        parts[i] = re.sub(r'\b(alt|aria-label|content|title)="([^"]*)"', lambda m: f'{m.group(1)}="{tr(m.group(2))}"', parts[i])
    out = ''.join(parts)
    out = re.sub(r'<li id="x-([\w-]+)"([^>]*?)data-short="[^"]*"', lambda m: f'<li id="x-{m.group(1)}"{m.group(2)}data-short="{SHORT.get(m.group(1), m.group(1))}"', out)
    out = out.replace('<html lang="zh-Hant">', '<html lang="en">')
    out = out.replace('hsu-juan-wei-resume-zh.pdf', 'hsu-juan-wei-resume-en.pdf').replace('img/share-zh.jpg', 'img/share-en.jpg')
    out = out.replace('content="https://johnny-0120.github.io/"', 'content="https://johnny-0120.github.io/en/"')
    # 檔案（圖片、字型、樣式、程式、履歷）多加一層 ../；頁面之間的連結不動，才會連到英文版的頁面
    out = re.sub(r'(href|src|data-img|data-dark)="((?:\.\./)*)(img/|fonts/|resume/|style\.css|main\.js)', r'\1="../\2\3', out)
    # 中英切換鈕：英文版指回中文版同一頁
    back = '../' if depth == 1 else f'../../projects/{CUR}'
    out = re.sub(r'<a class="lang-btn" href="[^"]*" hreflang="en" lang="en" aria-label="English version">EN</a>',
                 f'<a class="lang-btn" href="{back}" hreflang="zh-Hant" lang="zh-Hant" aria-label="中文版">中文</a>', out)
    return out

pages = [('index.html', 'en/index.html', 1)] + [(f'projects/{p.name}', f'en/projects/{p.name}', 2) for p in sorted((here / 'projects').glob('*.html'))]
(here / 'en' / 'projects').mkdir(parents=True, exist_ok=True)
for src, dst, depth in pages:
    CUR = pathlib.Path(src).name
    html = convert((here / src).read_text(encoding='utf-8'), depth)
    (here / dst).write_text(html, encoding='utf-8')

if missing:
    print('還沒翻譯：'); [print(' -', t) for t in sorted(missing)]
    sys.exit(1)
print('英文版已產生：', ', '.join(d for _, d, _ in pages))
