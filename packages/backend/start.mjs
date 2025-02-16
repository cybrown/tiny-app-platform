import server from "./lib/server.mjs";
import config from "./lib/config.mjs";

const PORT = 3001;

server.listen(PORT, () => {
  config.log && console.log(`App listening on port ${PORT}`);
});
