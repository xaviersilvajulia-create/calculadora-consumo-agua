# Calculadora de Consumo de Água

Projeto desenvolvido para identificar hábitos de desperdício hídrico no dia a dia e ajudar famílias e a comunidade escolar a economizar água.

---

## Etapa 1 – Investigação

* **Qual problema você pretende solucionar?**
  O consumo excessivo e o desperdício de água no dia a dia, causados pela falta de noção sobre quantos litros são gastos em atividades rotineiras (banhos demorados, torneira aberta ao escovar os dentes, uso de mangueira).
* **Onde esse problema acontece?**
  Nas residências dos alunos e nos banheiros, pátios e cozinha da escola.
* **Quem é afetado por essa situação?**
  Toda a comunidade e o meio ambiente: as famílias e a escola pagam contas mais caras, os reservatórios sofrem redução de volume e há risco de racionamento em períodos de seca.
* **Por que esse problema precisa ser resolvido?**
  Porque a água potável é um recurso finito e essencial. Reduzir o desperdício preserva os mananciais e gera economia financeira.
* **Como um programa de computador poderia ajudar?**
  Transformando hábitos invisíveis em números concretos, comparando o gasto diário com a recomendação da ONU (110 litros/dia por pessoa) e apontando onde economizar.

---

## Etapa 2 – Planejamento

* **Objetivo do programa:** Calcular o consumo diário e mensal de água com base na rotina do usuário, classificar o nível de gasto e sugerir metas de economia.
* **Informações fornecidas pelo usuário:** Quantidade e tempo dos banhos, número de descargas, minutos com a torneira aberta (higiene e louça), uso semanal da máquina de lavar e da mangueira.
* **Processamento:** Multiplicar cada atividade pelo gasto médio em litros, somar o total diário, projetar o gasto mensal (30 dias), comparar com o limite de 110L/dia e identificar o maior gasto.
* **Resultados apresentados:** Gasto detalhado por atividade, total diário e mensal, classificação (Econômico, Moderado ou Alto Desperdício) e uma dica prática focada no maior vilão do consumo.
* **Interação:** Questionário guiado pelo terminal onde o usuário digita apenas os valores numéricos da sua rotina.

---

## Etapa 3 – Como executar o código

1. Baixe o arquivo `calculadora_agua.py` deste repositório.
2. Execute em qualquer ambiente Python 3 (`python calculadora_agua.py`) ou cole em um editor online como Programiz ou Replit.
