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

        //Weapon Types
        oConfig.weaponTypes.map(e => {
            e.name = game.i18n.localize(e.i18n)
        });        

        //Weapon Sizes
        oConfig.weaponSizes.map(e => {
            e.name = game.i18n.localize(e.i18n)
        });     
        
        //Spell shapes
        oConfig.spellShapes.map(e => {
            e.name = game.i18n.localize("shape."+e.id)
        });     
        
        //Spell Natures
        oConfig.spellNature.map(e => {
            e.name = game.i18n.localize("nature."+e.id)
        });     
        oConfig.spellSecondNature.map(e => {
            e.name = game.i18n.localize("nature."+e.id)
        });   
        
        //Components
        oConfig.componentUtility.map(e => {
            e.name = game.i18n.localize("component."+e.id)
        });       
        oConfig.componentLocation.map(e => {
            e.name = game.i18n.localize("component."+e.id)
        });           
        oConfig.componentPotential.map(e => {
            e.name = game.i18n.localize("component."+e.id)
        });    
        oConfig.componentPlace.map(e => {
            e.name = game.i18n.localize("component."+e.id)
        });        

    }

}