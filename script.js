const axios = require('axios');
const fs = require('fs');

async function fetchCryptocurrencyData() {
  try {
    const response = await axios.get('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': 'f9e2b35c-ffac-430f-85bf-b4f482e12234',
      },
    });

    // Create the CSV content
    const csvContent = [
      ['Name', 'Symbol', 'Price (USD)', 'Market Cap (USD)', 'Volume (24h USD)'], // Headers
    ];

    response.data.data.forEach(coin => {
      csvContent.push([
        coin.name,
        coin.symbol,
        coin.quote.USD.price,
        coin.quote.USD.market_cap,
        coin.quote.USD.volume_24h,
      ]);
    });

    // Write the CSV content to a file
    fs.writeFileSync('cryptocurrencies.csv', csvContent.map(row => row.join(',')).join('\n'));

    console.log('Cryptocurrency data has been saved to cryptocurrencies.csv');
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error.message);
  }
}

fetchCryptocurrencyData();