import { SYSTEM_ID } from "../config/uiConstants.js"
import { configRULES } from "../config/rules.js"
import { aqConfig } from "../config/config.js"

export default class helperHandlebars {

/**
 * define
 */
static define() {

    //concat
    Handlebars.registerHelper("concat", (...args) => args.slice(0, -1).join(""))
    Handlebars.registerHelper("or", (...args) => args.slice(0, -1).some(Boolean))
    Handlebars.registerHelper("array", (...args) => args.slice(0, -1))

    Handlebars.registerHelper("and", (a, b) => a && b)
    Handlebars.registerHelper("eq", (a, b) => a === b)
    Handlebars.registerHelper("gt", (a, b) => a > b)
    Handlebars.registerHelper("gte", (a, b) => a >= b)
    Handlebars.registerHelper("lt", (a, b) => a < b)
    Handlebars.registerHelper("lte", (a, b) => a <= b)
    
    Handlebars.registerHelper("neg", n => -n)
    Handlebars.registerHelper("not", n => !n)
    Handlebars.registerHelper("abs", n => Math.abs(n))
    Handlebars.registerHelper("add", (a, b) => a + b)
    Handlebars.registerHelper("rest", (a, b) => a - b)
    Handlebars.registerHelper("mult", (a, b) => a * b)
    Handlebars.registerHelper("zeros", (v, n) => {
        const pad = new Array(1 + n).join('0')
        return (pad+v).slice(-pad.length);
    })
    Handlebars.registerHelper("toUpperCase", (a) => a.toUpperCase())

    Handlebars.registerHelper("assets", () => 'systems/'+SYSTEM_ID+'/assets')

    Handlebars.registerHelper("_disabled", (...args) => {
        const isEditable = args[0].data.root.isEditable
        return (isEditable) ? '' : 'disabled="disabled"'
    })   

    Handlebars.registerHelper("translate", (key, docs) => {
        return Object.keys(docs).map((key) => docs[key]).find(e => e.key === key)?.label
    })

    Handlebars.registerHelper("_value", (...args) => {
        const sPath = args.slice(0, -1).join('.')
        let oData = args[args.length - 1].data.root
        sPath.split('.').map(s => { oData = oData[s]})
        return oData
    })    

    Handlebars.registerHelper("navTab", (...args) => {
        const group = args[0]
        const tabs = args[1]
        const sClass = args[2] ? args[2] : ''
        let links = "";
        tabs.map(tab => {
            links += `<a data-action="tab" data-group="${group}" data-tab="${tab}">${game.i18n.localize('common.'+tab)}</a>`
        })
        return `<nav class="tabs ${sClass}" data-group="${group}">${links}</nav>`
    })   

    Handlebars.registerHelper("checkButton", (...args) => {
        const path = args[0]
        const tooltip = game.i18n.localize(args[1])
        const icon = args[2]
        const document = args.length > 4 ? args[3] : args[3].data.root
        const isEditable = document.isEditable        
        let property = document;
        path.split('.').map(s => {property = property[s]})

        return `<input name="${path}" 
                    style="display: none"
                    type="checkbox"
                    ${property ? " checked " : ""} /> 
                <button type="button" 
                        class="icon fas ${icon} ${property ? "_checked" : ""}" 
                        ${isEditable ? 'data-action="_checkButton"' : 'disabled="disabled"'}
                        data-path="${path}"
                        data-tooltip="${tooltip}"
                        aria-label="${tooltip}">
                </button>`;
    })

    Handlebars.registerHelper("sheetRules", (root) => {
        const document = root.data.root
        return game.i18n.localize('RULES.'+document.system.rules)
    })    

    Handlebars.registerHelper("isCharVisible", (key, root) => {
        const document = root.data.root
        const rules = document.system.rules
        if (configRULES[rules].chars.find(e => e === key)) return true
                                                           return false
    })

    Handlebars.registerHelper("skillsRenderColumn", (options, index, root) => {
        const nSkills = root.data.root.skills.length
        const nColumns = options.columns
        const nSxC = Math.trunc(nSkills / nColumns)
        const rIndex = Math.trunc(index / nSxC) + 1
        return rIndex === 0 ? 1 : rIndex > nColumns ? nColumns : rIndex
    })    

    Handlebars.registerHelper("skillsStatus", (skill, root) => {
        const rules = root.data.root.system.rules
        const s = aqConfig.skills.status.find(s => skill[s])
        return "systems/"+SYSTEM_ID+"/assets/ui/"+rules+'_comp_'+s+'.png'
    })      

}
}