const DATA = {
  ECA: {
    label: "E.C.A",
    boilers: [
      { code: "DTYECA 8006720000", name: "Felis FL 65",  cost: 850.57,  sym: "€" },
      { code: "DTYECA 8006721000", name: "Felis FL 100", cost: 1123.50, sym: "€" },
      { code: "DTYECA 8006722000", name: "Felis FL 125", cost: 1260.52, sym: "€" },
      { code: "DTYECA 8006723000", name: "Felis FL 150", cost: 1616.75, sym: "€" },
    ],
    accessories: [
      { code: "DTYECAAKS 7006721314", name: "Ekranlı Kaskad Kontrol Panel Grubu", cost: 101.01, sym: "€", mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721570", name: "Kaskad Kontrol Modül Kartı",    cost: 42.53,  sym: "€", mode: "boiler" },
      { code: "DTYECAAKS 7006721429", name: "Dış Hava Sensörü",    cost: 13.29,  sym: "€", mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721438", name: "Kaskad Sıcaklık Sensörü", cost: 18.61, sym: "€", mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721432", name: "Boyler Sıcaklık Sensörü", cost: 10.63, sym: "€", mode: "tank" },
      { code: "DTYECAAKS 7006721891", name: "Primer Devre Sirk. Pompası 100-125 kW", cost: 180.75, sym: "€", mode: "ecaPump100" },
      { code: "DTYECAAKS 7006721892", name: "Primer Devre Sirk. Pompası 150 kW",    cost: 212.64, sym: "€", mode: "ecaPump150" },
    ],
  },
  BAYMAK: {
    label: "Baymak",
    boilers: [
      { code: "DTYBAY 10090901", name: "Baymak Lectus 65 kW %108",  cost: 1277 * 0.81, sym: "€" },
      { code: "DTYBAY 10090902", name: "Baymak Lectus 90 kW %108",  cost: 1410 * 0.81, sym: "€" },
      { code: "DTYBAY 10090903", name: "Baymak Lectus 115 kW %108", cost: 1581 * 0.81, sym: "€" },
    ],
    accessories: [
      { code: "DTYBAYAKS 60218227", name: "Kaskad Pompa EVop OEM 100/180-32",          cost: 347 * 0.81,   sym: "€", mode: "boiler" },
      { code: "DTYBAYAKS 09120032", name: "RVS 283 Kaskad Kontrol Paneli",             cost: 14833 * 0.81, sym: "₺", mode: "fixed", qty: 1 },
      { code: "DTYBAYAKS 16910171", name: "OCI365.03 OT/LPB Çevirici Ara B. Kartı", cost: 57 * 0.81, sym: "€", mode: "boiler" },
      { code: "DTYBAYAKS 16900077", name: "QAD36/101 Isıtma Suyu Gidiş Sensörü", cost: 15 * 0.81, sym: "€", mode: "fixed", qty: 2 },
      { code: "DTYBAYAKS 16900066", name: "QAC34 Dış Hava Sensörü", cost: 11 * 0.81, sym: "€", mode: "fixed", qty: 1 },
      { code: "DTYBAYAKS 16910072", name: "QAZ36.522/109 Boyler Sıcak Su Sensörü", cost: 7 * 0.81, sym: "€", mode: "tank" },
    ],
  },
  VAILLANT: {
    label: "Vaillant",
    boilers: [
      { code: "ECOT FIT PLUS 100", name: "ecoTEC fit Plus 100 kW", cost: 2233 * 0.77, sym: "€" },
      { code: "ECPFTIS PLUS 150",  name: "ecoTEC fit Plus 150 kW", cost: 2344 * 0.77, sym: "€" },
    ],
    accessories: [
      { code: "UPML XL 32-125", name: "UPML XL 32-125 Pompa",      cost: 257 * 0.77, sym: "€", mode: "boiler" },
      { code: "VRC720",          name: "VRC720 Kontrol Cihazı", cost: 165 * 0.77, sym: "€", mode: "fixed", qty: 1 },
      { code: "VR71",            name: "VR71 Sensör Modülü", cost: 222 * 0.77, sym: "€", mode: "fixed", qty: 1 },
      { code: "VR32",            name: "VR32 Uzaktan Kontrol",      cost: 45 * 0.77,  sym: "€", mode: "minusOne" },
    ],
  },
};

const state = { brand: "ECA", quantities: {} };
const fmtEUR = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTRY = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

function fmt(value, sym) { return sym === "₺" ? fmtTRY.format(value) : "€ " + fmtEUR.format(value); }
function toEUR(item) { return item.sym === "₺" ? item.cost / getRate() : item.cost; }

const boilerList     = document.querySelector("#boilerList");
const quoteLines     = document.querySelector("#quoteLines");
const eurRate        = document.querySelector("#eurRate");
const marginRate     = document.querySelector("#marginRate");
const hasWaterTank   = document.querySelector("#hasWaterTank");
const waterTankCount = document.querySelector("#waterTankCount");
const customer       = document.querySelector("#customer");
const project        = document.querySelector("#project");

function brandData() { return DATA[state.brand]; }
function getRate()   { return Number(eurRate.value || 42); }
function totalBoilers() { return Object.values(state.quantities).reduce((s, v) => s + Number(v || 0), 0); }

function fetchTCMBRate() {
  const label = document.querySelector("#eurRateLabel");
  const setRate = (rate) => {
    eurRate.value = rate.toFixed(2);
    if (label) label.textContent = "EUR/TL (canlı • " + new Date().toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"}) + ")";
    renderSummary();
  };
  fetch("https://api.exchangerate-api.com/v4/latest/EUR")
    .then(r => r.json())
    .then(d => { if (d.rates && d.rates.TRY > 0) setRate(d.rates.TRY); })
    .catch(() => {
      fetch("https://open.er-api.com/v6/latest/EUR")
        .then(r => r.json())
        .then(d => { if (d.rates && d.rates.TRY > 0) setRate(d.rates.TRY); })
        .catch(() => { if (label) label.textContent = "EUR/TL (manuel)"; });
    });
}

