import helperContext from "../helper/helperContext.js";
import helperSheets from "../helper/helperSheets.js";
import helperMagia from "../helper/helperMagia.js";

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

  /**
   * _onChangeStepValue
   * @param {*} event 
   */
  static async _onChangeStepValue(event) {
    event.stopPropagation()
    const target = event.currentTarget
    const path = $(target).data('path'),
          key = $(target).data('key'), 
          step = $(target).data('step'),
          field = $(target).data('field'),
          type = $(target).data('type'),
          extra = $(target).data('extra')

    let mItems = this._access(this.actor, path)
    let index = mItems.findIndex(e => e.key === key)

    if (type === 'stat') {
      mItems[index][step][field] = Number($(target).val())
      if (mItems[index][step][field] > mItems[index][step][field+'Total'] ) mItems[index][step][field] = mItems[index][step][field+'Total']

      if (field === 'dias') mItems[index][step].semanas = Math.trunc(mItems[index][step].dias / 7)
      if (field === 'semanas') mItems[index][step].dias = mItems[index][step].semanas * 7
      mItems[index][step].percent = mItems[index][step].dias ? (mItems[index][step].dias / mItems[index][step].diasTotal) * 100 : 
                                    mItems[index][step].unidades ? (mItems[index][step].unidades / mItems[index][step].unidadesTotal) * 100 : 0

      mItems[index][step].completed = (mItems[index][step].percent === 100)
    }
    if (type === 'checkbox') {
      if (step !== '') mItems[index][step][field] = $(target).prop('checked')
                  else mItems[index][field] = $(target).prop('checked')
    }    

    await this.actor.update({[path]: mItems})
    if (extra === 'learn') {
      const item = this.actor.items.filter(e => e.type === 'hechizo').find(e => e.system.key === key)
      if (!item) return
      item.update({"system.aprendido": true})

      let mEstudio = this.actor.system.magia.estudio
      let nIndex = mEstudio.findIndex(e => e.key === $(target).data('key'))
      if (nIndex < 0) return
      mEstudio.splice(nIndex, 1)
      await this.actor.update({"system.magia.estudio": mEstudio})      
    }
  }

  /**
   * _onDropOver
   * @param {*} _event 
   * @param {*} ui 
   */
  static _onDropOver(_event, ui) {
    const target = _event.target
    const origin = ui.draggable
    $(target).addClass('_dragOver')
  }

  static _onDropOut(_event, ui) {
    const target = _event.target
    $(target).removeClass('_dragOver')
  }

  static _onDragStop(_event, ui) {
    const target = _event.target
    $(target).parents('._dropZone').find('._droppable').each((i, e) => { $(e).removeClass('_dragOver') })
  }

  static _onDrop(_event, ui) {
    const target = _event.target
    const itemId = ui.draggable.data('id')
    const item = this.document.items.get(itemId)
    if (!item) return 
    if ($(target).data('block') === 'preparacion') helperMagia.prepararHechizo(this.document, item)
    if ($(target).data('block') === 'estudio') helperMagia.estudiarHechizo(this.document, item)
    if ($(target).data('block') === 'preparacionEnsalmo') helperMagia.prepararEnsalmo(this.document, item)      
  }

  static _access(object, path) {
    let oReturn = object
    path.split('.').map(s => { oReturn = oReturn[s] })
    return oReturn
  }

}