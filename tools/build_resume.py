"""產生中英文履歷 PDF（resume/）。需要本機網站伺服器在 http://localhost:5520（或改 BASE）。"""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5520'
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(channel='chrome'); pg = await b.new_page()
    for lang, out in [('zh', 'resume/hsu-juan-wei-resume-zh.pdf'), ('en', 'resume/hsu-juan-wei-resume-en.pdf')]:
      await pg.goto(f'{BASE}/tools/resume.html?lang={lang}', wait_until='networkidle'); await pg.wait_for_timeout(800)
      await pg.pdf(path=out, format='A4', print_background=True, margin={'top': '0', 'bottom': '0', 'left': '0', 'right': '0'})
      n = await pg.evaluate("(e => e.scrollHeight > e.clientHeight + 1 ? '內容超出一頁' : '一頁剛好')(document.querySelector('.pg'))")
      print(out, n)
    await b.close()
asyncio.run(main())
