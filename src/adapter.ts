import type { Page, BrowserContext } from 'playwright';
import { readFileSync } from 'node:fs';

export function playwrightAdapter(page: Page & { target: Function }) {
    const protocol = JSON.parse(readFileSync('node_modules/devtools-protocol/json/browser_protocol.json', 'utf-8'));
    const events = protocol.domains.reduce((eventMap: any[], domain: any) => {
        if (!domain.events) return eventMap
        const types = domain.events.map((event: any) => `${domain.domain}.${event.name}`);
        return [...eventMap, ...types]
    }, []);
    page.target = function () {
        return {
            async createCDPSession() {
                const context: BrowserContext = page.context();
                const cdp: any = await context.newCDPSession.apply(context, [page]);
                cdp.id = function () {
                    return cdp._guid;
                };
                cdp.connection = function () {
                    return cdp._connection;
                }
                for (const eventName of events) {
                    cdp.on(eventName, (...event: any[]) => {
                        cdp.emit('*', eventName, ...event)
                    });
                }
                return cdp
            }
        }
    };
    return page
}

export async function wdioAdapter(browser: any) {
    if (!browser.getPuppeteer) {
        throw new Error('Protocol does not support puppeteer connection.\nTry to run via bidi driver');
    }
    const puppeteer = await browser.getPuppeteer();
    const pages = await puppeteer.pages();
    return pages.find((p: any) => p.url() !== 'data:,')
}
