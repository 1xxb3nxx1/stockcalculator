const API_KEY = '1c59569b049248a3a6fe4417fa73eb29'; // Twelve Data API Key

// Fetch stock data and update chart + current price
async function fetchStockData(ticker) {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&apikey=${API_KEY}&outputsize=30`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("Twelve Data API response:", data);

    if (data.status === 'error' || !data.values || data.values.length === 0) {
      alert('Error fetching stock data or no data found for this ticker.');
      return;
    }

    // Latest price is the first value (most recent)
    const latestPrice = parseFloat(data.values[0].close);

    // Display current price
    const priceEl = document.getElementById('currentPrice');
    if (priceEl) {
      priceEl.innerText = `Current Price for ${ticker}: $${latestPrice.toFixed(2)}`;
    }

    // Prepare chart data
    const values = data.values.slice().reverse(); // oldest to newest
    const labels = values.map(item => item.datetime);
    const prices = values.map(item => parseFloat(item.close));

    drawChart(ticker, labels, prices);

  } catch (error) {
    console.error('Fetch stock data error:', error);
    alert('Failed to fetch stock data. Please check the console for details.');
  }
}

// Draw the stock price chart using Chart.js
function drawChart(ticker, labels, prices) {
  const ctx = document.getElementById('stockChart').getContext('2d');

  // Destroy existing chart if it exists
  if (window.stockChart instanceof Chart) {
    window.stockChart.destroy();
  }

  // Create new chart
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
        x: {
          ticks: { maxTicksLimit: 10 }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Trigger fetch on input blur
document.getElementById('ticker').addEventListener('blur', () => {
  const tickerInput = document.getElementById('ticker');
  const ticker = tickerInput.value.trim().toUpperCase();
  if (ticker) {
    fetchStockData(ticker);
  }
});

// Investment calculator logic
function calculateInvestment() {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseFloat(document.getElementById('years').value);
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();

  if (isNaN(amount) || isNaN(years) || !ticker) {
    alert('Please enter a valid ticker, investment amount, and years.');
    return;
  }

  const annualReturnRate = 0.08; // Estimated average return
  const futureValue = amount * Math.pow(1 + annualReturnRate, years);

  const resultText = `
    If you invest $${amount.toFixed(2)} in ${ticker} for ${years} years 
    at an estimated 8% annual return, your investment could grow to:
    <strong>$${futureValue.toFixed(2)}</strong>
  `;

  document.getElementById('results').innerHTML = resultText;
}
