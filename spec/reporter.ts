import { DisplayProcessor, SpecReporter } from 'jasmine-spec-reporter';
import SuiteInfo = jasmine.SuiteInfo;

class TypescriptProcessor extends DisplayProcessor {
    public displayJasmineStarted(info: SuiteInfo, log: string): string {
        return `TypeScript ${log}`;
    }
}

const jasmineReporters = require('jasmine-reporters');

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
    customProcessors: [TypescriptProcessor]
}));
