function calculateInvestment() {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseInt(document.getElementById('years').value);
  const growthRate = 0.08; // Assume 8% average return
  const futureValue = amount * Math.pow(1 + growthRate, years);
  document.getElementById('results').innerText = 
    `Estimated value after ${years} years: $${futureValue.toFixed(2)}`;
}

async function fetchStockData(ticker) {
  // Mock data; replace with live API call
  const labels = ['2020', '2021', '2022', '2023', '2024'];
  const data = [100, 120, 140, 130, 150];

  const ctx = document.getElementById('stockChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${ticker} Stock Price`,
        data: data,
        borderColor: 'green',
        fill: false,
      }]
    }
  });
}

// Optional: call fetchStockData when ticker input changes
document.getElementById('ticker').addEventListener('blur', () => {
  const ticker = document.getElementById('ticker').value.toUpperCase();
  fetchStockData(ticker);
});
