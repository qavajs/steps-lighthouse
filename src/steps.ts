import { When, IWorld } from '@qavajs/core';
// @ts-ignore
const lighthouseModule = import('lighthouse').then(module => module.default);
// @ts-ignore
import type { Flags, Config } from 'lighthouse';
import { playwrightAdapter, wdioAdapter } from './adapter';
import {MemoryValue} from "@qavajs/core";

async function audit(world: IWorld, config?: Config) {
    const page = world.playwright
        ? playwrightAdapter(world.playwright.page)
        : await wdioAdapter(world.wdio.browser)
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
When('I perform lighthouse audit and save results as {value}', async function (resultsKey: MemoryValue) {
    const results = await audit(this);
    resultsKey.set(results.lhr);
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
When('I perform lighthouse audit and save results as {value}:', async function (resultsKey: MemoryValue, rawConfig: string) {
    const config = JSON.parse(await this.getValue(rawConfig));
    const results = await audit(this, config);
    resultsKey.set(results.lhr);
});

/**
 * Perform lighthouse audit with provided config
 * @example
 * When I perform lighthouse audit with '#lhConfig' and save results as 'lighthouseReport':
 */
When('I perform lighthouse audit with {value} config and save results as {value}', async function (configKey: MemoryValue, resultsKey: MemoryValue) {
    const results = await audit(this, await configKey.value());
    resultsKey.set(results.lhr);
});


