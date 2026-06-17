import { SYSTEM_ID } from "../../config/uiConstants.js"
import { configRULES } from "../../config/rules.js";
import { aqConfig } from "../../config/config.js";
import extendActorSheet from "../actor.js";
import helperContext from "../../helper/helperContext.js";
import helperSheets from "../../helper/helperSheets.js";
import helperDialog from "../../helper/helperDialog.js";
import helperTables from "../../helper/helperTables.js";
import sheetHandler from "../handler.js";
import helperTools from "../../helper/helperTools.js";
import helperSettings from "../../helper/helperSettings.js";

export default class extendCharacterSheet extends extendActorSheet {

  static templateFolder = "systems/"+SYSTEM_ID+"/templates/character"
  static templateTag = "character"  

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['_'+this.templateTag],
    position: { 
      width: 1000, 
      height: 800 
    },
    actions: {
      _editLore:              this.#onEditLore,
      _showStatus:            this.#onShowStatus,
      _changeSkillStatus:     this.#onChangeSkillStatus,
      _resetAttr:             this.#onResetAttributes,
      _hitsPoints:            this.#onClickHitsPoints,
      _navToSkill:            this.#onNavToSkill,
      _navToItem:             this.#onNavToItem,
      _showPenals:            this.#onShowPenals
    }    
  }

  /** @override */
  static PARTS = {
    header: { template: `${this.templateFolder}/headers/${this.templateTag}.hbs` },
    main: { template: `${this.templateFolder}/main/${this.templateTag}.hbs` }
  }
  static TABS = {
    primary: {
      tabs: [ {id: "stats"}, {id: "combate"} ],
      initial: "stats"
    },
    stats: {
      tabs: [ {id: "principal"}, {id: "rasgos"} ],
      initial: "principal"
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

    context.caracteristicas = helperContext.getCaracteristicas()

    context.info = {...context.info, ...helperSheets.readLoreContext(this.document)}
    context.m10 = helperTools.numberArray(10)
    context.m20 = helperTools.numberArray(20)

    await helperSheets.checkSkills(this.document)
    context.skills = helperSheets.systemSkills(this.document)
    context.secuelas = helperSheets.itemsSecuelas(this.document, rules)
    context.orgullos = helperSheets.itemsOrgullos(this.document, rules)
    context.verguenzas = helperSheets.itemsVerguenzas(this.document, rules)
    context.weapons = helperSheets.itemsWeapons(this.document, rules)
    context.armors = helperSheets.itemsArmors(this.document, rules)
    context.shields = helperSheets.systemShields(this.document, rules)
    
    context.tabs = this._prepareTabs("primary")
    context.tabsStats = this._prepareTabs("stats")

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
    this.activateListeners($(this.element))
    this.activateFirstTime()
  }


  /**
   * activateListeners
   * @param {*} html 
   */
  activateListeners(html) {
    super.activateListeners(html)

    if ( !this.isEditable || !this.isEditMode) return;

    html.find('._charTotal').on("change", sheetHandler._onChangeCharTotal.bind(this))
    html.find('._charRR').on("change", sheetHandler._onChangeRrIrr.bind(this))
    html.find('._charIRR').on("change", sheetHandler._onChangeRrIrr.bind(this))
    html.find('._skillValue').on("change", sheetHandler._onChangeSkillValue.bind(this))
    html.find('._skillCheck').on("change", sheetHandler._onChangeSkillCheck.bind(this))
  }  

  /**
   * activateFirstTime
   */
  activateFirstTime() {
    if (!helperSettings.getFirstTime()) return

    if ($(this.element).find('._fog').length === 0) 
        $(this.element).prepend(`<div class="_fog"></div>`)
    if ($(this.element).find('._fog').find('._explain').length === 0) 
        $(this.element).find('._fog').prepend(this._lineFirstTime(this._firstTimeStep, this._firstTimeStep === '03'))

    $(this.element).find('._fog ._buttons button._next').on('click', _event => {
      _event.stopPropagation()
      $(this.element).find('._explain._firstTime'+this._firstTimeStep).remove()
      $(this.element).find('._boxPointer._firstTime'+this._firstTimeStep).remove()
      this._firstTimeStep = '0' + (Number($(_event.target).data('current')) + 1)
      this.document.sheet.render(true)
    })

    $(this.element).find('._fog ._buttons button._close').on('click', async _event => {
      _event.stopPropagation()
      await game.settings.set(SYSTEM_ID, 'firstTime', false)
      $(this.element).find('._fog').remove()
      this.document.sheet.render(true)
    })    
  }

  _lineFirstTime(sCount, bLast) {
    return `<div class="_explain _firstTime${sCount}">
              ${game.i18n.localize('explain.firstTime'+sCount)}
              <div class="_buttons">                
                <button type="button" class="_close" data-current="${sCount}">${game.i18n.localize('common.abandonar')}</button>
                ${!bLast ? `<button type="button" class="_next" data-current="${sCount}">${game.i18n.localize('common.continuar')}</button>` : ''}                
              </div>              
            </div>
            <div class="_boxPointer _firstTime${sCount}"></div>`
  }

  /**
   * onEditLore
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onEditLore(_event, target) {
    const lore = $(target).data('lore')
    const rules = this.document.system.rules
    
    if (lore !== 'posicion' || !configRULES[rules].estratoRoll) {

      const option = await helperDialog.dialogSelectLore(rules, lore, this.document)
      if (!option) return
      if (option === '#alea') await helperTables.tableLore(rules, lore, this.document)
                         else await helperContext.assignLoreToActor(rules, lore, this.document, option)

    } else {

      const optionEstrato = await helperDialog.dialogSelectLore(rules, 'estrato', this.document)
      if (!optionEstrato) return
      if (optionEstrato === '#alea') await helperTables.tableLore(rules, 'estrato', this.document)
      else {
        await helperContext.assignLoreToActor(rules, 'estrato', this.document, optionEstrato)
        const optionPosicion = await helperDialog.dialogSelectLore(rules, 'posicion', this.document)
        if (!optionPosicion) return
        if (optionPosicion === '#alea') await helperTables.tableLore(rules, 'posicion', this.document)
                                    else await helperContext.assignLoreToActor(rules, 'posicion', this.document, optionPosicion)
      }   
    }
  }  

  /**
   * onShowStatus
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onShowStatus(_event, target) {
    const path = $(target).data('path')
    const key = path.split('.').splice(-1)[0]
    let data = this.document
    path.split('.').map(s => {data = data[s]})
    const content = `<p>${game.i18n.localize('common.penalMov')}: <strong>x ${data.penalMov}</strong></br>       
                        ${game.i18n.localize('common.penalDan')}: <strong>x ${data.penalDan}</strong></br>
                        ${game.i18n.localize('common.penalHab')}: <strong>- ${data.penalHab}%</strong></br>
                        ${game.i18n.localize('common.penalIni')}: <strong>- ${data.penalIni} x AGI</strong></p>
                     <p>${game.i18n.localize('explain.'+key)}</p>`
                            
    helperDialog.dialogDescription(null, content, game.i18n.localize('common.'+key), this.document.system.rules, 300)
  }

  /**
   * onChangeSkillStatus
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onChangeSkillStatus(_event, target) {
    _event.stopPropagation()
    const id = $(target).data('id')
    const item = this.document.items.get($(target).data('id'))
    if (!item) return
    const key = item.system.key
    const competencias = this.document.system.competencias
    let stats = competencias.find(e => e.key === key)
    const rules = this.document.system.rules
    let options = [];
    const position = {
      left: _event.x - 100,
      top: _event.y - 100
    };
    aqConfig.skills.status.map(s => {
      options.push({
        key: s,
        label: game.i18n.localize('common.'+s),
        img: "systems/"+SYSTEM_ID+"/assets/ui/"+rules+'_comp_'+s+'.png'
      })
    })
    const option = await helperDialog.dialogSelectOptions(rules, item.name, options, position)
    
    aqConfig.skills.status.map(s => {
        if (s === option) stats[s] = true
                     else stats[s] = false
    })
    await this.document.update({'system.competencias': competencias})
  }

  /**
   * onClickHitsPoints
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onClickHitsPoints(_event, target) {
    _event.stopPropagation()
    const ptv = $(target).data('value')
    await this.document.update({
       "system.atributos.ptv.value": ptv
    })
  }

  static async #onNavToSkill(_event, target) {
    _event.stopPropagation()
    const key = $(target).data('key')
    await this.document.sheet.changeTab('stats', 'primary');
    const section = $(this.document.sheet.form).find('section.tab.active');
    const skills = $(this.document.sheet.form).find('._skills');
    const skill = $(this.document.sheet.form).find(`._skill[data-key="${key}"] input._skillValue`);
    skill.focus()
    section.scrollTop(5000)
    skills.scrollTop(5000)
  }

  static async #onNavToItem(_event, target) {
    _event.stopPropagation()
    const sId = $(target).data('id')
    const sName = $(target).data('name')
    const item = this.document.items.get(sId)
    if (!item) return
    item.sheet._sheetMode = 0
    await item.sheet.render(true)
    let input = $(item.sheet.form).find(`input[name="${sName}"]`)
        if (input.length === 0) input = $(item.sheet.form).find(`select[name="${sName}"]`)
    input.focus()
  }

  static #onShowPenals(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    let mPenals = []
    let rules = ''
    let img = ''
    let sContent = `<table class="_penals">`

    if (item) {
      item.system.penalizaciones.map(o => {
          const skill = this.document.items.find(e => e.type === 'competencia' && e.system.key === o.key)
          if (!skill) return
          mPenals.push({label: skill.name, field: o.penal})
      })
      rules = item.system.rules
      img = item.img
      
    } else {
      mPenals = helperSheets.getSkillPenals(this.document, $(target).data('key'))
      rules = this.document.system.rules
      img = this.document.img

    }

    mPenals.map(o => {
      sContent += `<tr><td class="_label">${o.label}</td>
                       <td class="_field">${o.field}%</td></tr>`
    })
    sContent += '</table>'
    helperDialog.dialogDescription(null, sContent, game.i18n.localize('common.penalizaciones'), rules, 550, img)
  }

  /**
   * onResetAttributes
   * @param {*} _event 
   * @param {*} target 
   */
  static async #onResetAttributes(_event, target) {
    this.document.update({
      "system.atributos.ptv.value": this.document.system.atributos.ptv.max,
      "system.atributos.ptf.value": this.document.system.atributos.ptf.max,
      "system.atributos.ptc.value": this.document.system.atributos.ptc.max,
      "system.atributos.sue.value": this.document.system.atributos.sue.max
    })
  }

}