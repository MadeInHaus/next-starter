import chalk from 'chalk';
import pkg from '../package.json' assert { type: 'json' };

const requiredNodeVersion = pkg.engines?.node;
const currentVersion = process.versions.node;

const requiredNodeVersionNumStr = requiredNodeVersion.replace(/[^\d.]/g, '');

const requiredNodeVersionWholeNumber = Math.floor(
    parseFloat(requiredNodeVersionNumStr)
);
const currentVersionWholeNumber = Math.floor(parseFloat(currentVersion));

if (!requiredNodeVersion) {
    console.warn(
        chalk.yellow.bold(
            '\nNo Node version specified in package.json. For more info, please visit https://docs.npmjs.com/cli/v8/configuring-npm/package-json#engines\n'
        )
    );
} else if (requiredNodeVersionWholeNumber !== currentVersionWholeNumber) {
    console.error(
        chalk.red.bold(
            `\nRequired Node version is ${requiredNodeVersion}, but you are using version ${currentVersion}. Please use Node Version Manager (nvm) to switch to a compatible version.\n`
        )
    );

    // Exit the process with a non-zero code to indicate failure
    process.exit(1);
} else {
    console.log(
        chalk.green.bold(`\nNode version ${currentVersion} is compatible 👍`)
    );
}
