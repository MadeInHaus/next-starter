import chalk from 'chalk';
import sh from 'shelljs';

sh.config.silent = true;

const run = async () => {
    console.log(
        chalk.yellow.bold(
            'Checking if Node Version Manager (nvm) is installed... \n'
        )
    );

    // Check for existence of nvm
    if (sh.exec('nvm')) {
        console.log(chalk.green.bold('nvm is installed!'));
        // Run `nvm use`
        sh.exec('nvm use');
    } else {
        console.log(
            chalk.red.bold(
                'nvm is not installed! Please install it: https://github.com/nvm-sh/nvm#installing-and-updating '
            )
        );
    }
};

run();
