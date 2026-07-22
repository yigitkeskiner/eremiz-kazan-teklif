// ============================================================
// KAZAN ALTI SİSTEMİ - marka bağımsız aksesuar grubu
// Kaynak: "Kazanların otomasyonu.pdf" notları + Google Drive fiyat listeleri
// (Tercih Ocak2026, Klepsan Ocak2025, Sancak Mayıs2026, Ünival/Giacomini Ocak2026, Boğaziçi Ocak2025)
// Tüm fiyatlar İSKONTOSUZ liste fiyatlarıdır; iskonto oranları KAZAN_ALTI_ISKONTO içinde.
// ============================================================

const KAZAN_ALTI_ISKONTO = {
  TERCIH: 0.64,
  SANCAK: 0.60,
  UNIVAL: 0.62,
  BOGAZICI: 0.45,
  KLEPSAN: 0.25, // "sarı" grup varsayıldı (rakor/vana); onay bekliyor
};

// --- 1) Kazan girişi (her kazan için) — Klepsan (Tercih'te 1 1/4" ölçü yok, kullanıcı onayı ile Klepsan'a kaydırıldı) ---
const KAZAN_GIRISI = {
  kureselVana114: { ad: "1 1/4\" Küresel Su Vanası (dişli, PN16 tam geçişli)", kod: "113", fiyat: 862.00, birim: "TL", kaynak: "KLEPSAN", carpan: 2 }, // 2x kazan adedi
  cekvalf114:     { ad: "1 1/4\" Dik Çekvalf (yaylı, dış dişli, PN25)",        kod: "514", fiyat: 394.00, birim: "TL", kaynak: "KLEPSAN", carpan: 1 },
  pislikTutucu114:{ ad: "1 1/4\" Pislik Tutucu (dişli filtre, PN16)",          kod: "804", fiyat: 694.00, birim: "TL", kaynak: "KLEPSAN", carpan: 1 }, // VARSAYIM: tutarlılık için Klepsan (onay bekliyor)
};

// --- 2) Emniyet ventili — Klepsan Sabit Ayarlı (sadece 1/2, 3/4, 1" ölçülerde mevcut) ---
const EMNIYET_VENTILI_SABIT_AYARLI = [
  { olcu: "1/2\"", kod: "1410", fiyat: 321.00 },
  { olcu: "3/4\"", kod: "1411", fiyat: 562.00 },
  { olcu: "1\"",   kod: "1412", fiyat: 966.00 },
];
// Kazan: 4 bar, adet = kazan adedi. Genleşme tankı: 6 bar, adet = 1. Aynı ürün ailesi (bar seçenekli).
// Büyük kazanlarda (>1") bu aile yetersiz kalabilir — teyit gerekir.

// --- 3) Denge Kabı — Sancak (S2620 Kaynak Boyunlu, kapasiteye göre) ---
// KAPSAM: 29-394 kW arası teyitli. 395-899 kW arası veri eksik (Sancak kataloğunda bu aralık ayrıca doğrulanmalı).
const DENGE_KABI_TABLE = [
  { minKW: 29,  maxKW: 42,  dn: 32,  kod: "S2620", fiyat: 2316 },
  { minKW: 43,  maxKW: 57,  dn: 40,  kod: "S2620", fiyat: 2838 },
  { minKW: 58,  maxKW: 107, dn: 50,  kod: "S2620", fiyat: 4439 },
  { minKW: 108, maxKW: 129, dn: 65,  kod: "S2620", fiyat: 5029 },
  { minKW: 130, maxKW: 196, dn: 65,  kod: "S2620", fiyat: 6618 },
  { minKW: 197, maxKW: 260, dn: 80,  kod: "S2620", fiyat: 9628 },
  { minKW: 261, maxKW: 394, dn: 100, kod: "S2620", fiyat: 11578 },
  // 395-899 kW: ARAŞTIRMA GEREKİYOR
  { minKW: 900, maxKW: 1299, dn: 150, kod: "S2620", fiyat: null }, // fiyat teyit edilemedi (sayfa okuma sırasında net görülemedi)
];

