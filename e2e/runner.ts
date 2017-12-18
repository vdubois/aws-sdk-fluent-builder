const Jasmine = require('jasmine');
const jasmineRunner = new Jasmine();

jasmineRunner.loadConfigFile('e2e/jasmine.json');
jasmineRunner.execute();
