import { SYSTEM_ID } from "../../config/uiConstants.js"
import extendItem0Sheet from "../item.js";
import helperContext from "../../helper/helperContext.js";
import { aqConfig } from "../../config/config.js";
import { configRULES } from "../../config/rules.js";
import helperTools from "../../helper/helperTools.js";
import helperDialog from "../../helper/helperDialog.js";
import helperWizard from "../../helper/helperWizard.js";

export default class sheetProfesion extends extendItem0Sheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/item"
  static templateTag = "profesion"

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
      width: 1250,  
      height: 900
    },        
    actions: {
      _clearSkills: this.#onClearSkills,
      _clearChars: this.#onClearChars,
      _checkSelected: this.#onCheckSelected,
      _clickChar: this.#onClickChar,
      _assignStratos: this.#onAssignStratos
    },    
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  } 
  static TABS = {
    primary: {
      tabs: [ {id: "caracteristicas"}, {id: "competencias"}, {id: "descripcion"} ],
      initial: "caracteristicas"
    }
  }

  /**
   * _prepareContext
   * @override
   */
  async _prepareContext() {
    const rules = this.document.system.rules
    const context = await super._prepareContext()

    context.caracteristicas = helperContext.getCaracteristicas()
    context.competencias = await helperContext.getCompetenciasObject(rules)
    context.estratos = await helperContext.getEstratosExpanded(rules)

    var nIndex = 0
    for (var s in context.competencias) {
        context.competencias[s].index = nIndex
        nIndex++
    }
    nIndex = 0
    for (var s in context.estratos) {
        context.estratos[s].index = nIndex
        nIndex++
    }    

    context.tabs = this._prepareTabs("primary")
    return context

  }

  static async #onClearSkills(_event, target) {

    let mSkills = this.document.system.competencias
    mSkills.map(e => {
      e.primaria = false;
      e.secundaria = false;
      e.alternativa = false;
      e.grupo = '';
    })
    await this.document.update({"system.competencias": mSkills})
  }

  static async #onClearChars(_event, target) {

    let oSystem = this.document.system

    let mStratos = oSystem.estratos
    mStratos.map(e => {
      e.checked = false;
      e.ingresos = '';
      e.low = '';
      e.high = '';
    })
    await this.document.update({"system.estratos": mStratos})    

    for (var s in oSystem.caracteristicas) {
      oSystem.caracteristicas[s] = 0
    }
    await this.document.update({"system.caracteristicas": oSystem.caracteristicas})

  }

  static async #onCheckSelected(_event) {
    let competencias = this.document.system.competencias
    $(_event.target).parents('section.tab.active').find('._table').find('._row:visible').each((i,e) => {
      const key = $(e).find('input[type="hidden"]').val()
      const oComp = competencias.find(e2 => e2.key === key)
      const sGroup = $(_event.target).parent().find('#_setValue').val()
      if ($(_event.target).data('group') === 'primaria') oComp.primaria = true
      if ($(_event.target).data('group') === 'secundaria') oComp.secundaria = true
      if ( sGroup !== '') oComp.grupo = sGroup
    })
    this.document.update({ "system.competencias": competencias })
  }

  static async #onClickChar(_event) {
    if ( !this.document.sheet.isEditable || !this.document.sheet.isEditMode) return
    const sChar = "system.caracteristicas."+$(_event.target).data('char')
    this.document.update({ [sChar]: Number($(_event.target).data('value')) })
  }

  static async #onAssignStratos(_event) {
    if ( !this.document.sheet.isEditable || !this.document.sheet.isEditMode) return

    /**
     * Textos con el formato tabulado de tipo:  
     *    Alta Nobleza (Sociedad Cristiana) {skill alquimia} *20	  01-05
     *    Alta Nobleza (Sociedad Islámica)  {skill alquimia} *20	  01-05
     */

    const sContent = `<form id="_content">
                        <prose-mirror 
                            name="textStratos" 
                            value=""
                            style="flex: 1; border: 1px solid var(--color-border-dark);">
                        </prose-mirror>
                        <div class="_row _right">
                            <button class="_action" 
                                    type="button" 
                                    data-action="continue">${game.i18n.localize('common.continuar')}</button>
                        </div>
                      </form>`

      const form0 = this.document.sheet
      const item = this.document
      await foundry.applications.api.DialogV2.prompt({
          classes: ['_extend', '_wizard'],
          window: { title: '' },
          content: `<div class="_content">${sContent}</div>`,
          ok: {},
          render: (_event, dialog) => {
              helperDialog._setShadowToDialog(dialog)          
              helperDialog._setNoFooter(dialog)
              $(dialog.element).find('button[data-action="continue"]').on('click', (_event) => {
                  const form = $(form0.element).find('._main .tab.active')
                  const table = form.find('._table[data-path="system.estratos"]')
                  const editorElement = $(_event.currentTarget).parents('form').find('prose-mirror[name="textStratos"]')
                  let estratos = item.system.estratos
                  editorElement.val().replaceAll('<p>', '</p>').split('</p>').map(line => {
                    if (line.split('\t').length === 1) return
                    const sText = line.split('\t')[0].trim()
                    const sValue1 = line.split('\t')[1].trim()
                    const sValue2 = line.split('\t')[2].trim()
                    let row
                    table.find('._row').each((i,e) => {
                      if ($(e).find('label._stratoTitle').text().trim() === sText) row = $(e)
                    })
                    if (row) {
                        const sKey = row.find('input[type="hidden"]').val()
                        let _estrato = estratos.find(e => e.key === sKey)
                        row.find('input[data-field="checked"]').prop('checked', true)
                        row.find('input[data-field="ingresos"]').val(Number(sValue1))
                        row.find('input[data-field="low"]').val(Number(sValue2.split('-')[0]))
                        row.find('input[data-field="high"]').val(Number(sValue2.split('-')[1]))
                        _estrato.checked = true
                        _estrato.ingresos = sValue1
                        _estrato.low = Number(sValue2.split('-')[0])
                        _estrato.high = Number(sValue2.split('-')[1])
                    }
                  })
                  dialog.close()
                  item.update({"system.estratos": estratos})
              })
          }
      })

  }

}