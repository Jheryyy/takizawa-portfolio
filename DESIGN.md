# Takizawablox Design System Specification

## Tokens & Theme

```yaml
colors:
  primary: "#FF5A1F"
  tertiary: "#FF8552"
  canvas: "#0A0A0A"
  surface: "#141414"
  elevated: "#1C1C1C"
  hairline: "#242424"
  muted: "#9CA3AF"
  text-primary: "#FFFFFF"

typography:
  display: "Plus Jakarta Sans, Inter, sans-serif"
  sans: "Inter, sans-serif"
  mono: "JetBrains Mono, monospace"

rounded:
  md: "12px"
  lg: "20px"
  xl: "32px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "88px"
```

## Overview
Sistem desain ini menggabungkan estetika **Dark Mode Native** dengan komposisi **Minimalist Editorial** untuk merepresentasikan identitas seorang Frontend Developer dan UI/UX Enthusiast. Kontras ekstrem antara kanvas hitam pekat (`#0A0A0A`), tipografi putih berukuran masif, dan sorotan cahaya oranye hangat (`#FF5A1F`) menciptakan kesan modern, berani, dan berorientasi pada detail visual maupun kualitas kode.

## Colors
- **Primary (`#FF5A1F`)**: Digunakan secara disiplin untuk aksi utama (CTA button), nomor urut indeks (`#01`–`#04`), label kategori (*eyebrow*), indikator aktif pada timeline **Education**, serta *ambient radial glow* di area Hero.
- **Secondary (`#FFFFFF`)**: Digunakan untuk permukaan tombol CTA pada Navbar dan elemen kontras utama di atas background gelap.
- **Background (`#0A0A0A`) & Surface (`#141414`)**: Menciptakan kedalaman (*tonal elevation*) tanpa bergantung pada *drop shadow* konvensional. Kartu **Detail About (Education & Skill)**, **Project**, dan **Guestbook** selalu menggunakan `#141414` dengan garis tepi `1px solid #242424`.

## Typography
- **Display & Headings (`Plus Jakarta Sans` / `Inter`)**: Menggunakan *tight tracking* (`-0.02em` hingga `-0.03em`) dan *tight leading* (`1.05`–`1.15`) untuk memberikan karakter editorial yang tegas pada judul Hero dan sub-bagian.
- **Technical Labels & Numbers (`JetBrains Mono`)**: Digunakan khusus untuk penomoran indeks (`#01`), badge teknologi (`Next.js`, `Tailwind CSS`, `Figma`), dan timestamp pada **Guestbook** agar menonjolkan nuansa *developer-centric*.
