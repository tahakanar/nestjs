# Gün 10: TypeORM ve ConfigModule

## Dosyaları okuma sırası

1. `hafta-2-nestj/gorev-takip/.env.example`: bağlantı ayarları.
2. `src/database/database.module.ts`: ConfigModule ve `TypeOrmModule.forRootAsync`.
3. `src/database/database.config.ts`: ConfigService ile ortak bağlantı seçenekleri.
4. `src/users/entities/user.entity.ts` ve `src/tasks/entities/task.entity.ts`: tablo ve ilişki tanımları.
5. `src/tasks/tasks.module.ts`: `forFeature([Task])` repository sağlayıcısını kaydeder.
6. `src/tasks/tasks.service.ts`: `@InjectRepository(Task)` ile repository kullanımı.
7. `src/database/migrations/1791800000000-initial-schema.ts`: tabloları oluşturan `up`, geri alan `down`.

`src/` yolları Nest uygulamasına göredir.

## Express ile karşılaştırma

| Express / SQL | TypeORM |
| --- | --- |
| INSERT INTO tasks ... | repository.create(...) + repository.save(...) |
| SELECT ... ORDER BY id | repository.find({ order: { id: 'ASC' } }) |
| SELECT ... WHERE id = $1 | repository.findOneBy({ id }) |
| UPDATE tasks ... | alanları değiştir + repository.save(task) |
| DELETE ... WHERE id = $1 | repository.delete(id) |

`create()` yalnızca bir nesne oluşturur; veritabanına yazan `save()` işlemidir.
Veritabanı işlemleri asenkron olduğundan, sonucu kullanmadan önce `await` gerekir.
Controller dönen Promise'i NestJS'e bırakabilir.

## Kullanıcı ilişkisi

Bir kullanıcının birçok görevi vardır: User tarafında `OneToMany`, Task tarafında `ManyToOne`.
`tasks.user_id`, `users.id` alanına foreign key ile bağlıdır ve indekslidir.
Kullanıcı silinirse ilişkili görevler de silinir (`ON DELETE CASCADE`).
Gün 10'da giriş sistemi olmadığı için `user_id` boş olabilir. Gün 11'de kullanıcı
JWT'den belirlenecek; mevcut sahipsiz görevler ele alınıp bu alan zorunlu yapılmalıdır.
`password` alanı hash saklamak içindir; auth eklendiğinde düz metin kaydedilmemelidir.

## Çalıştırma

```bash
cd hafta-2-nestj/gorev-takip
nvm use 24
# .env yoksa:
cp .env.example .env
npm run migration:run
npm run start:dev
```

Bu çalışma sırasında proje için PostgreSQL 16 kurulumuyla ayrı bir cluster
`.local/postgres` altında oluşturuldu. Yalnızca `127.0.0.1:55432` üzerinden dinler.
Geliştirme veritabanı `gorev_takip_nest`, test veritabanı `gorev_takip_nest_test`.
Örnek parola yalnızca yerel öğrenme içindir. `.env` ve `.local/` git tarafından yok sayılır.

Bilgisayar yeniden başladıktan sonra PostgreSQL'i açmak için (Nest uygulaması klasöründe):

```bash
/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D .local/postgres -l .local/postgres.log -o '-p 55432 -h 127.0.0.1 -k /private/tmp' start
```

## Migration ve SQL çıktısı

`synchronize: false`: entity değişikliği tabloyu kendiliğinden değiştirmez.
Şema değişiklikleri migration olarak uygulanır ve migration tablosunda kaydedilir.
`npm run migration:show` uygulanmış/bekleyen migration'ları gösterir.
`npm run migration:revert` son migration'ı geri alır; bu ilk migration için tabloları
ve içlerindeki verileri siler. Geri alma kontrolü ayrı test veritabanında yapıldı.

`.env` içinde `DB_LOGGING=true` yapıp uygulamayı yeniden başlatınca TypeORM'un
ürettiği SQL sorgularını konsolda görebilirsin.

## Kontrol

```bash
curl -X POST http://localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Veritabanını öğren"}'
curl http://localhost:3000/tasks
```

Nest uygulamasını durdurup yeniden aç. `GET /tasks` kaydı tekrar döndürmelidir.
`npm run test:http`, ayrı test veritabanında CRUD, doğrulama, ortak hata formatı
ve uygulama yeniden açıldıktan sonra kalıcılık kontrolünü çalıştırır.
Bu testten önce test veritabanı mevcut olmalıdır; migration test tarafından uygulanır.

Kaynaklar: [NestJS TypeORM](https://docs.nestjs.com/techniques/typeorm),
[NestJS Configuration](https://docs.nestjs.com/techniques/configuration),
[TypeORM Migrations](https://typeorm.io/docs/advanced-topics/migrations/).
