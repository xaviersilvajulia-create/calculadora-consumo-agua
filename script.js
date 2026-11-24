document.addEventListener("DOMContentLoaded", () => {
  // 1. MODO ESCURO PERSISTENTE
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("aquaimpacto-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.textContent = savedTheme === "dark" ? "Modo Claro" : "Modo Escuro";

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("aquaimpacto-theme", next);
    themeToggle.textContent = next === "dark" ? "Modo Claro" : "Modo Escuro";
  });

  // 2. REFERÊNCIAS DE INPUTS E LABELS
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

  let escalaColetiva = 100;

  const presets = {
    economico: { banhos: 1, tempoBanho: 6, descargas: 4, higiene: 2, louca: 5, maquina: 1, mangueira: 0, carne: 2, roupas: 1, desperdicioComida: 0, papel: 5 },
    medio: { banhos: 2, tempoBanho: 10, descargas: 5, higiene: 4, louca: 10, maquina: 2, mangueira: 15, carne: 4, roupas: 2, desperdicioComida: 2, papel: 20 },
    alto: { banhos: 2, tempoBanho: 18, descargas: 7, higiene: 8, louca: 20, maquina: 4, mangueira: 45, carne: 8, roupas: 5, desperdicioComida: 4, papel: 50 },
  };

  function fmt(num, dec = 1) {
    return num.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function atualizarTudo() {
    const v = {};
    Object.keys(inputs).forEach((k) => {
      v[k] = Number(inputs[k].value);
    });

    // Atualiza textos dos controles diretos
    document.getElementById("val-banhos").textContent = `${v.banhos} ${v.banhos === 1 ? "banho" : "banhos"}`;
    document.getElementById("val-tempoBanho").textContent = `${v.tempoBanho} min`;
    document.getElementById("val-descargas").textContent = `${v.descargas} ${v.descargas === 1 ? "vez" : "vezes"}`;
    document.getElementById("val-higiene").textContent = `${v.higiene} min/dia`;
    document.getElementById("val-louca").textContent = `${v.louca} min/dia`;
    document.getElementById("val-maquina").textContent = `${v.maquina} ${v.maquina === 1 ? "vez/sem" : "vezes/sem"}`;
    document.getElementById("val-mangueira").textContent = `${v.mangueira} min/sem`;

    // Atualiza textos dos controles de água invisível
    document.getElementById("val-carne").textContent = `${v.carne} porções/sem`;
    document.getElementById("val-roupas").textContent = `${v.roupas} peças/mês`;
    document.getElementById("val-desperdicioComida").textContent = `${v.desperdicioComida} pratos/sem`;
    document.getElementById("val-papel").textContent = `${v.papel} folhas/sem`;

    // Cálculos Uso Direto (L/dia)
    const diretoItens = [
      { nome: "Banho", litros: v.banhos * v.tempoBanho * 9 },
      { nome: "Descarga sanitária", litros: v.descargas * 10 },
      { nome: "Lavar louça", litros: v.louca * 8 },
      { nome: "Máquina de lavar", litros: (v.maquina * 135) / 7 },
      { nome: "Uso de mangueira", litros: (v.mangueira * 18) / 7 },
      { nome: "Torneira (dentes/mãos)", litros: v.higiene * 6 },
    ];

    const diretoDia = diretoItens.reduce((acc, i) => acc + i.litros, 0);
    const diretoMes = diretoDia * 30;
    const diretoAno = diretoDia * 365;

    // Cálculos Água Invisível (L/dia)
    const invCarneDia = (v.carne * 1540) / 7;
    const invRoupasDia = (v.roupas * 2700) / 30;
    const invComidaDia = (v.desperdicioComida * 1000) / 7;
    const invPapelDia = (v.papel * 10) / 7;
    const invisivelDia = invCarneDia + invRoupasDia + invComidaDia + invPapelDia;

    const pegadaTotalDia = diretoDia + invisivelDia;

    // KPIs Principais
    document.getElementById("kpi-diario").textContent = `${fmt(diretoDia, 0)} L`;
    document.getElementById("kpi-mensal").textContent = `${fmt(diretoMes, 0)} L`;
    document.getElementById("kpi-m3").textContent = `${fmt(diretoMes / 1000, 2)} m³/mês`;
    document.getElementById("kpi-total-real").textContent = `${fmt(pegadaTotalDia, 0)} L/dia`;

    // Régua e Status
    const statusBadge = document.getElementById("kpi-status-badge");
    const statusDesc = document.getElementById("status-descricao");
    const rulerFill = document.getElementById("ruler-fill");
    rulerFill.style.width = `${Math.min(100, (diretoDia / 300) * 100)}%`;

    if (diretoDia <= 110) {
      statusBadge.textContent = "Sustentável (Meta ONU)";
      statusBadge.className = "kpi-foot badge-ok";
      rulerFill.style.backgroundColor = "#15803d";
      statusDesc.textContent = "Excelente! Seu uso direto está dentro do limite sustentável de 110 L/dia da ONU.";
    } else if (diretoDia <= 180) {
      statusBadge.textContent = "Alerta de Excesso";
      statusBadge.className = "kpi-foot badge-warn";
      rulerFill.style.backgroundColor = "#d97706";
      statusDesc.textContent = `Atenção: Você consome ${fmt(diretoDia - 110, 0)} L/dia acima da meta recomendada pela ONU.`;
    } else {
      statusBadge.textContent = "Crítico (Alto Desperdício)";
      statusBadge.className = "kpi-foot badge-danger";
      rulerFill.style.backgroundColor = "#b91c1c";
      statusDesc.textContent = `Crítico: Seu consumo direto é ${(diretoDia / 110).toFixed(1)}x maior que o ideal da ONU.`;
    }

    // Breakdown visual
    const list = document.getElementById("breakdown-list");
    list.innerHTML = "";
    [...diretoItens].sort((a, b) => b.litros - a.litros).forEach((item) => {
      const perc = diretoDia > 0 ? (item.litros / diretoDia) * 100 : 0;
      const row = document.createElement("div");
      row.innerHTML = `
        <div class="breakdown-top">
          <span>${item.nome}</span>
          <span>${fmt(item.litros, 1)} L (${fmt(perc, 0)}%)</span>
        </div>
        <div class="breakdown-track">
          <div class="breakdown-bar" style="width:${perc}%"></div>
        </div>
      `;
      list.appendChild(row);
    });

    // Água Invisível e Consequências
    document.getElementById("inv-total-dia").textContent = `${fmt(invisivelDia, 0)} L / dia`;
    const mult = diretoDia > 0 ? (invisivelDia / diretoDia).toFixed(1) : "0";
    document.getElementById("inv-multiplier").textContent = `${mult}x maior que o uso na torneira`;

    const excedente = Math.max(0, diretoDia - 110);
    const pessoas = Math.floor(excedente / 50);
    document.getElementById("imp-pessoas").textContent =
      pessoas > 0 ? `${pessoas} ${pessoas === 1 ? "pessoa/dia" : "pessoas/dia"}` : "0 pessoas (Meta atingida)";
    document.getElementById("imp-caixas").textContent = `${fmt(diretoAno / 1000, 1)} caixas d'água`;

    // Simulador Antes vs. Depois
    let novoTempoBanho = v.tempoBanho;
    let novaHigiene = v.higiene;
    let novaLouca = v.louca;
    let novaMangueira = v.mangueira;
    let economiaInvisivelDia = 0;

    if (habits.banho.checked && v.tempoBanho > 6) {
      novoTempoBanho = 6;
    }
    if (habits.torneira.checked) {
      novaHigiene = v.higiene * 0.4;
      novaLouca = v.louca * 0.4;
    }
    if (habits.balde.checked) {
      novaMangueira = v.mangueira * 0.15;
    }
    if (habits.carne.checked) {
      const reducaoPorcoes = Math.min(v.carne, 2);
      economiaInvisivelDia = (reducaoPorcoes * 1540) / 7;
    }

    const novoDiretoDia =
      v.banhos * novoTempoBanho * 9 +
      v.descargas * 10 +
      novaLouca * 8 +
      (v.maquina * 135) / 7 +
      (novaMangueira * 18) / 7 +
      novaHigiene * 6;

    const novoDiretoAno = novoDiretoDia * 365;
    const economiaDiretaAno = Math.max(0, diretoAno - novoDiretoAno);
    const economiaTotalAno = economiaDiretaAno + economiaInvisivelDia * 365;
    const caixasSalvas = economiaTotalAno / 1000;
    const reaisSalvosAno = (economiaDiretaAno / 1000) * 8.5;

    document.getElementById("ba-antes").textContent = `${fmt(diretoAno, 0)} L/ano`;
    document.getElementById("ba-depois").textContent = `${fmt(novoDiretoAno, 0)} L/ano`;
    document.getElementById("ba-economia-litros").textContent = `${fmt(economiaTotalAno, 0)} litros / ano`;
    document.getElementById("ba-economia-detalhes").innerHTML =
      `Equivalente a <strong>${fmt(caixasSalvas, 1)} caixas d'água</strong> de 1.000L salvas e <strong>R$ ${fmt(reaisSalvosAno, 2)}</strong> economizados na conta por ano (<strong>R$ ${fmt(reaisSalvosAno * 10, 2)}</strong> em 10 anos).`;

    // Efeito Borboleta Coletivo
    const litColetivoMilhoes = (economiaTotalAno * escalaColetiva) / 1_000_000;
    const caminhoes = Math.round((economiaTotalAno * escalaColetiva) / 10000);
    document.getElementById("collective-saved").textContent =
      `${fmt(litColetivoMilhoes, 2)} milhões de litros preservados/ano`;
    document.getElementById("collective-trucks").textContent =
      `Suficiente para encher ${caminhoes.toLocaleString("pt-BR")} caminhões-pipa de 10.000L e proteger os reservatórios locais.`;

    window.ultimaEconomiaAnual = fmt(economiaTotalAno, 0);
  }

  // Eventos nos inputs e checkboxes
  Object.values(inputs).forEach((el) => el.addEventListener("input", atualizarTudo));
  Object.values(habits).forEach((el) => el.addEventListener("change", atualizarTudo));

  // Cenários rápidos
  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = presets[btn.dataset.preset];
      Object.keys(p).forEach((k) => {
        inputs[k].value = p[k];
      });
      atualizarTudo();
    });
  });

  // Escala coletiva
  document.querySelectorAll(".scale-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scale-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      escalaColetiva = Number(btn.dataset.scale);
      atualizarTudo();
    });
  });

  // Gerador de Pacto / Certificado
  document.getElementById("btn-generate-pact").addEventListener("click", () => {
    const nome = document.getElementById("pact-name").value.trim() || "Cidadão(ã) Consciente";
    const meta = document.getElementById("pact-goal").value;
    const economia = window.ultimaEconomiaAnual || "0";

    const textoCertificado = `Eu, ${nome}, assumi o compromisso AquaImpacto: "${meta}", gerando uma economia estimada de ${economia} litros de água por ano!`;
    const box = document.getElementById("pact-certificate");
    document.getElementById("cert-text").textContent = textoCertificado;
    box.classList.remove("hidden");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${textoCertificado} Calcule o seu impacto também: ${window.location.href}`).then(() => {
        document.getElementById("cert-feedback").textContent =
          "Texto do compromisso copiado! Agora é só colar no WhatsApp da turma ou da família.";
      });
    }
  });

  // Copiar código Python
  const btnCopyCode = document.getElementById("btn-copy-code");
  btnCopyCode.addEventListener("click", () => {
    const code = document.getElementById("python-source").textContent;
    navigator.clipboard.writeText(code).then(() => {
      btnCopyCode.textContent = "Código Copiado!";
      setTimeout(() => {
        btnCopyCode.textContent = "Copiar Código Python";
      }, 2500);
    });
  });

  atualizarTudo();
});