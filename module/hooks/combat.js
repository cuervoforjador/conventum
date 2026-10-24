import { SYSTEM_ID, ACTOR_IMG, ACTOR_IMGvyc } from "../config/uiConstants.js"
import aqCombatLayer from "../documents/aqCombatLayer.js"

export default class hooksCombat {

    /**
     * activateCombatTracker
     * @param {*} combatTracker 
     */
    static activateCombatTracker(combatTracker) {
        aqCombatLayer.renderAQCombatLayer()
    }

    /**
     * deactivateCombatTracker
     * @param {*} combatTracker 
     */
    static deactivateCombatTracker(combatTracker) {
        aqCombatLayer.hideAQCombatLayer()
    }

    /**
     * renderCombatTracker
     * @param {*} combatTracker 
     * @param {*} data 
     * @param {*} options 
     */
    static renderCombatTracker(combatTracker, data, options) {

        /*
        const html = $(combatTracker.element)

        const miBoton = $(`<button class="mi-boton-custom">Mi Acción</button>`)
        
        miBoton.on("click", (event) => {
            console.log("¡Botón pulsado!")
        });

        html.find("#combat-controls").append(miBoton)
        */
    }

    /**
     * createCombat
     * @param {*} combat 
     * @param {*} options 
     * @param {*} sId 
     */
    static createCombat(combat, options, sId) {
        aqCombatLayer.renderAQCombatLayer()
    }

    /**
     * updateCombat
     * @param {*} combat 
     * @param {*} stats 
     * @param {*} options 
     * @param {*} sId 
     */
    static updateCombat(combat, stats, options, sId) {
        aqCombatLayer.renderAQCombatLayer()
    }
    
    /**
     * deleteCombat
     * @param {*} combat 
     * @param {*} stats 
     * @param {*} sId 
     */
    static deleteCombat(combat, stats, sId) {
        aqCombatLayer.hideAQCombatLayer()
    }    

    /**
     * createCombatant
     * @param {*} combat 
     * @param {*} options 
     * @param {*} sId 
     */
    static createCombatant(combat, options, sId) {

    }

    /**
     * updateCombatant
     * @param {*} combat 
     * @param {*} stats 
     * @param {*} options 
     * @param {*} sId 
     */
    static updateCombatant(combat, stats, options, sId) {

    }
    
    /**
     * deleteCombatant
     * @param {*} combat 
     * @param {*} stats 
     * @param {*} sId 
     */
    static deleteCombatant(combat, stats, sId) {

    }    

}