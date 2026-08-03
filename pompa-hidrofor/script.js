// EREM Group - Pompa ve Hidrofor Secimi
// Hesap mantigi "ERM Pompa Secim Teklif Sistemi V1" Excel dosyasindaki
// 2A_Hidrofor, 2B_Sirkulasyon, 2C_Kazan, 4_Eslestirme ve 5_Teklif
// sayfalarindaki formullerin birebir JS karsiligidir.

(function () {
  "use strict";

  var PRODUCTS = window.PUMP_PRODUCTS || [];
  var CURVES = window.ALARKO_CURVES || [];
  var LISTS = window.PUMP_LISTS || {};

  var NO_CALC_CATEGORIES = ["Yangın pompası", "Endüstriyel pompa"];

  // ---------- yardimci fonksiyonlar ----------
  function round(value, digits) {
    if (value === null || value === undefined || isNaN(value)) return null;
    var f = Math.pow(10, digits || 0);
    return Math.round((value + Number.EPSILON) * f) / f;
  }

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var v = el.value;
    if (v === "" || v === null || v === undefined) return null;
    var n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function str(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    return el.value || "";
  }

  function fillSelect(id, options, placeholder) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    if (placeholder) {
      var ph = document.createElement("option");
      ph.value = "";
      ph.textContent = placeholder;
      el.appendChild(ph);
    }
    (options || []).forEach(function (opt) {
      var o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      el.appendChild(o);
    });
  }

  function fmt(value, unit) {
    if (value === null || value === undefined || value === "" || isNaN(value)) return "—";
    return value + (unit ? " " + unit : "");
  }

  function money(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
  }

  function pct(value) {
    if (value === null || value === undefined || isNaN(value)) return "—";
    return (value * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + "%";
  }

  // ---------- 2A HIDROFOR ----------
  function calcHidrofor() {
    var daire = num("h_daireSayisi");
    var kisi = num("h_kisiDaire");
    var kisiUsed = kisi === null ? 4 : kisi;
    var tuketim = num("h_tuketim");
    var tuketimUsed = tuketim === null ? 150 : tuketim;
    var esKullanim = num("h_esKullanim");
    var esKullanimUsed = esKullanim === null ? 0.08 : esKullanim;
    var katSayisi = num("h_katSayisi");
    var katYuksekligi = num("h_katYuksekligi");
    var katYuksekligiUsed = katYuksekligi === null ? 3 : katYuksekligi;
    var sebekeBasinc = num("h_sebekeBasinc");
    var sebekeBasincUsed = sebekeBasinc === null ? 0 : sebekeBasinc;
    var istenenBasinc = num("h_istenenBasinc");
    var istenenBasincUsed = istenenBasinc === null ? 2 : istenenBasinc;
    var tesisatKaybi = num("h_tesisatKaybi");
    var tesisatKaybiUsed = tesisatKaybi === null ? 5 : tesisatKaybi;
    var emisKaybi = num("h_emisKaybi");
    var emisKaybiUsed = emisKaybi === null ? 2 : emisKaybi;
    var depoKonum = str("h_depoKonum");
    var frekansIstek = str("h_frekansIstek");

    var warnings = [];
    var gunlukIhtiyac = null, Q = null, geometrik = null, H = null;

    if (daire === null) {
      warnings.push({ type: "warn", text: "⚠ Daire/kullanıcı sayısı girilmeden debi hesaplanamaz." });
    } else {
      gunlukIhtiyac = round(daire * kisiUsed * tuketimUsed / 1000, 1);
      Q = round(gunlukIhtiyac * esKullanimUsed, 1);
    }

    if (katSayisi === null) {
      warnings.push({ type: "warn", text: "⚠ Kat sayısı girilmeden hidrofor seçimi yapılamaz." });
    } else {
      geometrik = katSayisi * katYuksekligiUsed;
      H = round(geometrik + istenenBasincUsed * 10 + tesisatKaybiUsed + emisKaybiUsed - sebekeBasincUsed * 10, 0);
    }

    if (sebekeBasinc === null) {
      warnings.push({ type: "info", text: "ℹ Şebeke basıncı bilinmiyor → 0 kabul edilmiştir (teklif notuna ekleyin)." });
    }
    if (!depoKonum) {
      warnings.push({ type: "info", text: "ℹ Depo konumu belirtilmedi; emiş şartı sahada doğrulanmalıdır." });
    }
    if (Q !== null && Q > 20) {
      warnings.push({ type: "info", text: "ℹ Çok pompalı büyük sistem → ORTA risk, teknik kontrol önerilir." });
    }

    var sistemOnerisi = "";
    if (Q !== null) {
      sistemOnerisi = Q <= 8 ? "İkili (1 asıl + 1 yedek)" : (Q <= 20 ? "İkili / Üçlü" : "Üçlü");
    }
    var frekansOnerisi = "";
    if (frekansIstek === "Evet") {
      frekansOnerisi = "Frekans kontrollü";
    } else if (katSayisi !== null) {
      frekansOnerisi = katSayisi >= 8 ? "Frekans kontrollü önerilir" : "Sabit devir yeterli olabilir";
    }

    var teklifVerilebilir = (Q === null || H === null) ? "HAYIR – Q/H yok (Kural 1)" : "EVET – ön seçim yapılabilir";

    return {
      gunlukIhtiyac: gunlukIhtiyac, Q: Q, geometrik: geometrik, H: H,
      sistemOnerisi: sistemOnerisi, frekansOnerisi: frekansOnerisi,
      warnings: warnings, teklifVerilebilir: teklifVerilebilir
    };
  }

  function renderHidrofor(r) {
    var el = document.getElementById("hidroforOutput");
    var html = "";
    html += renderWarnings(r.warnings);
    html += '<div class="ph-kv">';
    html += kvRow("Günlük ihtiyaç (m³/gün)", fmt(r.gunlukIhtiyac));
    html += kvRow("Q – Hesaplanan debi (m³/h)", fmt(r.Q));
    html += kvRow("Geometrik yükseklik (mSS)", fmt(r.geometrik));
    html += kvRow("H – Basma yüksekliği (mSS)", fmt(r.H));
    html += kvRow("Önerilen sistem", r.sistemOnerisi || "—");
    html += kvRow("Frekans önerisi", r.frekansOnerisi || "—");
    html += kvRow("Teklif verilebilir mi?", r.teklifVerilebilir);
    html += "</div>";
    el.innerHTML = html;
  }

  // ---------- 2B SIRKULASYON ----------
  // H (mSS) hesabi basitlestirildi: H = (0,2 x kat sayisi) + 5
  function calcSirkulasyon() {
    var kapasite = num("s_kapasite");
    var deltaT = num("s_deltaT");
    var deltaTUsed = deltaT === null ? 20 : deltaT;
    var katSayisi = num("s_katSayisi");

    var warnings = [];
    var Q = null, H = null;

    if (deltaT === null) {
      warnings.push({ type: "warn", text: "⚠ ΔT girilmeden sirkülasyon pompası debisi hesaplanamaz." });
    }
    if (kapasite === null) {
      warnings.push({ type: "warn", text: "⚠ Isıtma kapasitesi (kW) girilmedi." });
    } else {
      Q = round(0.86 * kapasite / deltaTUsed, 2);
    }

    if (katSayisi === null) {
      warnings.push({ type: "warn", text: "⚠ Bina kaç katlı girilmeden H hesaplanamaz." });
    } else {
      H = round(0.2 * katSayisi + 5, 1);
    }

    var teklifVerilebilir = (Q === null || H === null) ? "HAYIR – Q/H yok (Kural 1)" : "EVET – ön seçim yapılabilir";

    return { Q: Q, H: H, warnings: warnings, teklifVerilebilir: teklifVerilebilir };
  }

  function renderSirkulasyon(r) {
    var el = document.getElementById("sirkulasyonOutput");
    var html = "";
    html += renderWarnings(r.warnings);
    html += '<div class="ph-kv">';
    html += kvRow("Q – Hesaplanan debi (m³/h)", fmt(r.Q));
    html += kvRow("H – Basma yüksekliği (mSS)", fmt(r.H));
    html += kvRow("Teklif verilebilir mi?", r.teklifVerilebilir);
    html += "</div>";
    el.innerHTML = html;
  }

  // ---------- ALARKO OPTIMA egri kontrolu ----------
  function alarkoVpUygun(curve, Q, H) {
    if (Q === null || H === null) return { uygun: false, hAlt: null, hUst: null };
    if (Q > curve.qMaxVar) return { uygun: false, hAlt: null, hUst: null };
    var hAlt = curve.altH0 + (Q / curve.qMaxVar) * (curve.altHend - curve.altH0);
    var hUst;
    if (Q <= curve.qTepe) {
      hUst = curve.ustH0 + (Q / curve.qTepe) * (curve.ustHtepe - curve.ustH0);
    } else {
      hUst = curve.ustHtepe - ((Q - curve.qTepe) / (curve.qSon - curve.qTepe)) * (curve.ustHtepe - curve.ustHson);
    }
    return { uygun: H >= hAlt && H <= hUst, hAlt: round(hAlt, 2), hUst: round(hUst, 2) };
  }

  function alarkoCpUygun(curve, Q, H) {
    if (Q === null || H === null) return { uygun: false, hAlt: null, hUst: null };
    if (Q > curve.sabitQSon) return { uygun: false, hAlt: null, hUst: null };
    var hAlt = curve.sabitHalt;
    var hUst;
    if (Q <= curve.sabitQYataySon) {
      hUst = curve.sabitHust;
    } else {
      hUst = curve.sabitHust - ((Q - curve.sabitQYataySon) / (curve.sabitQSon - curve.sabitQYataySon)) * (curve.sabitHust - curve.sabitHson);
    }
    return { uygun: H >= hAlt && H <= hUst, hAlt: round(hAlt, 2), hUst: round(hUst, 2) };
  }

  function calcAlarko(Q, H) {
    var vpRows = CURVES.map(function (c) {
      var res = alarkoVpUygun(c, Q, H);
      return { model: c.model, pdfPage: c.pdfPage, uygun: res.uygun, hAlt: res.hAlt, hUst: res.hUst, qMaxVar: c.qMaxVar };
    });
    var cpRows = CURVES.map(function (c) {
      var res = alarkoCpUygun(c, Q, H);
      return { model: c.model, pdfPage: c.pdfPage, uygun: res.uygun, hAlt: res.hAlt, hUst: res.hUst, qMaxVar: c.qMaxVar };
    });
    // Birden fazla model ayni Q/H noktasini matematiksel olarak karsilayabilir
    // (buyuk pompa dusuk devirde kucuk pompanin isini de yapabilir). Referans
    // birlesik egri grafiginde her nokta tek bir pompanin bolgesine denk
    // dustugunden, uygun olanlar arasindan en kucuk kapasiteliyi (qMaxVar)
    // seciyoruz - veri dizisindeki sira (rastgele/aile bazli) degil.
    var vpBest = vpRows.filter(function (r) { return r.uygun; })
      .sort(function (a, b) { return a.qMaxVar - b.qMaxVar; })[0];
    var cpBest = cpRows.filter(function (r) { return r.uygun; })
      .sort(function (a, b) { return a.qMaxVar - b.qMaxVar; })[0];
    return { vpRows: vpRows, cpRows: cpRows, vpBest: vpBest, cpBest: cpBest };
  }

  function renderAlarko(alarko, Q, H) {
    var el = document.getElementById("alarkoOutput");
    if (Q === null || H === null) { el.innerHTML = ""; return; }
    var html = '<div class="ph-banner ph-banner-info">';
    html += "<strong>Alarko Optima önerisi</strong> (Q=" + Q + " m³/h, H=" + H + " mSS baz alınarak, katalog grafiklerinin yaklaşık sayısallaştırmasıyla):<br/>";
    html += "Değişken basınç (Δp-v) modu: <strong>" + (alarko.vpBest ? alarko.vpBest.model : "Uygun model yok / manuel kontrol") + "</strong> &nbsp;•&nbsp; ";
    html += "Sabit basınç (Δp-c) modu: <strong>" + (alarko.cpBest ? alarko.cpBest.model : "Uygun model yok / manuel kontrol") + "</strong>";
    html += "<br/><span class=\"ph-field-hint\">Kritik projelerde katalog eğrisi / teknik onay kontrolü gerekir.</span>";
    html += "</div>";
    el.innerHTML = html;
  }

  // ---------- 2C KAZAN ----------
  function calcKazan() {
    var kapasite = num("k_kapasite");
    var deltaT = num("k_deltaT");
    var deltaTUsed = deltaT === null ? 20 : deltaT;
    var glikol = num("k_glikol");
    var glikolUsed = glikol === null ? 0 : glikol;
    var glikolKatsayi = (!glikolUsed) ? 1 : round(1 + 0.5 * glikolUsed / 100, 2);
    var tesisatKaybi = num("k_tesisatKaybi");
    var tesisatKaybiUsed = tesisatKaybi === null ? 4 : tesisatKaybi;
    var ekipmanKaybi = num("k_ekipmanKaybi");
    var ekipmanKaybiUsed = ekipmanKaybi === null ? 2 : ekipmanKaybi;
    var emniyetPayi = num("k_emniyetPayi");
    var emniyetPayiUsed = emniyetPayi === null ? 1 : emniyetPayi;

    var warnings = [];
    var Q = null;
    if (kapasite === null) {
      warnings.push({ type: "warn", text: "⚠ Kazan kapasitesi girilmeden debi hesaplanamaz." });
    } else {
      Q = round(0.86 * kapasite / deltaTUsed * glikolKatsayi, 2);
    }
    var H = round(tesisatKaybiUsed + ekipmanKaybiUsed + emniyetPayiUsed, 1);

    if (glikolUsed > 0) {
      warnings.push({ type: "info", text: "ℹ Glikollü sistem → viskozite düzeltmesi uygulandı; nihai seçimde üretici programıyla doğrulayın." });
    }
    warnings.push({ type: "info", text: "Kazan dairesi pompası ORTA risk sınıfındadır (Kural 4) – teklif öncesi teknik kontrol önerilir." });

    var teklifVerilebilir = (Q === null) ? "HAYIR – Q yok (Kural 1)" : "EVET – teknik kontrol sonrası";

    return { Q: Q, H: H, warnings: warnings, teklifVerilebilir: teklifVerilebilir };
  }

  function renderKazan(r) {
    var el = document.getElementById("kazanOutput");
    var html = "";
    html += renderWarnings(r.warnings);
    html += '<div class="ph-kv">';
    html += kvRow("Q – Hesaplanan debi (m³/h)", fmt(r.Q));
    html += kvRow("H – Basma yüksekliği (mSS)", fmt(r.H));
    html += kvRow("Teklif verilebilir mi?", r.teklifVerilebilir);
    html += "</div>";
    el.innerHTML = html;
  }

  // ---------- ortak render yardimcilari ----------
  function kvRow(label, value) {
    return "<div><span>" + label + "</span><strong>" + value + "</strong></div>";
  }

  function renderWarnings(warnings) {
    return (warnings || []).map(function (w) {
      var cls = w.type === "warn" ? "ph-banner-warn" : "ph-banner-info";
      return '<div class="ph-banner ' + cls + '">' + w.text + "</div>";
    }).join("");
  }

  // ---------- kategoriye gore hesap calistirma ----------
  function runCategoryCalc(category) {
    var out = { Q: null, H: null, riskCategoryNote: null };
    if (category === "Hidrofor") {
      var rH = calcHidrofor();
      renderHidrofor(rH);
      out.Q = rH.Q; out.H = rH.H;
    } else if (category === "Sirkülasyon pompası") {
      var rS = calcSirkulasyon();
      renderSirkulasyon(rS);
      var alarko = calcAlarko(rS.Q, rS.H);
      renderAlarko(alarko, rS.Q, rS.H);
      out.Q = rS.Q; out.H = rS.H; out.alarko = alarko;
    } else if (category === "Kazan dairesi pompası") {
      var rK = calcKazan();
      renderKazan(rK);
      out.Q = rK.Q; out.H = rK.H;
    } else {
      out.Q = num("m_Q");
      out.H = num("m_H");
    }
    return out;
  }

  function riskForCategory(category) {
    if (["Yangın pompası", "Endüstriyel pompa", "Pis su pompası", "Drenaj pompası"].indexOf(category) > -1) return "YUKSEK";
    if (["Kazan dairesi pompası", "HVAC pompası"].indexOf(category) > -1) return "ORTA";
    return "DUSUK";
  }

  function riskLabel(risk) {
    return risk === "YUKSEK" ? "YÜKSEK" : (risk === "ORTA" ? "ORTA" : "DÜŞÜK");
  }

  function onayForRisk(risk) {
    if (risk === "YUKSEK") return "TEKNİK ONAY ZORUNLU";
    if (risk === "ORTA") return "Teknik kontrol önerilir";
    return "Satış ekibi ilerleyebilir";
  }

  // ---------- 4_Eslestirme puanlama motoru ----------
  function scoreProducts(category, Qused, Hused, ctx) {
    var candidates = PRODUCTS.filter(function (p) { return p.category === category; });

    var withEligibility = candidates.map(function (p, idx) {
      var eligible = Qused !== null && Hused !== null &&
        Qused >= p.qMin && Qused <= p.qMax &&
        Hused >= p.hMin && Hused <= p.hMax &&
        (ctx.freqTercih !== "Evet" || p.frequency === "Var") &&
        (!ctx.elektrikTercih || ctx.elektrikTercih === "Farketmez" || p.electric === ctx.elektrikTercih) &&
        (ctx.sivi === null || p.maxTemp === null || p.maxTemp === undefined || p.maxTemp >= ctx.sivi);

      if (eligible && p.brand === "Alarko" && p.category === "Sirkülasyon pompası" && ctx.alarko) {
        var curveRowVp = ctx.alarko.vpRows.filter(function (r) { return r.model === p.model; })[0];
        var curveRowCp = ctx.alarko.cpRows.filter(function (r) { return r.model === p.model; })[0];
        var okVp = curveRowVp ? curveRowVp.uygun : false;
        var okCp = curveRowCp ? curveRowCp.uygun : false;
        eligible = okVp || okCp;
      }

      return { product: p, idx: idx, eligible: eligible };
    });

    var eligibleList = withEligibility.filter(function (r) { return r.eligible; });
    var minNetPrice = eligibleList.length
      ? Math.min.apply(null, eligibleList.map(function (r) { return r.product.netPrice; }).filter(function (v) { return typeof v === "number"; }))
      : null;

    var scored = withEligibility.map(function (r) {
      var p = r.product;
      if (!r.eligible) {
        return { product: p, eligible: false, scores: { qh: 0, tip: 0, frekans: 0, stok: 0, motor: 0, fiyat: 0, marka: 0 }, total: 0, idx: r.idx };
      }
      var bepQ = (typeof p.bepQ === "number") ? p.bepQ : (p.qMin + p.qMax) / 2;
      var qh = round(40 * (1 - Math.min(1, Math.abs(Qused - bepQ) / Math.max(p.qMax - p.qMin, 0.001))), 0);

      var tip = (!ctx.pompaTipiTercih || p.pumpType === ctx.pompaTipiTercih) ? 15 : 7;

      var frekans;
      if (ctx.freqTercih === "Hayır") {
        frekans = p.frequency === "Yok" ? 10 : 5;
      } else {
        frekans = 10;
      }

      var stok = p.stock === "Var" ? 10 : 0;

      var motor;
      var gerekli = (Qused * Hused) / 165;
      if (p.motorKW === null || p.motorKW === undefined) {
        motor = 5;
      } else if (p.motorKW >= gerekli && p.motorKW <= 2.5 * gerekli + 0.2) {
        motor = 10;
      } else if (p.motorKW >= gerekli) {
        motor = 5;
      } else {
        motor = 0;
      }

      var fiyat = 0;
      if (typeof p.netPrice === "number" && p.netPrice > 0 && minNetPrice !== null) {
        fiyat = round(10 * minNetPrice / p.netPrice, 0);
      }

      var marka = (!ctx.markaTercih || ctx.markaTercih === "Farketmez" || p.brand === ctx.markaTercih) ? 5 : 0;

      var total = qh + tip + frekans + stok + motor + fiyat + marka;

      return { product: p, eligible: true, scores: { qh: qh, tip: tip, frekans: frekans, stok: stok, motor: motor, fiyat: fiyat, marka: marka }, total: total, idx: r.idx };
    });

    scored.sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      return a.idx - b.idx;
    });

    return scored;
  }

  // ---------- sonuc render ----------
  function renderResults(category, Qused, Hused, scored) {
    var area = document.getElementById("resultsArea");
    var risk = riskForCategory(category);
    var onay = onayForRisk(risk);

    var html = "";

    if (NO_CALC_CATEGORIES.indexOf(category) > -1) {
      html += '<div class="ph-banner ph-banner-danger">';
      html += "⚠ <strong>" + category + "</strong> otomatik seçilmez; V1 kapsamı dışındadır. Sadece ön bilgi toplanır ve çıktı ";
      html += "<strong>TEKNİK ONAY GEREKLİ</strong> olarak işaretlenir. Aşağıdaki ürün eşleştirmesi bilgi amaçlıdır, müşteriye otomatik teklif olarak sunulmamalıdır.";
      html += "</div>";
    }

    html += '<div class="ph-risk-row">';
    html += '<span class="ph-risk-pill ph-risk-' + risk + '">Risk seviyesi: ' + riskLabel(risk) + "</span>";
    html += '<span class="ph-risk-pill">Teknik onay durumu: ' + onay + "</span>";
    html += '<span class="ph-risk-pill">Kullanılan Q: ' + fmt(Qused, "m³/h") + "</span>";
    html += '<span class="ph-risk-pill">Kullanılan H: ' + fmt(Hused, "mSS") + "</span>";
    html += "</div>";

    var eligible = scored.filter(function (s) { return s.eligible; });
    var top3 = eligible.slice(0, 3);

    if (Qused === null || Hused === null) {
      html += '<div class="ph-banner ph-banner-warn">⚠ Kural 1: Q ve H olmadan pompa seçimi yapılmaz. Önce hesap panelini / manuel Q-H alanlarını doldurun.</div>';
    } else if (top3.length === 0) {
      html += '<div class="ph-banner ph-banner-warn">Bu kritere uyan ürün bulunamadı. Kriterleri gözden geçirin veya ürün veritabanını genişletin.</div>';
    } else {
      var prices = top3.map(function (t) { return t.product.netPrice; }).filter(function (v) { return typeof v === "number"; });
      var minP = prices.length ? Math.min.apply(null, prices) : null;
      var maxP = prices.length ? Math.max.apply(null, prices) : null;

      html += '<div class="ph-reco-grid">';
      top3.forEach(function (t, i) {
        var p = t.product;
        var tag = "Alternatif öneri";
        var tagClass = "";
        if (p.netPrice === minP) { tag = "Ekonomik öneri"; tagClass = "economic"; }
        else if (p.netPrice === maxP) { tag = "Premium öneri"; tagClass = "premium"; }

        html += '<div class="ph-reco-card" data-reco-idx="' + i + '">';
        html += '<span class="ph-reco-tag ' + tagClass + '">Öneri ' + (i + 1) + " · " + tag + "</span>";
        html += '<div class="ph-reco-model">' + p.model + "</div>";
        html += '<div class="ph-reco-brand">' + p.brand + " · " + p.pumpType + "</div>";
        html += '<div class="ph-reco-line"><span>Q aralığı</span><strong>' + p.qMin + " – " + p.qMax + " m³/h</strong></div>";
        html += '<div class="ph-reco-line"><span>H aralığı</span><strong>' + p.hMin + " – " + p.hMax + " mSS</strong></div>";
        html += '<div class="ph-reco-line"><span>Motor</span><strong>' + fmt(p.motorKW, "kW") + "</strong></div>";
        html += '<div class="ph-reco-line"><span>Frekans / Elektrik</span><strong>' + p.frequency + " / " + p.electric + "</strong></div>";
        html += '<div class="ph-reco-line"><span>Stok</span><strong>' + p.stock + "</strong></div>";
        html += '<div class="ph-reco-line"><span>Liste fiyatı</span><strong>' + money(p.listPrice) + "</strong></div>";
        html += '<div class="ph-reco-line"><span>İskonto</span><strong>' + pct(p.discountPct) + "</strong></div>";
        html += '<div class="ph-reco-line"><span>Net fiyat</span><strong>' + money(p.netPrice) + "</strong></div>";
        html += '<div class="ph-reco-line"><span>Uygunluk puanı</span><strong>' + t.total + " / 100</strong></div>";
        html += '<div class="ph-reco-score"><i style="width:' + t.total + '%"></i></div>';
        html += "</div>";
      });
      html += "</div>";

      html += '<div class="ph-commercial">';
      html += "<h3>Ticari Hesap (seçilen öneri için)</h3>";
      html += '<div class="ph-grid ph-three-col">';
      html += '<label class="ph-field">Seçilen öneri<select id="commReco">';
      top3.forEach(function (t, i) { html += '<option value="' + i + '">Öneri ' + (i + 1) + " – " + t.product.model + "</option>"; });
      html += "</select></label>";
      html += '<label class="ph-field">Adet<input id="commQty" type="number" min="1" value="1" /></label>';
      html += '<label class="ph-field">KDV oranı<input id="commKdv" type="number" step="0.01" value="0.20" /></label>';
      html += '<label class="ph-field">Net alış (birim, opsiyonel – kâr marjı için)<input id="commNetAlis" type="number" step="0.01" /></label>';
      html += "</div>";
      html += '<div id="commOutput" class="ph-kv" style="margin-top:12px;"></div>';
      html += "</div>";
    }

    html += '<div class="ph-table-wrap"><table class="ph-table"><thead><tr>';
    ["Marka", "Model", "Uygunluk", "Q/H (40)", "Tip (15)", "Frekans (10)", "Stok (10)", "Motor (10)", "Fiyat (10)", "Marka (5)", "TOPLAM", "Net Fiyat"].forEach(function (h) {
      html += "<th>" + h + "</th>";
    });
    html += "</tr></thead><tbody>";
    scored.forEach(function (s) {
      var p = s.product;
      html += '<tr class="' + (s.eligible ? "" : "ph-row-elendi") + '">';
      html += "<td>" + p.brand + "</td><td>" + p.model + "</td>";
      html += "<td>" + (s.eligible ? '<span class="ph-badge ph-badge-uygun">UYGUN</span>' : '<span class="ph-badge ph-badge-elendi">ELENDİ</span>') + "</td>";
      html += "<td>" + s.scores.qh + "</td><td>" + s.scores.tip + "</td><td>" + s.scores.frekans + "</td>";
      html += "<td>" + s.scores.stok + "</td><td>" + s.scores.motor + "</td><td>" + s.scores.fiyat + "</td><td>" + s.scores.marka + "</td>";
      html += "<td><strong>" + s.total + "</strong></td><td>" + money(p.netPrice) + "</td>";
      html += "</tr>";
    });
    html += "</tbody></table></div>";

    html += '<div class="ph-note">Bu seçim, tarafımıza iletilen bilgilere göre ÖN SEÇİM olarak hazırlanmıştır. Nihai seçim için saha şartları, tesisat kayıpları, ';
    html += "depo konumu, şebeke basıncı, akışkan tipi ve proje değerleri kontrol edilmelidir. Eksik veya hatalı bilgi verilmesi durumunda seçim sonucu değişebilir. ";
    html += "Boş bırakılan alanlarda sistem varsayım kullanmıştır. <strong>3_Ürün_DB kaynaklı ürün/fiyat verileri örnektir</strong>; gerçek liste ile değiştirilmeden müşteriye teklif verilmez.</div>";

    area.innerHTML = html;

    if (top3.length) {
      var recalcCommercial = function () {
        var idx = parseInt(document.getElementById("commReco").value, 10) || 0;
        var qty = parseFloat(document.getElementById("commQty").value) || 1;
        var kdv = parseFloat(document.getElementById("commKdv").value);
        if (isNaN(kdv)) kdv = 0.2;
        var netAlisRaw = document.getElementById("commNetAlis").value;
        var netAlis = netAlisRaw === "" ? null : parseFloat(netAlisRaw);

        var chosen = top3[idx].product;
        var tutar = chosen.netPrice * qty;
        var kdvDahil = round(tutar * (1 + kdv), 2);
        var brutKar = netAlis !== null && !isNaN(netAlis) ? tutar - netAlis * qty : null;
        var karMarji = brutKar !== null && tutar !== 0 ? brutKar / tutar : null;

        var out = document.getElementById("commOutput");
        var h = "";
        h += kvRow("Net satış fiyatı (birim)", money(chosen.netPrice));
        h += kvRow("Tutar (KDV hariç)", money(tutar));
        h += kvRow("KDV dahil toplam", money(kdvDahil));
        h += kvRow("Brüt kâr", brutKar === null ? "—" : money(brutKar));
        h += kvRow("Kâr marjı %", karMarji === null ? "—" : pct(karMarji));
        out.innerHTML = h;
      };
      ["commReco", "commQty", "commKdv", "commNetAlis"].forEach(function (id) {
        document.getElementById(id).addEventListener("input", recalcCommercial);
        document.getElementById(id).addEventListener("change", recalcCommercial);
      });
      recalcCommercial();
    }
  }

  // ---------- kategori paneli gecisi ----------
  function updateCategoryPanels() {
    var category = str("category");
    ["panel-hidrofor", "panel-sirkulasyon", "panel-kazan", "panel-manuel"].forEach(function (id) {
      document.getElementById(id).classList.add("ph-hidden");
    });
    var warnEl = document.getElementById("categoryWarning");
    warnEl.classList.add("ph-hidden");
    warnEl.textContent = "";

    if (category === "Hidrofor") {
      document.getElementById("panel-hidrofor").classList.remove("ph-hidden");
    } else if (category === "Sirkülasyon pompası") {
      document.getElementById("panel-sirkulasyon").classList.remove("ph-hidden");
    } else if (category === "Kazan dairesi pompası") {
      document.getElementById("panel-kazan").classList.remove("ph-hidden");
    } else if (category) {
      document.getElementById("panel-manuel").classList.remove("ph-hidden");
    }

    if (category === "Yangın pompası") {
      warnEl.textContent = "⚠ Kural 3: Yangın pompası otomatik seçilmez; sadece ön bilgi toplanır, TEKNİK ONAY gerekir.";
      warnEl.classList.remove("ph-hidden");
    } else if (category === "Endüstriyel pompa") {
      warnEl.textContent = "⚠ Endüstriyel pompa V1 kapsamı dışındadır; çıktı TEKNİK ONAY GEREKLİ olarak işaretlenir.";
      warnEl.classList.remove("ph-hidden");
    }

    // pompa tipi tercihi listesini kategoriye gore doldur
    var types = Array.from(new Set(PRODUCTS.filter(function (p) { return p.category === category; }).map(function (p) { return p.pumpType; })));
    fillSelect("matchPumpType", types, "Farketmez");
  }

  function runMatch() {
    var category = str("category");
    if (!category) return;

    var calc = runCategoryCalc(category);

    var manualQ = num("matchQ");
    var manualH = num("matchH");
    var Qused = manualQ !== null ? manualQ : calc.Q;
    var Hused = manualH !== null ? manualH : calc.H;

    // Alarko egri uygunlugu, panel otonhesabinin Q/H'siyle degil,
    // eslestirmede gercekten kullanilan Qused/Hused ile hesaplanmali
    // (manuel Q/H girildiginde panel hesabi bunlardan farkli olabilir).
    var alarko = category === "Sirkülasyon pompası" ? calcAlarko(Qused, Hused) : null;
    if (alarko) renderAlarko(alarko, Qused, Hused);

    var ctx = {
      freqTercih: str("matchFreq"),
      elektrikTercih: str("matchElectric"),
      sivi: num("matchTemp"),
      markaTercih: str("matchBrand"),
      pompaTipiTercih: str("matchPumpType"),
      alarko: alarko
    };

    var scored = scoreProducts(category, Qused, Hused, ctx);
    renderResults(category, Qused, Hused, scored);
  }

  // ---------- baslangic kurulumu ----------
  function init() {
    fillSelect("category", LISTS.Kategoriler, "Kategori seçin");
    fillSelect("h_depoKonum", LISTS.DepoKonum);
    fillSelect("h_frekansIstek", LISTS.EvetHayirFark);
    fillSelect("s_frekansIstek", LISTS.EvetHayirFark);
    fillSelect("matchFreq", LISTS.EvetHayirFark);
    fillSelect("matchElectric", LISTS.Elektrik);
    fillSelect("matchBrand", LISTS.Markalar);

    // "Farketmez" secenegi notr varsayilan olarak secili gelsin (Evet/Hayir zorlamasin)
    ["h_frekansIstek", "s_frekansIstek", "matchFreq", "matchElectric", "matchBrand"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && Array.prototype.some.call(el.options, function (o) { return o.value === "Farketmez"; })) {
        el.value = "Farketmez";
      }
    });

    document.getElementById("category").addEventListener("change", updateCategoryPanels);
    document.getElementById("runMatchBtn").addEventListener("click", runMatch);

    // canli hesap onizlemesi: kategori panel alanlari degistiginde otomatik yeniden hesapla
    document.getElementById("phForm").addEventListener("input", function (e) {
      var category = str("category");
      if (!category) return;
      if (["Hidrofor", "Sirkülasyon pompası", "Kazan dairesi pompası"].indexOf(category) > -1) {
        runCategoryCalc(category);
      }
    });

    updateCategoryPanels();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
