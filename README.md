# 2 Haftalık Backend ve NestJS Öğrenme Planı

Frontend geçmişi olan, backend bilgisi olmayan biri için hazırlandı.

- **Süre:** 14 gün, günde yaklaşık 3-4 saat
- **1. hafta:** Node.js, Express, veritabanı ve auth temelleri
- **2. hafta:** NestJS ve gerçek proje (`procright-be`) okuma

**Temel yaklaşım:** Tek bir proje üzerinden ilerlenir. Önce **Express** ile bir "Görev Takip API'si" yazılır, 2. haftada aynı API **NestJS** ile yeniden yazılır. Böylece NestJS'in neyi neden kolaylaştırdığı birebir görülür.

> **Görev Takip API'si:** kullanıcılar (`users`) ve görevler (`tasks`). Kullanıcı kayıt olur, giriş yapar, kendi görevlerini oluşturur, listeler, günceller ve siler.

---

## Önerilen klasör yapısı

```
nestjs-ogrenme-plani/
├── README.md          → bu plan
├── notlar.md          → her gün öğrendiklerini 3-5 madde yaz
├── hafta-1-express/   → Express ile Görev Takip API'si
└── hafta-2-nestjs/    → NestJS ile aynı API
```

## Gereksinimler

- Node.js (LTS sürümü): `node -v` ile kontrol et
- Docker (PostgreSQL'i kolayca çalıştırmak için)
- Bir API istemcisi: Postman, Insomnia ya da VS Code için "REST Client" eklentisi
- Bir veritabanı arayüzü: TablePlus, DBeaver ya da pgAdmin

---

# 1. HAFTA: Backend Temelleri

## Gün 1: Node.js temelleri

**Hedef:** Tarayıcı dışında çalışan JavaScript'i anlamak.

> 📄 **Detaylı plan (kaynaklar, alıştırmalar, süreler):** [gun-01-nodejs-temelleri.md](gun-01-nodejs-temelleri.md)

**Öğren:**
- Node.js nedir? Tarayıcıdan farkı ne? (`window` ve `document` yok, dosya sistemi ve ağ erişimi var)
- Event loop (kabaca): Node neden tek thread'le çok sayıda isteği karşılayabiliyor?
- Modül sistemi: `import`/`export` ve `require`
- `process.env`, `process.argv`
- `fs` modülü ile dosya okuma ve yazma
- `npm init`, `package.json`, script'ler

**Yap:**
1. `hafta-1-express` klasöründe `npm init -y` çalıştır.
2. Bir JSON dosyasını okuyup konsola yazan bir script yaz.
3. Node'un hazır `http` modülüyle, `/` adresine "Merhaba" dönen bir sunucu yaz (Express kullanmadan).

**Kaynak:** https://nodejs.org/en/learn

**Kontrol:** "Tarayıcıdaki JS ile Node'daki JS'in farkı ne?" sorusunu cevaplayabiliyor musun?

---

## Gün 2: Express ve REST'e giriş

**Hedef:** İlk gerçek API'yi yazmak.

**Öğren:**
- Express nedir, neden `http` modülü yerine kullanılır?
- Route tanımlama: `app.get`, `app.post`, `app.put`, `app.delete`
- `req.params`, `req.query`, `req.body`
- `res.status().json()`
- HTTP status kodları: 200, 201, 204, 400, 401, 403, 404, 500
- REST tasarımı: `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`

**Yap:**
1. Express'i kur.
2. Görevleri **bellekteki bir dizide** tutan tam bir CRUD API yaz.
3. Her endpoint'i Postman ile test et.

**Kaynak:** https://expressjs.com/en/starter/installing.html

**Kontrol:** Olmayan bir görevi istediğinde 404, eksik veriyle görev oluşturmaya çalıştığında 400 dönüyor mu?

---

## Gün 3: Middleware, hata yönetimi, validation ve katmanlı yapı

**Hedef:** Backend'in "boru hattı" mantığını kavramak. NestJS'teki guard, pipe ve interceptor kavramlarının atası burası.

**Öğren:**
- Middleware nedir? `(req, res, next)` imzası
- Global ve route'a özel middleware
- Merkezi hata yönetimi (error-handling middleware: `(err, req, res, next)`)
- Validation: kullanıcıdan gelen veriye neden asla güvenilmez?
- Katmanlı mimari: **route → controller → service**

**Yap:**
1. Her isteğin method'unu, URL'ini ve süresini loglayan bir middleware yaz.
2. `POST /tasks` için gövde doğrulaması ekle (`title` zorunlu ve string olmalı). İstersen `zod` kullanabilirsin.
3. Tüm hataları tek bir error middleware'de yakala.
4. Kodu `routes/`, `controllers/` ve `services/` klasörlerine böl.

**Kontrol:** Bir isteğin sunucuya girdiği andan cevap dönene kadar hangi adımlardan geçtiğini çizebiliyor musun?

---

## Gün 4: SQL ve PostgreSQL

**Hedef:** Veritabanının temellerini öğrenmek.

**Öğren:**
- İlişkisel veritabanı nedir? Tablo, satır, kolon, primary key, foreign key
- `CREATE TABLE`, `INSERT`, `SELECT`, `UPDATE`, `DELETE`
- `WHERE`, `ORDER BY`, `LIMIT`
- `JOIN`: ilişkili tablolardan veri çekmek
- İlişki türleri: 1-1, 1-N, N-N

**Yap:**
1. PostgreSQL'i Docker ile çalıştır:
   ```bash
   docker run --name pg-ogrenme -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```
2. `users` ve `tasks` tablolarını oluştur (`tasks.user_id` → `users.id`).
3. Elle birkaç kayıt ekle ve `JOIN` ile "kullanıcı adı + görevleri" sorgusunu yaz.

**Kaynak:** https://www.postgresqltutorial.com

**Kontrol:** Foreign key olmasaydı hangi sorunlar çıkardı, açıklayabiliyor musun?

---

## Gün 5: Express'i veritabanına bağlama ve config

**Hedef:** Bellekteki diziden gerçek veritabanına geçmek.

**Öğren:**
- `pg` kütüphanesi ile bağlantı ve connection pool
- Parametreli sorgular (`$1`, `$2`). **SQL injection nedir, neden string birleştirme yapılmaz?**
- `.env` dosyası ve `dotenv`. Secret'lar neden koda yazılmaz, `.env` neden `.gitignore`'a eklenir?
- ORM nedir? (Bugün kullanmayacağız, ama 2. haftada TypeORM'a geçeceğiz.)

**Yap:**
1. Service katmanını, dizi yerine PostgreSQL'e sorgu atacak şekilde değiştir.
2. DB bağlantı bilgilerini `.env` dosyasına taşı.
3. Tüm CRUD endpoint'lerini tekrar test et.

**Kontrol:** Sunucuyu yeniden başlattığında veriler kaybolmuyor mu?

---

## Gün 6: Authentication (JWT)

**Hedef:** Kullanıcı kaydı, girişi ve korumalı endpoint'ler.

**Öğren:**
- Authentication ve authorization arasındaki fark
- Şifre hashleme (`bcrypt`). Şifreler neden asla düz metin saklanmaz?
- JWT nedir, hangi parçalardan oluşur? (https://jwt.io adresinde bir token'ı çözümle)
- `Authorization: Bearer <token>` header'ı

**Yap:**
1. `POST /auth/register`: şifreyi hashleyip kullanıcıyı kaydet.
2. `POST /auth/login`: şifreyi doğrula, JWT dön.
3. Token'ı doğrulayan bir `authMiddleware` yaz ve `/tasks` endpoint'lerini koru.
4. Kullanıcı yalnızca **kendi** görevlerini görebilsin.

**Kontrol:** Token olmadan 401 alıyor musun? Başka bir kullanıcının görevine erişmeye çalışınca 403 ya da 404 alıyor musun?

---

## Gün 7: Tekrar ve 1. haftayı tamamlama

**Hedef:** Eksikleri kapatmak ve temeli oturtmak.

> 📄 **Detaylı cevaplar ve tekrar notları:** [notlar.md](notlar.md) — middleware, controller/service ayrımı, JWT, SQL injection ve gün sonu test planı.

**Yap:**
1. Görev Takip API'sindeki eksikleri tamamla.
2. Tüm endpoint'leri baştan sona tekrar test et.
3. `notlar.md` dosyasına şu soruların cevaplarını yaz:
   - Middleware nedir, ne işe yarar?
   - Controller ile service arasındaki fark ne?
   - JWT nasıl çalışır?
   - SQL injection nedir, nasıl önlenir?
4. **Bu yapıda seni en çok zorlayan ya da tekrar eden şeyleri listele.** (Validation kodu, hata yönetimi, klasör düzeni gibi.) 2. haftada NestJS'in bunları nasıl çözdüğünü göreceksin.

---

# 2. HAFTA: NestJS

## Gün 8: NestJS'e giriş: Module, Controller, Service ve DI

**Hedef:** NestJS'in temel yapı taşlarını anlamak.

**Öğren:**
- NestJS nedir? Express'in üzerine kurulmuş bir framework
- Nest CLI: `npm i -g @nestjs/cli`, `nest new`, `nest g resource`
- **Module**, **Controller** ve **Service (Provider)**
- **Dependency Injection (DI):** service'ler neden `new` ile oluşturulmuyor? `@Injectable()` ne işe yarıyor?
- Decorator'lar: `@Controller`, `@Get`, `@Post`, `@Param`, `@Body`, `@Query`

**Yap:**
1. `hafta-2-nestjs` klasöründe `nest new gorev-takip` çalıştır.
2. `nest g resource tasks` ile bir tasks modülü oluştur ve üretilen dosyaları incele.
3. 1. haftadaki bellekteki dizi versiyonunu NestJS'e taşı.

**Kaynak:** https://docs.nestjs.com: "Overview" bölümündeki First steps, Controllers, Providers ve Modules sayfaları

**Kontrol:** "`TasksController`, `TasksService`'i nereden buluyor?" sorusunu cevaplayabiliyor musun?

---

## Gün 9: DTO, Validation ve Exception Filter

**Hedef:** 1. haftada elle yazdığın validation ve hata yönetimini NestJS yöntemiyle yapmak.

**Öğren:**
- DTO (Data Transfer Object) nedir?
- `class-validator` ve `class-transformer`: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`
- `ValidationPipe`: global kullanım ve `whitelist`, `transform` seçenekleri
- Hazır exception'lar: `NotFoundException`, `BadRequestException`
- Kendi Exception Filter'ını yazmak

**Yap:**
1. `CreateTaskDto` ve `UpdateTaskDto` oluştur.
2. `main.ts` içinde global `ValidationPipe` kur.
3. Bulunamayan görev için `NotFoundException` fırlat.
4. Tüm hataları aynı formatta dönen bir `HttpExceptionFilter` yaz.

**Kaynak:** docs.nestjs.com: Pipes, Validation, Exception filters

**Kontrol:** 1. haftadaki validation koduyla karşılaştır. Ne kadar kod azaldı?

---

## Gün 10: TypeORM ve ConfigModule

**Hedef:** Veritabanını NestJS'e bağlamak.

**Öğren:**
- `@nestjs/config` ve `ConfigService`
- `@nestjs/typeorm` ve `TypeOrmModule.forRootAsync`
- Entity: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`
- İlişkiler: `@ManyToOne`, `@OneToMany`
- Repository pattern: `@InjectRepository`
- Migration nedir? Neden `synchronize: true` production'da kullanılmaz?

**Yap:**
1. `User` ve `Task` entity'lerini oluştur (Task, User'a ManyToOne ile bağlı).
2. Service'i repository kullanacak şekilde güncelle.
3. Bir migration oluştur ve çalıştır.

**Kaynak:** docs.nestjs.com: Techniques > Configuration, Database; https://typeorm.io

**Kontrol:** 1. haftadaki SQL sorgularıyla karşılaştır. TypeORM arka planda hangi SQL'i üretiyor? (`logging: true` ile görebilirsin.)

---

## Gün 11: Auth, Guard, Interceptor ve Request Lifecycle

**Hedef:** NestJS'in istek boru hattını tam olarak anlamak.

**Öğren:**
- **Guard:** yetki kontrolü (1. haftadaki `authMiddleware`'in NestJS karşılığı)
- `@nestjs/jwt` ile JWT üretme ve doğrulama
- Custom decorator: `@CurrentUser()`
- **Interceptor:** cevabı dönüştürme, süre ölçme
- **Request lifecycle:**
  ```
  Middleware → Guard → Interceptor (önce) → Pipe → Controller → Service
            → Interceptor (sonra) → Exception Filter (hata olursa)
  ```

**Yap:**
1. `AuthModule`: register ve login endpoint'leri (bcrypt + JWT).
2. `JwtAuthGuard` yazıp `/tasks` endpoint'lerini koru.
3. İstekteki kullanıcıyı getiren bir `@CurrentUser()` decorator'ı yaz.
4. Her cevabı `{ data: ... }` formatına saran bir `TransformInterceptor` yaz.

**Kaynak:** docs.nestjs.com: Guards, Interceptors, Custom decorators, Security > Authentication

**Kontrol:** Request lifecycle'ı ezberlemeden, kendi kodundaki örneklerle anlatabiliyor musun?

---

## Gün 12: Test ve Swagger

**Hedef:** Yazdığın kodu test etmek ve dokümante etmek.

**Öğren:**
- Jest temelleri: `describe`, `it`, `expect`
- `Test.createTestingModule` ile bağımlılıkları mock'lama
- Unit test ile e2e test arasındaki fark
- `supertest` ile e2e test
- Swagger: `@nestjs/swagger` ve `@ApiProperty`

**Yap:**
1. `TasksService` için unit test yaz (repository'yi mock'la).
2. `POST /tasks` ve `GET /tasks` için e2e test yaz.
3. Swagger'ı kur ve `/api` adresinden dokümantasyonu aç.

**Kaynak:** docs.nestjs.com: Fundamentals > Testing, OpenAPI

**Kontrol:** `npm run test` ve `npm run test:e2e` başarılı geçiyor mu?

---

## Gün 13: Gerçek projeyi okumak (`procright-be`)

**Hedef:** Öğrendiklerini büyük, üretimde çalışan bir projede tanımak.

**Oku (sırayla):**
1. `apps/api/src/main.ts`: global pipe, guard, interceptor ve filter'lar burada kuruluyor. Gün 9 ve 11'de yazdıklarınla karşılaştır.
2. `apps/api/src/api.module.ts`: kök modül ve tüm modüllerin toplandığı yer.
3. `libs/common/guards/supabase-auth.guard.ts`: gerçek bir auth guard.
4. `libs/common/interceptors` ve `libs/common/error-handling`
5. Basit bir modül: `apps/api/src/modules/countries`
6. Karmaşık bir modül: `libs/modules/specification` (entity, repository, service)
7. `libs/rabbitmq/rabbitmq.module.ts`: dinamik modül (`forRootAsync`) örneği

**Yap:**
1. Projeyi local'de ayağa kaldır (`npm run start:local`) ve Swagger'ı aç (`/api`).
2. Bir endpoint seç ve **uçtan uca takip et**: controller → service → repository → entity.
3. `npm run start:debug` ile breakpoint koyup isteği adım adım izle.
4. Bu projede senin projende olmayan şeyleri `notlar.md` dosyasına yaz. (Monorepo, `libs/` yapısı, RabbitMQ consumer'ları, cache, observability gibi.)

**Kontrol:** Seçtiğin endpoint'in akışını birine anlatabiliyor musun?

---

## Gün 14: Final: projeyi tamamla ve katkı yap

**Hedef:** Öğrendiklerini pekiştirmek ve gerçek projeye ilk katkıyı hazırlamak.

**Yap:**
1. NestJS Görev Takip API'sini tamamla (auth, CRUD, validation, test, Swagger).
2. **Ekstra (istersen):** görevlere `status` (enum) ve `dueDate` alanları ekle, listelemeye filtreleme ve sayfalama (pagination) ekle.
3. `procright-be` içinde **yeni bir branch** aç ve küçük, basit bir modül ya da mevcut bir modüle küçük bir endpoint ekle (controller + service + DTO + test).
4. Değişikliği bir ekip üyesine review ettir.

**Son değerlendirme: bunları açıklayabiliyor musun?**
- [ ] Node.js'in tarayıcıdan farkı
- [ ] REST ve HTTP status kodları
- [ ] Middleware ve request lifecycle
- [ ] Module, Controller ve Service arasındaki ilişki
- [ ] Dependency Injection
- [ ] DTO ve ValidationPipe
- [ ] Guard, Interceptor, Pipe ve Filter farkları
- [ ] Entity, Repository ve Migration
- [ ] JWT ile authentication
- [ ] Unit test ile e2e test arasındaki fark

---

## Sonraki adımlar (2 haftadan sonra)

- Cache (Redis) ve `@nestjs/cache-manager`
- Mesaj kuyrukları (RabbitMQ) ve asenkron işler: `procright-be` consumer'ları
- Event'ler (`@nestjs/event-emitter`) ve zamanlanmış işler (`@nestjs/schedule`)
- Docker ile uygulamayı paketlemek
- Loglama ve gözlemlenebilirlik (Pino, OpenTelemetry)

## Genel ipuçları

- **Her gün `notlar.md`'ye yaz.** Anlatamadığın şeyi tam öğrenmemişsin demektir.
- **Hata mesajlarını dikkatle oku.** NestJS'te en sık görülen hata `Nest can't resolve dependencies of X`. Genelde bir modülün `imports` ya da `exports` kısmında eksik bir şey olduğu anlamına gelir.
- **Kopyala-yapıştır yerine yazarak öğren.** Özellikle 1. hafta.
- **Takıldığında soru sor.** Bir konuda 30 dakikadan fazla ilerleyemiyorsan yardım iste.
