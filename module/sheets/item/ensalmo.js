import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";

export default class sheetEnsalmo extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "ensalmo"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
        width: 900
    },     
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  } 

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {
    const rules = this.document.system.rules
    const context = await super._prepareContext()    
    context.configRULES = configRULES[rules]

    context.niveles = helperContext.getEnsalmosNiveles(rules)
    context._textRequisitos = await extendItem0Sheet.textImplentation('propiedades.requisistos', this.document)
    context._textCeremonia = await extendItem0Sheet.textImplentation('propiedades.ceremonia', this.document)

    return context
  }

}