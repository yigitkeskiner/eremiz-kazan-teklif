const DATA = {
  ECA: {
    label: "E.C.A",
    boilers: [
      { code: "DTYECA 8006720000", name: "Felis FL 65", cost: 850.57 },
      { code: "DTYECA 8006721000", name: "Felis FL 100", cost: 1123.5 },
      { code: "DTYECA 8006722000", name: "Felis FL 125", cost: 1260.52 },
      { code: "DTYECA 8006723000", name: "Felis FL 150", cost: 1616.75 },
    ],
    accessories: [
      { code: "DTYECAAKS 7006721314", name: "Ekranlı Kaskad Kontrol Panel Grubu", cost: 101.01, mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721570", name: "Kaskad Kontrol Modül Kartı", cost: 42.53, mode: "boiler" },
      { code: "DTYECAAKS 7006721429", name: "Dış Hava Sensörü", cost: 13.29, mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721438", name: "Kaskad Sıcaklık Sensörü", cost: 18.61, mode: "fixed", qty: 1 },
      { code: "DTYECAAKS 7006721432", name: "Boyler Sıcaklık Sensörü", cost: 10.63, mode: "tank" },
      { code: "DTYECAAKS 7006721891", name: "Primer Devre Sirkülasyon Pompası 100-125 kW", cost: 180.75, mode: "ecaPump100" },
      { code: "DTYECAAKS 7006721892", name: "Primer Devre Sirkülasyon Pompası 150 kW", cost: 212.64, mode: "ecaPump150" },
    ],
  },
  BAYMAK: {
    label: "Baymak",
    boilers: [
      { code: "DTYBAY 10090901", name: "Baymak Lectus 65 kW %108", cost: 1277 * 0.81 },
      { code: "DTYBAY 10090902", name: "Baymak Lectus 90 kW %108", cost: 1410 * 0.81 },
      { code: "DTYBAY 10090903", name: "Baymak Lectus 115 kW %108", cost: 1581 * 0.81 },
    ],
    accessories: [
      { code: "DTYBAYAKS 60218227", name: "Kaskad Pompa EVop OEM 100/180-32", cost: 347 * 0.81, mode: "boiler" },
      { code: "DTYBAYAKS 09120032", name: "RVS 283 Kaskad Kontrol Paneli", cost: 14833 * 0.81 / 42, mode: "fixed", qty: 1 },
      { code: "DTYBAYAKS 16910171", name: "OCI365.03 OT/LPB Çevirici Ara Bağlantı Kartı", cost: 57 * 0.81, mode: "boiler" },
      { code: "DTYBAYAKS 16900077", name: "QAD36/101 Isıtma Suyu Gidiş Sensörü", cost: 15 * 0.81, mode: "fixed", qty: 2 },
      { code: "DTYBAYAKS 16900066", name: "QAC34 Dış Hava Sensörü", cost: 11 * 0.81, mode: "fixed", qty: 1 },
      { code: "DTYBAYAKS 16910072", name: "QAZ36.522/109 Boyler Sıcak Su Sensörü", cost: 7 * 0.81, mode: "tank" },
    ],
  },
  VAILLANT: {
    label: "Vaillant",
    boilers: [
      { code: "ECOT FIT PLUS 100", name: "ecoTEC fit Plus 100 kW", cost: 2233 * 0.77 },
      { code: "ECPFTIS PLUS 150", name: "ecoTEC fit Plus 150 kW", cost: 2344 * 0.77 },
    ],
    accessories: [
      { code: "UPML XL 32-125", name: "UPML XL 32-125 Pompa", cost: 257 * 0.77, mode: "boiler" },
      { code: "VRC720", name: "VRC720 Kontrol Cihazı", cost: 165 * 0.77, mode: "fixed", qty: 1 },
      { code: "VR71", name: "VR71 Sensör Modülü", cost: 222 * 0.77, mode: "fixed", qty: 1 },
      { code: "VR32", name: "VR32 Uzaktan Kontrol", cost: 45 * 0.77, mode: "minusOne" },
    ],
  },
};

const state = {
  brand: "ECA",
  quantities: {},
};

const formatterEUR = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const formatterTRY = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

const boilerList = document.querySelector("#boilerList");
const quoteLines = document.querySelector("#quoteLines");
const eurRate = document.querySelector("#eurRate");
const marginRate = document.querySelector("#marginRate");
const hasWaterTank = document.querySelector("#hasWaterTank");
const waterTankCount = document.querySelector("#waterTankCount");
const customer = document.querySelector("#customer");
const project = document.querySelector("#project");

function brandData() {
  return DATA[state.brand];
}

function totalBoilers() {
  return Object.values(state.quantities).reduce((sum, qty) => sum + Number(qty || 0), 0);
}

function autoQuantity(item) {
  const total = totalBoilers();
  if (item.mode === "fixed") return item.qty || 1;
  if (item.mode === "boiler") return total;
  if (item.mode === "tank") return hasWaterTank.checked ? Number(waterTankCount.value || 1) : 0;
  if (item.mode === "minusOne") return Math.max(0, total - 1);
  if (item.mode === "ecaPump100") {
    return Number(state.quantities["DTYECA 8006721000"] || 0) + Number(state.quantities["DTYECA 8006722000"] || 0);
  }
  if (item.mode === "ecaPump150") return Number(state.quantities["DTYECA 8006723000"] || 0);
  return 0;
}

function renderBoilers() {
  const data = brandData();
  boilerList.innerHTML = data.boilers
    .map((item) => {
      const qty = Number(state.quantities[item.code] || 0);
      return `
        <label class="quote-item">
          <span>
            <strong>${item.name}</strong>
            <span>${item.code} · ${formatterEUR.format(item.cost)} maliyet</span>
          </span>
          <input type="number" min="0" value="${qty}" data-code="${item.code}" aria-label="${item.name} adedi" />
        </label>
      `;
    })
    .join("");

  boilerList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      state.quantities[event.target.dataset.code] = Math.max(0, Number(event.target.value || 0));
      renderSummary();
    });
  });
}

