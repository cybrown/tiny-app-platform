const server = require("./lib/server");
const config = require("./lib/config");

const PORT = 3001;

server.listen(PORT, () => {
  config.log && console.log(`App listening on port ${PORT}`);
});
