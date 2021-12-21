import inquirer from 'inquirer';
import sh from 'shelljs';
import path from 'path';

const run = async () => {
    const dotNextPath = path.resolve(process.cwd(), '.next');
    const hasDotNext = sh.test('-d', dotNextPath);

    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    const hasNodeModules = sh.test('-d', nodeModulesPath);

    const packageLockPath = path.resolve(process.cwd(), 'package-lock.json');
    const hasPackageLock = sh.test('-f', packageLockPath);

    const yarnLockPath = path.resolve(process.cwd(), 'yarn.lock');
    const hasYarnLock = sh.test('-f', yarnLockPath);

    const {
        removeDotNext,
        removeNodeModules,
        removePackageLock,
        removeYarnLock,
    } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'removeDotNext',
            message: `Remove .next folder?`,
            when: hasDotNext,
            default: true,
        },
        {
            type: 'confirm',
            name: 'removeNodeModules',
            message: `Remove node_modules folder?`,
            when: hasNodeModules,
            default: true,
        },
        {
            type: 'confirm',
            name: 'removePackageLock',
            message: `Remove package-lock.json file?`,
            when: hasPackageLock,
            default: true,
        },
        {
            type: 'confirm',
            name: 'removeYarnLock',
            message: `Remove yarn.lock file?`,
            when: hasYarnLock,
            default: true,
        },
    ]);

    if (
        (!hasDotNext || !removeDotNext) &&
        (!hasNodeModules || !removeNodeModules) &&
        (!hasPackageLock || !removePackageLock) &&
        (!hasYarnLock || !removeYarnLock)
    ) {
        console.log('\nNothing to clean up.');
        return;
    }

    if (hasDotNext && removeDotNext) {
        sh.rm('-rf', dotNextPath);
    }
    if (hasNodeModules && removeNodeModules) {
        sh.rm('-rf', nodeModulesPath);
    }
    if (hasPackageLock && removePackageLock) {
        sh.rm(packageLockPath);
    }
    if (hasYarnLock && removeYarnLock) {
        sh.rm(yarnLockPath);
    }
};

run();
