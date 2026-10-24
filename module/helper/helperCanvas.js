import { SYSTEM_ID } from "../config/uiConstants.js"
import helperSettings from "./helperSettings.js";
import helperTools from "./helperTools.js"
import aqCombatLayer from "../documents/aqCombatLayer.js";

export default class helperCanvas {

    /**
     * canvasReady
     * @param {*} canvas 
     */
    static canvasReady(canvas) {
        $("#aqCombatLayer").remove()
        
        const $layer = $('<div id="aqCombatLayer"></div>')
        $("#board").after($layer)
        aqCombatLayer.refreshLayer(canvas.stage.position, canvas.stage.scale.x)
    }

    /**
     * canvasPan
     * @param {*} canvas 
     * @param {*} view 
     */
    static canvasPan(canvas, view) {
        aqCombatLayer.refreshLayer(view, view.scale)
    }

    /**
     * collapseSidebar
     * @param {*} sideBar 
     * @param {*} collapse 
     */
    static collapseSidebar(sideBar, collapse) {
        if (sideBar.tabGroups?.primary === 'combat') {
            aqCombatLayer.renderAQCombatLayer()
        }
    }

}