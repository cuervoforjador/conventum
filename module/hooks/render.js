import { SYSTEM_ID } from "../config/uiConstants.js"
import hooksFolders from "./folders.js"

export default class hooksRender {

    /**
     * renderApplicationV2
     * @param {*} application 
     * @param {*} html 
     * @param {*} properties 
     * @param {*} options 
     */
    static renderApplicationV2(application, html, properties, options) {
        const sId = application.options.id.split('-')[0].toLowerCase()
        if (sId === 'compendium') hooksFolders.renderCompendium(application, html, properties, options)
    }

}