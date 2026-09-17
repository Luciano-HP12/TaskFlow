import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(
    `TaskFlow API ejecutándose en el puerto ${env.port} [${env.nodeEnv}]`
  );
});