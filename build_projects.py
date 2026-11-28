"""產生重點作品的深入介紹頁（projects/*.html）。
內容寫在下面的 PROJECTS，改完跑：  python build_projects.py
接著跑 python build_en.py（英文版）和 python build_fonts.py（字型）。
只寫有來源的事實；沒有資料的地方不要補，列進 Obsidian 專案頁的「待補」。"""
import pathlib, html

here = pathlib.Path(__file__).parent
(here / 'projects').mkdir(exist_ok=True)

PROJECTS = [
  {
    'slug': 'wordmemo', 'title': 'WordMemo 單字記憶', 'kind': '軟體',
    'lede': '給高中生的英文單字網站。先測程度，再用記憶法和間隔複習把字背起來，造句和作文交給 AI 改，老師可以開班出題。',
    'cover': 'img/wordmemo.jpg?v=3', 'cover_dark': 'img/wordmemo-dark.jpg?v=3',
    'meta': [('時間', '2026.03 第一版　2026.11 重寫中'), ('狀態', '製作中，做好之後給我的家教學生用'), ('角色', '獨立開發（AI 輔助）'), ('技術', 'Cloudflare Workers、D1、OpenRouter、Google 登入、PWA'), ('費用', '全部用免費方案')],
    'links': [('看介紹 ↗', 'https://wordmemo.johnny970120.workers.dev/about'), ('直接試用 ↗', 'https://wordmemo.johnny970120.workers.dev')],
    'sections': [
      ('為什麼做', ['我自己準備英文時，背過的單字很快就忘。市面上的 App 大多只是把中文意思背起來，所以我想做一個真的記得住的工具。']),
      ('做了什麼', [
        '程度測驗：從選的年級開始，每 4 題決定升一級或降一級，最多 28 題，找到適合的起點。',
        '記憶法：每個字配字根、諧音、聯想故事、例句或搭配詞，挑一個最適合自己的記。',
        '間隔複習：答錯的字很快會再出現，答對的隔久一點。難度看最近 60 題的答對率，每輪結束也會問「太簡單、剛好、太難」來微調。',
        'AI 造句和作文批改，指出文法問題並給改寫建議。',
        '老師端：可以開班、出四種任務（單字範圍、自訂單字、測驗、作文），每個任務有結果頁，也看得到學生的上線次數、練習時段和最常錯的字。',
        '單字庫是大考中心高中 6000 字，另外有英檢、多益、雅思、托福。手機打開就能用，不登入也能先試。',
      ]),
      ('遇到的難題', [
        '第一版是用 Flask 寫的，要一直開著主機。後來整個改寫成 Cloudflare Workers 加 D1 資料庫，不用自己顧伺服器，也能用免費方案撐住。',
        'AI 模型用的是免費額度，所以免登入試用的人不能用 AI 功能和班級，避免額度一下就被用光。',
        '測試時發現一般老師可以把別人的學生拉進自己的班級，這是權限漏洞，修掉了。',
      ]),
    ],
    'photos': [('img/wordmemo.jpg?v=3', 'WordMemo 首頁'), ('img/ai-report.jpg', 'AI 造句批改')],
  },
  {
    'slug': 'radar', 'title': '中原機會雷達', 'kind': '軟體',
    'lede': '每天自動整理中原大學十幾個公開來源的競賽、實習、獎學金、出國和講座公告，做成能搜尋、看截止日、請 AI 推薦的網站。',
    'cover': 'img/radar.jpg?v=3', 'cover_dark': 'img/radar-dark.jpg?v=3',
    'meta': [('時間', '2026.10 起'), ('狀態', '製作中，還沒開始推廣'), ('角色', '發想、開發、維運（AI 輔助）'), ('技術', 'TypeScript、React、Cloudflare Workers／D1／Vectorize、Google 登入、PWA 推播'), ('資料量', '10 月底搬家時一起搬了 5,228 筆公告')],
    'links': [('打開網站 ↗', 'https://cycu-radar-app.johnny970120.workers.dev'), ('專案介紹 ↗', 'https://github.com/johnny-0120/johnny-0120/blob/main/projects/cycu-opportunity-radar/README.md')],
    'sections': [
      ('為什麼做', ['學校的競賽、實習、獎學金公告分散在十幾個網站，常常是看到的時候已經截止了。']),
      ('做了什麼', [
        '每天自動抓學校的公開公告來源，補齊全文，再用 AI 分類標題、抓出截止日。',
        '首頁有精選、截止時間表、收藏和重要提醒；手機可以裝成 App，收到推播。',
        '「問問 AI」：跟它講自己的興趣和經驗，它會從公告裡挑適合的推薦。搜尋用 BM25 加語意搜尋，讓關鍵字不完全一樣也找得到。',
        '首頁和分類插圖換成手繪風格的吉祥物「小雷」，有深色模式。',
      ]),
      ('遇到的難題', [
        '學校來源很多，常有某個網站逾時或回 503。抓取改成一個來源失敗不影響其他來源，也幫每個來源設了時間上限。',
        'AI 分類每天有用量上限，所以分批處理、先存結果再確認，不會重複花額度。',
        '10 月底把整個網站搬到 Cloudflare，5,228 筆資料搬完後兩邊的筆數和雜湊都核對過。',
      ]),
    ],
    'photos': [('img/radar.jpg?v=3', '中原機會雷達首頁'), ('img/radar-calendar.jpg', '截止時間表'), ('img/radar-ai.jpg', '問問 AI'), ('img/radar-mobile.jpg', '手機版首頁')],
  },
  {
    'slug': 'mars', 'title': '火星車降落機', 'kind': '硬體',
    'lede': '2026 火星任務火星車降落競賽的作品。自己用 ESP32 寫四軸飛控，再加一顆會看地面標記的相機，讓機體自己找降落點。',
    'cover': 'img/mars-rover.jpg',
    'meta': [('比賽', '2026 火星任務　火星車降落競賽（東海大學、國立自然科學博物館）'), ('時間', '2026.10 – 2026.11'), ('結果', '完賽'), ('角色', '飛控、相機、機構設計（降落傘由同學製作）'), ('技術', 'ESP32、XIAO ESP32S3 相機、MPU 姿態感測、BMP280 氣壓計、PID、3D 列印')],
    'links': [],
    'sections': [
      ('目標', ['讓機體從空中自己找到地上的標記，穩穩降落。']),
      ('做了什麼', [
        '主飛控：用 ESP32 自己寫四軸飛控，200 Hz 的控制迴圈裡做姿態估測和 PID，再用 BMP280 氣壓計算高度。',
        '相機板：XIAO ESP32S3 相機負責看地面，辨識結果透過 UART 傳給主飛控；定位用 AprilTag 標記。',
        '降落傘分離和脫離各用一顆伺服馬達控制，另外有保險開關，避免馬達意外啟動。',
        '機體是 3D 列印的藍色框架。飛控、相機和機構都是我設計的，同學負責做降落傘。',
      ]),
      ('遇到的難題', [
        'ESP32 的開發工具不支援中文路徑，專案一放在中文資料夾就編譯失敗，最後把實體檔案放在英文路徑，再用資料夾連結對回來。',
        '沒有接感測器時程式不能當機，所以加了故障偵測，感測器讀不到會自動重試並回報狀態。',
      ]),
    ],
    'photos': [('img/mars-rover.jpg', '完成的機體'), ('img/mars-field.jpg', '比賽場地上的機體'), ('img/mars-build.jpg', '組裝'), ('img/mars-day.jpg', '比賽當天在場邊調整'), ('img/cert-mars.jpg', '參賽證明')],
  },
  {
    'slug': 'winch', 'title': '捲線器', 'kind': '硬體',
    'lede': '可以自動把物體放到指定高度的捲線器。我負責機構，用 Fusion 360 改了好幾版，最後自己設計棘輪和齒輪，取代買來停不住的絞盤。',
    'cover': 'img/reel-mk4.jpg',
    'meta': [('時間', '2026.10 – 2026.11'), ('角色', '機構設計（Fusion 360）'), ('控制', 'ESP32-C3、相機看 AprilTag 標籤定位'), ('狀態', '機構設計完成，還沒實際測試')],
    'links': [],
    'sections': [
      ('目標', ['相機看著吊掛物上的 AprilTag 標籤，算出現在的高度，ESP32-C3 透過 Wi-Fi 控制馬達收放線，把物體放到指定位置；也可以用手機手動操作。']),
      ('我做了什麼', [
        '負責整個機構設計，用 Fusion 360 從第一版一路改到 Mk4，每一版都調整配置、零件尺寸和走線。',
        '買來的絞盤捲到定點停不下來，沒辦法用。我自己設計了一組棘輪和齒輪：捲筒旁邊加一片棘輪，設計成棘爪卡住就能停在定點。',
      ]),
      ('團隊的控制程式', ['控制程式用 S 曲線規劃速度、PID 追位置，快到目標時提前減速，到位後單向鎖住，不會來回晃。']),
    ],
    'photos': [('img/reel-mk4.jpg', 'Mk4 整體機構'), ('img/reel-ratchet.jpg', '自己設計的棘輪和捲筒'), ('img/reel-drum-mk4.jpg', '捲筒和出線位置')],
  },
  {
    'slug': 'trc', 'title': 'TRC XY 平衡模塊', 'kind': '硬體',
    'lede': '臺灣機器人競賽的作品：裝在物流無人車上的配重補償模組，讓疊高的貨物在轉彎、煞車時比較不容易翻倒。',
    'cover': 'img/trc-xy.jpg',
    'meta': [('比賽', '臺灣機器人競賽　運輸物流應用領域'), ('隊伍', '蠑螈'), ('角色', '機械構想、製作'), ('時間', '2026.10 起'), ('狀態', '已確認入圍，準備動工做實體')],
    'links': [],
    'sections': [
      ('要解決的問題', ['工廠常把貨物疊得很高，無人車轉彎、煞車或被撞時有翻倒的風險，現場多半只能放慢速度。']),
      ('怎麼做', [
        '載台四個角裝荷重元，量四個角的受力，算出往哪一邊快要倒、還剩多少餘裕。',
        'X、Y 兩軸用同步帶和直線滑軌帶動一塊配重，Y 軸帶整組 X 機構，X 軸帶配重，在平面上移到需要的位置。',
        '每一軸 4 顆 775 直流馬達左右同步驅動，兩軸共 8 顆，讓滑台受力平均、不會卡住。',
        '配重的移動用 PID 加 S 曲線控制，限制速度和加速度，避免移動時反而晃到車體。',
      ]),
      ('目前進度', ['8 頁技術說明書裡的初步模擬：加裝模組後，靜態傾倒臨界力提升約 11–12%。', '已經確認入圍，現在準備動工做實體。']),
    ],
    'photos': [('img/trc-xy.jpg', '整體 3D 圖'), ('img/trc-xy-top.jpg', '俯視圖'), ('img/trc-xy-side.jpg', '側面')],
  },
]

