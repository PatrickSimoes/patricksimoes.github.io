// Calculadora de preço de venda (/precificacao/).
// É a mesma conta do app — src/lib/pricing.ts (computePricing):
//   margem  → preço = custo ÷ (1 − margem)   (margem de 0 a 95%)
//   lucro   → preço = custo + lucro          (lucro ≥ 0)
//   markup  → preço = custo × markup         (de 1× a 10×)
// Tudo roda no navegador; nada é enviado pra lugar nenhum.
(function () {
  var form = document.getElementById('calc');
  if (!form) return;

  var MAX_MARGIN_PCT = 95;
  var MAX_MARKUP = 10;

  var MODES = {
    margem: { label: 'Margem de lucro', pre: false, suf: '%', def: '60', hint: 'A fatia do preço que sobra como lucro. Vai até 95%.' },
    lucro: { label: 'Lucro por unidade', pre: true, suf: '', def: '3,00', hint: 'Quanto você quer ganhar em cada unidade vendida.' },
    markup: { label: 'Markup', pre: false, suf: '×', def: '2', hint: 'Quantas vezes o custo você cobra. 2× é o dobro do custo.' }
  };

  var byId = function (id) { return document.getElementById(id); };
  var el = {
    custo: byId('c-custo'),
    rend: byId('c-rend'),
    valor: byId('c-valor'),
    valorLabel: byId('c-valor-label'),
    valorPre: byId('c-valor-pre'),
    valorSuf: byId('c-valor-suf'),
    valorHint: byId('c-valor-hint'),
    preco: byId('r-preco'),
    rCusto: byId('r-custo'),
    lucro: byId('r-lucro'),
    margem: byId('r-margem'),
    markup: byId('r-markup'),
    aviso: byId('r-aviso'),
    leitura: byId('r-leitura')
  };

  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var dec = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

  // Valor digitado em cada modo, pra trocar de modo sem perder o que a pessoa escreveu.
  var typed = { margem: MODES.margem.def, lucro: MODES.lucro.def, markup: MODES.markup.def };
  var mode = 'margem';

  /** "1.234,56" → 1234.56 · "54,5" → 54.5 · "54.5" → 54.5 · "2x" → 2 */
  function parseNum(raw) {
    var s = String(raw == null ? '' : raw).trim();
    s = s.replace(/R\$/gi, '').replace(/[%×]/g, '').replace(/x$/i, '').replace(/\s+/g, '');
    if (!s) return NaN;
    if (s.indexOf(',') !== -1) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, ''); // "1.200" é mil e duzentos
    }
    return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : NaN;
  }

  function cents(n) {
    return Math.round(n * 100) / 100;
  }

  function compute(totalCost, yieldCount, m, value) {
    if (!isFinite(totalCost) || !isFinite(yieldCount) || yieldCount <= 0 || totalCost < 0) return null;
    var unitCost = totalCost / yieldCount;
    var price;
    if (m === 'margem') {
      var pct = isFinite(value) ? Math.min(Math.max(value, 0), MAX_MARGIN_PCT) : 0;
      price = unitCost / (1 - pct / 100);
    } else if (m === 'lucro') {
      price = unitCost + (isFinite(value) ? Math.max(0, value) : 0);
    } else {
      price = unitCost * (isFinite(value) ? Math.min(Math.max(value, 1), MAX_MARKUP) : 1);
    }
    var p = cents(price);
    var c = cents(unitCost);
    var profit = cents(p - c);
    return {
      unitCost: c,
      price: p,
      profit: profit,
      marginPct: p > 0 ? Math.round((profit / p) * 100) : 0,
      markup: c > 0 ? p / c : null
    };
  }

  function warningFor(m, value) {
    if (!isFinite(value)) return '';
    if (m === 'margem' && value > MAX_MARGIN_PCT) {
      return 'A margem vai até 95% — acima disso a conta não fecha. Pensando em “200%”? Isso é markup: troque o jeito de calcular.';
    }
    if (m === 'margem' && value < 0) return 'Margem negativa é vender no prejuízo. A conta usa 0%.';
    if (m === 'markup' && value < 1) return 'Markup abaixo de 1× é vender abaixo do custo. A conta usa 1×.';
    if (m === 'markup' && value > MAX_MARKUP) return 'O markup vai até 10×. A conta usa 10×.';
    if (m === 'lucro' && value < 0) return 'Lucro negativo é vender no prejuízo. A conta usa R$ 0,00.';
    return '';
  }

  var announceTimer = null;

  function render() {
    var totalCost = parseNum(el.custo.value);
    var yieldCount = parseNum(el.rend.value);
    var value = parseNum(el.valor.value);
    var r = compute(totalCost, yieldCount, mode, value);

    var warn = r ? warningFor(mode, value) : 'Preencha quanto gastou e quanto rendeu pra ver o preço.';
    el.aviso.textContent = warn;
    el.aviso.hidden = !warn;

    if (!r) {
      el.preco.textContent = '—';
      el.rCusto.textContent = '—';
      el.lucro.textContent = '—';
      el.margem.textContent = '—';
      el.markup.textContent = '—';
      return;
    }

    el.preco.textContent = brl.format(r.price);
    el.rCusto.textContent = brl.format(r.unitCost);
    el.lucro.textContent = brl.format(r.profit);
    el.margem.textContent = r.marginPct + '%';
    el.markup.textContent = r.markup === null ? '—' : dec.format(r.markup) + '×';

    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () {
      el.leitura.textContent =
        'Preço sugerido ' + brl.format(r.price) + ' por unidade. Lucro de ' + brl.format(r.profit) +
        ' por unidade, margem de ' + r.marginPct + '%.';
    }, 700);
  }

  function setMode(next) {
    if (!MODES[next] || next === mode) return;
    typed[mode] = el.valor.value;
    mode = next;
    var cfg = MODES[mode];
    el.valorLabel.textContent = cfg.label;
    el.valorHint.textContent = cfg.hint;
    el.valorPre.hidden = !cfg.pre;
    el.valorSuf.hidden = !cfg.suf;
    el.valorSuf.textContent = cfg.suf;
    el.valor.value = typed[mode];
    render();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  form.addEventListener('input', function (e) {
    if (e.target && e.target.name === 'modo') return; // tratado no 'change'
    render();
  });

  form.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'modo') setMode(e.target.value);
  });

  // Se o navegador restaurou o formulário (voltar/avançar), respeita o que ficou marcado.
  var checked = form.querySelector('input[name="modo"]:checked');
  if (checked && checked.value !== mode) {
    var restored = el.valor.value;
    el.valor.value = MODES[mode].def; // o valor restaurado pertence ao outro modo
    setMode(checked.value);
    el.valor.value = restored;
  }
  render();
})();
