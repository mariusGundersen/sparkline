var connect = require("connect");

connect().use(connect.static(__dirname + '/demo')).use(connect.static(__dirname + '/source')).listen(8081);