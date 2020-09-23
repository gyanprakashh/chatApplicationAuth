const app = require("express")();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const { authorize } = require("./middlewares/auth");

require("dotenv").config({ path: "./.env" });

const { DATABASE_URL, NODE_ENV, NODE_PORT } = process.env;
const isDevelopement = NODE_ENV === "development";
const PORT = process.env.NODE_PORT || 8000;
if (isDevelopement) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
if (isDevelopement) {
  //developement mode
  app.use(cors());
  //production mode
  //app.use(cors({origin:CLIENT_URL,optionsSuccessStatus:200}));
}
app.options('*', cors()) 
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/api", authRoutes);
app.use("/api/users", authorize, userRoutes);

mongoose
  .connect(DATABASE_URL, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `DB ${DATABASE_URL} is connected and server is running at port ${PORT}- ${NODE_PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(`DB connection failed`);
  });
