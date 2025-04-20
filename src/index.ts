import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import "./database"
import cors from "cors"
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import path from "path";
import userRoutes from "./routes/user";
import paymentRoutes from "./routes/payment";
import { errorHandler } from "./middlewares/errorHandler";
import { engine } from 'express-handlebars';

dotenv.config();

//initializations
const app = express();
const corsOptions = {
  //To allow requests from client
  origin: true,
  credentials: true,
  exposedHeaders: ["set-cookie"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
//settings
app.set('port', process.env.PORT || 3000);
app.engine('handlebars', engine({
  helpers: {
    json: function(context:any) {
      return JSON.stringify(context, null, 2);
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'templates'));


//middleware
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    preserveExtension: true,
    createParentPath: true,
  })
);

//routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates/mercadoPago/index.html'));
});
app.get('/payment/success', (req, res) => {
  const paymentData = {
    query: req.query,
  };
  res.render('mercadoPago/success', { paymentData });
});
 app.get('/payment/failure', (req, res) => {
  const paymentData = {
    query: req.query,
  };
  res.render('mercadoPago/failure', { paymentData });
});
app.get('/payment/pending', (req, res) => {
  const paymentData = {
    query: req.query,
  };
  res.render('mercadoPago/pending', { paymentData });
});

app.use('/api', userRoutes);
app.use('/api/payments', paymentRoutes);

app.listen(app.get('port'));
console.log('Server on port', app.get('port'))

app.use(errorHandler)