// --- 4) Tortu Pislik Hava Ayırıcı (Akuple, tek gövdede birleşik) — Sancak S2500 (Dişli ve Kaynak Boyunlu), DN'ye göre ---
// Not: Denge Kabı ile "aynı boyutta" olacağı için DN, DENGE_KABI_TABLE'dan gelen dn değeriyle eşleştirilir.
const TORTU_PISLIK_HAVA_AYIRICI_TABLE = {
  20: 3146, 25: 3209, 32: 3270 /* son hane teyit edilemedi, ~3270 */, 40: 4219,
  50: 5062, 65: 6002, 80: 8022, 100: 11529, 125: 16675, 150: 18649, 200: 34963, 250: 41416, 300: 58879,
};

// --- 5) Pislik Tutucu (sistem geneli, denge tankı ile aynı boy) — TERCİH listesi (Y tipi flanşlı PN16) ---
const PISLIK_TUTUCU_BUYUK_TERCIH_TABLE = {
  32: 2525, 40: 2600, 50: 3130, 65: 4705, 80: 6660, 100: 7775, 125: 12390, 150: 17535, 200: 32450,
};

// --- 6) İzolasyon vanaları (pislik tutucu / hava ayırıcı / dönüş hattı / tortu pislik ayırıcı önü) ---
// Kullanıcıya soruluyor: Wafer Kelebek Vana mı, Küresel Vana mı? Cevaba göre TEK tip kullanılır (4 noktada da aynı).
// Wafer -> Ünival/Giacomini NİKEL klape (USD)
const WAFER_VANA_NIKEL_USD_TABLE = { 40: 90.00, 50: 93.00, 65: 94.54, 80: 104.84, 100: 140.97, 125: 195.03, 150: 225.00, 200: 347.77 };
// Küresel -> TERCİH flanşlı küresel vana (PN16, TL) — not: DN25 sonrası kullanılabilir
const KURESEL_VANA_TERCIH_PN16_TL_TABLE = { 25: 2340, 32: 3045, 40: 3635, 50: 4985, 65: 6120, 80: 8965, 100: 11735, 125: 18420, 150: 24000, 200: 49500 };

// --- 7) Flanş — Boğaziçi KAYNAK BOYUNLU FLANŞ (PN10-16), DN'ye göre ---
const KAYNAK_BOYUNLU_FLANS_TL_TABLE = { 15: 277, 20: 316, 25: 366, 32: 464, 40: 573, 50: 671, 65: 780, 80: 1036, 100: 1352, 125: 1480, 150: 1875, 200: 3050 };

// --- 8) Conta — Boğaziçi 2mm Klingrit (USD), DN'ye göre ---
const CONTA_2MM_KLINGRIT_USD_TABLE = { 15: 0.08, 20: 0.12, 25: 0.22, 32: 0.34, 40: 0.41, 50: 0.55, 65: 0.75, 80: 0.98, 100: 1.09, 125: 1.16, 150: 1.34, 200: 1.50, 250: 1.97, 300: 2.53 };

// --- 9) Civata + Somun — HENÜZ BİLDİRİLMEDİ (kullanıcı sonradan verecek). Miktar kuralı biliniyor: ---
// DN65 altı flanş başına 4 adet M16, DN65 ve üstü flanş başına 8 adet.
const CIVATA_SOMUN_BIRIM_FIYAT_TL = null; // TODO: kullanıcıdan gelecek

// --- 10) Hava tüpü grubu — Sancak S2580 "Hava Ayırıcı (Paslanmaz)" (EUR, ölçüye göre) + Ünival mini vana + oto purjör ---
// VARSAYIM: kullanıcı "hava tüpü sayfa 21'de" dedi; o sayfada bulunan küçük dişli/tüp gövdeli ürün budur. Teyit edilmeli.
const HAVA_TUPU_SANCAK_EUR_TABLE = { "1\"": 126.00, "1 1/4\"": 148.00, "1 1/2\"": 170.00, "2\"": 193.00 };
const MINI_KURESEL_VANA_UNIVAL_TL = { "1/2\"": 450.00, "3/4\"": 584.38, "1\"": 1093.75, "1 1/4\"": 1719.09, "1 1/2\"": 2315.63, "2\"": 3510.81 };
const OTOMATIK_PURJOR_UNIVAL_EUR = { "1/2\"": 11.12 };

