const API_KEY = 'QRYH4KEEQGS3ZO9O'; // Your Alpha Vantage API key

function calculateInvestment() {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseInt(document.getElementById('years').value);
  const growthRate = 0.08; // 8% assumed return
  const futureValue = amount * Math.pow(1 + growthRate, years);

  document.getElementById('results').innerText =
    `Estimated value after ${years} years: $${futureValue.toFixed(2)}`;
}

async function fetchStockData(ticker) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data["Time Series (Daily)"]) {
      alert("Invalid ticker or API limit hit. Try again later.");
      return;
    }

    const dailyData = data["Time Series (Daily)"];
    const labels = Object.keys(dailyData).slice(0, 30).reverse(); // last 30 days
    const prices = labels.map(date => parseFloat(dailyData[date]["4. close"]));

    drawChart(ticker, labels, prices);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    alert("Error fetching data.");
  }
}

function drawChart(ticker, labels, prices) {
  const ctx = document.getElementById('stockChart').getContext('2d');

  // Destroy existing chart if already created
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
  const ticker = document.getElementById('ticker').value.toUpperCase();
  if (ticker) fetchStockData(ticker);
});
