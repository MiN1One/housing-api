const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readCurrencies = async () => {
  return JSON.parse(
    await promisify(fs.readFile)(
      path.join(__dirname, '../public/data/currency.json'),
      { encoding: 'utf-8' }
    )
  );
};

const parseCurrency = async (data) => {
  let { currency, from, to } = data;

  if (currency === 'usd') {
    return {
      from: from && from,
      to: to && to
    };
  }

  const { usd, eu } = await readCurrencies();

  if (currency === 'uzsom') {
    from = from && from / usd;
    to = to && to / usd;
  } else if (currency === 'eu') {
    from = from && from * eu / usd;
    to = to && to * eu / usd;
  }

  return {
    from: from && from,
    to: to && to
  };
};

const convertCurrency = async (currency, data) => {
  if (currency === 'usd') {
    return data;
  }

  const { usd, eu } = await readCurrencies();
  let newData = data.map(el => {

    el.price = el.price.map(p => {
      // for conversion to uzsom
      p = p * usd;

      if (currency === 'eu') {
        p = p / eu;
      }

      return (Math.round(p * 10) / 10).toFixed(2); 
    });

    return el;
  });

  return newData;
};

module.exports = {
  parseCurrency,
  convertCurrency
};