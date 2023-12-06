export default class Memory {
    lhConfig = {
        extends: 'lighthouse:default',
        settings: {
            formFactor: 'desktop',
            screenEmulation: {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false
            }
        }
    }
}
