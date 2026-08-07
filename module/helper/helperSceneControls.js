import { SYSTEM_ID } from "../config/uiConstants.js"
import helperContext from "./helperContext.js"
import helperSettings from "./helperSettings.js";
import helperTools from "./helperTools.js"
import helperDialog from "./helperDialog.js"
import tutTiendas from "../tutorial/tutTiendas.js"

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
                shopExample: {
                    button: true,
                    icon: "fas fa-shop",
                    name: "shopExample",
                    order: 1,
                    title: "Tutorial (Comercios)",
                    onClick: helperSceneControls._tutTiendas
                }                
                /*
                maintTool: {
                    button: true,
                    icon: "fas fa-tools",
                    name: "maintTool",
                    order: 1,
                    title: "Actualizar Hechizos",
                    onClick: helperSceneControls._maintTool
                }
                */
            },
            //activeTool: "maintTool"
        };        
    }

    /**
     * _maintTool
     */
    static async _maintTool() {
        const pack = game.packs.get('aquelarre.aq4_pack')
        const mDocs = (await pack.getDocuments()).filter(e => e.type === 'rasgo')
        mDocs.map(doc => {
            if (!doc.system.verguenza) return;
            //doc.update({"system.fuente": sFuente})
            const sImg = "systems/aquelarre/assets/img/aq/verguenza.png" //doc.img.replace('.jpg', '.png')
            doc.update({"img": sImg})
        })

    }

    /**
     * _tutTiendas
     */
    static async _tutTiendas() {
        tutTiendas.display()   
    }
}