import { When, IWorld } from '@cucumber/cucumber';
// @ts-ignore
const lighthouseModule = import('lighthouse').then(module => module.default);
// @ts-ignore
import type { Flags, Config } from 'lighthouse';
import { playwrightAdapter, wdioAdapter } from './adapter';
import memory from '@qavajs/memory';

declare global {
    var browser: any;
    var page: any;
    var config: any;
    var context: any;
}

async function audit(world: IWorld, config?: Config) {
    const page = global.page
        ? playwrightAdapter(global.page)
        : await wdioAdapter(global.browser)
    const lighthouse = await lighthouseModule;
    const flags: Flags =  { output: 'html' };
    const results = await lighthouse(page.url(), flags, config, page as any);
    if (!results) throw new Error(`Lighthouse audit report was not generated`);
    const reportHtml = results.report;
    world.attach(Buffer.from(reportHtml as string).toString('base64'), 'base64:text/html');
    return results;
}
/**
 * Perform lighthouse audit
 * @example
 * When I perform lighthouse audit and save results as 'lighthouseReport'
 */
When('I perform lighthouse audit and save results as {string}', async function (resultsKey) {
    const results = await audit(this);
    memory.setValue(resultsKey, results.lhr);
});

/**
 * Perform lighthouse audit with provided config
 * @example
 * When I perform lighthouse audit and save results as 'lighthouseReport':
 * """
 *     {
 *         "extends": "lighthouse:default",
 *         "settings": {
 *             "formFactor": "desktop",
 *             "screenEmulation": {
 *                 "mobile": false,
 *                 "width": 1350,
 *                 "height": 940,
 *                 "deviceScaleFactor": 1,
 *                 "disabled": false
 *             }
 *         }
 *     }
 * """
 */
When('I perform lighthouse audit and save results as {string}:', async function (resultsKey, rawConfig) {
    const config = JSON.parse(await memory.getValue(rawConfig));
    const results = await audit(this, config);
    memory.setValue(resultsKey, results.lhr);
});

/**
 * Perform lighthouse audit with provided config
 * @example
 * When I perform lighthouse audit with '#lhConfig' and save results as 'lighthouseReport':
 */
When('I perform lighthouse audit with {string} config and save results as {string}', async function (configKey, resultsKey) {
    const config = await memory.getValue(configKey);
    const results = await audit(this, config);
    memory.setValue(resultsKey, results.lhr);
});


