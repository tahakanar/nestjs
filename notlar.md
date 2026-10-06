# Öğrenme Notları

## Gün 7: İlk haftanın tekrarı

Bu notlar, [README'deki Gün 7 planının](README.md#gün-7-tekrar-ve-1-haftayı-tamamlama) sorularını cevaplamak için hazırlandı. Örnekler, projedeki `hafta-1-express/gun-06/` uygulamasına dayanır. Kod parçalarının bir bölümü mevcut koddan alınmış, bir bölümü konuyu açıklamak için sadeleştirilmiştir.

Amaç, bir HTTP isteğinin sunucuya girdikten sonra nasıl doğrulandığını, veritabanına nasıl ulaştığını ve nasıl cevaba dönüştüğünü anlayabilmek.

### 1. Middleware nedir, ne işe yarar?

Middleware, Express'te istek ile cevap arasındaki akışta çalışan bir fonksiyondur. Gelen isteği inceleyebilir, `req` üzerine bilgi ekleyebilir, cevap gönderebilir veya kontrolü sıradaki fonksiyona bırakabilir. Böylece her endpoint'te aynı kontrolleri yeniden yazmak yerine ortak işlemleri paylaşırız. [Express middleware dokümanı](https://expressjs.com/en/guide/using-middleware/)

Projeden bir örnek: `POST /tasks` isteği geldiğinde doğrudan görev oluşturmuyoruz. Önce JSON gövdesini okuyoruz, kullanıcıyı token üzerinden tanıyoruz ve başlığın geçerli olduğunu kontrol ediyoruz. Ancak bu adımlar başarılı olursa controller çalışıyor.

#### `req`, `res` ve `next` ne anlama gelir?

```js
function middleware(req, res, next) {
  // req: gelen isteğin bilgileri
  // res: istemciye gönderilecek cevabı yönetir
  // next: akışı sıradaki middleware veya handler'a geçirir
  next();
}
```

`req.body`, `req.params` ve `req.query` istemciden gelen verileri taşır. Projedeki auth middleware'i bunlara ek olarak `req.user` alanını oluşturur. Controller bu alan sayesinde giriş yapan kullanıcının kimliğini öğrenir.

`next()` çağrısı ile akış devam eder; `next(err)` ile hata işleme akışına geçilir. Cevap gönderip isteği sonlandıran bir middleware'in normal akışı devam ettirmesi gerekmez. Cevap göndermeden ve `next()` çağırmadan kalan middleware ise isteğin beklemesine neden olur. Ayrıca `next()` bir `return` değildir; fonksiyonun kalan satırları çalışabilir. Bir hata dalında `return next(err)` kullanmak, o daldan sonra devam etmeyi önler. [Express middleware dokümanı](https://expressjs.com/en/guide/using-middleware/)

#### Bu projedeki middleware'ler

| Middleware | Tanımlandığı yer | Görevi |
|---|---|---|
| `logger` | `server.js` içinde global | Method, URL, status ve cevap süresini loglar. |
| `express.json()` | `server.js` içinde global | JSON içerikli istek gövdesini okuyup `req.body` alanını hazırlar. |
| `authMiddleware` | Tasks router'ında | Token'ı doğrular ve `req.user.id` değerini oluşturur. |
| `validateCreateTask` | `POST /tasks` üzerinde | `title` alanının boş olmayan bir string olduğunu kontrol eder. |
| `validateUpdateTask` | `PATCH /tasks/:id` üzerinde | Gönderilmiş `title` ve `done` alanlarının türlerini kontrol eder. |
| `validateCredentials` | Register ve login route'larında | Email biçimini ve şifre uzunluğunu kontrol eder. |
| `notFoundHandler` | Route'lardan sonra | Hiçbir route'un cevap vermediği istek için 404 hatası oluşturur. |
| `errorHandler` | En sonda | Hataları `{ error: ... }` biçimindeki JSON cevabına çevirir. |

Dosyaları görmek için: [server.js](hafta-1-express/gun-06/server.js), [validation](hafta-1-express/gun-06/middlewares/validate.js), [auth](hafta-1-express/gun-06/middlewares/auth.js), [logger](hafta-1-express/gun-06/middlewares/logger.js).

Logger'ın bir ayrıntısı önemli: girişte zamanı kaydeder, `res.on('finish', ...)` ile cevap tamamlandığında log yazar. Yani logger ilk çalışan middleware olsa da süreyi gösteren log satırı cevap tamamlanınca oluşur.

#### Middleware sırası neden önemli?

Mevcut uygulamadaki başarılı görev oluşturma akışı:

```text
POST /tasks
  → logger: başlangıç zamanını kaydeder
  → express.json(): JSON gövdesini okur
  → tasksRouter içindeki authMiddleware: token'ı doğrular
  → validateCreateTask: title alanını kontrol eder
  → tasks.controller.create: service'i çağırır
  → tasks.service.create: INSERT sorgusunu çalıştırır
  → controller: 201 ve yeni görevi döner
  → logger'ın finish dinleyicisi: sonucu ve süreyi loglar
```

Bu sıralamada token yanlışsa validation ve controller çalışmaz. JSON bozuksa daha auth aşamasına gelmeden JSON parser hata verir. Gövdeyi okumadan `req.body.title` kontrolü yapmaya çalışmak ise verinin henüz hazır olmamasına yol açar.

Başarılı istek normalde `errorHandler` üzerinden geçmez. Örneğin service görev bulamayınca `NotFoundError` fırlatırsa Express hata akışına geçer ve `errorHandler` 404 cevabı üretir.

#### Hata middleware'i neden dört parametre alır?

Express hata middleware'ini `(err, req, res, next)` imzasıyla ayırt eder. Projede bu fonksiyon, `err.status` üzerinden HTTP kodunu belirler. Beklenmeyen hatalarda 500 döner ve ayrıntıyı sunucu konsoluna yazar. Uygulama Express 5 kullandığı için `async` controller'ın döndürdüğü Promise reddedildiğinde hata otomatik olarak hata middleware'ine aktarılır. Bu, handler'dan bağımsız başlatılmış her zamanlayıcı veya arka plan işi için otomatik yakalama anlamına gelmez. [Express hata yönetimi](https://expressjs.com/en/guide/error-handling/)

**Kendi cümlemle cevap:** Middleware, isteğin geçtiği ortak kontrol adımlarıdır. Loglama, JSON okuma, kimlik doğrulama ve validation gibi işleri controller'dan önce düzenler; hata middleware'i de başarısız akışları ortak bir cevaba dönüştürür.

### 2. Controller ile service arasındaki fark ne?

Controller, HTTP isteğiyle uygulama mantığı arasındaki bağlantıdır. Service ise uygulamanın yaptığı işi gerçekleştirir. Bu projede service aynı zamanda doğrudan SQL sorgularını çalıştırır; ileride veritabanı erişimi ayrı bir repository katmanına taşınabilir.

| Konu | Controller | Service |
|---|---|---|
| Gelen veri | `req.params`, `req.query`, `req.body`, `req.user` üzerinden alır. | Fonksiyon parametreleri üzerinden alır. |
| Temel sorumluluk | İsteği uygun çağrıya çevirip HTTP cevabını üretir. | İş kurallarını ve veri işlemlerini gerçekleştirir. |
| HTTP bilgisi | `res.status(201).json(...)` gibi işlemleri bilir. | Mevcut task service'inde `req` ve `res` yoktur. |
| Hata | Hatanın merkezi handler'a gitmesine izin verir. | Görev yoksa `NotFoundError` gibi bir hata üretir. |
| Örnek | URL'deki ID'yi sayıya çevirir, `findOne` çağırır. | Kullanıcıya ait görevi SQL ile bulur. |

#### Mevcut kod üzerinden görev oluşturma

[Tasks controller](hafta-1-express/gun-06/controllers/tasks.controller.js) içindeki fonksiyon:

```js
exports.create = async (req, res) => {
  res.status(201).json(await tasksService.create(req.user.id, req.body));
};
```

Controller, doğrulanmış kullanıcı kimliğini ve gövdeyi service'e iletir. İşlem tamamlandığında HTTP 201 cevabını gönderir. Başlığı hangi tabloya yazacağını veya SQL'in nasıl kurulacağını bilmez.

[Tasks service](hafta-1-express/gun-06/services/tasks.service.js) içindeki fonksiyon:

```js
async function create(userId, { title }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, user_id)
     VALUES ($1, $2)
     RETURNING ${COLUMNS}`,
    [title.trim(), userId],
  );
  return rows[0];
}
```

Buradaki `pool` ve `COLUMNS`, mevcut service dosyasında tanımlıdır. Service başlığı temizler, görevi giriş yapan kullanıcıya bağlar ve veritabanının döndürdüğü satırı verir. HTTP status kodunu belirlemek controller'ın işidir.

#### Route bu ayrımın neresinde?

```js
router.post('/', validateCreateTask, controller.create);
```

Route, method ve URL eşleşmesini tanımlar; hangi validation ve controller'ın çalışacağını bağlar. Controller isteği işler, service işlemi gerçekleştirir. Tasks router'ı `/tasks` altında bağlandığı için bu tanımın dışarıdan adresi `POST /tasks` olur.

#### Bu ayrım neden yararlı?

Her şeyi tek route fonksiyonunda yazsaydık token kontrolü, validation, SQL ve cevap üretme aynı yerde karışırdı. Projedeki ayrımda SQL değişirse service'e, cevap status'u değişirse controller'a, endpoint adresi değişirse route'a bakarız.

Service'e normal parametreler vermek test yazmayı da kolaylaştırır: `findOne(userId, id)` çağrısını test ederken bir HTTP isteği hazırlamak zorunda kalmayız. Bununla birlikte mevcut service'in DB bağımlılığını testte kontrol etmek gerekir. Service ayrıca proje özelindeki HTTP hata sınıflarını kullanır; dolayısıyla HTTP katmanından tamamen bağımsız değildir.

Validation ile iş kuralı arasındaki farkı da ayırmak gerekir: “`title` string mi?” girdi doğrulamasıdır. “Bu kullanıcı bu göreve erişebilir mi?” erişim kuralıdır. Projede ilkini validation middleware'i, ikincisini service'in `user_id` filtreli sorguları sağlar.

**Kendi cümlemle cevap:** Controller isteği okur, service'i çağırır ve HTTP cevabını gönderir. Service ise görev oluşturma, bulma veya silme gibi asıl işi yapar. Route bu parçaları endpoint'e bağlar.

### 3. JWT nasıl çalışır?

JWT, taraflar arasında kullanıcı kimliği gibi bilgileri taşıyabilen bir token biçimidir. Bu projede **HS256 ile imzalanmış JWT** kullanıyoruz. İstemci giriş yaptıktan sonra token alır ve korumalı isteklere ekler; sunucu da token'ın doğruluğunu kontrol eder.

#### Authentication ile authorization farkı

- **Authentication — kimlik doğrulama:** “Bu isteği kim gönderiyor?” Projede login sırasında email ve şifre, sonraki isteklerde JWT kontrol edilir.
- **Authorization — yetkilendirme:** “Bu kullanıcı bu kaynağa erişebilir mi?” Projede task sorguları giriş yapan kullanıcının `user_id` değeriyle sınırlandırılır.

Giriş yapmış olmak bütün görevleri okumaya izin vermez. Token yalnızca kimliği tanımamıza yardımcı olur; kaynak üzerinde yetki kontrolünü ayrıca yaparız.

#### Kayıt, giriş ve korumalı istek akışı

1. `POST /auth/register` ile email ve şifre gönderilir. [Auth service](hafta-1-express/gun-06/services/auth.service.js), şifreyi `bcrypt.hash(password, 10)` ile hashleyip kaydeder. Veritabanındaki `password` alanının içeriği düz şifre değil, hash'tir. Kayıt cevabında bu alan bulunmaz.
2. `POST /auth/login` ile kimlik bilgileri gönderilir. Service email üzerinden kullanıcıyı bulur, `bcrypt.compare` ile şifreyi kontrol eder. Hash'i çözüp eski şifreyi geri elde etmez.
3. Bilgiler doğruysa `jwt.sign` ile token üretilir. Mevcut kod payload'a `sub: user.id` ekler, HS256 kullanır ve `.env` ayarına göre son kullanma süresi belirler; varsayılan süre `1h` olur.
4. İstemci token'ı cevaptaki `token` alanından alır ve sonraki istekte gönderir:

   ```http
   GET /tasks HTTP/1.1
   Authorization: Bearer <girişte-alınan-token>
   ```

5. [Auth middleware](hafta-1-express/gun-06/middlewares/auth.js), `jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })` çağrısını yapar. Başarılı olursa `req.user = { id: Number(payload.sub) }` oluşturup `next()` çağırır. Başlık eksikse veya doğrulama başarısızsa 401 hatası üretir.
6. Controller `req.user.id` değerini service'e iletir. Service sorguyu bu kullanıcıya göre sınırlar; örneğin `WHERE id = $1 AND user_id = $2` ile yalnızca kullanıcının kendi görevini bulur.

#### Token'ın üç parçası

Bu projedeki imzalı token şu biçimdedir:

```text
header.payload.signature
```

Header algoritma gibi bilgileri, payload ise claim adı verilen bilgileri taşır. `sub` token'ın ilgili olduğu kişiyi, `iat` üretim zamanını, `exp` son kullanma zamanını ifade eder. Zamanlar Unix zamanı olarak saniye cinsindedir. RFC'de `sub` string olarak tanımlanır; mevcut proje sayısal ID gönderir. Standarda uyum için üretimde `sub: String(user.id)` tercih edilebilir. [JWT standardı — RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)

**İmzalama, şifreleme değildir.** Bu token'ın header ve payload alanları Base64URL ile kodlanır, okunabilir. İmza, içerik değiştirildiğinde doğrulamanın başarısız olmasını sağlar. Payload'a şifre veya secret koymamalıyız. [JWT standardı — RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)

Projede HS256, sunucudaki ortak secret ile HMAC üretir. Saldırgan payload'daki kullanıcı ID'sini değiştirirse aynı secret olmadan geçerli bir imza üretemez. Secret'ın kendisi istemciye gönderilmez.

#### `decode` ile `verify` aynı şey mi?

`decode`, token'ın içeriğini okumaya yarar; imzaya güvenebileceğimizi kanıtlamaz. `verify`, imzayı ve varsa `exp` gibi geçerlilik kontrollerini yapar; kabul edilen algoritmaları da seçeneklerle sınırlandırabiliriz. İstemcinin kendi yazdığı bir token'ı yalnızca decode ederek kullanıcı kabul etmek, kimlik doğrulaması yapmış olmak değildir. [jsonwebtoken API dokümanı](https://github.com/auth0/node-jsonwebtoken)

#### Token geçerliyse neden başka kullanıcının görevi 404 dönüyor?

Kullanıcı A'nın token'ı geçerli olabilir; fakat kullanıcı B'nin görevini istemesi yetkili olduğu anlamına gelmez. Mevcut service, hem görev ID'sini hem A'nın kullanıcı ID'sini sorguya ekler. Eşleşen satır olmadığında `NotFoundError` fırlatır. Proje böylece başka kullanıcıya ait görevin varlığını da açıklamaz.

| Durum | Mevcut uygulamadaki cevap |
|---|---|
| Token başlığı eksik | 401 |
| Token imzası geçersiz veya süresi dolmuş | 401 |
| Token geçerli, görev o kullanıcıya ait değil | 404 |
| Token geçerli, kendi görevi mevcut | İşleme göre 200 veya 204 |

#### “Stateless” ne demek?

Mevcut uygulama JWT'leri bir oturum tablosunda tutmaz. Sonraki istekte sunucu, token'ın imzasını ve süresini kontrol ederek kullanıcı kimliğini çıkarır. Görev verilerini almak için yine veritabanına gider; stateless olması “veritabanı kullanılmaz” anlamına gelmez.

Kodda token iptali mekanizması da yoktur. Bu nedenle istemcinin token'ı silmesi, ele geçirilmiş başka bir kopyayı geçersiz kılmaz. Bu uygulamada o kopya süresi dolana kadar kullanılabilir. İleride çıkış, kullanıcı silme veya hesap kapatma gibi durumlarda ek oturum/iptal kontrolleri tasarlanabilir.

**Kendi cümlemle cevap:** Kullanıcı doğru email ve şifreyle giriş yapınca sunucu imzalı bir token verir. İstemci bunu her korumalı isteğe ekler. Sunucu imzayı ve süreyi doğrular, kullanıcıyı tanır; ardından istenen görevin o kullanıcıya ait olup olmadığını ayrıca kontrol eder.

### 4. SQL injection nedir, nasıl önlenir?

SQL injection, kullanıcı girdisinin SQL komutunun yapısını değiştirebilmesidir. Sorun, veri olması gereken bir değeri sorgu metnine doğrudan eklemektir. Parametreli sorgu kullanmak, sorgu yapısını kullanıcı değerlerinden ayırır. [OWASP SQL injection rehberi](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

#### Tehlikeli örnek

Aşağıdaki sorgu, yalnızca sorunu göstermek içindir; projede kullanılmamalıdır:

```js
const sql = `SELECT id, email FROM users WHERE email = '${email}'`;
await pool.query(sql);
```

`email` normal bir adres olduğunda sorgu beklendiği gibi görünebilir. Fakat şu değer gönderilirse:

```text
' OR 1=1 --
```

oluşan sorgu şu hale gelir:

```sql
SELECT id, email FROM users WHERE email = '' OR 1=1 --'
```

Burada `1=1` her satır için doğrudur; `--` ise satırın kalanını yorum haline getirir. Sorgu yalnızca istenen email'i arama amacından çıkar ve diğer kullanıcıların satırlarını da döndürebilir. Bu örnek tek başına şifre kontrolünü aşmayı göstermez; yanlış kurulan SQL'in veri seçimini nasıl değiştirdiğini gösterir.

#### Doğru yöntem: parametreli sorgu

Projede [auth service](hafta-1-express/gun-06/services/auth.service.js) kullanıcıyı şu şekilde arar:

```js
const { rows } = await pool.query(
  'SELECT id, email, password FROM users WHERE email = $1',
  [email.trim().toLowerCase()],
);
```

`$1`, değer için bir yer tutucudur. SQL metni bir argümanda, değerler ayrı bir dizide gönderilir. Böylece saldırı metni sorgunun bir parçası olarak değil, aranacak email değeri olarak ele alınır. Dizi sırası yer tutuculara karşılık gelir: `$1` ilk değer, `$2` ikinci değerdir. [node-postgres sorgu dokümanı](https://node-postgres.com/features/queries)

Task sorgusundaki örnek:

```js
const { rows } = await pool.query(
  `SELECT id, title, done, created_at
   FROM tasks
   WHERE id = $1 AND user_id = $2`,
  [id, userId],
);
```

Bu sorguda iki ayrı koruma vardır: parametre kullanımı değerlerin SQL yapısını değiştirmesini önler; `user_id` koşulu ise görev erişimini doğru kullanıcıyla sınırlar. Parametreli yazılmış ama `user_id` filtresi olmayan bir sorgu, yine başkasının görevine erişim açığı oluşturabilir.

#### Validation tek başına yeterli mi?

Email biçimini veya ID'nin sayı olmasını doğrulamak yararlıdır, ancak SQL sorgusunu string birleştirmeyle kurmak için gerekçe değildir. Girdi kontrolü ve parametreli sorgu farklı amaçlara hizmet eder. ORM kullanırken de kullanıcı girdisini birleştirdiğimiz ham SQL için aynı risk vardır. [OWASP SQL injection rehberi](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

#### Tablo veya kolon adını `$1` ile seçebilir miyiz?

Yer tutucular veri değerleri içindir; tablo ve kolon adları için kullanılamaz. İstemciden sıralama tercihi alacaksak, bunu uygulamanın belirlediği sabit kolonlarla eşleştirmek gerekir. [node-postgres sorgu dokümanı](https://node-postgres.com/features/queries)

Örneğin ileride sıralama eklenecekse, şu kontrol fikri kullanılabilir; bu özellik mevcut uygulamada yoktur:

```js
const sortColumns = { id: 'id', createdAt: 'created_at' };
if (!Object.hasOwn(sortColumns, requestedSort)) {
  throw new BadRequestError('Geçersiz sıralama alanı');
}
const column = sortColumns[requestedSort];
const { rows } = await pool.query(
  `SELECT id, title, done FROM tasks
   WHERE user_id = $1 ORDER BY ${column} ASC`,
  [userId],
);
```

Burada sorguya eklenen kolon adı kullanıcının doğrudan metni değil, uygulamanın sabit izin listesinden seçilen değerdir. Mevcut task service'indeki `${COLUMNS}` da dosyada tanımlanan sabit bir metindir; kullanıcıdan gelmez.

**Kendi cümlemle cevap:** SQL injection, kullanıcının verisinin sorgu komutuna dönüşmesidir. Değerleri SQL metnine eklemek yerine `$1`, `$2` gibi parametrelerle ayrı gönderirim; dinamik kolon gibi yapısal seçimleri ise sabit izin listesiyle sınırlarım.

### 5. Bu yapıda tekrar eden veya zorlayabilecek işler

Bu bölüm kişisel deneyim beyanı değildir; mevcut koddan görülen tekrarlar ve öğrenirken üzerinde düşünülmesi gereken noktalar listelenmiştir. Gün sonunda gerçekten hangi konunun zorladığı ayrıca eklenebilir.

| Mevcut Express yapısındaki iş | Neden dikkat istiyor? | İkinci haftada incelenecek NestJS karşılığı |
|---|---|---|
| Elle yazılan validation | Her alan için tür, boşluk ve zorunluluk kontrolü yazılıyor. | DTO, `class-validator`, `ValidationPipe` |
| ID ve query dönüştürme | `req.params.id` string; `done` query değeri `'true'` veya `'false'`. | `ParseIntPipe`, boolean dönüşümü veya DTO ile doğrulama |
| Ortak hata cevabı | Hata sınıfları ve merkezi handler elle bağlanıyor. | Hazır exception'lar ve Exception Filter |
| Auth bağlama | Her korumalı router'a middleware eklemeyi hatırlamak gerekiyor. | Guard ve gerektiğinde global guard |
| Kullanıcıyı controller'a taşıma | Her ilgili controller'da `req.user.id` okunuyor. | `@CurrentUser()` custom decorator |
| Süre ölçme ve cevap biçimi | Ortak davranışın doğru noktada uygulanması gerekiyor. | Middleware ve Interceptor |
| Dosyaların birbirine bağlanması | Route, controller, service import'ları elle kuruluyor. | Module ve Dependency Injection |
| SQL ve DB sonuçlarını işleme | Sorgu, parametre sırası, `rows[0]` ve `rowCount` kontrol ediliyor. | Entity ve Repository; gerektiğinde ham SQL |

NestJS Guard'ları erişim kararlarına, `ValidationPipe` ise DTO tabanlı doğrulamaya yapı sağlar. Ancak “kullanıcı yalnızca kendi görevini görebilir” kuralını yine bizim kurmamız gerekir; framework'e geçmek bu kuralı otomatik eklemez. [NestJS Guards](https://docs.nestjs.com/guards)

#### Mevcut koddan Gün 7 için inceleme adayları

- `validateUpdateTask`, boş `{}` gövdesini reddetmiyor. Service mevcut değerleri koruyup 200 dönebilir. Boş güncellemeyi kabul edip etmeyeceğimize karar vermeliyiz.
- Şifre sınırı `password.length` ile kontrol ediliyor. Bcrypt'in sınırı **72 byte** olduğu için Türkçe karakter veya emoji içeren şifrelerde bu kontrol byte sınırıyla aynı değildir. UTF-8 uzunluğu için `Buffer.byteLength(password, 'utf8')` kullanılabilir. Bu ayrım kurulu [bcrypt paketinin açıklamasında](hafta-1-express/node_modules/bcrypt/README.md) da belirtilir.
- Auth middleware doğrulanmış payload'daki `sub` alanını sayıya çeviriyor fakat geçerli, pozitif bir kullanıcı ID'si olduğunu ayrıca kontrol etmiyor. Beklenen claim biçimini doğrulamak ve token kullanıcı kimliğinin nasıl üretildiğini tutarlı hale getirmek gerekir.
- Bazı kontroller middleware'de, ID ve query kontrolleri controller'da. Bu dağılımı okuyabilmek ve yeni endpoint'lerde tutarlı sürdürebilmek önemli.
- `package.json` içindeki `test` script'i henüz gerçek test çalıştırmıyor. Manuel endpoint denemeleri ile otomatik testlerin kapsamını birbirinden ayırmalıyız.

Bu maddeler inceleme notlarıdır; bu belge hazırlanırken uygulama kodunda değişiklik yapılmadı.

### 6. Gün sonu manuel test planı

Bu tablo **çalıştırılmış test sonucu değildir**. Gün 7'de uygulamayı ve PostgreSQL'i başlattıktan sonra Postman veya benzeri bir istemciyle uygulanacak senaryoları gösterir.

Önce farklı email'lerle A ve B kullanıcılarını kaydet, giriş yap ve token'larını ayrı tut. A kullanıcısıyla görev oluştur, cevaptaki gerçek görev ID'sini sonraki isteklerde kullan. `POST` ve `PATCH` isteklerinde `Content-Type: application/json`, korumalı isteklerde ilgili kullanıcının Bearer token'ını gönder.

| Deneme | Beklenen sonuç |
|---|---|
| `GET /` | 200 ve `Merhaba` |
| Geçerli bilgilerle `POST /auth/register` | 201; kullanıcı bilgileri, şifre/hash olmadan |
| Aynı email ile tekrar kayıt | 409 |
| Geçersiz email veya kısa şifreyle kayıt | 400 |
| Doğru bilgilerle `POST /auth/login` | 200 ve `{ token: ... }` |
| Biçimi geçerli ama yanlış şifreyle login | 401 |
| Token olmadan `GET /tasks` | 401 |
| Değiştirilmiş veya süresi dolmuş token ile `GET /tasks` | 401 |
| A token'ıyla `POST /tasks`, gövde: `{ "title": "Gün 7 tekrarı" }` | 201, yeni görev ve `done: false` |
| A token'ıyla boş başlıklı `POST /tasks` | 400 |
| A token'ıyla `GET /tasks` | 200; yalnızca A'nın görevleri |
| A token'ıyla `GET /tasks/:id` | Kendi oluşturduğu görev için 200 |
| A token'ıyla `PATCH /tasks/:id`, gövde: `{ "done": true }` | 200; görev tamamlanmış |
| A token'ıyla `GET /tasks?done=true` | 200; yalnızca A'nın tamamlanmış görevleri |
| A token'ıyla `GET /tasks?done=abc` | 400 |
| A token'ıyla `PATCH /tasks/:id`, gövde: `{ "done": "true" }` | 400; string, boolean yerine geçmez |
| A token'ıyla `GET /tasks/abc` | 400; geçersiz ID |
| A token'ıyla geçerli ID biçiminde ama bulunmayan görev | 404 |
| B token'ıyla A'nın görevini GET, PATCH ve DELETE ile isteme | Her işlemde 404; A'nın görevi değişmez |
| A token'ıyla `DELETE /tasks/:id` | 204; cevap gövdesi yok |
| Silinen görevi A token'ıyla tekrar isteme | 404 |
| JSON header'ıyla bozuk JSON gönderme | 400 |
| Router dışında tanımsız bir adrese istek | 404 |
| Silinmemiş bir görev oluşturup sunucuyu yeniden başlatma | Görev PostgreSQL'de kalır, tekrar listelenir |

Süresi dolmuş token denemesi için test ortamında token süresini kısa tutup yeni token üretebilirsin. Sadece payload'daki `exp` değerini elle değiştirmek aynı test değildir: imza da bozulur.

### 7. Kendini kontrol et

- [ ] `POST /tasks` akışındaki adımları dosyaları açmadan anlatabiliyorum.
- [ ] `next()` çağrısının göreviyle `return` arasındaki farkı biliyorum.
- [ ] Başarılı isteğin ve hatalı isteğin akışlarını ayırabiliyorum.
- [ ] Controller'ın neden SQL yazmadığını açıklayabiliyorum.
- [ ] Token doğrulama ile görev sahipliği kontrolünün ayrı işler olduğunu biliyorum.
- [ ] JWT payload'ının okunabilir olduğunu ve `decode` ile `verify` farkını açıklayabiliyorum.
- [ ] `$1`, `$2` parametrelerinin SQL injection'ı nasıl önlediğini anlatabiliyorum.
- [ ] Geçerli bir token'la bile başka kullanıcının görevine neden erişemediğimi açıklayabiliyorum.
- [ ] Manuel test tablosunu uyguladım ve sonuçlarını kaydettim.

Gün sonunda doldur:

```text
Beni en çok zorlayan konu:
Kod yazarken en çok tekrar ettiğim işlem:
Hâlâ açıklamakta zorlandığım nokta:
Manuel testte beklediğimden farklı çıkan sonuç:
Gün 8'de NestJS ile karşılaştırmak istediğim bölüm:
```

← [Öğrenme planına dön](README.md)
