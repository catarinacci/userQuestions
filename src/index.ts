import express, {Express, Application, Request, NextFunction, Response}  from "express";
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

dotenv.config();

//initializations
const app: Express = express();
const corsOptions = {
  //To allow requests from client
  origin: true,
  credentials: true,
  exposedHeaders: ["set-cookie"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
//settings
app.set('port', process.env.PORT || 3000);

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
    res.sendFile(path.join(__dirname, 'test.html'));
});

app.use('/api', userRoutes);
app.use('/api/payments', paymentRoutes);

app.listen(app.get('port'));
console.log('Server on port', app.get('port'))

app.use(errorHandler)