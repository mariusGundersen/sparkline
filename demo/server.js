var express = require("express");

express().use(express.static(__dirname)).use(express.static(__dirname + '/../source')).listen(3000);
