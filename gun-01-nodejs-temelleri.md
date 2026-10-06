# 1. Gün: Node.js Temelleri

- **Hedef:** Tarayıcı dışında çalışan JavaScript'i anlamak.
- **Süre:** Yaklaşık 3,5 saat
- **Ana kaynak:** [nodejs.org/en/learn](https://nodejs.org/en/learn). Node.js'in resmî öğrenme sayfası: ücretsiz, kısa ve güncel. Sol menüde konulara göre bölümler var.

**Yöntem:** Her konu için önce 15-20 dakika oku, sonra hemen küçük bir kod yaz. Yalnızca okumak ya da video izlemek yetmez.

> Günün tüm kodlarını `hafta-1-express/gun-01/` klasöründe yaz.

---

## 1. Node.js nedir, tarayıcıdan farkı ne? (30 dk)

**Oku:** nodejs.org/en/learn, "Getting Started" bölümü:
- "Introduction to Node.js"
- "Differences between Node.js and the Browser"

**Dene:**
1. Bir `app.js` dosyası oluştur ve `node app.js` ile çalıştır.
2. İçine `console.log(window)` yaz ve hata aldığını gör.
3. Sonra `console.log(process.version)` dene.

---

## 2. Event loop (45 dk)

Günün en soyut konusu. Detaylara takılma; kabaca anlaman yeterli.

**İzle:** Philip Roberts, *"What the heck is the event loop anyway?"* (JSConf EU 2014, YouTube). Bu konu için en çok önerilen video.

**Görsel araç:** [latentflip.com/loupe](http://latentflip.com/loupe). Kodun call stack ve kuyrukta nasıl ilerlediğini canlı gösterir.

**Oku (isteğe bağlı):** nodejs.org/en/learn, "Asynchronous Work" bölümü, "The Node.js Event Loop"

**Dene:** Aşağıdaki kodun çıktı sırasını **önce tahmin et**, sonra çalıştır:

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
```

<details>
<summary>Cevap ve açıklama (önce kendin dene)</summary>

Çıktı: `1, 4, 3, 2`

- `1` ve `4` senkron kod. Hemen çalışır.
- `Promise.then` **microtask** kuyruğuna girer. Senkron kod biter bitmez çalışır.
- `setTimeout` (0 ms olsa bile) **macrotask** kuyruğuna girer. Microtask'lardan sonra çalışır.

Frontend'de kullandığın `setTimeout` ve Promise'ler de aynı mantıkla çalışıyor.

</details>

---

## 3. Modül sistemi: `import`/`export` ve `require` (30 dk)

**Oku:** Başlangıç bölümlerini okuman yeterli.
- nodejs.org/api/esm.html (ES Modules: `import`/`export`)
- nodejs.org/api/modules.html (CommonJS: `require`/`module.exports`)

**Dene:** `math.js` dosyasından bir fonksiyon export edip `app.js`'te kullan. Bunu iki şekilde yap:

1. **CommonJS:**
   ```js
   // math.js
   module.exports = { topla: (a, b) => a + b };

   // app.js
   const { topla } = require('./math');
   ```
2. **ES Modules:** `package.json`'a `"type": "module"` ekle.
   ```js
   // math.js
   export const topla = (a, b) => a + b;

   // app.js
   import { topla } from './math.js';
   ```

Frontend'de sürekli `import` kullandığın için bu kısım tanıdık gelecek.

---

## 4. `process.env` ve `process.argv` (20 dk)

**Oku:**
- nodejs.org/en/learn, "Command Line" bölümü, "How to read environment variables from Node.js"
- Referans: nodejs.org/api/process.html

**Dene:**

```bash
PORT=4000 node app.js merhaba
```

`app.js` içinde `process.env.PORT` ve `process.argv` değerlerini yazdır.

---

## 5. `fs` ile dosya okuma ve yazma (30 dk)

**Oku:** nodejs.org/en/learn, "Manipulating Files" bölümü, "Reading files" ve "Writing files"

**Dene:** Bir `tasks.json` dosyasını oku, içine yeni bir görev ekle ve dosyaya geri yaz. `fs/promises` ve `async/await` kullan.

```json
[
  { "id": 1, "title": "Node.js öğren", "done": false }
]
```

---

## 6. npm ve `package.json` (20 dk)

**Oku:** nodejs.org/en/learn, "Getting Started" bölümü, "An introduction to the npm package manager"

**Dene:**
1. `npm init -y` çalıştır.
2. `package.json`'a bir `"start": "node app.js"` script'i ekle.
3. `npm start` ile çalıştır.

---

## 7. Günün projesi: `http` modülüyle sunucu (45 dk)

**Referans:** nodejs.org/api/http.html

**Yap:** Express kullanmadan bir sunucu yaz:

| İstek | Cevap |
|---|---|
| `GET /` | "Merhaba" metni |
| `GET /tasks` | `tasks.json` dosyasının içeriği (JSON) |
| Diğer tüm adresler | 404 |

Tarayıcıdan ve Postman'den dene.

Bu adım sonraki günler için önemli: URL'leri `if` ile ayırmanın ne kadar zahmetli olduğunu görmek, 2. gün Express'in neden var olduğunu anlamanı sağlar.

---

## Gün sonu kontrolü

Bunları kendi cümlelerinle `notlar.md`'ye yazabiliyorsan 1. gün tamam:

- [ ] Node.js'te `window` neden yok? Tarayıcıda olmayan hangi imkânlar var?
- [ ] Event loop örneğindeki kod neden `1, 4, 3, 2` sırasıyla yazdırıyor?
- [ ] `process.env` ne işe yarar? Şifreler neden koda değil env'e yazılır?
- [ ] `require` ile `import` arasındaki fark ne?
- [ ] `http` modülüyle yazdığın sunucuda seni en çok zorlayan ne oldu?

## İpuçları

- **Türkçe kaynak tercih edersen** YouTube'da "Node.js dersleri" diye aratabilirsin. Ama güncel ve doğru bilgi için resmî doküman her zaman daha güvenilir.
- **Takıldığında soru sor.** "Bu kod neden böyle çalıştı?" ya da "Event loop'u frontend örneğiyle anlat" gibi sorular sorabilirsin. Yazdığın kodu Claude'a da gözden geçirtebilirsin.

---

← [Plana dön](README.md)
