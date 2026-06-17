const { HandlebarsApplicationMixin } = foundry.applications.api
export default class sheetTableExtend
             extends foundry.applications.sheets.RollTableSheet {

  static DEFAULT_OPTIONS = {
    classes: ["_extend"]
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options)    
    this._addClasses()
    this._hideTitle()
    
    //Lore
    if (this.document.isLore && this.document.rules === 'vyc') {
      $(this.element).find('.window-content table tr').each((i,e) => {
        const src = $(e).find('td.image img').attr('src')
        $(e).find('td.image').remove()
        $(e).find('td.details').append(`<div class="_watermark" style="background: url(${src})"></div>`)
      })
    }
    if (this.document.isLore && !game.user.isActiveGM) this._removeEditButtons()

    //Secuelas
    if (this.document.isSecuela && !game.user.isActiveGM) this._removeEditButtons()
  }  

  _removeEditButtons() {
      $(this.element).find('.window-content table tr').each((i,e) => {
        $(e).find('td.controls').find('button').each((i2,e2) => {$(e2).remove()})
      })
      $(this.element).find('.window-content button[data-action="changeMode"]').remove()
      $(this.element).find('.window-content button[data-action="resetResults"]').remove()    
  }

  _addClasses() {
    if (this.document.isLore) {
        $(this.element).addClass('_extend')
        $(this.element).addClass('_lore')
        $(this.element).addClass('_'+this.document.rules)
    }
    if (this.document.isSecuela) {
        $(this.element).addClass('_extend')
        $(this.element).addClass('_secuela')
        $(this.element).addClass('_'+this.document.rules)
    }    
  }

  _hideTitle() {
        $(this.element).find('.window-title').hide();    
  }

}