def e(t): return html.escape(t, quote=True)

def page(p):
    dark = f' data-dark="../{p["cover_dark"]}"' if p.get('cover_dark') else ''
    meta = ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in p['meta'])
    links = ''.join(f'<a href="{e(u)}" target="_blank" rel="noopener">{e(t)}</a>' for t, u in p['links'])
    secs = ''
    for h, paras in p['sections']:
        body = ''.join(f'<li>{e(x)}</li>' for x in paras) if len(paras) > 1 else f'<p>{e(paras[0])}</p>'
        if len(paras) > 1: body = f'<ul>{body}</ul>'
        secs += f'<section class="pj-sec"><h2>{e(h)}</h2>{body}</section>\n'
    photos = ''.join(f'<button class="ph"><img src="../{e(s)}" alt="{e(a)}" loading="lazy"></button>' for s, a in p['photos'])
    others = ''.join(f'<a href="{q["slug"]}.html">{e(q["title"])}</a>' for q in PROJECTS if q is not p)
    return f'''<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(p["title"])}｜徐專洧</title>
<meta name="description" content="{e(p["lede"])}">
<meta property="og:title" content="{e(p["title"])}｜徐專洧">
<meta property="og:description" content="{e(p["lede"])}">
<meta property="og:image" content="https://johnny-0120.github.io/img/share-zh.jpg">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%2317243A'/><text x='32' y='44' font-size='34' text-anchor='middle' fill='%23EDF4FC' font-family='serif'>洧</text></svg>">
<script>try{{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}}catch(e){{}}</script>
<link rel="preload" href="../fonts/wan-sb.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../style.css?v=41">
</head>
<body class="pj">
<header class="bar">
  <a class="bar-name" href="../">徐專洧</a>
  <nav class="bar-nav" id="nav" aria-label="主選單">
    <a href="../#works">作品</a>
    <a href="../#timeline">經歷</a>
    <a href="../#contact">聯絡</a>
  </nav>
  <div class="bar-right">
    <a class="lang-btn" href="../en/projects/{p["slug"]}.html" hreflang="en" lang="en" aria-label="English version">EN</a>
    <button class="theme-btn" type="button" aria-label="切換深色／淺色模式"><span class="ico"></span><span class="lbl">深色</span></button>
  </div>
</header>
<main class="pj-main">
  <a class="pj-back" href="../#works">← 回到作品</a>
  <p class="pj-kind">{e(p["kind"])}</p>
  <h1 class="pj-title">{e(p["title"])}</h1>
  <p class="pj-lede">{e(p["lede"])}</p>
  <figure class="pj-cover"><img src="../{e(p["cover"])}"{dark} alt="{e(p["title"])}"></figure>
  <dl class="pj-meta">{meta}</dl>
  {f'<p class="work-links pj-links">{links}</p>' if links else ''}
  {secs}
  <section class="pj-sec"><h2>照片</h2><div class="masonry">{photos}</div></section>
  <nav class="pj-more"><p>其他作品</p>{others}</nav>
</main>
<footer class="foot"><p>© 2026 徐專洧。網站上的照片請勿轉用。</p><a href="../">回到首頁 ↑</a></footer>
<div class="lightbox" hidden><button class="lb-close" aria-label="關閉">關閉 ✕</button><img alt=""></div>
<script src="../main.js?v=31"></script>
</body>
</html>
'''

for p in PROJECTS:
    (here / 'projects' / f'{p["slug"]}.html').write_text(page(p), encoding='utf-8')
    print('projects/' + p['slug'] + '.html')
