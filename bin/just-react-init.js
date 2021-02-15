#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const exists = require('fs').existsSync;
const rm = require('rimraf').sync;
const path = require('path');
const home = require('user-home');
const logger = require('../lib/logger');
const { isLocalPath, getTemplatePath } = require('../lib/local-path');
const generate = require('../lib/generate');
const ora = require('ora');

/**
 * If finally i have only one template i will delete <template-name>
 */
program.usage('<template-name> [project-name]').option('-c, --clone', 'use git clone');

/**
 * Help Documentation
 */
program.on('--help', () => {
    console.log();
    console.log('FOR EXAMPLE: ');
    console.log(chalk.gray('  # Use template to create a new project.'));
    console.log('  `$just-react init fast my-project`');
    console.log();
});

/**
 * If only input just-react also will return help documentation
 */
function help() {
    program.parse(process.argv);
    if (program.args.length < 1) return program.help();
}
help();

/**
 * Settings.
 */
// 模板名是什么
let template = program.args[0];
// 用户指定的项目名
const rawName = program.args[1];
// 是否在当前目录
const inPlace = !rawName || rawName === '.';
// 最终项目名
const name = inPlace ? path.relative('../', process.cwd()) : rawName;
// 项目生成目录
const to = path.resolve(rawName || '.');
// 是否使用git clone来下载私有仓库
const clone = program.clone || false;
// 模板下载目录
const tmp = path.join(home, '.just-templates', template.replace(/[\/:]/g, '-'));

/**
 * Padding.
 */

console.log();
process.on('exit', () => {
    console.log();
});

// 询问用户是否是在当前目录下创建项目; 如果目录已经存在提示已存在
if (inPlace || exists(to)) {
    inquirer
        .prompt([
            {
                type: 'confirm',
                message: inPlace ? '在当前目录创建项目？' : '目录已经存在，仍要继续？',
                name: 'ok',
            },
        ])
        .then((answers) => {
            if (answers.ok) {
                run();
            }
        })
        .catch(logger.fatal);
} else {
    run();
}

/**
 * 检查、下载、生成项目.
 */

function run() {
    //  检查是不是本地模板
    if (isLocalPath(template)) {
        const templatePath = getTemplatePath(template);
        if (exists(templatePath)) {
            generate(name, templatePath, to, (err) => {
                if (err) logger.fatal(err);
                console.log();
                logger.success('"%s" 创建成功.', name);
            });
        } else {
            logger.fatal('未找到本地模板 "%s" .', template);
        }
    } else {
        // 远程模板，需要先下载
        downloadAndGenerate(template);
    }
}

/**
 * 从模板仓库下载模板，并生成项目
 *
 * @param {String} template
 */
function downloadAndGenerate(template) {
    const spinner = ora('模板下载中，请稍等···');
    spinner.start();

    // 删除本地缓存的模板
    if (exists(tmp)) rm(tmp);
    download(template, tmp, { clone }, (err) => {
        spinner.stop();
        if (err) {
            logger.fatal('模板' + template + '下载失败' + ': ' + err.message.trim());
        }
        generate(name, tmp, to, (err) => {
            if (err) logger.fatal(err);
            console.log();
            logger.success('"%s" 创建成功.', name);
        });
    });
}
