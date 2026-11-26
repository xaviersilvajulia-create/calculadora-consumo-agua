document.addEventListener("DOMContentLoaded", () => {
  const inputs = {
    banhos: document.getElementById("banhos"),
    tempoBanho: document.getElementById("tempoBanho"),
    descargas: document.getElementById("descargas"),
    higiene: document.getElementById("higiene"),
    louca: document.getElementById("louca"),
    maquina: document.getElementById("maquina"),
    mangueira: document.getElementById("mangueira"),
  };

  const cenariosDiaZero = {
    escola: { populacao: 800, capacidade: 500000, permiteChuva: false },
    bairro: { populacao: 15000, capacidade: 30000000, permiteChuva: true },
    cidade: { populacao: 250000, capacidade: 600000000, permiteChuva: true },
  };

  let cenarioAtivo = "escola";
  const rainSlider = document.getElementById("dz-rain");

  const presets = {
    economico: { banhos: 1, tempoBanho: 6, descargas: 4, higiene: 2, louca: 5, maquina: 1, mangueira: 0 },
    medio: { banhos: 2, tempoBanho: 10, descargas: 5, higiene: 4, louca: 10, maquina: 2, mangueira: 15 },
    alto: { banhos: 2, tempoBanho: 18, descargas: 7, higiene: 8, louca: 20, maquina: 4, mangueira: 45 },
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
      const desc = pct === 0 ? "Seca Severa" : pct <= 20 ? "Chuvas Irregulares" : "Chuva Regular";
      rainLabel.textContent = `${pct}% (${desc})`;
    }

    const volumeUtil = cenario.capacidade * 0.9;
    const consumoColetivo = Math.max(1, consumoUsuarioDia * cenario.populacao);
    const reposicao = 110 * cenario.populacao * (taxaChuva * 2.5);
    const saldo = consumoColetivo - reposicao;
    const saldoReduzido = consumoColetivo * 0.75 - reposicao;

    document.getElementById("dz-collective-flow").textContent =
      `Consumo coletivo: ${Math.round(consumoColetivo).toLocaleString("pt-BR")} litros/dia`;

    const waterFill = document.getElementById("dz-water-fill");
    const tankPct = document.getElementById("dz-tank-pct");
    const daysCount = document.getElementById("dz-days-count");
    const collapseDate = document.getElementById("dz-collapse-date");
    const savedDays = document.getElementById("dz-saved-days");

    if (saldo <= 0) {
      waterFill.style.height = "88%";
      waterFill.className = "tank-fill healthy";
      tankPct.textContent = "ESTÁVEL";
      daysCount.textContent = "SUSTENTÁVEL";
      collapseDate.textContent = "Sem risco de seca";
      savedDays.textContent = "Equilíbrio hídrico garantido!";
    } else {
      const dias = Math.max(1, Math.floor(volumeUtil / saldo));
      const dataAlvo = new Date();
      dataAlvo.setDate(dataAlvo.getDate() + dias);

      const nivel = Math.min(84, Math.max(12, (dias / 180) * 84));
      waterFill.style.height = `${nivel}%`;
      waterFill.className = "tank-fill";
      tankPct.textContent = `${Math.round(nivel)}%`;
      daysCount.textContent = `${dias.toLocaleString("pt-BR")} DIAS`;
      collapseDate.textContent = dataAlvo.toLocaleDateString("pt-BR");

      if (saldoReduzido <= 0) {
        savedDays.textContent = "Evitaria completamente o Dia Zero!";
      } else {
        const diasNovos = Math.floor(volumeUtil / saldoReduzido);
        const ganho = Math.max(0, diasNovos - dias);
        savedDays.textContent = `+${ganho.toLocaleString("pt-BR")} dias de abastecimento garantidos`;
      }
    }
  }

  function atualizarTudo() {
    const v = {};
    Object.keys(inputs).forEach((k) => {
      v[k] = Number(inputs[k].value);
    });

    document.getElementById("val-banhos").textContent = `${v.banhos} ${v.banhos === 1 ? "banho" : "banhos"}`;
    document.getElementById("val-tempoBanho").textContent = `${v.tempoBanho} min`;
    document.getElementById("val-descargas").textContent = `${v.descargas} ${v.descargas === 1 ? "vez" : "vezes"}`;
    document.getElementById("val-higiene").textContent = `${v.higiene} min/dia`;
    document.getElementById("val-louca").textContent = `${v.louca} min/dia`;
    document.getElementById("val-maquina").textContent = `${v.maquina} ${v.maquina === 1 ? "vez/sem" : "vezes/sem"}`;
    document.getElementById("val-mangueira").textContent = `${v.mangueira} min/sem`;

    const atividades = [
      { nome: "Banho", litros: v.banhos * v.tempoBanho * 9 },
      { nome: "Descarga sanitária", litros: v.descargas * 10 },
      { nome: "Lavar louça", litros: v.louca * 8 },
      { nome: "Máquina de lavar", litros: (v.maquina * 135) / 7 },
      { nome: "Uso de mangueira", litros: (v.mangueira * 18) / 7 },
      { nome: "Torneira (dentes/mãos)", litros: v.higiene * 6 },
    ];

    const diario = atividades.reduce((acc, i) => acc + i.litros, 0);
    const mensal = diario * 30;
    const anual = diario * 365;
    const caixas = anual / 1000;

    document.getElementById("kpi-diario").textContent = `${fmt(diario, 0)} L`;
    document.getElementById("kpi-status").textContent =
      diario <= 110 ? "Dentro da meta ONU" : `+${fmt(diario - 110, 0)} L acima da meta`;
    document.getElementById("kpi-mensal").textContent = `${fmt(mensal, 0)} L`;
    document.getElementById("kpi-m3").textContent = `${fmt(mensal / 1000, 2)} m³/mês`;
    document.getElementById("kpi-anual").textContent = `${fmt(anual / 1000, 1)} mil L`;
    document.getElementById("kpi-caixas").textContent = `${fmt(caixas, 1)} caixas de 1.000L`;

    const ordenadas = [...atividades].sort((a, b) => b.litros - a.litros);
    document.getElementById("maior-vilao").textContent =
      ordenadas[0].litros > 0 ? `Maior gasto: ${ordenadas[0].nome}` : "Sem gasto";

    const barsContainer = document.getElementById("breakdown-bars");
    barsContainer.innerHTML = "";
    ordenadas.forEach((item) => {
      const perc = diario > 0 ? (item.litros / diario) * 100 : 0;
      const div = document.createElement("div");
      div.innerHTML = `
        <div class="bar-top">
          <span>${item.nome}</span>
          <span>${fmt(item.litros, 1)} L (${fmt(perc, 0)}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${perc}%"></div>
        </div>
      `;
      barsContainer.appendChild(div);
    });

    const excedente = Math.max(0, diario - 110);
    const pessoas = Math.floor(excedente / 50);
    document.getElementById("imp-pessoas").textContent =
      pessoas > 0 ? `${pessoas} ${pessoas === 1 ? "pessoa/dia" : "pessoas/dia"}` : "Meta sustentável atingida";

    // Economia com banho de 6 min e torneira fechada (60% menor)
    const novoBanho = v.tempoBanho > 6 ? 6 : v.tempoBanho;
    const novoDiario =
      v.banhos * novoBanho * 9 +
      v.descargas * 10 +
      v.louca * 0.4 * 8 +
      (v.maquina * 135) / 7 +
      (v.mangueira * 0.15 * 18) / 7 +
      v.higiene * 0.4 * 6;
    const economiaAno = Math.max(0, (diario - novoDiario) * 365);
    document.getElementById("imp-economia").textContent = `${fmt(economiaAno, 0)} litros/ano`;

    atualizarDiaZero(diario);
  }

  Object.values(inputs).forEach((el) => el.addEventListener("input", atualizarTudo));
  rainSlider.addEventListener("input", atualizarTudo);

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

  document.querySelectorAll(".dz-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".dz-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      cenarioAtivo = tab.dataset.scenario;
      atualizarTudo();
    });
  });

  // =========================================================
  // QUIZ INTERATIVO SOBRE O CONTEÚDO DO SITE
  // =========================================================
  const questoes = [
    {
      pergunta: "1. Qual é o consumo diário máximo recomendado pela ONU para atender às necessidades básicas com sustentabilidade?",
      opcoes: ["500 litros por dia", "110 litros por dia", "5 litros por dia"],
      correta: 1,
    },
    {
      pergunta: "2. O que significa o termo 'Dia Zero' mostrado no simulador?",
      opcoes: [
        "O dia em que começa a temporada de chuvas fortes.",
        "O momento em que o reservatório atinge o volume morto (10%) e as torneiras são fechadas.",
        "O dia em que a conta de água vem zerada.",
      ],
      correta: 1,
    },
    {
      pergunta: "3. Qual porcentagem aproximada da água do planeta é doce e está acessível para consumo humano?",
      opcoes: ["Menos de 1%", "Cerca de 50%", "Mais de 70%"],
      correta: 0,
    },
    {
      pergunta: "4. Onde está concentrada a chamada 'Água Invisível' que consumimos todos os dias?",
      opcoes: [
        "Apenas na água que evapora da piscina.",
        "Na produção de alimentos, roupas e bens que utilizamos.",
        "Somente na lavagem de carros.",
      ],
      correta: 1,
    },
  ];

  const quizContainer = document.getElementById("quiz-questions");
  questoes.forEach((q, qIdx) => {
    const item = document.createElement("div");
    item.className = "quiz-item";
    const opcoesHtml = q.opcoes
      .map(
        (texto, oIdx) => `
        <label class="quiz-opt" data-q="${qIdx}" data-o="${oIdx}">
          <input type="radio" name="q${qIdx}" value="${oIdx}" />
          <span>${texto}</span>
        </label>
      `
      )
      .join("");
    item.innerHTML = `<h4>${q.pergunta}</h4><div class="quiz-options">${opcoesHtml}</div>`;
    quizContainer.appendChild(item);
  });

  document.getElementById("btn-check-quiz").addEventListener("click", () => {
    let acertos = 0;
    questoes.forEach((q, qIdx) => {
      const selecionada = document.querySelector(`input[name="q${qIdx}"]:checked`);
      const labels = document.querySelectorAll(`.quiz-opt[data-q="${qIdx}"]`);
      labels.forEach((l) => l.classList.remove("correct", "wrong"));

      labels[q.correta].classList.add("correct");
      if (selecionada) {
        const resp = Number(selecionada.value);
        if (resp === q.correta) {
          acertos++;
        } else {
          labels[resp].classList.add("wrong");
        }
      }
    });

    const resultBox = document.getElementById("quiz-result");
    resultBox.classList.remove("hidden");
    resultBox.textContent = `Você acertou ${acertos} de ${questoes.length} questões!`;
  });

  atualizarTudo();
});
