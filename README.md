# BLEXI - Apart Yönetim Sistemi

Next.js, React ve TypeScript ile geliştirilmiş kapsamlı bir apart ve yurt yönetim sistemi. Uygulama, binalar, odalar, öğrenciler, kayıtlar, finansal işlemler ve daha fazlasını yönetmek için gerekli özellikleri içerir.

## Özellikler

- **Dashboard**: Mülkler, sakinler ve finansal durum genel görünümü
- **Mülk Yönetimi**: Apartlar, odalar ve yatakları envanter takibi ile yönetme
- **Öğrenci Kaydı**: Konaklama rezervasyonu içeren eksiksiz kayıt sihirbazı
- **Finansal Yönetim**: Faturalar, ödemeler, indirimler ve vergi türlerini yönetme
- **Yetkilendirme Sistemi**: Rol tabanlı erişim kontrolü ve kullanıcı yönetimi
- **Duyarlı Arayüz**: Modern tasarımla karanlık/aydınlık tema desteği

## Teknoloji Stack'i

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript
- **Durum Yönetimi**: Zustand
- **Veri Çekme**: TanStack React Query
- **Formlar**: React Hook Form ve Zod doğrulama
- **Stil**: Tailwind CSS
- **Kimlik Doğrulama**: JWT ile özel auth implementasyonu
- **UI Bileşenleri**: Tailwind ile özel UI kütüphanesi

## Başlangıç

### Gereksinimler

- Node.js 18+ ve npm

### Kurulum

```bash
# Repo'yu klonlayın
git clone https://github.com/vgurgor/blexi-app.git
cd blexi-app

# Bağımlılıkları yükleyin
npm install
```

### Geliştirme

```bash
# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde kullanılabilir olacaktır.

### Prodüksiyon için Build

```bash
# Optimize edilmiş prodüksiyon build'i oluşturun
npm run build

# Prodüksiyon sunucusunu başlatın
npm run start
```

### Linting

```bash
# Linter'ı çalıştırın
npm run lint
```

## Uygulama Yapısı

- `/app`: Next.js App Router sayfaları ve layout'ları
- `/components`: Yeniden kullanılabilir React bileşenleri
- `/context`: React context sağlayıcıları (Theme, Toast, ReactQuery)
- `/hooks`: API sorgu hook'ları dahil özel React hook'ları
- `/lib`: Yardımcı fonksiyonlar ve API entegrasyon fonksiyonları
- `/store`: Zustand durum yönetimi store'ları
- `/styles`: Global CSS ve Tailwind yapılandırması
- `/types`: TypeScript tip tanımlamaları
- `/utils`: Yardımcı fonksiyonlar, doğrulayıcılar ve biçimlendiriciler

## Temel Modüller

- **Apartmanlar**: Mülkler ve binaların yönetimi
- **Odalar/Yataklar**: Oda türleri, yatak atamaları ve özellikleri takibi
- **Öğrenciler**: Öğrenci profilleri ve kayıt yönetimi
- **Finans**: Faturalama, ödeme işleme ve finansal raporlama
- **Envanter**: Mülk ve oda envanter öğelerini takip etme
- **Ayarlar**: Sistem yapılandırması ve kullanıcı yönetimi

## Lisans

Tescilli - Tüm hakları saklıdır.

## Katkıda Bulunanlar

- Volkan Gürgör