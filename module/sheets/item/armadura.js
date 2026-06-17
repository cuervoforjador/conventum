import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";
import helperSheets from "../../helper/helperSheets.js";

export default class sheetArmadura extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "armadura"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        width: 700
    }, 
    actions: {
      _skillsByChar:    this.#onAddSkills
    }      
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  } 
  static TABS = {
    primary: {
      tabs: [ {id: "localizaciones"}, {id: "penalizaciones"}, {id: "descripcion"} ],
      initial: "descripcion"
    }
  }  

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {
    const rules = this.document.system.rules
    const context = await super._prepareContext()
    context.configRULES = configRULES[rules]
   
    context.tipos = await helperContext.getArmadurasTiposSheet(rules)
    context.localizacionesTipos = await helperContext.getLocalizacionesTipos(rules)
    context.localizaciones = await helperContext.getLocalizacionesPartes(rules, this.document.system.localizacion)
    context.competencias = await helperContext.getCompetenciasObject(rules)
    context.caracteristicas = helperContext.getCaracteristicas()

    context.tabs = this._prepareTabs("primary")
    return context

  }

  /**
   * _onRender
   * @param {*} context 
   * @param {*} options 
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options)   
    const item = this.document 
    $(this.element).find('._borrame').on("click", (event) => {
      item.update({"system.resistenciaTotal": this.document.system.resistencia,
                   "system.enUso": true})
    })
  }

  /**
   * onAddSkills
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onAddSkills(_event, target) {
    const sChar = $(target).parents('._row').find('select').find(':selected').val()
    const value = $(target).parents('._row').find('input').val()
    const rules = this.document.system.rules
    const competencias = await helperContext.getCompetencias(rules)
    let mPenalizaciones = this.document.system.penalizaciones
    competencias.filter(e => e.system.caracteristica === sChar).map(comp => {
      let penal = mPenalizaciones.find(o => o.key === comp.system.key)
      if (penal) penal.penal = value
            else mPenalizaciones.push({key: comp.system.key, penal: value})
    })
    await this.document.update({"system.penalizaciones": mPenalizaciones})
  }

}