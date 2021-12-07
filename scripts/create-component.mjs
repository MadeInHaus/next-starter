import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import sh from 'shelljs';
import path from 'path';
import fs from 'fs';

import {
    uiComponentJS,
    uiComponentSCSS,
    uiComponentIndex,
} from './templates/ui-component.mjs';

import {
    pageComponentRoute,
    pageComponentJS,
    pageComponentSCSS,
    pageComponentIndex,
} from './templates/page-component.mjs';

sh.config.silent = true;

const uiComponentScaffold = async () => {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Name:',
            validate: name =>
                !!name.match(/^[A-Z][A-Za-z0-9]*$/) ||
                'Component name must be in CamelCase',
        },
    ]);
    const dir = path.resolve(process.cwd(), 'components', 'ui', name);
    if (sh.ls(dir).find(file => file === `${name}.js`)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `components/ui/${name}/${name}.js exists. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwrite) {
            return;
        }
    }

    sh.mkdir('-p', dir);

    const js = new sh.ShellString(uiComponentJS(name));
    const scss = new sh.ShellString(uiComponentSCSS());
    const index = new sh.ShellString(uiComponentIndex(name));

    js.to(path.resolve(dir, `${name}.js`));
    scss.to(path.resolve(dir, `${name}.module.scss`));
    index.to(path.resolve(dir, `index.js`));

    const check = chalk.green.bold('✓');
    console.log('\nFiles written:');
    console.log(`- components/ui/${name}/index.js ${check}`);
    console.log(`- components/ui/${name}/${name}.js ${check}`);
    console.log(`- components/ui/${name}/${name}.module.scss ${check}\n`);
};

const pageComponentScaffold = async () => {
    const routeExamples = ['index', 'about', 'books/[id]', 'blog/[...rest]'];
    const routeExamplesText = routeExamples.map(r => chalk.green(r)).join(', ');
    const { route, name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'route',
            message: 'Route:',
            validate: route =>
                !!route.match(/^[a-z0-9\-\/\[\]\.]+$/) ||
                `Examples of routes: ${routeExamplesText}`,
        },
        {
            type: 'input',
            name: 'name',
            message: 'Name:',
            validate: name =>
                !!name.match(/^[A-Z][A-Za-z0-9]*$/) ||
                'Component name must be CamelCased',
        },
    ]);
    const routeFile = route.match(/\.js$/) ? route : `${route}.js`;
    const routePath = path.resolve(process.cwd(), 'pages', routeFile);
    if (sh.test('-f', routePath)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `pages/${routeFile} exists. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwrite) {
            return;
        }
    }
    const compDir = path.resolve(process.cwd(), 'components', 'pages', name);
    if (sh.ls(compDir).find(file => file === `${name}.js`)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `components/pages/${name}/${name}.js exists. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwrite) {
            return;
        }
    } else {
        sh.mkdir('-p', compDir);
    }

    const routeFileParts = routeFile.split('/');
    routeFileParts.pop();
    if (routeFileParts.length) {
        const routeFileDir = routeFileParts.join('/');
        sh.mkdir('-p', path.resolve(process.cwd(), 'pages', routeFileDir));
    }
    fs.writeFileSync(routePath, pageComponentRoute(name));

    const js = new sh.ShellString(pageComponentJS(name));
    const scss = new sh.ShellString(pageComponentSCSS());
    const index = new sh.ShellString(pageComponentIndex(name));

    js.to(path.resolve(compDir, `${name}.js`));
    scss.to(path.resolve(compDir, `${name}.module.scss`));
    index.to(path.resolve(compDir, `index.js`));

    const check = chalk.green.bold('✓');
    console.log('\nFiles written:');
    console.log(`- pages/${routeFile} ${check}`);
    console.log(`- components/pages/${name}/index.js ${check}`);
    console.log(`- components/pages/${name}/${name}.js ${check}`);
    console.log(`- components/pages/${name}/${name}.module.scss ${check}\n`);
};

const run = async () => {
    console.log(
        chalk.yellow(
            figlet.textSync('HAUS', {
                font: 'Elite',
                horizontalLayout: 'default',
                verticalLayout: 'default',
            })
        )
    );
    console.log(chalk.yellow.bold('  Component Scaffolder\n'));

    const { type } = await inquirer.prompt([
        {
            type: 'list',
            name: 'type',
            message: 'Type:',
            choices: ['ui', 'page'],
            default: 'ui',
        },
    ]);

    switch (type) {
        case 'ui':
            await uiComponentScaffold();
            break;
        case 'page':
            await pageComponentScaffold();
            break;
    }
};

run();
