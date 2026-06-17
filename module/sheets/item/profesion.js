import { SYSTEM_ID } from "../../config/uiConstants.js"
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";

export default class sheetProfesion extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "profesion"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag]
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
    const context = await super._prepareContext()
    return context

  }

}