const TWELVE_API_KEY = '1c59569b049248a3a6fe4417fa73eb29'; // Twelve Data API Key
const FINNHUB_API_KEY = 'd1u7qi9r01qp7ee26h90d1u7qi9r01qp7ee26h9g'; // Finnhub API Key

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

    const values = data.values.slice().reverse();
    const labels = values.map(item => item.datetime);
    const prices = values.map(item => parseFloat(item.close));

    drawChart(ticker, labels, prices);

  } catch (error) {
    console.error('Fetch stock data error:', error);
    alert('Failed to fetch stock data. Please check the console for details.');
  }
}

// Fetch dividend history from Finnhub
async function fetchDividendData(ticker) {
  const url = `https://finnhub.io/api/v1/stock/dividend?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Dividend fetch error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("Finnhub dividend data:", data);

    // Sort dividends descending by date
    data.sort((a,b) => new Date(b.date) - new Date(a.date));

    return data;

  } catch (error) {
    console.error('Fetch dividend data error:', error);
    alert('Failed to fetch dividend data. Dividends will not be included.');
    return [];
  }
}

function drawChart(ticker, labels, prices) {
  const ctx = document.getElementById('stockChart').getContext('2d');
  if (window.stockChart instanceof Chart) {
    window.stockChart.destroy();
  }
  window.stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${ticker} Price (Last 30 Days)`,
        data: prices,
        borderColor: 'blue',
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { maxTicksLimit: 10 } },
        y: { beginAtZero: false }
      }
    }
  });
}

// Trigger fetch on ticker blur
document.getElementById('ticker').addEventListener('blur', () => {
  const tickerInput = document.getElementById('ticker');
  const ticker = tickerInput.value.trim().toUpperCase();
  if (ticker) {
    fetchStockData(ticker);
  }
});

// Calculate investment including dividends on button click
document.getElementById('calculateBtn').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseFloat(document.getElementById('years').value);
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();

  if (isNaN(amount) || isNaN(years) || !ticker) {
    alert('Please enter a valid ticker, investment amount, and years.');
    return;
  }

  // Fetch dividends for the ticker
  const dividends = await fetchDividendData(ticker);

  // Calculate total dividends over the investment period
  // Only count dividends within last N years (approximate)
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - Math.floor(years);

  // Sum dividend amounts from the relevant years
  let totalDividends = 0;
  dividends.forEach(div => {
    const divYear = new Date(div.date).getFullYear();
    if (divYear >= startYear) {
      totalDividends += div.amount;
    }
  });

  // Calculate future value with 8% annual return ignoring dividends
  const annualReturnRate = 0.08;
  const futureValue = amount * Math.pow(1 + annualReturnRate, years);

  // Calculate estimated dividends earned: totalDividends * shares owned
  // Shares = amount / current price
  const currentPriceText = document.getElementById('currentPrice').innerText;
  let currentPrice = null;
  if (currentPriceText) {
    const priceMatch = currentPriceText.match(/\$(\d+(\.\d+)?)/);
    if (priceMatch) currentPrice = parseFloat(priceMatch[1]);
  }

  let estimatedDividendsEarned = 0;
  if (currentPrice && currentPrice > 0) {
    const sharesOwned = amount / currentPrice;
    estimatedDividendsEarned = sharesOwned * totalDividends;
  }

  // Total projected value = futureValue + dividends earned (no reinvestment here)
  const totalProjected = futureValue + estimatedDividendsEarned;

  // Show results
  const resultText = `
    If you invest $${amount.toFixed(2)} in ${ticker} for ${years} years at an estimated 8% annual return, your investment could grow to:<br>
    <strong>$${futureValue.toFixed(2)}</strong><br><br>
    Estimated dividends earned over ${years} years: <strong>$${estimatedDividendsEarned.toFixed(2)}</strong><br>
    <strong>Total projected value including dividends:</strong> $${totalProjected.toFixed(2)}
  `;

  document.getElementById('results').innerHTML = resultText;
});
