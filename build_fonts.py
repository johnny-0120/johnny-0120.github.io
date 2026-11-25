"""把網站用到的字從字型裡挑出來，做成很小的 woff2。
網站文字有改（尤其是新增經歷）之後，跑一次：  python build_fonts.py
原始字型放在 ../_fonts_src（源雲明體、源石黑體，SIL OFL 授權，作者 ButTaiwan）。"""
import pathlib, string
from fontTools import subset
from fontTools.ttLib import TTFont
here = pathlib.Path(__file__).parent
src = here.parent / '_fonts_src'
text = ''.join(p.read_text(encoding='utf-8') for p in [here / 'index.html', here / 'main.js', here / 'en' / 'index.html', here / 'en' / 'strings.json'])
text += string.printable + '，。、；：？！「」『』（）《》〈〉——…・·／＋－×→↓↗←↑0123456789'
chars = ''.join(sorted(set(text)))
fonts = {'GenWanMin2TW-SB.otf': 'wan-sb.woff2',
         'GenSekiGothic2TW-R.otf': 'seki-r.woff2', 'GenSekiGothic2TW-M.otf': 'seki-m.woff2'}
for s, d in fonts.items():
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']
    f = TTFont(src / s); sub = subset.Subsetter(opts); sub.populate(text=chars); sub.subset(f)
    f.flavor = 'woff2'; f.save(here / 'fonts' / d)
    print(d, (here / 'fonts' / d).stat().st_size // 1024, 'KB')