function autoQuantity(item) {
  const total = totalBoilers();
  if (item.mode === "fixed")      return item.qty || 1;
  if (item.mode === "boiler")     return total;
  if (item.mode === "tank")       return hasWaterTank.checked ? Number(waterTankCount.value || 1) : 0;
  if (item.mode === "minusOne")   return Math.max(0, total - 1);
  if (item.mode === "ecaPump100") return Number(state.quantities["DTYECA 8006721000"] || 0) + Number(state.quantities["DTYECA 8006722000"] || 0);
  if (item.mode === "ecaPump150") return Number(state.quantities["DTYECA 8006723000"] || 0);
  return 0;
}

function renderBoilers() {
  const data = brandData();
  boilerList.innerHTML = data.boilers.map((item) => {
    const qty = Number(state.quantities[item.code] || 0);
    return `<label class="quote-item"><span><strong>${item.name}</strong><span>${item.code} · ${fmt(item.cost, item.sym)} maliyet</span></span><input type="number" min="0" value="${qty}" data-code="${item.code}" aria-label="${item.name} adedi" /></label>`;
  }).join("");
  boilerList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (e) => {
      state.quantities[e.target.dataset.code] = Math.max(0, Number(e.target.value || 0));
      renderSummary();
    });
  });
}

function quoteItems() {
  const margin = Number(marginRate.value || 0) / 100;
  const data = brandData();
  const boilerLines = data.boilers.map((item) => ({ ...item, qty: Number(state.quantities[item.code] || 0), type: "Kazan" })).filter((item) => item.qty > 0);
  const accessoryLines = data.accessories.map((item) => ({ ...item, qty: autoQuantity(item), type: "Aksesuar" })).filter((item) => item.qty > 0);
  return [...boilerLines, ...accessoryLines].map((item) => ({
    ...item,
    sale:    item.cost   * (1 + margin),
    saleEUR: toEUR(item) * (1 + margin),
    costEUR: toEUR(item),
  }));
}

// Teklife benzersiz numara üret
function generateTeklifNo() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  return "OFR" + yy + mm + dd + Math.floor(100 + Math.random()*900);
}
const TEKLIF_NO = generateTeklifNo();

function renderSummary() {
  const data  = brandData();
  const rate  = getRate();
  const lines = quoteItems();
  const KDV_ORAN = 0.20;

  // EUR bazlı satış toplamlar
  const topSatEUR = lines.reduce((s, l) => s + l.saleEUR * l.qty, 0);

  // TL karşılıkları
  const toplamTutar = topSatEUR * rate;          // iskontosuz liste fiyatı = satış fiyatı
  const iskonto     = 0;                          // marj zaten maliyet üzerinden, müşteriye iskonto gösterilmiyor
  const netToplam   = toplamTutar - iskonto;
  const kdv         = netToplam * KDV_ORAN;
  const genelToplam = netToplam + kdv;

  // Marka
  document.querySelector("#summaryBrand").textContent    = data.label;
  document.querySelector("#summaryCustomer").textContent = customer.value.trim() || "Müşteri adı girilmedi";
  document.querySelector("#summaryProject").textContent  = project.value.trim()  || "Proje / bina adı girilmedi";

  // Teklif meta
  const teklifNoEl = document.querySelector("#teklifNo");
  const teklifTarihEl = document.querySelector("#teklifTarih");
  const eurKurEl = document.querySelector("#eurKurDisplay");
  if (teklifNoEl) teklifNoEl.textContent = TEKLIF_NO;
  if (teklifTarihEl) teklifTarihEl.textContent = new Date().toLocaleDateString("tr-TR");
  if (eurKurEl) eurKurEl.textContent = fmtEUR.format(rate);

  // Kalem listesi
  if (!lines.length) {
    quoteLines.innerHTML = `<div class="empty-lines">Kazan adedi girildiğinde teklif kalemleri burada oluşur.</div>`;
  } else {
    quoteLines.innerHTML = `
      <table class="proforma-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Rün Adı</th>
            <th>Miktar</th>
            <th>Birim</th>
            <th>Liste Fiyatı</th>
            <th>Ara Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${item.name}</strong><br><small>${item.code}</small></td>
              <td>${item.qty}</td>
              <td>ADET</td>
              <td>${fmt(item.sale, item.sym)}</td>
              <td>${fmt(item.sale * item.qty, item.sym)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  }

  // Proforma toplam satırları
  document.querySelector("#satirToplamTutar").textContent  = fmtTRY.format(toplamTutar);
  document.querySelector("#satirIskonto").textContent      = fmtTRY.format(iskonto);
  document.querySelector("#satirNetToplam").textContent    = fmtTRY.format(netToplam);
  document.querySelector("#satirKDV").textContent          = fmtTRY.format(kdv);
  document.querySelector("#satirGenelToplam").textContent  = fmtTRY.format(genelToplam);
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    state.brand = button.dataset.brand;
    state.quantities = {};
    renderBoilers();
    renderSummary();
  });
});

[eurRate, marginRate, hasWaterTank, waterTankCount, customer, project].forEach((el) => {
  el.addEventListener("input", renderSummary);
  el.addEventListener("change", renderSummary);
});

document.querySelector("#printBtn").addEventListener("click", () => window.print());

fetchTCMBRate();
setInterval(fetchTCMBRate, 30 * 60 * 1000);

renderBoilers();
renderSummary();
