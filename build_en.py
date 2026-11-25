"""用中文版 index.html ＋ en/strings.json（中→英對照）產生英文版 en/index.html。
中文版改完之後跑：  python build_en.py
有沒翻到的中文會列出來，把它加進 en/strings.json 再跑一次。"""
import json, re, pathlib, sys
here = pathlib.Path(__file__).parent
zh = (here / 'index.html').read_text(encoding='utf-8')
S = json.loads((here / 'en' / 'strings.json').read_text(encoding='utf-8'))
SHORT = json.loads((here / 'en' / 'short.json').read_text(encoding='utf-8'))
CJK = re.compile(r'[一-鿿]')
ALLOW = ['徐專洧 · Johnny', '(陳永祥)']           # 英文版裡故意保留的中文
missing = []

def tr(t):
    k = t.strip()
    if not k or not CJK.search(k) or k == '洧': return t   # 洧：分頁小圖示上的字，保留
    if k in S: return t.replace(k, S[k])
    missing.append(k); return t

out = zh
# 文字節點（不動 script / style）
parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>)', out, flags=re.S)
for i in range(0, len(parts), 2):
    parts[i] = re.sub(r'>([^<]+)<', lambda m: '>' + tr(m.group(1)) + '<', parts[i])
    parts[i] = re.sub(r'\b(alt|aria-label|content|title)="([^"]*)"', lambda m: f'{m.group(1)}="{tr(m.group(2))}"', parts[i])
out = ''.join(parts)
# 舞台上的短名
out = re.sub(r'<li id="x-([\w-]+)"([^>]*?)data-short="[^"]*"', lambda m: f'<li id="x-{m.group(1)}"{m.group(2)}data-short="{SHORT.get(m.group(1), m.group(1))}"', out)
# 語言、路徑、切換按鈕
out = out.replace('<html lang="zh-Hant">', '<html lang="en">')
out = re.sub(r'(href|src|data-img|data-dark)="(?!https?:|#|mailto:|tel:|data:|\.\./)([^"]+)"', r'\1="../\2"', out)
out = out.replace('href="../en/" hreflang="en" lang="en" aria-label="English version">EN</a>', 'href="../" hreflang="zh-Hant" lang="zh-Hant" aria-label="中文版">中文</a>')
(here / 'en' / 'index.html').write_text(out, encoding='utf-8')

left = [t for t in re.findall(r'>([^<]*[一-鿿][^<]*)<', re.sub(r'<script\b.*?</script>', '', out, flags=re.S))
        if not any(a in t for a in ALLOW) and t.strip() not in ('中文', '洧')]
if missing or left:
    print('還沒翻譯：'); [print(' -', t) for t in sorted(set(missing))]
    sys.exit(1)
print('en/index.html 已產生，全部都有翻譯')