function quoteItems() {
  const margin = Number(marginRate.value || 0) / 100;
  const data = brandData();
  const boilerLines = data.boilers
    .map((item) => ({ ...item, qty: Number(state.quantities[item.code] || 0), type: "Kazan" }))
    .filter((item) => item.qty > 0);

  const accessoryLines = data.accessories
    .map((item) => ({ ...item, qty: autoQuantity(item), type: "Aksesuar" }))
    .filter((item) => item.qty > 0);

  return [...boilerLines, ...accessoryLines].map((item) => ({
    ...item,
    sale: item.cost * (1 + margin),
  }));
}

function renderSummary() {
  const data = brandData();
  const rate = Number(eurRate.value || 0);
  const lines = quoteItems();
  const salesEUR = lines.reduce((sum, item) => sum + item.sale * item.qty, 0);
  const costEUR = lines.reduce((sum, item) => sum + item.cost * item.qty, 0);

  document.querySelector("#summaryBrand").textContent = data.label;
  document.querySelector("#summaryCustomer").textContent = customer.value.trim() || "Müşteri adı girilmedi";
  document.querySelector("#summaryProject").textContent = project.value.trim() || "Proje adı girilmedi";
  document.querySelector("#salesTotal").textContent = formatterEUR.format(salesEUR);
  document.querySelector("#tryTotal").textContent = formatterTRY.format(salesEUR * rate);
  document.querySelector("#profitTotal").textContent = formatterTRY.format((salesEUR - costEUR) * rate);

  if (!lines.length) {
    quoteLines.innerHTML = `<div class="empty-lines">Kazan adedi girildiğinde teklif kalemleri burada oluşur.</div>`;
    return;
  }

  quoteLines.innerHTML = lines
    .map(
      (item) => `
        <div class="line-row">
          <div>
            <strong>${item.name}</strong>
            <span>${item.type} · ${item.code} · ${item.qty} adet</span>
          </div>
          <em>${formatterEUR.format(item.sale * item.qty)}</em>
        </div>
      `
    )
    .join("");
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.brand = button.dataset.brand;
    state.quantities = {};
    renderBoilers();
    renderSummary();
  });
});

[eurRate, marginRate, hasWaterTank, waterTankCount, customer, project].forEach((element) => {
  element.addEventListener("input", renderSummary);
  element.addEventListener("change", renderSummary);
});

document.querySelector("#printBtn").addEventListener("click", () => window.print());

renderBoilers();
renderSummary();
