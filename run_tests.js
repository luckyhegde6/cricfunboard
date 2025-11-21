const { exec } = require('child_process');
const fs = require('fs');

console.log("Starting unit tests...");
const unit = exec('npm run test:unit');
const unitStream = fs.createWriteStream('unit_test.log');
unit.stdout.pipe(unitStream);
unit.stderr.pipe(unitStream);

unit.on('exit', (code) => {
    console.log(`Unit tests exited with code ${code}`);
    console.log("Starting E2E tests...");
    const e2e = exec('npm run test:e2e');
    const e2eStream = fs.createWriteStream('e2e_test.log');
    e2e.stdout.pipe(e2eStream);
    e2e.stderr.pipe(e2eStream);
    
    e2e.on('exit', (code) => {
        console.log(`E2E tests exited with code ${code}`);
    });
});
