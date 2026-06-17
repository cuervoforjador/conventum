import { SYSTEM_ID } from "../config/uiConstants.js";
import helperTools from "../helper/helperTools.js";
import helperContext from "../helper/helperContext.js";
import helperTables from "../helper/helperTables.js";
import helperSocket from "../helper/helperSocket.js";

export default class newRollTable extends RollTable {

  get isLore() { return this.flags.isLore?.value === true }
  get isSecuela() { return this.flags.isSecuela?.value === true }
  get rules() { return this.flags.rules?.value }
  get lore() { return this.flags.lore?.value }
  get actor() { return helperTools.getActor(this.flags.actorId?.value, this.flags.tokenId?.value) }

  /**
   * createDocuments
   * @param {*} data 
   * @param {*} operation 
   * @returns 
   */
  static async createDocuments(data=[], operation={}) {
    let document = await super.createDocuments(data, operation)
    return document
  }

  /**
   * draw
   * @param {*} options 
   * @returns 
   */
  async draw({roll, recursive=true, results=[], displayChat=true, messageMode, rollMode}={}) {

    const result = await super.draw(roll, recursive, results, displayChat, messageMode, rollMode)
    if (game.dice3d) await game.dice3d.showForRoll(result.roll)

    if (this.isLore) {
      const key = result.results[0].flags.key.value
      await helperContext.assignLoreToActor(this.rules, this.lore, this.actor, key)
      helperSocket.requestDeleteRollTable({
        actorId: this.actor.id,
        tokenId: helperTools.getTokenId(this.actor),
        stats: {tableId: this.id}
      })
      this._evaluateSecondRoll()
    }
    
    if (this.isSecuela) {
      const key = result.results[0].flags.key.value
      const secuela = (await helperContext.getFromCompendium(this.rules, 'secuela')).find(e => e.system.key === key)
      await helperContext.assignSecuelaToActor(this.actor, secuela)
      helperSocket.requestDeleteRollTable({
        actorId: this.actor.id,
        tokenId: helperTools.getTokenId(this.actor),
        stats: {tableId: this.id}
      })    
    }
    return result
  }

  /**
   * toMessage
   * @param {*} results 
   * @param {*} options 
   * @returns 
   */
  async toMessage(results, {roll, messageData={}, messageOptions={}}={}) {
    if (this.isLore) {
      messageData.flags = {
        isLore: {value: true},
        rules: {value: this.rules},
        lore: {value: this.lore}
      }
    }
    if (this.isSecuela) return

    const message = await super.toMessage(results, {roll, messageData, messageOptions})    
    return message    
  }

  /**
   * _evaluateSecondRoll
   */
  async _evaluateSecondRoll() {
    if (this.isLore && this.lore === 'estrato')
        await helperTables.tableLore(this.rules, 'posicion', this.actor)
  }

}