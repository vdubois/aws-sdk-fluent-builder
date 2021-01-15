const JasmineE2E = require('jasmine');
const jasmineRunnerE2E = new JasmineE2E({});

jasmineRunnerE2E.loadConfigFile('e2e/jasmine.json');
jasmineRunnerE2E.execute();
