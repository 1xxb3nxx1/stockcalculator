const API_KEY = '1c59569b049248a3a6fe4417fa73eb29'; // Your Twelve Data API key

async function fetchStockData(ticker) {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&apikey=${API_KEY}&outputsize=30`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log("Twelve Data API response:", data);

    if (data.status === 'error') {
      alert(`API error: ${data.message}`);
      return;
    }

    if (!data.values || data.values.length === 0) {
      alert('No data available for this ticker.');
      return;
    }

    // Latest price is close of first element (newest date)
    const latestPrice = parseFloat(data.values[0].close);

    // Display current price
    const priceEl = document.getElementById('currentPrice');
    if (priceEl) {
      priceEl.innerText = `Current Price for ${ticker}: $${latestPrice.toFixed(2)}`;
    }

    // Prepare data for chart (reverse for chronological order)
    const values = data.values.slice().reverse();
    const labels = values.map(item => item.datetime);
    const prices = values.map(item => parseFloat(item.close));

    drawChart(ticker, labels, prices);

  } catch (error) {
    console.error('Fetch stock data error:', error);
    alert('Failed to fetch stock data. Please check the console for details.');
  }
}

function drawChart(ticker, labels, prices) {
  const ctx = document.getElementById('stockChart').getContext('2d');

  // If a chart already exists and is valid, destroy it first
  if (window.stockChart instanceof Chart) {
    window.stockChart.destroy();
  }

  // Now create and store the new chart
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
        }
      }
    }
  });
}


// Event listener to fetch data when ticker input loses focus
document.getElementById('ticker').addEventListener('blur', () => {
  const tickerInput = document.getElementById('ticker');
  const ticker = tickerInput.value.trim().toUpperCase();
  if (ticker) {
    fetchStockData(ticker);
  }
});

// ======================
// Investment Calculator
// ======================

function calculateInvestment() {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseFloat(document.getElementById('years').value);
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();

  if (isNaN(amount) || isNaN(years) || !ticker) {
    alert('Please enter a valid ticker, investment amount, and years.');
    return;
  }

  const annualReturnRate = 0.08;
  const futureValue = amount * Math.pow(1 + annualReturnRate, years);

  const resultText = `
    If you invest $${amount.toFixed(2)} in ${ticker} for ${years} years 
    at an estimated 8% annual return, your investment could grow to:
    <strong>$${futureValue.toFixed(2)}</strong>
  `;

  document.getElementById('results').innerHTML = resultText;
}
