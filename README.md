# Zephyre - Modern Anime Streaming Website

Zephyre adalah website streaming anime modern yang dibangun dengan Next.js 14 (App Router), menampilkan desain dark theme yang elegan, animasi yang smooth, dan fully responsive untuk semua device.

## ✨ Fitur Utama

- **🌙 Dark Theme Modern** - Desain clean, minimalis, dan elegan
- **🎬 Full Animasi** - Smooth transitions menggunakan Framer Motion
- **📱 Fully Responsive** - Optimal di mobile, tablet, dan desktop
- **🔍 Search Anime** - Pencarian anime dengan hasil real-time
- **📅 Jadwal Anime** - Jadwal tayang anime per hari
- **📺 Streaming & Download** - Link streaming dan download episode
- **⭐ Rating & Review** - Sistem rating dan informasi detail anime
- **🏷️ Genre & Filter** - Kategori dan filter anime
- **📊 Last Update** - Anime yang baru diupdate
- **🎯 SEO Optimized** - Meta tags dan Open Graph untuk setiap halaman
- **📱 WhatsApp Report** - Sistem laporan error via WhatsApp bot
- **☁️ Vercel Ready** - Siap deploy ke Vercel tanpa konfigurasi tambahan

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animation**: Framer Motion
- **Icons**: Heroicons
- **API**: Maelyn API (Otakudesu)
- **Image Optimization**: Next.js Image Component

## 📁 Struktur Project

```
zepyhre/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── globals.css         # Global CSS dengan TailwindCSS
│   │   ├── layout.tsx          # Root layout dengan metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── search/             # Search page
│   │   │   └── page.tsx
│   │   ├── jadwal/             # Schedule page
│   │   │   └── page.tsx
│   │   └── anime/              # Anime detail pages
│   │       └── [slug]/
│   │           └── page.tsx
│   ├── components/             # Reusable components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Footer.tsx          # Footer component
│   │   ├── HeroSection.tsx     # Hero/banner section
│   │   ├── AnimeCard.tsx       # Anime card component
│   │   ├── AnimeSection.tsx    # Anime list section
│   │   ├── AnimeDetail.tsx     # Anime detail page
│   │   ├── SearchResults.tsx   # Search results
│   │   ├── JadwalAnime.tsx     # Anime schedule
│   │   ├── LastUpdateSection.tsx # Last update section
│   │   ├── LoadingSpinner.tsx  # Loading animations
│   │   └── Providers.tsx       # Context providers
│   └── config/
│       └── apiConfig.js        # API configuration
├── public/                     # Static assets
├── package.json               # Dependencies
├── tailwind.config.js         # TailwindCSS config
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config
└── postcss.config.js         # PostCSS config
```

## 🚀 Instalasi & Setup

### Prerequisites

- Node.js 18+
- npm atau yarn
- API Key dari Maelyn API

### Langkah Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd zepyhre
   ```

2. **Install dependencies**

   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Konfigurasi API Key**

   Edit file `src/config/apiConfig.js` dan ganti API key:

   ```javascript
   const apiKey = "your-api-key-here"; // Ganti dengan API KEY milikmu
   ```

4. **Jalankan development server**

   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Buka browser**

   Akses `http://localhost:3000` untuk melihat website

## 📝 Scripts Available

