import chalk from 'chalk';
import sh from 'shelljs';

sh.config.silent = true;

const run = async () => {
    console.log(chalk.yellow.bold('Checking if NVM is installed... \n'));

    // Check for existence of NVM
    if (sh.exec('nvm')) {
        console.log(chalk.green.bold('NVM is installed!'));
        // Run nvm use
        sh.exec('nvm use');
    } else {
        console.log(chalk.red.bold('NVM is not installed!'));
    }
};

run();
