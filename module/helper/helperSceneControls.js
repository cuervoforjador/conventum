import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "./helperContext.js"

export default class helperSceneControls {

    /**
     * getSceneControlButtons
     * @param {*} controls 
     */
    static getSceneControlButtons(controls) {
        //return;

        controls.aquelarre = {
            name: "aquelarre",
            title: game.i18n.localize('common.aquelarre'),
            icon: "fas fa-ram",
            layer: "controls",
            visible: game.user.isGM,
            tools: {
                maintTool: {
                    button: true,
                    icon: "fas fa-tools",
                    name: "maintTool",
                    order: 1,
                    title: "Actualizar Hechizos",
                    onClick: helperSceneControls._maintTool
                }
            },
            //activeTool: "maintTool"
        };        
    }

    /**
     * _maintTool
     */
    static async _maintTool() {
        const pack = game.packs.get('aquelarre.aq3_pack')
        const mDocs = (await pack.getDocuments()).filter(e => e.type === 'competencia')
        mDocs.map(doc => {
            
            //doc.update({"system.fuente": sFuente})
            const sImg = "systems/aquelarre/assets/img/aq/skills.png" //doc.img.replace('.jpg', '.png')
            doc.update({"img": sImg})
        })

    }

}