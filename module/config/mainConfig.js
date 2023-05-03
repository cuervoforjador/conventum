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

    static _renderCompendiumDirectory(tab, element, info) {
        HookCompendium._stylingLiCompendium(tab);
    }

}