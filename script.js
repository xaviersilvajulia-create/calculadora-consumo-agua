// =========================================================
  // LÓGICA DO SIMULADOR DE DIA ZERO
  // =========================================================
  const cenariosDiaZero = {
    escola: { nome: "Nossa Escola", populacao: 800, capacidade: 500000, permiteChuva: false },
    bairro: { nome: "Bairro Residencial", populacao: 15000, capacidade: 30000000, permiteChuva: true },
    cidade: { nome: "Cidade Média", populacao: 250000, capacidade: 600000000, permiteChuva: true },
  };

  let cenarioAtivo = "escola";
  const rainSlider = document.getElementById("dz-rain");

  function atualizarDiaZero(consumoUsuarioDia) {
    if (!rainSlider) return;

    const cenario = cenariosDiaZero[cenarioAtivo];
    let taxaChuva = cenario.permiteChuva ? Number(rainSlider.value) / 100 : 0;

    // Atualiza label da estiagem
    const rainLabel = document.getElementById("val-dz-rain");
    if (!cenario.permiteChuva) {
      rainSlider.disabled = true;
      rainLabel.textContent = "0% (Caixa Fechada)";
    } else {
      rainSlider.disabled = false;
      const pct = Number(rainSlider.value);
      const desc = pct === 0 ? "Seca Severa" : pct <= 20 ? "Chuvas Irregulares" : "Chuva Moderada";
      rainLabel.textContent = `${pct}% (${desc})`;
    }

    // Volume útil antes do volume morto (90% da capacidade total)
    const volumeUtil = cenario.capacidade * 0.9;
    const consumoColetivoDia = Math.max(1, consumoUsuarioDia * cenario.populacao);

    // Reposição diária baseada na meta sustentável (110 L/dia por pessoa * taxa de chuva)
    const metaSustentavelColetiva = 110 * cenario.populacao;
    const reposicaoDiaria = metaSustentavelColetiva * (taxaChuva * 2.5);

    const saldoLiquidoDia = consumoColetivoDia - reposicaoDiaria;

    // Cenário com redução de 25% no consumo
    const consumoReduzidoDia = consumoColetivoDia * 0.75;
    const saldoReduzidoDia = consumoReduzidoDia - reposicaoDiaria;

    document.getElementById("dz-collective-use").textContent =
      `Consumo coletivo: ${Math.round(consumoColetivoDia).toLocaleString("pt-BR")} litros/dia`;

    const waterEl = document.getElementById("dz-water-level");
    const tankPercentEl = document.getElementById("dz-tank-percent");
    const tankStatusEl = document.getElementById("dz-tank-status");
    const alertBanner = document.getElementById("dz-alert-banner");
    const alertTitle = document.getElementById("dz-alert-title");
    const daysLeftEl = document.getElementById("dz-days-left");
    const targetDateEl = document.getElementById("dz-target-date");
    const compNowEl = document.getElementById("dz-comp-now");
    const compBetterEl = document.getElementById("dz-comp-better");

    if (saldoLiquidoDia <= 0) {
      // Equilíbrio hídrico alcançado
      waterEl.style.height = "88%";
      waterEl.className = "reservoir-water safe";
      tankPercentEl.textContent = "ESTÁVEL";
      tankStatusEl.textContent = "REPOSIÇÃO EQUILIBRADA";
      alertBanner.className = "dz-alert-header safe";
      alertTitle.textContent = "EQUILÍBRIO HÍDRICO — COLAPSO EVITADO!";
      daysLeftEl.textContent = "∞ SUSTENTÁVEL";
      daysLeftEl.className = "dz-days-number safe";
      targetDateEl.textContent = "Sem risco de seca";
      compNowEl.textContent = "Equilíbrio estável";
      compBetterEl.textContent = "Reserva em alta";
    } else {
      const diasRestantes = Math.max(1, Math.floor(volumeUtil / saldoLiquidoDia));
      const dataColapso = new Date();
      dataColapso.setDate(dataColapso.getDate() + diasRestantes);

      // Cálculo comparativo (-25% de consumo)
      let textoGanho = "";
      if (saldoReduzidoDia <= 0) {
        textoGanho = "Evitaria o Dia Zero!";
      } else {
        const diasComReducao = Math.floor(volumeUtil / saldoReduzidoDia);
        const ganho = Math.max(0, diasComReducao - diasRestantes);
        textoGanho = `+${ganho.toLocaleString("pt-BR")} dias ganhos`;
      }

      // Nível visual proporcional ao risco (quanto menos dias, mais vazio o tanque)
      const nivelVisual = Math.min(85, Math.max(12, (diasRestantes / 180) * 85));
      waterEl.style.height = `${nivelVisual}%`;
      tankPercentEl.textContent = `${Math.round(nivelVisual)}%`;

      if (diasRestantes <= 45) {
        waterEl.className = "reservoir-water critical";
        tankStatusEl.textContent = "EMERGÊNCIA CRÍTICA";
        alertBanner.className = "dz-alert-header";
        alertTitle.textContent = "ALERTA MÁXIMO: COLAPSO IMINENTE";
      } else if (diasRestantes <= 120) {
        waterEl.className = "reservoir-water warning";
        tankStatusEl.textContent = "NÍVEL DE ATENÇÃO";
        alertBanner.className = "dz-alert-header";
        alertTitle.textContent = "ALERTA DE ESCASSEZ SEVERA";
      } else {
        waterEl.className = "reservoir-water";
        tankStatusEl.textContent = "REBAIXAMENTO GRADUAL";
        alertBanner.className = "dz-alert-header";
        alertTitle.textContent = "MONITORAMENTO DE ESTIAGEM";
      }

      daysLeftEl.textContent = `${diasRestantes.toLocaleString("pt-BR")} DIAS`;
      daysLeftEl.className = "dz-days-number";
      targetDateEl.textContent = dataColapso.toLocaleDateString("pt-BR");
      compNowEl.textContent = `${diasRestantes.toLocaleString("pt-BR")} dias`;
      compBetterEl.textContent = textoGanho;
    }
  }

  document.querySelectorAll(".dz-scenario-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dz-scenario-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cenarioAtivo = btn.dataset.scenario;
      atualizarTudo();
    });
  });

  if (rainSlider) {
    rainSlider.addEventListener("input", atualizarTudo);
  }