import helperContext from "../helper/helperContext.js";

export default class sheetHandler {

  /**
   * _onChangeCharTotal
   * @param {*} event 
   */
  static async _onChangeCharTotal(event) {
    const target = event.currentTarget
    const char = target.name.split('.')[2]
    const path = "system.caracteristicas."+char+".value"
    await this.actor.update({[path]: target.valueAsNumber});
  }

  /**
   * _onChangeRrIrr
   * @param {*} event 
   */
  static async _onChangeRrIrr(event) {
    const target = event.currentTarget
    const char = target.name.split('.')[2]
    const antiChar = char === 'rr' ? 'irr' : 'rr'
    const path = "system.atributos."+antiChar+".value"
    const value = 100 - target.valueAsNumber
    await this.actor.update({[path]: value < 0 ? 0 : value });
  }

  /**
   * _onChangeSkillValue
   * @param {*} event 
   */
  static async _onChangeSkillValue(event) {
    const target = event.currentTarget
    const key = $(target).parents('._skill').data('key')
    let competencias = this.actor.system.competencias
    let skill = competencias.find(e => e.key === key)
    if (!skill) return

    skill.stats.value = $(target).val()
    this.actor.update({"system.competencias": competencias})
  }

  /**
   * _onChangeSkillCheck
   * @param {*} event 
   */  
  static async _onChangeSkillCheck(event) {
    const target = event.currentTarget
    const key = $(target).parents('._skill').data('key')
    let competencias = this.actor.system.competencias
    let skill = competencias.find(e => e.key === key)
    if (!skill) return

    skill.checked = $(target).prop('checked')
    this.actor.update({"system.competencias": competencias})
  }  

}