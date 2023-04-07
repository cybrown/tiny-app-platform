const server = require("./lib/server");

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
