import { SYSTEM_ID } from "../config/uiConstants.js"
import newTour from "../documents/tour.js"
import helperTours from "./helperTours.js"

export default class helperSettings {

    /**
     * register
     */
    static register() {

        game.settings.register(SYSTEM_ID, "rules", {
            name: "common.rules",
            hint: "tooltip.rules",
            scope: "world",
            config: true,
            type: String,
            default: 'aq3',
            requiresReload: true,
            choices: {
                "aq3": game.i18n.localize('RULES.aq3'),
                "aq4": game.i18n.localize('RULES.aq4'),
                "vyc": game.i18n.localize('RULES.vyc'),
            },            
        })

        game.settings.register(SYSTEM_ID, "userEdit", {
            name: "common.userEdit",
            hint: "tooltip.userEdit",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            requiresReload: true 
        })

        game.settings.register(SYSTEM_ID, "initTour", {
            name: "common.initTour",
            hint: "tooltip.initTour",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            requiresReload: true 
        }) 

        game.settings.register(SYSTEM_ID, "firstTime", {
            name: "common.firstTime",
            hint: "tooltip.firstTime",
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            requiresReload: true 
        })        
    }

    /**
     * registerTours
     */
    static async registerTours() {
        const oWelcomeTour = await new newTour(helperTours.welcome())
        await game.tours.register(SYSTEM_ID, "initTour", oWelcomeTour)
        if (game.settings.get(SYSTEM_ID, 'initTour')) {
            oWelcomeTour.start()
            game.settings.set(SYSTEM_ID, 'initTour', false)
        }
        
    }

    /**
     * getFirstTime
     * @returns 
     */
    static getFirstTime() {
        return game.settings.get(SYSTEM_ID,'firstTime');
    }

    /**
     * getUserEdit
     * @returns 
     */
    static getUserEdit() {
        return game.settings.get(SYSTEM_ID,'userEdit');
    }

}