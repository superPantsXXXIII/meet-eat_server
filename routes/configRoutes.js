const indexR = require("./index");
const usersRouter = require("./users");
const eventsRouter = require("./events");
// const playersR = require("./players");
// const productsRouter = require("./products");


exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersRouter);
  app.use("/events",eventsRouter);
  // app.use("/players",playersR);
  // app.use("/api/products",productsRouter);
}