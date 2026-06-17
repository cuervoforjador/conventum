import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";

export default class sheetPueblo extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "pueblo"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag]
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  }  
  static TABS = {
    primary: {
      tabs: [ {id: "estratos"}, {id: "idiomas"}, {id: "descripcion"} ],
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
    context.sociedades = await helperContext.getSociedades(rules)
    context.pueblos = await helperContext.getPueblos(rules)
    context.estratos = await helperContext.getEstratos(rules)
    context.idiomas = await helperContext.getIdiomas(rules)
    
    
    context.configRULES = configRULES[rules]
    context.tabs = this._prepareTabs("primary")
    return context
  }

}