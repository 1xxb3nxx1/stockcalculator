const TWELVE_API_KEY = '1c59569b049248a3a6fe4417fa73eb29'; // Twelve Data API Key

// Fetch stock price and timeseries from Twelve Data
async function fetchStockData(ticker) {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&apikey=${TWELVE_API_KEY}&outputsize=30`;

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
    document.getElementById('currentPrice').innerText = `Current Price for ${ticker}: $${latestPrice.toFixed(2)}`;

    // Update TradingView chart
    loadTradingViewWidget(ticker);

  } catch (error) {
    console.error('Fetch stock data error:', error);
    alert('Failed to fetch stock data. Please check the console for details.');
  }
}

function loadTradingViewWidget(ticker) {
  const containerId = 'tradingview_chart';
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous widget

  // Default to NASDAQ if no prefix
  const formattedSymbol = ticker.includes(':') ? ticker : `NASDAQ:${ticker}`;

  if (typeof TradingView === 'undefined') {
    console.error('TradingView library not loaded!');
    return;
  }

  new TradingView.widget({
    width: "100%",
    height: 400,
    symbol: formattedSymbol,
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


// Calculate investment value on button click
document.getElementById('calculateBtn').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseFloat(document.getElementById('years').value);
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();

  if (isNaN(amount) || isNaN(years) || !ticker) {
    alert('Please enter a valid ticker, investment amount, and years.');
    return;
  }

  // Use fixed 8% annual return (no dividend calculation here)
  const annualReturnRate = 0.08;
  const futureValue = amount * Math.pow(1 + annualReturnRate, years);

  document.getElementById('results').innerHTML = `
    If you invest $${amount.toFixed(2)} in ${ticker} for ${years} years at an estimated 8% annual return, your investment could grow to:<br>
    <strong>$${futureValue.toFixed(2)}</strong>
  `;
});

// Trigger fetch on ticker input blur
document.getElementById('ticker').addEventListener('blur', () => {
  const tickerInput = document.getElementById('ticker');
  const ticker = tickerInput.value.trim().toUpperCase();
  if (ticker) {
    fetchStockData(ticker);
  }
});
