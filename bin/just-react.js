#!/usr/bin/env node

const program = require("commander");
program
  .version(require("../package").version)
  .usage("<command> [options]")
  .command("init", "create a new react project.");
program.parse(process.argv);
