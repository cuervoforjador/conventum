/**
 * Config...
 */

export class mainConfig {

    /**
     * Init Extend Configuration ...
     * @param {object} oConfig 
     */
    static init(oConfig) {
        oConfig.version10 = ( Math.floor(Number(game.version)) === 10 );
        oConfig.version11 = ( Math.floor(Number(game.version)) === 11 );
        return oConfig;
    }

    /**
     * translateConfig
     */
    static translateConfig() {
        let oConfig = CONFIG.ExtendConfig;

        //Armor Types
        oConfig.armorTypes.map(e => {
            e.name = game.i18n.localize(e.i18n)
        });
    }

}