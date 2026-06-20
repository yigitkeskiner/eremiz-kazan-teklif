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
      { code: "DTYECAAKS 7006721570", name: "Kaskad Kontrol Modül Kartı", cost: 42.53, sym: "€", mode: "boiler" },
      { code: "DTYECAAKS 7006721429", name: "Dış Hava Sensörü", cost: 13.29, sym: "€", mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721438", name: "Kaskad Sıcaklık Sensörü", cost: 18.61, sym: "€", mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721432", name: "Boyler Sıcaklık Sensörü", cost: 10.63, sym: "€", mode: "tank" },
      { code: "DTYECAAKS 7006721891", name: "Primer Devre Sirk. Pompası 100-125 kW", cost: 180.75, sym: "€", mode: "ecaPump100" },
      { code: "DTYECAAKS 7006721892", name: "Primer Devre Sirk. Pompası 150 kW", cost: 212.64, sym: "€", mode: "ecaPump150" },
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
      { code: "DTYBAYAKS 60218227", name: "Kaskad Pompa EVop OEM 100/180-32", cost: 347 * 0.81, sym: "€", mode: "boiler" },
      { code: "DTYBAYAKS 09120032", name: "RVS 283 Kaskad Kontrol Paneli", cost: 14833 * 0.81, sym: "₺", mode: "fixed", qty: 1 },
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
      { code: "UPML XL 32-125", name: "UPML XL 32-125 Pompa", cost: 257 * 0.77, sym: "€", mode: "boiler" },
      { code: "VRC720", name: "VRC720 Kontrol Cihazı", cost: 165 * 0.77, sym: "€", mode: "fixed", qty: 1 },
      { code: "VR71", name: "VR71 Sensör Modülü", cost: 222 * 0.77, sym: "€", mode: "fixed", qty: 1 },
      { code: "VR32", name: "VR32 Uzaktan Kontrol", cost: 45 * 0.77, sym: "€", mode: "minusOne" },
    ],
  },
};

const state = { brand: "ECA", quantities: {} };
const fmtEUR = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTRY = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

function fmt(value, sym) { return sym === "₺" ? fmtTRY.format(value) : "€ " + fmtEUR.format(value); }
function toEUR(item) { return item.sym === "₺" ? item.cost / getRate() : item.cost; }

const boilerList = document.querySelector("#boilerList");
const quoteLines = document.querySelector("#quoteLines");
const eurRate = document.querySelector("#eurRate");
const marginRate = document.querySelector("#marginRate");
const hasWaterTank = document.querySelector("#hasWaterTank");
const waterTankCount = document.querySelector("#waterTankCount");
const customer = document.querySelector("#customer");
const project = document.querySelector("#project");

function brandData() { return DATA[state.brand]; }
function getRate() { return Number(eurRate.value || 42); }
function totalBoilers() { return Object.values(state.quantities).reduce((s, v) => s + Number(v || 0), 0); }

function autoQuantity(item) {
  const total = totalBoilers();
  if (item.mode === "fixed") return item.qty || 1;
  if (item.mode === "boiler") return total;
  if (item.mode === "tank") return hasWaterTank.checked ? Number(waterTankCount.value || 1) : 0;
  if (item.mode === "minusOne") return Math.max(0, total - 1);
  if (item.mode === "ecaPump100") return Number(state.quantities["DTYECA 8006721000"] || 0) + Number(state.quantities["DTYECA 8006722000"] || 0);
  if (item.mode === "ecaPump150") return Number(state.quantities["DTYECA 8006723000"] || 0);
  return 0;
}

function renderBoilers() {
  const data = brandData();
  boilerList.innerHTML = data.boilers.map((item) => {
    const qty = Number(state.quantities[item.code] || 0);
    return '<label class="quote-item"><span><strong>' + item.name + '</strong><span>' + item.code + ' · ' + fmt(item.cost, item.sym) + ' maliyet</span></span><input type="number" min="0" value="' + qty + '" data-code="' + item.code + '" /></label>';
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
  return [...boilerLines, ...accessoryLines].map((item) => ({ ...item, sale: item.cost * (1 + margin), saleEUR: toEUR(item) * (1 + margin), costEUR: toEUR(item) }));
}

function renderSummary() {
  const data = brandData();
  const rate = getRate();
  const lines = quoteItems();
  const totalSaleEUR = lines.reduce((s, l) => s + l.saleEUR * l.qty, 0);
  const totalCostEUR = lines.reduce((s, l) => s + l.costEUR * l.qty, 0);
  const profitTRY = (totalSaleEUR - totalCostEUR) * rate;
  document.querySelector("#summaryBrand").textContent = data.label;
  document.querySelector("#summaryCustomer").textContent = customer.value.trim() || "Müşteri adı girilmedi";
  document.querySelector("#summaryProject").textContent = project.value.trim() || "Proje adı girilmedi";
  document.querySelector("#salesTotal").textContent = "€ " + fmtEUR.format(totalSaleEUR);
  document.querySelector("#tryTotal").textContent = fmtTRY.format(totalSaleEUR * rate);
  document.querySelector("#profitTotal").textContent = fmtTRY.format(profitTRY);
  if (!lines.length) { quoteLines.innerHTML = '<div class="empty-lines">Kazan adedi girildiğinde teklif kalemleri burada oluşur.</div>'; return; }
  quoteLines.innerHTML = lines.map((item) => '<div class="line-row"><div><strong>' + item.name + '</strong><span>' + item.type + ' · ' + item.code + ' · ' + item.qty + ' adet</span></div><em>' + fmt(item.sale * item.qty, item.sym) + '</em></div>').join("");
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
renderBoilers();
renderSummary();
