const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (er) => {
  console.error(er);
  console.log('UNCAUGHT EXCEPTION! App is terminated.');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
// mongoose.connect(DB, {
mongoose.connect(process.env.DB_LOCAL, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
}).then(() => console.log('DB CONNECTED'));

const port = process.env.PORT || 3005;
const server = app.listen(port, () => console.log('LISTENING ON PORT ' + port));

process.on('unhandledRejection', (er) => {
  console.log('UNHANDLED REJECTION! Terminating...');
  server.close(() => {
    console.error(er);
    process.exit(1);
  });
});

// features: {
//   facilities: ["internet", "private_kitchen", "parking", "private_bath", "furnitured", "air_conditioner", "gaming_area", "washing_machine", "personal_computer", "public_libriary"],
//   others: ["Single bed", "Parking area"],
//   security: ["cctv", "health", "controlled_access", "card_access", "additional_keys"],
//   rules: ["no_smoking", "no_late_access"],
//   bills: ["water_bill", "internet_bill", "electricity_bill", "gas_bill", "heating_bill"],
//   places: ["market", "school", "libriary", "restaurant", "hospital", "bus_station"]
// }