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
  let newData = [...data];

  if (currency === 'usd') {
    return newData;
  }

  const { usd, eu } = await readCurrencies();

  newData = newData.map(el => {
    el.price = el.price.map(p => p * usd);
    return el;
  });

  if (currency === 'eu') {
    newData = newData.map(el => {
      el.price = el.price.map(p => p / eu);
      return el;
    });
  }

  return newData;
};

module.exports = {
  parseCurrency,
  convertCurrency
};