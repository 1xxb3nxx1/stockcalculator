const API_KEY = '1c59569b049248a3a6fe4417fa73eb29'; // Your Twelve Data API key

function calculateInvestment() {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseInt(document.getElementById('years').value);

  if (isNaN(amount) || isNaN(years) || amount <= 0 || years <= 0) {
    document.getElementById('results').innerText = 'Please enter valid positive numbers for amount and years.';
    return;
  }

  const growthRate = 0.08; // 8% assumed return
  const futureValue = amount * Math.pow(1 + growthRate, years);

  document.getElementById('results').innerText =
    `Estimated value after ${years} years: $${futureValue.toFixed(2)}`;
}

async function fetchStockData(ticker) {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&apikey=${API_KEY}&outputsize=30`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("Twelve Data API response:", data);

    if (data.status === 'error') {
      alert("API Error:\n" + (data.message || JSON.stringify(data)));
      return;
    }

    if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
      alert("No data available for the ticker.");
      return;
    }

    // Twelve Data returns latest data first, reverse for chronological order
    const values = data.values.slice().reverse();

    const labels = values.map(item => item.datetime);
    const prices = values.map(item => parseFloat(item.close));

    drawChart(ticker, labels, prices);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    alert("Failed to fetch stock data. Please try again.");
  }
}

function drawChart(ticker, labels, prices) {
  const ctx = document.getElementById('stockChart').getContext('2d');

  if (window.stockChart) {
    window.stockChart.destroy();
  }

  window.stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
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

document.getElementById('ticker').addEventListener('blur', () => {
  const ticker = document.getElementById('ticker').value.trim().toUpperCase();
  if (ticker) {
    fetchStockData(ticker);
  }
});
