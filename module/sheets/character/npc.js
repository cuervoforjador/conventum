import { SYSTEM_ID } from "../../config/uiConstants.js"
import extendActorSheet from "../actor.js";

export default class extendCharacterNPCSheet extends extendActorSheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/character/"

  /** @override */
  static PARTS = {
    main:       { template: `${this.templateFolder}main.hbs` }
  }

}