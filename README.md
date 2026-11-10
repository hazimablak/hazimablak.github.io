# Hazım Ablak — Kişisel portfolyo

Canlı adres: https://hazimablak.github.io/

Saf HTML, CSS ve JavaScript ile yazıldı. Derleme adımı ve bağımlılık yoktur; dosyalar GitHub Pages'e olduğu gibi yüklenir.

## Özellikler

- Türkçe, İngilizce ve Arapça. Dil, sayfa yenilenmeden değişir; Arapçada sayfa sağdan sola döner.
- Açık ve koyu tema. İlk açılışta sistem ayarına uyar, seçim tarayıcıda saklanır.
- Telefon, tablet ve masaüstünde çalışan tek sayfa.
- Kategori filtreli proje ızgarası; ilk açılışta öne çıkan projeler, düğmeyle tamamı.
- Animasyonlar: açılış, kaydırınca belirme, sayaçlar, dönen unvan, kartlarda fareyi izleyen ışık. Sistemde "hareketi azalt" açıksa kapanır.
- İletişim formu Formspree üzerinden e-postaya düşer.

## Klasör yapısı

```text
.
├── index.html            # Sayfa, Türkçe metinler ve ikon seti
├── en.html               # Eski İngilizce adresi ?lang=en adresine yönlendirir
└── assets
    ├── css/style.css     # Tüm stiller; renkler en üstteki değişkenlerde
    ├── js/i18n.js        # İngilizce ve Arapça çeviriler
    ├── js/main.js        # Dil, tema, menü, filtre, animasyon ve form
    └── img/              # Fotoğraf, uygulama görselleri, favicon
```

## Sık yapılan değişiklikler

**Metin değiştirmek:** Türkçesini `index.html` içinde, İngilizce ve Arapçasını `assets/js/i18n.js` içinde aynı anahtarla değiştir.

**Proje eklemek:** `index.html` içindeki `id="project-grid"` ızgarasına bir `<article class="card project reveal">` kopyala.

- `data-cat` ile kategorisini yaz: `mobile`, `web`, `ai`, `other` (birden fazlaysa boşlukla ayır).
- Açıklamaya yeni bir `data-i18n` anahtarı ver ve bu anahtarı `i18n.js` içinde `en` ve `ar` bölümlerine ekle.
- Kartların sırası önemlidir: ilk açılışta baştaki 7 kart (dar ekranda 6) görünür, gerisi "Tüm projeleri göster" ile açılır.

**Renk değiştirmek:** `style.css` dosyasının başındaki `:root` (açık tema) ve `:root[data-theme="dark"]` (koyu tema) bloklarını düzenle. Vurgu rengi tek değişkendir: `--accent`.

**İkon eklemek:** İkonlar `index.html` başındaki gizli `<svg>` içinde `<symbol>` olarak durur ve `<svg class="ic"><use href="#i-ad"/></svg>` ile çağrılır. Yeni ikon için [lucide.dev](https://lucide.dev) sitesinden SVG'yi kopyalayıp aynı biçimde bir `<symbol>` ekle.

**Dil eklemek:** `i18n.js` içine yeni bir dil bölümü ekle, `main.js` içindeki `LANGS` listesine ve `index.html` başındaki betikteki listeye dil kodunu yaz, üst çubuğa bir `data-lang` düğmesi ekle.

## Yerelde çalıştırmak

```bash
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini aç.

## Kaynaklar

- Yazı tipleri: Geist ve IBM Plex Sans Arabic (Google Fonts)
- İkonlar: Lucide ve Simple Icons
- Uygulama simgeleri ve ekran görüntüleri: uygulamaların Google Play sayfaları
