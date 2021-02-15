#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");

program
  .usage("<template-name> [project-name]")
  .option("-c, --clone", "use git clone");

/**
 * help documentation
 */
program.on("--help", () => {
  console.log("  FOR EXAMPLE: ");
  console.log();
  console.log(chalk.gray("  # Use template to create a new project."));
  console.log("  $just-react init fast my-project");
  console.log();
});

/**
 * If only just-react also will return help documentation
 */
function help() {
  program.parse(process.argv);
  if (program.args.length < 1) return program.help();
}
help();
