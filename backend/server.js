const dotenv = require('dotenv');
var path = require('path')
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");
const bodyParser = require("body-parser");
const cors = require('cors');
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
      "AfQr4zXNUvWfWYLpLEmI-Z9Ua_1rrS6AM3dlZY8whMLtgfK_ooSgzquYhH22r_mkRXTdESli6KTkMFWL",
  client_secret:
      "EP0jEjZpyDsDDOl36LKM4_C5BqEBNkvUNX7g_-GS8l6XuiO6p98snChFcWlUtoTXm3JTakGXvIRtMBq_"
});

dotenv.config();

const app = require('./app');
app.use(cors());
const dbVideoSharing = require('./config/database/db_index');

dbVideoSharing.connect();


app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");
const port = process.env.PORT || 9000;
const server= app.listen(port, () => {
  console.log('App listening to ' + port);
});
