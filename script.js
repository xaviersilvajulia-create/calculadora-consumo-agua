document.addEventListener("DOMContentLoaded", () => {
  const inputs = {
    banhos: document.getElementById("banhos"),
    tempoBanho: document.getElementById("tempoBanho"),
    descargas: document.getElementById("descargas"),
    higiene: document.getElementById("higiene"),
    louca: document.getElementById("louca"),
    maquina: document.getElementById("maquina"),
    mangueira: document.getElementById("mangueira"),
    carne: document.getElementById("carne"),
    roupas: document.getElementById("roupas"),
    desperdicioComida: document.getElementById("desperdicioComida"),
    papel: document.getElementById("papel"),
  };

  const habits = {
    banho: document.getElementById("hab-banho"),
    torneira: document.getElementById("hab-torneira"),
    balde: document.getElementById("hab-balde"),
    carne: document.getElementById("hab-carne"),
  };

  const cenariosDiaZero = {
    escola: { populacao: 800, capacidade: 500000, permiteChuva: false },
    bairro: { populacao: 15000, capacidade: 30000000, permiteChuva: true },
    cidade: { populacao: 250000, capacidade: 600000000, permiteChuva: true },
  };

  let cenarioAtivo = "escola";
  const rainSlider = document.getElementById("dz-rain");

  const presets = {
    economico: { banhos: 1, tempoBanho: 6, descargas: 4, higiene: 2, louca: 5, maquina: 1, mangueira: 0, carne: 2, roupas: 1, desperdicioComida: 0, papel: 5 },
    medio: { banhos: 2, tempoBanho: 10, descargas: 5, higiene: 4, louca: 10, maquina: 2, mangueira: 15, carne: 4, roupas: 2, desperdicioComida: 2, papel: 20 },
    alto: { banhos: 2, tempoBanho: 18, descargas: 7, higiene: 8, louca: 20, maquina: 4, mangueira: 45, carne: 8, roupas: 5, desperdicioComida: 4, papel: 50 },
  };

  function fmt(num, dec = 1) {
    return num.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function atualizarDiaZero(consumoUsuarioDia) {
    const cenario = cenariosDiaZero[cenarioAtivo];
    const taxaChuva = cenario.permiteChuva ? Number(rainSlider.value) / 100 : 0;
    const rainLabel = document.getElementById("val-dz-rain");

    if (!cenario.permiteChuva) {
      rainSlider.disabled = true;
      rainLabel.textContent = "0% (Caixa Fechada)";
    } else {
      rainSlider.disabled = false;
      const pct = Number(rainSlider.value);
      const desc = pct === 0 ? "Estiagem Severa" : pct <= 20 ? "Chuvas Irregulares" : "Chuva Regular";
      rainLabel.textContent = `${pct}% (${desc})`;
    }

    const volumeUtil = cenario.capacidade * 0.9;
    const consumoColetivoDia = Math.max(1, consumoUsuarioDia * cenario.populacao);
    const reposicaoDiaria = 110 * cenario.populacao * (taxaChuva * 2.5);
    const saldoLiquido = consumoColetivoDia - reposicaoDiaria;

    const consumoReduzido = consumoColetivoDia * 0.75;
    const saldoReduzido = consumoReduzido - reposicaoDiaria;

    document.getElementById("dz-collective-flow").textContent =
      `Demanda coletiva: ${Math.round(consumoColetivoDia).toLocaleString("pt-BR")} litros/dia`;

    const waterFill = document.getElementById("dz-water-fill");
    const tankPct = document.getElementById("dz-tank-pct");
    const tankLabel = document.getElementById("dz-tank-label");
    const statusStrip = document.getElementById("dz-status-strip");
    const statusText = document.getElementById("dz-status-text");
    const daysCount = document.getElementById("dz-days-count");
    const collapseDate = document.getElementById("dz-collapse-date");
    const savedDays = document.getElementById("dz-saved-days");

    if (saldoLiquido <= 0) {
      waterFill.style.height = "88%";
      waterFill.className = "tank-water healthy";
      tankPct.textContent = "ESTÁVEL";
      tankLabel.textContent = "EQUILÍBRIO HÍDRICO";
      statusStrip.className = "dz-status-strip green";
      statusText.textContent = "EQUILÍBRIO ALCANÇADO — COLAPSO EVITADO";
      daysCount.textContent = "SUSTENTÁVEL";
      collapseDate.textContent = "Sem risco de seca";
      savedDays.textContent = "Reserva natural em recuperação";
    } else {
      const dias = Math.max(1, Math.floor(volumeUtil / saldoLiquido));
      const dataAlvo = new Date();
      dataAlvo.setDate(dataAlvo.getDate() + dias);

      let ganhoTexto = "";
      if (saldoReduzido <= 0) {
        ganhoTexto = "Evitaria completamente o Dia Zero!";
      } else {
        const diasNovos = Math.floor(volumeUtil / saldoReduzido);
        const diferenca = Math.max(0, diasNovos - dias);
        ganhoTexto = `+${diferenca.toLocaleString("pt-BR")} dias ganhos de abastecimento`;
      }

      const nivel = Math.min(84, Math.max(12, (dias / 180) * 84));
      waterFill.style.height = `${nivel}%`;
      tankPct.textContent = `${Math.round(nivel)}%`;

      if (dias <= 60) {
        waterFill.className = "tank-water low";
        tankLabel.textContent = "RESERVA EM QUEDA RÁPIDA";
        statusStrip.className = "dz-status-strip";
        statusText.textContent = "ALERTA DE ESCASSEZ — REDUZA O CONSUMO";
      } else {
        waterFill.className = "tank-water";
        tankLabel.textContent = "NÍVEL MONITORADO";
        statusStrip.className = "dz-status-strip";
        statusText.textContent = "CONTAGEM REGRESSIVA EM ANDAMENTO";
      }

      daysCount.textContent = `${dias.toLocaleString("pt-BR")} DIAS`;
      collapseDate.textContent = dataAlvo.toLocaleDateString("pt-BR");
      savedDays.textContent = ganhoTexto;
    }
  }

  function atualizarTudo() {
    const v = {};
    Object.keys(inputs).forEach((k) => {
      v[k] = Number(inputs[k].value);
    });

    // Labels dos controles diretos
    document.getElementById("val-banhos").textContent = `${v.banhos} ${v.banhos === 1 ? "banho" : "banhos"}`;
    document.getElementById("val-tempoBanho").textContent = `${v.tempoBanho} min`;
    document.getElementById("val-descargas").textContent = `${v.descargas} ${v.descargas === 1 ? "vez" : "vezes"}`;
    document.getElementById("val-higiene").textContent = `${v.higiene} min/dia`;
    document.getElementById("val-louca").textContent = `${v.louca} min/dia`;
    document.getElementById("val-maquina").textContent = `${v.maquina} ${v.maquina === 1 ? "vez/sem" : "vezes/sem"}`;
    document.getElementById("val-mangueira").textContent = `${v.mangueira} min/sem`;

    // Labels dos controles invisíveis
    document.getElementById("val-carne").textContent = `${v.carne} porções/sem`;
    document.getElementById("val-roupas").textContent = `${v.roupas} peças/mês`;
    document.getElementById("val-desperdicioComida").textContent = `${v.desperdicioComida} pratos/sem`;
    document.getElementById("val-papel").textContent = `${v.papel} folhas/sem`;

    // Uso direto
    const atividades = [
      { nome: "Banho", litros: v.banhos * v.tempoBanho * 9 },
      { nome: "Descarga sanitária", litros: v.descargas * 10 },
      { nome: "Lavar louça", litros: v.louca * 8 },
      { nome: "Máquina de lavar", litros: (v.maquina * 135) / 7 },
      { nome: "Uso de mangueira", litros: (v.mangueira * 18) / 7 },
      { nome: "Torneira (dentes/mãos)", litros: v.higiene * 6 },
    ];

    const diretoDia = atividades.reduce((acc, item) => acc + item.litros, 0);
    const diretoMes = diretoDia * 30;
    const diretoAno = diretoDia * 365;
    const caixasAno = diretoAno / 1000;

    // KPIs e Hero
    document.getElementById("hero-user-liters").textContent = `${fmt(diretoDia, 0)} L/dia`;
    const heroPill = document.getElementById("hero-status-pill");
    if (diretoDia <= 110) {
      heroPill.textContent = "Dentro da Meta ONU";
      heroPill.className = "status-pill";
    } else {
      heroPill.textContent = `+${fmt(diretoDia - 110, 0)} L acima da meta`;
      heroPill.className = "status-pill alert";
    }

    document.getElementById("kpi-diario").textContent = `${fmt(diretoDia, 0)} L`;
    document.getElementById("kpi-mensal").textContent = `${fmt(diretoMes, 0)} L`;
    document.getElementById("kpi-m3").textContent = `${fmt(diretoMes / 1000, 2)} m³/mês`;
    document.getElementById("kpi-anual").textContent = `${fmt(diretoAno / 1000, 1)} mil L`;
    document.getElementById("kpi-caixas").textContent = `${fmt(caixasAno, 1)} caixas de 1.000L`;

    // Barras de distribuição
    const ordenadas = [...atividades].sort((a, b) => b.litros - a.litros);
    const vilao = ordenadas[0];
    document.getElementById("maior-vilao-tag").textContent =
      vilao.litros > 0 ? `Maior gasto: ${vilao.nome}` : "Sem consumo registrado";

    const barsContainer = document.getElementById("breakdown-bars");
    barsContainer.innerHTML = "";
    ordenadas.forEach((item) => {
      const perc = diretoDia > 0 ? (item.litros / diretoDia) * 100 : 0;
      const div = document.createElement("div");
      div.innerHTML = `
        <div class="bar-row-top">
          <span>${item.nome}</span>
          <span>${fmt(item.litros, 1)} L (${fmt(perc, 0)}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${perc}%"></div>
        </div>
      `;
      barsContainer.appendChild(div);
    });

    // Consequências humanas e financeiras
    const excedente = Math.max(0, diretoDia - 110);
    const pessoas = Math.floor(excedente / 50);
    document.getElementById("imp-pessoas").textContent =
      pessoas > 0 ? `${pessoas} ${pessoas === 1 ? "pessoa/dia" : "pessoas/dia"}` : "Meta sustentável atingida";

    const custoAno = caixasAno * 8.5;
    document.getElementById("imp-custo").textContent = `R$ ${fmt(custoAno, 2)} / ano`;
    document.getElementById("imp-custo-5anos").textContent =
      `Projeção de R$ ${fmt(custoAno * 5, 2)} acumulados na conta ao longo de 5 anos.`;

    // Água Invisível
    const invDia =
      (v.carne * 1540) / 7 +
      (v.roupas * 2700) / 30 +
      (v.desperdicioComida * 1000) / 7 +
      (v.papel * 10) / 7;

    const totalGeral = diretoDia + invDia;
    document.getElementById("inv-total-geral").textContent = `${fmt(totalGeral, 0)} L / dia`;
    document.getElementById("inv-apenas-oculta").textContent = `${fmt(invDia, 0)} L/dia`;
    const prop = diretoDia > 0 ? (invDia / diretoDia).toFixed(1) : "0";
    document.getElementById("inv-proporcao").textContent = `${prop}x`;

    // Antes vs. Depois
    const novoTempoBanho = habits.banho.checked && v.tempoBanho > 6 ? 6 : v.tempoBanho;
    const novaHigiene = habits.torneira.checked ? v.higiene * 0.4 : v.higiene;
    const novaLouca = habits.torneira.checked ? v.louca * 0.4 : v.louca;
    const novaMangueira = habits.balde.checked ? v.mangueira * 0.15 : v.mangueira;
    const ecoInvDia = habits.carne.checked ? (Math.min(v.carne, 2) * 1540) / 7 : 0;

    const novoDiretoDia =
      v.banhos * novoTempoBanho * 9 +
      v.descargas * 10 +
      novaLouca * 8 +
      (v.maquina * 135) / 7 +
      (novaMangueira * 18) / 7 +
      novaHigiene * 6;

    const novoDiretoAno = novoDiretoDia * 365;
    const ecoDiretaAno = Math.max(0, diretoAno - novoDiretoAno);
    const ecoTotalAno = ecoDiretaAno + ecoInvDia * 365;
    const reaisSalvos = (ecoDiretaAno / 1000) * 8.5;

    document.getElementById("ba-antes").textContent = `${fmt(diretoAno, 0)} L/ano`;
    document.getElementById("ba-depois").textContent = `${fmt(novoDiretoAno, 0)} L/ano`;
    document.getElementById("ba-economia-total").textContent =
      `${fmt(ecoTotalAno, 0)} litros/ano (R$ ${fmt(reaisSalvos, 2)})`;

    window.ultimaEconomiaAnual = fmt(ecoTotalAno, 0);

    // Atualiza Simulador Dia Zero
    atualizarDiaZero(diretoDia);
  }

  // Listeners dos sliders e checkboxes
  Object.values(inputs).forEach((el) => el.addEventListener("input", atualizarTudo));
  Object.values(habits).forEach((el) => el.addEventListener("change", atualizarTudo));
  rainSlider.addEventListener("input", atualizarTudo);

  // Botões de perfil rápido
  document.querySelectorAll(".btn-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const p = presets[btn.dataset.preset];
      Object.keys(p).forEach((k) => {
        inputs[k].value = p[k];
      });
      atualizarTudo();
    });
  });

  // Abas do Dia Zero
  document.querySelectorAll(".dz-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".dz-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      cenarioAtivo = tab.dataset.scenario;
      atualizarTudo();
    });
  });

  // Certificado de Compromisso
  document.getElementById("btn-generate-pact").addEventListener("click", () => {
    const nome = document.getElementById("pact-name").value.trim() || "Estudante Consciente";
    const meta = document.getElementById("pact-goal").value;
    const eco = window.ultimaEconomiaAnual || "0";

    const frase = `Eu, ${nome}, assumi o compromisso AquaImpacto: "${meta}", economizando cerca de ${eco} litros de água por ano!`;
    const certCard = document.getElementById("pact-certificate");
    document.getElementById("cert-text").textContent = frase;
    certCard.classList.remove("hidden");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${frase} Simule seu consumo também: ${window.location.href}`).then(() => {
        document.getElementById("cert-feedback").textContent =
          "Compromisso copiado! Cole no WhatsApp da sua turma ou família.";
      });
    }
  });

  // Copiar código Python
  const btnCopyPy = document.getElementById("btn-copy-code");
  btnCopyPy.addEventListener("click", () => {
    const code = document.getElementById("python-source").textContent;
    navigator.clipboard.writeText(code).then(() => {
      btnCopyPy.textContent = "Código Python Copiado!";
      setTimeout(() => {
        btnCopyPy.textContent = "Copiar Código Python";
      }, 2500);
    });
  });

  atualizarTudo();
});