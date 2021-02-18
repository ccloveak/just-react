#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const symbols = require('log-symbols');
const chalk = require('chalk');

program
    .version(require('../package').version)
    .command('init <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer
                .prompt([
                    {
                        name: 'description',
                        message: 'Please input description: ',
                    },
                    {
                        name: 'author',
                        message: 'Please input author: ',
                    },
                ])
                .then((answers) => {
                    const spinner = ora('Downloading...');
                    spinner.start();
                    download('ccloveak/react-cli#main', name, { clone: true }, (err) => {
                        if (err) {
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            spinner.succeed();
                            const fileName = `${name}/package.json`;
                            const meta = {
                                name,
                                description: answers.description,
                                author: answers.author,
                            };
                            if (fs.existsSync(fileName)) {
                                const content = fs.readFileSync(fileName).toString();
                                const result = handlebars.compile(content)(meta);
                                fs.writeFileSync(fileName, result);
                            }
                            console.log(
                                symbols.success,
                                chalk.green('Project initialization completed.'),
                            );
                        }
                    });
                });
        } else {
            console.log(symbols.error, chalk.red('Project already exist.'));
        }
    });
program.parse(process.argv);
