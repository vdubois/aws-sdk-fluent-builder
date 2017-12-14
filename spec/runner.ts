const Jasmine = require('jasmine');
const jasmineRunner = new Jasmine();

jasmineRunner.loadConfigFile('spec/jasmine.json');
jasmineRunner.execute();
