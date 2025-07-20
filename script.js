const API_KEY = 'QRYH4KEEQGS3ZO9O'; // Your Alpha Vantage API key

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
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("Alpha Vantage response:", data); // Debug output to console

    if (data["Error Message"]) {
      alert("Invalid ticker symbol. Please try again.");
      return;
    }

    if (data["Note"]) {
      alert("API call frequency exceeded. Please wait a minute and try again.");
      return;
    }

    if (!data["Time Series (Daily)"]) {
      alert("Unexpected response format from API.");
      return;
    }

    const dailyData = data["Time Series (Daily)"];
    const labels = Object.keys(dailyData).slice(0, 30).reverse(); // Last 30 days
    const prices = labels.map(date => parseFloat(dailyData[date]["4. close"]));

    drawChart(ticker, labels, prices);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    alert("Failed to fetch stock data. Please check your internet connection and try again.");
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
