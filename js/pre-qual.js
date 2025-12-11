document.addEventListener("DOMContentLoaded", () => {

  /* ==========================
     STEP MANAGEMENT
  ========================== */
  const steps = Array.from(document.querySelectorAll(".step"));
  let currentIndex = 0;

  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

  function formatCurrency(value) {
    const num = Number(value || 0);
    return "$" + formatter.format(num);
  }

  function goToStep(id) {
    const target = document.getElementById(id);
    if (!target) return;

    steps.forEach(step => step.classList.remove("active"));
    target.classList.add("active");

    currentIndex = steps.indexOf(target);

    updateSidebar();
    updateProgress();
  }

  document.querySelectorAll(".btn-next").forEach(btn => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.next;
      if (next === "complete") {
        window.location.href = "complete/index.html";
        return;
      }
      goToStep(next);
    });
  });

  document.querySelectorAll(".btn-prev").forEach(btn => {
    btn.addEventListener("click", () => {
      const prev = btn.dataset.prev;
      if (prev) goToStep(prev);
    });
  });

  /* ==========================
     SIDEBAR HIGHLIGHTING
  ========================== */
  function updateSidebar() {
    const activeSection = steps[currentIndex].dataset.section;

    document.querySelectorAll(".section-item").forEach(item => {
      item.classList.toggle("active", item.dataset.section === activeSection);
    });
  }

  /* ==========================
     PROGRESS DIAL
  ========================== */
  const totalSteps = steps.length;
  const dial = document.querySelector(".dial-progress");
  const label = document.getElementById("progress-label");
  const circumference = 339;

  function updateProgress() {
    const pct = Math.round(((currentIndex + 1) / totalSteps) * 100);
    const offset = circumference - (pct / 100) * circumference;

    dial.style.strokeDashoffset = offset;
    label.textContent = `${pct}% Complete`;
  }

  updateProgress();

  /* ==========================
     SUMMARY UPDATES
  ========================== */
  function setSummary(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function mapRadioGroup(name, summaryId) {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(r => {
      r.addEventListener("change", () => {
        const chosen = Array.from(radios).find(x => x.checked);
        setSummary(summaryId, chosen ? chosen.value : "—");
      });
    });
  }

  /* Map radios */
  mapRadioGroup("loan-purpose", "summary-loan-purpose");
  mapRadioGroup("credit-score", "summary-credit-score");
  mapRadioGroup("employment-structure", "summary-employment");

  /* ==========================
     LOAN AMOUNT (URL Prefill)
  ========================== */
  const loanAmountInput = document.getElementById("loan-amount-input");
  const amountParam = new URLSearchParams(window.location.search).get("amount");

  if (amountParam && loanAmountInput) {
    const clean = amountParam.replace(/[^\d]/g, "");
    loanAmountInput.value = formatter.format(clean);
    setSummary("summary-loan-amount", formatCurrency(clean));
  }

  if (loanAmountInput) {
    loanAmountInput.addEventListener("input", () => {
      let raw = loanAmountInput.value.replace(/[^\d]/g, "");
      if (!raw) {
        loanAmountInput.value = "";
        setSummary("summary-loan-amount", "—");
        return;
      }
      loanAmountInput.value = formatter.format(raw);
      setSummary("summary-loan-amount", formatCurrency(raw));
    });
  }

  /* ==========================
     SLIDERS (Income & Debt)
  ========================== */
  const incomeSlider = document.getElementById("income-input");
  const incomeDisplay = document.getElementById("income-display");

  if (incomeSlider && incomeDisplay) {
    const updateIncome = () => {
      const val = Number(incomeSlider.value);
      const text = val >= 100000 ? "$100K+" : formatCurrency(val);
      incomeDisplay.textContent = text;
      setSummary("summary-income", text);
    };
    incomeSlider.addEventListener("input", updateIncome);
    updateIncome();
  }

  const debtSlider = document.getElementById("debt-input");
  const debtDisplay = document.getElementById("debt-display");

  if (debtSlider && debtDisplay) {
    const updateDebt = () => {
      const val = Number(debtSlider.value);
      const text = val >= 50000 ? "$50K+" : formatCurrency(val);
      debtDisplay.textContent = text;
      setSummary("summary-debt", text);
    };
    debtSlider.addEventListener("input", updateDebt);
    updateDebt();
  }

  /* ==========================
     INSURANCE CHECKBOXES
  ========================== */
  const insuranceGroup = document.getElementById("insurance-group");

  if (insuranceGroup) {
    insuranceGroup.addEventListener("change", () => {
      const selected = Array.from(
        insuranceGroup.querySelectorAll('input[type="checkbox"]:checked')
      ).map(c => c.value);

      setSummary("summary-insurance", selected.join(", ") || "—");
    });
  }

});