```bash
# Development server
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🎨 Komponen Utama

### 1. Navbar (`components/Navbar.tsx`)

- Sticky navigation dengan scroll effects
- Search bar terintegrasi
- Mobile responsive menu
- Active link highlighting

### 2. HeroSection (`components/HeroSection.tsx`)

- Animated hero banner
- Search functionality
- Call-to-action buttons
- Gradient backgrounds

### 3. AnimeCard (`components/AnimeCard.tsx`)

- Multiple variants (default, large, compact)
- Hover animations
- Rating display
- Episode information

### 4. AnimeDetail (`components/AnimeDetail.tsx`)

- Comprehensive anime information
- Episode list with streaming links
- Download options
- Tabbed interface

### 5. SearchResults (`components/SearchResults.tsx`)

- Real-time search
- Grid layout results
- Loading states
- Error handling

### 6. JadwalAnime (`components/JadwalAnime.tsx`)

- Weekly schedule view
- Day-based filtering
- Time-based sorting
- Responsive design

## 🔧 Konfigurasi

### API Configuration

File `src/config/apiConfig.js` berisi konfigurasi untuk Maelyn API:

```javascript
const apiConfig = {
  SEARCH: (q) => ({
    /* search endpoint */
  }),
  DETAIL: (urlAnime) => ({
    /* detail endpoint */
  }),
  JADWAL: () => ({
    /* schedule endpoint */
  }),
  STREAM: (urlEpisode) => ({
    /* streaming endpoint */
  }),
  DOWNLOAD: (urlEpisode) => ({
    /* download endpoint */
  }),
  LASTUPDATE: () => ({
    /* last update endpoint */
  }),
  ONGOING: () => ({
    /* ongoing anime endpoint */
  }),
  COMPLETED: () => ({
    /* completed anime endpoint */
  }),
};
```

### TailwindCSS Theme

Custom color palette dan animations didefinisikan di `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* custom primary colors */ },
      dark: { /* custom dark colors */ }
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.5s ease-out',
      // ... more animations
    }
  }
}
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code ke GitHub repository
2. Connect repository di Vercel dashboard
3. Set environment variables jika diperlukan
4. Deploy otomatis

### Manual Build

```bash
# Build production
npm run build

# Start production server
npm start
```

## 📱 Responsive Design

Website ini fully responsive dengan breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Setiap komponen dioptimalkan untuk semua ukuran layar dengan:

- Flexible grid layouts
- Responsive typography
- Touch-friendly interactions
- Optimized images

## 🎭 Animasi & Transitions

Menggunakan Framer Motion untuk:

- **Page transitions** - Smooth navigation antar halaman
- **Component animations** - Fade in, slide up, scale effects
- **Hover effects** - Interactive card animations
- **Loading states** - Skeleton loading dan spinners
- **Scroll animations** - Reveal on scroll effects

## 🔍 SEO Features

- **Dynamic metadata** untuk setiap halaman
- **Open Graph tags** untuk social media sharing
- **Twitter Card support**
- **Structured data** untuk search engines
- **Optimized images** dengan Next.js Image
- **Fast loading** dengan code splitting

## 🛡️ Best Practices

- **TypeScript** untuk type safety
- **ESLint** untuk code quality
- **Component-based architecture**
- **Reusable utilities**
- **Error boundaries**
- **Loading states**
- **Accessibility features**

## 🚀 Deployment

### Vercel Deployment

1. **Push ke GitHub repository**
2. **Connect ke Vercel**
3. **Deploy otomatis** - Tidak perlu konfigurasi tambahan

### WhatsApp Report Configuration (Opsional)

Untuk mengaktifkan fitur laporan WhatsApp di production:

1. **Setup Webhook Service** (pilih salah satu):

   - Zapier: Buat Zap dengan webhook trigger
   - Make.com (Integromat): Buat scenario dengan webhook
   - Custom webhook service

2. **Set Environment Variable di Vercel**:

   ```bash
   WHATSAPP_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
   ```

3. **Jika tidak dikonfigurasi**:
   - Laporan tetap diterima dan disimpan untuk diproses manual
   - User tetap mendapat konfirmasi bahwa laporan berhasil dikirim
   - Tidak ada error yang terlihat oleh user

### Development dengan WhatsApp Bot

```bash
# Jalankan development server
npm run dev

# Server akan berjalan di:
# - Next.js: http://localhost:3002
# - WhatsApp Bot: http://localhost:3001
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

- **API**: Maelyn API (Otakudesu)
- **Design Inspiration**: Modern anime streaming platforms
- **Icons**: Heroicons
- **Fonts**: Inter (Google Fonts)

---

**Dibuat dengan ❤️ menggunakan Next.js 14 dan TailwindCSS**