// ============================================================
// Hesaplama yardımcıları
// ============================================================

function dengeKabiSatiri(totalKW) {
  return DENGE_KABI_TABLE.find(r => totalKW >= r.minKW && totalKW <= r.maxKW) || null;
}

function buildKazanAltiLines(kazanAdedi, totalKW, vanaTipi /* "wafer" | "kuresel" */) {
  const lines = [];
  if (kazanAdedi <= 0) return lines;

  const netTL = (fiyat, iskonto) => fiyat == null ? null : fiyat * (1 - iskonto);

  // 1) Kazan girişi (her kazan başına)
  Object.values(KAZAN_GIRISI).forEach(item => {
    lines.push({
      name: item.ad, code: item.kod, qty: item.carpan * kazanAdedi,
      unitList: item.fiyat, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.KLEPSAN,
    });
  });

  // 2) Emniyet ventili - kazan (4 bar) + genleşme tankı (6 bar) — ölçü şimdilik 1" varsayılan (en büyük Sabit Ayarlı seçenek)
  const emniyet = EMNIYET_VENTILI_SABIT_AYARLI[EMNIYET_VENTILI_SABIT_AYARLI.length - 1];
  lines.push({ name: `Emniyet Ventili - Kazan (Sabit Ayarlı, 4 bar, ${emniyet.olcu})`, code: emniyet.kod, qty: kazanAdedi, unitList: emniyet.fiyat, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.KLEPSAN });
  lines.push({ name: `Emniyet Ventili - Genleşme Tankı (Sabit Ayarlı, 6 bar, ${emniyet.olcu})`, code: emniyet.kod, qty: 1, unitList: emniyet.fiyat, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.KLEPSAN });

  // 3) Denge kabı + ona bağlı DN'ye göre diğer kalemler
  const dk = dengeKabiSatiri(totalKW);
  if (!dk || dk.fiyat == null) {
    lines.push({ name: `Denge Kabı — ${totalKW} kW için katalog verisi eksik/teyit edilmedi`, code: "?", qty: 1, unitList: null, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.SANCAK, missing: true });
  } else {
    const dn = dk.dn;
    lines.push({ name: `Denge Kabı (${dk.minKW}-${dk.maxKW} kW, DN${dn}, kaynak boyunlu)`, code: dk.kod, qty: 1, unitList: dk.fiyat, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.SANCAK });

    const tortuPislikHava = TORTU_PISLIK_HAVA_AYIRICI_TABLE[dn];
    lines.push({ name: `Tortu Pislik Hava Ayırıcı - Akuple (DN${dn}, denge kabı ile aynı boy)`, code: "S2500", qty: 1, unitList: tortuPislikHava ?? null, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.SANCAK, missing: tortuPislikHava == null });

    const pislikBuyuk = PISLIK_TUTUCU_BUYUK_TERCIH_TABLE[dn];
    lines.push({ name: `Pislik Tutucu - sistem geneli (Y tipi flanşlı, DN${dn}, Tercih)`, code: "PN16", qty: 1, unitList: pislikBuyuk ?? null, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.TERCIH, missing: pislikBuyuk == null });

    // Hava Ayırıcı — not: bu, ayrı bir Sancak paslanmaz ürünü olarak da satılıyor (S2580, 1"-2" aralığında);
    // burada "denge kabı ile aynı boyda" istenen büyük hava ayırıcı, akuple ürün (Tortu Pislik Hava Ayırıcı) içinde
    // zaten birleşik geldiği için ayrıca satır açılmadı. Ayrı istenirse S2580/S2590 satırları eklenmelidir.

    // 4) İzolasyon vanaları (4 nokta): pislik tutucu önü, hava ayırıcı önü, dönüş hattı önü, tortu pislik ayırıcı önü
    const vanaAdedi = 4;
    if (vanaTipi === "wafer") {
      const waferFiyat = WAFER_VANA_NIKEL_USD_TABLE[dn];
      lines.push({ name: `Wafer Tip Kelebek Vana - Nikel Klapeli (DN${dn}) x${vanaAdedi} nokta`, code: "BWN-0201", qty: vanaAdedi, unitList: waferFiyat ?? null, sym: "$", iskonto: KAZAN_ALTI_ISKONTO.UNIVAL, missing: waferFiyat == null });
    } else {
      const kureselFiyat = KURESEL_VANA_TERCIH_PN16_TL_TABLE[dn];
      lines.push({ name: `Küresel Vana - Flanşlı PN16 (DN${dn}) x${vanaAdedi} nokta`, code: "PN16", qty: vanaAdedi, unitList: kureselFiyat ?? null, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.TERCIH, missing: kureselFiyat == null });
    }

    // 5) Flanş grubu (kaynak boyunlu): Denge kabı 4 + Tortu/Hava Ayırıcı 2 + Pislik Tutucu 2 + izolasyon vanaları 2/adet
    const flansAdedi = 4 + 2 + 2 + (2 * vanaAdedi);
    const flansFiyat = KAYNAK_BOYUNLU_FLANS_TL_TABLE[dn];
    lines.push({ name: `Flanş - Kaynak Boyunlu (DN${dn}) — denge kabı(4)+ayırıcı(2)+pislik tutucu(2)+vana(2x${vanaAdedi})`, code: "EN1092-1", qty: flansAdedi, unitList: flansFiyat ?? null, sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.BOGAZICI, missing: flansFiyat == null });

    // 6) Conta (flanş başına 2 adet)
    const contaAdedi = flansAdedi * 2;
    const contaFiyat = CONTA_2MM_KLINGRIT_USD_TABLE[dn];
    lines.push({ name: `Conta - 2mm Klingrit (DN${dn})`, code: "Klingrit-2mm", qty: contaAdedi, unitList: contaFiyat ?? null, sym: "$", iskonto: KAZAN_ALTI_ISKONTO.BOGAZICI, missing: contaFiyat == null });

    // 7) Civata + Somun (fiyat henüz bildirilmedi)
    const civataAdedi = flansAdedi * (dn < 65 ? 4 : 8);
    lines.push({ name: `Civata + Somun (M16, flanş başına ${dn < 65 ? 4 : 8} adet) — FİYAT BEKLENİYOR`, code: "M16", qty: civataAdedi, unitList: CIVATA_SOMUN_BIRIM_FIYAT_TL, sym: "₺", iskonto: 0, missing: true });
  }

  // 8) Hava tüpü grubu (standart, kazan/sistem başına 1 adet varsayıldı — büyüklük 1 1/4" alındı, ölçü değişebilir)
  const havaTupuOlcu = "1 1/4\"";
  lines.push({ name: `Hava Tüpü (Sancak, ${havaTupuOlcu}) — VARSAYIM, teyit gerekir`, code: "S2580", qty: 1, unitList: HAVA_TUPU_SANCAK_EUR_TABLE[havaTupuOlcu], sym: "€", iskonto: KAZAN_ALTI_ISKONTO.SANCAK, missing: false });
  lines.push({ name: `Mini Küresel Vana (hava tüpü için, standart ${havaTupuOlcu})`, code: "BAV-0104", qty: 2, unitList: MINI_KURESEL_VANA_UNIVAL_TL[havaTupuOlcu], sym: "₺", iskonto: KAZAN_ALTI_ISKONTO.UNIVAL });
  lines.push({ name: `Otomatik Hava Purjörü (hava tüpü için, 1/2")`, code: "R88I", qty: 1, unitList: OTOMATIK_PURJOR_UNIVAL_EUR["1/2\""], sym: "€", iskonto: KAZAN_ALTI_ISKONTO.UNIVAL });

  return lines;
}
