const TWELVE_API_KEY = '1c59569b049248a3a6fe4417fa73eb29'; // Twelve Data API Key

function extractTickerOnly(fullSymbol) {
  const parts = fullSymbol.split(':');
  return parts.length > 1 ? parts[1] : fullSymbol;
}

async function fetchStockData(fullSymbol) {
  const tickerOnly = extractTickerOnly(fullSymbol);
  const url = `https://api.twelvedata.com/time_series?symbol=${tickerOnly}&interval=1day&apikey=${TWELVE_API_KEY}&outputsize=30`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("Twelve Data API response:", data);

    if (data.status === 'error' || !data.values || data.values.length === 0) {
      alert('Error fetching stock data or no data found for this ticker.');
      return;
    }

    const latestPrice = parseFloat(data.values[0].close);
    document.getElementById('currentPrice').innerText = `Current Price for ${fullSymbol}: $${latestPrice.toFixed(2)}`;

    if (typeof TradingView !== 'undefined') {
      loadTradingViewWidget(fullSymbol);
    } else {
      window.addEventListener('load', () => loadTradingViewWidget(fullSymbol));
    }

  } catch (error) {
    console.error('Fetch stock data error:', error);
    alert('Failed to fetch stock data. Please check the console for details.');
  }
}

function loadTradingViewWidget(symbol) {
  const containerId = 'tradingview_chart';
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous widget

  if (typeof TradingView === 'undefined') {
    console.error('TradingView library not loaded!');
    return;
  }

  new TradingView.widget({
    width: "100%",
    height: 400,
    symbol: symbol,
    interval: "D",
    timezone: "America/New_York",
    theme: "light",
    style: "1",
    locale: "en",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: containerId
  });
}

function updateStockData() {
  const tickerInput = document.getElementById('ticker');
  const exchangeSelect = document.getElementById('exchange');
  const ticker = tickerInput.value.trim().toUpperCase();
  const exchange = exchangeSelect.value;

  if (!ticker) return;

  const fullSymbol = `${exchange}:${ticker}`;
  fetchStockData(fullSymbol);
}

// Setup event listeners inside window.onload to ensure TradingView script is ready
window.onload = () => {
  document.getElementById('ticker').addEventListener('blur', updateStockData);
  document.getElementById('exchange').addEventListener('change', updateStockData);

  document.getElementById('calculateBtn').addEventListener('click', () => {
    updateStockData(); // Make sure data is fresh

    const amount = parseFloat(document.getElementById('amount').value);
    const years = parseFloat(document.getElementById('years').value);
    const tickerInput = document.getElementById('ticker').value.trim().toUpperCase();
    const exchange = document.getElementById('exchange').value;

    if (isNaN(amount) || isNaN(years) || !tickerInput) {
      alert('Please enter a valid ticker, investment amount, and years.');
      return;
    }

    const fullSymbol = `${exchange}:${tickerInput}`;

    const annualReturnRate = 0.08;
    const futureValue = amount * Math.pow(1 + annualReturnRate, years);

    document.getElementById('results').innerHTML = `
      If you invest $${amount.toFixed(2)} in ${fullSymbol} for ${years} years at an estimated 8% annual return, your investment could grow to:<br>
      <strong>$${futureValue.toFixed(2)}</strong>
    `;
  });
};
