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

  const labels = {
    banhos: document.getElementById("val-banhos"),
    tempoBanho: document.getElementById("val-tempoBanho"),
    descargas: document.getElementById("val-descargas"),
    higiene: document.getElementById("val-higiene"),
    louca: document.getElementById("val-louca"),
    maquina: document.getElementById("val-maquina"),
    mangueira: document.getElementById("val-mangueira"),
  };

  let escalaColetiva = 100;

  const presets = {
    economico: { banhos: 1, tempoBanho: 6, descargas: 4, higiene: 2, louca: 5, maquina: 1, mangueira: 0 },
    medio: { banhos: 2, tempoBanho: 10, descargas: 5, higiene: 4, louca: 10, maquina: 2, mangueira: 15 },
    alto: { banhos: 2, tempoBanho: 18, descargas: 7, higiene: 8, louca: 20, maquina: 4, mangueira: 45 },
  };

  function formatarBR(valor, decimais = 1) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais,
    });
  }

  function atualizarCalculos() {
    const v = {
      banhos: Number(inputs.banhos.value),
      tempoBanho: Number(inputs.tempoBanho.value),
      descargas: Number(inputs.descargas.value),
      higiene: Number(inputs.higiene.value),
      louca: Number(inputs.louca.value),
      maquina: Number(inputs.maquina.value),
      mangueira: Number(inputs.mangueira.value),
    };

    // Atualiza textos dos sliders
    labels.banhos.textContent = `${v.banhos} ${v.banhos === 1 ? "banho" : "banhos"}`;
    labels.tempoBanho.textContent = `${v.tempoBanho} min`;
    labels.descargas.textContent = `${v.descargas} ${v.descargas === 1 ? "vez" : "vezes"}`;
    labels.higiene.textContent = `${v.higiene} min/dia`;
    labels.louca.textContent = `${v.louca} min/dia`;
    labels.maquina.textContent = `${v.maquina} ${v.maquina === 1 ? "vez/sem" : "vezes/sem"}`;
    labels.mangueira.textContent = `${v.mangueira} min/sem`;

    // Cálculos diários por atividade (litros)
    const atividades = [
      { nome: "Banho", litros: v.banhos * v.tempoBanho * 9 },
      { nome: "Descarga sanitária", litros: v.descargas * 10 },
      { nome: "Lavar louça", litros: v.louca * 8 },
      { nome: "Máquina de lavar", litros: (v.maquina * 135) / 7 },
      { nome: "Uso de mangueira", litros: (v.mangueira * 18) / 7 },
      { nome: "Torneira (dentes/mãos)", litros: v.higiene * 6 },
    ];

    const diario = atividades.reduce((acc, item) => acc + item.litros, 0);
    const mensal = diario * 30;
    const anual = diario * 365;
    const m3Mensal = mensal / 1000;

    // KPIs principais
    document.getElementById("kpi-diario").textContent = `${formatarBR(diario, 0)} L`;
    document.getElementById("kpi-mensal").textContent = `${formatarBR(mensal, 0)} L`;
    document.getElementById("kpi-m3").textContent = `${formatarBR(m3Mensal, 2)} m³/mês`;
    document.getElementById("kpi-anual").textContent = `${formatarBR(anual / 1000, 1)} mil L`;

    // Status e Régua (escala até 300 L/dia)
    const statusBadge = document.getElementById("kpi-status-badge");
    const statusDesc = document.getElementById("status-descricao");
    const rulerFill = document.getElementById("ruler-fill");
    const porcentagemRegua = Math.min(100, (diario / 300) * 100);
    rulerFill.style.width = `${porcentagemRegua}%`;

    if (diario <= 110) {
      statusBadge.textContent = "Sustentável (Meta ONU)";
      statusBadge.className = "kpi-foot badge-ok";
      rulerFill.style.backgroundColor = "#15803d";
      statusDesc.textContent = "Excelente! Seu consumo está dentro do limite de 110 L/dia recomendado pela ONU.";
    } else if (diario <= 180) {
      statusBadge.textContent = "Alerta de Excesso";
      statusBadge.className = "kpi-foot badge-warn";
      rulerFill.style.backgroundColor = "#d97706";
      statusDesc.textContent = `Atenção: Você consome ${formatarBR(diario - 110, 0)} L/dia acima da meta sustentável da ONU.`;
    } else {
      statusBadge.textContent = "Crítico (Alto Desperdício)";
      statusBadge.className = "kpi-foot badge-danger";
      rulerFill.style.backgroundColor = "#b91c1c";
      statusDesc.textContent = `Crítico: Seu gasto diário é ${(diario / 110).toFixed(1)}x maior que o recomendado pela ONU.`;
    }

    // Lista de barras por atividade
    const breakdownList = document.getElementById("breakdown-list");
    breakdownList.innerHTML = "";
    const ordenadas = [...atividades].sort((a, b) => b.litros - a.litros);

    ordenadas.forEach((item) => {
      const perc = diario > 0 ? (item.litros / diario) * 100 : 0;
      const div = document.createElement("div");
      div.className = "breakdown-item";
      div.innerHTML = `
        <div class="breakdown-top">
          <span>${item.nome}</span>
          <span>${formatarBR(item.litros, 1)} L (${formatarBR(perc, 0)}%)</span>
        </div>
        <div class="breakdown-track">
          <div class="breakdown-bar" style="width: ${perc}%"></div>
        </div>
      `;
      breakdownList.appendChild(div);
    });

    // Consequências reais
    const excedenteDiario = Math.max(0, diario - 110);
    const pessoasAtendidas = Math.floor(excedenteDiario / 50);
    const caixasAno = anual / 1000;
    const garrafoesAno = Math.round(anual / 20);
    const custoAnual = caixasAno * 8.5; // Tarifa média estimada R$ 8,50/m³

    document.getElementById("imp-pessoas").textContent =
      pessoasAtendidas > 0 ? `${pessoasAtendidas} ${pessoasAtendidas === 1 ? "pessoa" : "pessoas"}/dia` : "0 pessoas (Dentro da meta)";

    document.getElementById("imp-pessoas-desc").textContent =
      pessoasAtendidas > 0
        ? `Poderiam suprir seu mínimo vital diário (50L/dia — ONU) apenas com a água excedente do seu consumo.`
        : `Parabéns! Você não está gerando excedente acima da meta sustentável da ONU.`;

    document.getElementById("imp-caixas").textContent = `${formatarBR(caixasAno, 1)} caixas d'água`;
    document.getElementById("imp-caixas-desc").textContent =
      `Equivalente a caixas d'água de 1.000 litros (ou ${garrafoesAno.toLocaleString("pt-BR")} garrafões de 20L) consumidas em 1 ano.`;

    document.getElementById("imp-custo").textContent = `R$ ${formatarBR(custoAnual, 2)} / ano`;
    document.getElementById("imp-custo-desc").textContent =
      `Estimativa individual na conta de água e esgoto (projeção de R$ ${formatarBR(custoAnual * 5, 2)} em 5 anos).`;

    // Efeito borboleta
    const litrosColetivos = (anual * escalaColetiva) / 1_000_000;
    const caminhoesPipa = Math.round((anual * escalaColetiva) / 10000);
    document.getElementById("butterfly-liters").textContent = `${formatarBR(litrosColetivos, 2)} milhões de litros/ano`;
    document.getElementById("butterfly-context").textContent =
      `Equivalente a ${caminhoesPipa.toLocaleString("pt-BR")} caminhões-pipa de 10.000 litros retirados dos reservatórios locais.`;

    // Plano de ação (Maior Vilão)
    const vilao = ordenadas[0];
    document.getElementById("villain-name").textContent =
      vilao.litros > 0 ? `${vilao.nome} (${formatarBR(vilao.litros, 1)} L/dia)` : "Nenhum gasto registrado";

    const dicas = {
      "Banho": `Reduzir apenas 3 minutos em cada banho economiza ${formatarBR(v.banhos * 3 * 9 * 365, 0)} litros por ano.`,
      "Uso de mangueira": "Trocar a mangueira por vassoura e balde reduz o desperdício na limpeza em até 80%.",
      "Lavar louça": "Ensaboar toda a louça com a torneira fechada reduz esse gasto pela metade.",
      "Descarga sanitária": "Nunca use o vaso sanitário como lixeira e verifique regularmente se há vazamentos na válvula.",
      "Máquina de lavar": "Acumule roupas para utilizar a máquina sempre na capacidade máxima e reaproveite a água do enxágue.",
      "Torneira (dentes/mãos)": "Fechar a torneira enquanto escova os dentes economiza até 12 litros a cada escovação.",
    };

    document.getElementById("villain-tip").textContent =
      vilao.litros > 0 ? dicas[vilao.nome] : "Aumente algum controle para receber uma recomendação.";
  }

  // Eventos dos sliders
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", atualizarCalculos);
  });

  // Botões de cenários rápidos
  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = presets[btn.dataset.preset];
      Object.keys(p).forEach((key) => {
        inputs[key].value = p[key];
      });
      atualizarCalculos();
    });
  });

  // Botões de escala coletiva
  document.querySelectorAll(".scale-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scale-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      escalaColetiva = Number(btn.dataset.scale);
      atualizarCalculos();
    });
  });

  // Botão copiar código Python
  const btnCopy = document.getElementById("btn-copy-code");
  btnCopy.addEventListener("click", () => {
    const codeText = document.getElementById("python-source").textContent;
    navigator.clipboard.writeText(codeText).then(() => {
      btnCopy.textContent = "Código Copiado!";
      setTimeout(() => {
        btnCopy.textContent = "Copiar Código Python";
      }, 2500);
    });
  });

  atualizarCalculos();
});
