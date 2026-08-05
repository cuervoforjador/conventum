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
import helperMessages from "../../helper/helperMessages.js";
import helperBooks from "../../helper/helperBooks.js";
import helperMagia from "../../helper/helperMagia.js";

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
      _showPenals:            this.#onShowPenals,
      _showHechizo:           this.#onShowHechizo,
      _showEnsalmo:           this.#onShowEnsalmo,
      _showItemDescr:         this.#onShowItemDescr,
      _toggleAprendido:       this.#onToggleAprendido,
      _deletePreparacion:     this.#onDeletePreparacion,
      _deleteEstudio:         this.#onDeleteEstudio,
      _payHechizoPta:         this.#onPayHechizoPta,
      _dosis:                 this.#onDosis,
      _componentes:           this.#onComponentes,
      _bookHechizos:          this.#onBookHechizos,
      _lanzarHechizo:         this.#onLanzarHechizo,
      _estudiarOrdo:          this.#onEstudiarOrdo,
      _payEnsalmoPta:         this.#onPayEnsalmoPta,
      _adquirirOrdo:          this.#onAdquirirOrdo,
      _prepararEnsalmo:       this.#onPrepararEnsalmo,
      _bookEnsalmos:          this.#onBookEnsalmos,
      _payEnsalmoPtf:         this.#onPayEnsalmoPtf,
      _lanzarEnsalmo:         this.#onLanzarEnsalmo,
      _minusUnidad:           this.#onMinusUnidad,
      _openTienda:            this.#onOpenTienda,
      _productoDescr:         this.#onProductoDescr,
      _comprarItem:           this.#onComprarItem
    }
  }

  /** @override */
  static PARTS = {
    header: { 
      template: `${this.templateFolder}/headers/${this.templateTag}.hbs`,
      scrollable: [".scrollable"] 
    },
    main: {       
      template: `${this.templateFolder}/main/${this.templateTag}.hbs`,
      scrollable: [".scrollableStats", 
                   ".scrollableHechizos1",
                   ".scrollableHechizos2",
                   ".scrollableHechizos3",
                   ".scrollableEquipo1",
                   ".scrollableEquipo2",
                   ".scrollableEquipo3",
                   ".scrollableEnsalmos1",
                   ".scrollableEnsalmos2",
                   ".scrollableEnsalmos3"]
    }
  }
  static TABS = {
    primary: {
      tabs: [ {id: "stats"}, {id: "combate"}, {id: "hechizos"}, {id: "ensalmos"}, {id: "formulas"}, {id: "equipo"} ],
      initial: "stats"
    },
    stats: {
      tabs: [ {id: "principal"}, {id: "rasgos"} ],
      initial: "principal"
    },
    hechizos: {
      tabs: [ {id: "preparacion"}, {id: "estudio"}],
      initial: "preparacion"
    },
    ensalmos: {
      tabs: [ {id: "preparacion"}, {id: "estudio"}],
      initial: "preparacion"
    },
    equipo: {
      tabs: [ {id: "equipo"}, {id: "posesiones"}, {id: "tiendas"}],
      initial: "equipo"      
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
    context.skillRenderOptions = helperSheets.getItemsRenderOptions(this)
    context.itemsRenderOptions = context.skillRenderOptions

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

    context.hechizos = helperSheets.itemsHechizos(this.document, rules)
    context.hechizosPreparacion = helperSheets.itemsHechizosPreparacion(this.document, rules)
    context.hechizosEstudio = helperSheets.itemsHechizosEstudio(this.document, rules)
    
    context.ensalmos = helperSheets.itemsEnsalmos(this.document, rules)
    context.ensalmosEstudio = helperSheets.ensalmosEstudio(this.document, rules)
    context.ensalmoPreparacion = helperSheets.ensalmoPreparacion(this.document, rules)
    
    context.equipoProvisiones = helperSheets.provisiones(this.document, rules)
    context.equipoMunicion = helperSheets.municion(this.document, rules)
    context.equipo = helperSheets.equipo(this.document, rules)

    context.tiendas = helperSheets.tiendas(this.document.id, this.document.system.control.tienda, rules)
    context.tienda = helperSheets.tienda(this.document.id, this.document.system.control.tienda, rules)

    context.tabs = this._prepareTabs("primary")
    context.tabsStats = this._prepareTabs("stats")
    context.tabsHechizos = this._prepareTabs("hechizos")
    context.tabsEnsalmos = this._prepareTabs("ensalmos")
    context.tabsEquipo = this._prepareTabs("equipo")

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
    this._applyScroll($(this.element))
    this.activateListeners($(this.element))
    this.activateFirstTime()
  }

  _syncPartState(partId, newElement, priorElement, state) {
    super._syncPartState(partId, newElement, priorElement, state)
    for ( const [selector, scrollTop, scrollLeft] of state.scrollPositions ) {
      const el = selector === "" ? newElement : newElement.querySelector(selector);
      if ( el && scrollTop > 0) {
        $(el).data('scrollTop', scrollTop);
      }
    }    
  }
  _applyScroll(html) {
    if (!html) return;
    for ( const sClass of extendCharacterSheet.PARTS.main.scrollable) {
      html.find(sClass).each((i, e) => {
        const scrollTop = $(e).data('scrollTop')
        if (scrollTop > 0) $(e).scrollTop(scrollTop)
      })
    }
  }

  /**
   * activateListeners
   * @param {*} html 
   */
  activateListeners(html) {
    super.activateListeners(html)

    html.find('._draggable').draggable({
      containment: '._dropZone',
      revert: true,
      stack: '._draggable',
      helper: 'clone',
      stop: sheetHandler._onDragStop.bind(this)
    });
    
    html.find('._droppable').droppable({
        accept: '._draggable',
        drop: sheetHandler._onDrop.bind(this),
        over: sheetHandler._onDropOver.bind(this),        
        out: sheetHandler._onDropOut.bind(this)
    });

    html.find('._stepValue').on("change", sheetHandler._onChangeStepValue.bind(this))

    this._applyScroll()
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
        $(this.element).find('._fog').prepend(this._lineFirstTime(this._firstTimeStep, this._firstTimeStep === '04'))

    $(this.element).find('._fog ._buttons button._next').on('click', _event => {
      _event.stopPropagation()
      $(this.element).find('._explain._firstTime'+this._firstTimeStep).remove()
      $(this.element).find('._boxPointer._firstTime'+this._firstTimeStep).remove()
      this._firstTimeStep = '0' + (Number($(_event.target).data('current')) + 1)
      this.document.sheet.render(true)
    })

    $(this.element).find('._fog ._buttons button._close').on('click', async _event => {
      _event.stopPropagation()
      await helperSettings.hideFirstTime()
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

  static #onShowHechizo(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    helperContext.showHechizo(this.document.system.rules, item)
  }

  static #onShowEnsalmo(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    helperContext.showEnsalmo(this.document.system.rules, item)
  }  

  static #onShowItemDescr(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    helperDialog.dialogDescription(item)
  } 

  static async #onToggleAprendido(_event, target) {
    _event.stopPropagation() 
    const item = this.document.items.get($(target).data('id'))
    await item.update({"system.aprendido": !item.system.aprendido})

    if (!item.system.aprendido) {
      let mEstudio = this.document.system.magia.estudio
      let index = mEstudio.findIndex(e => e.key === item.system.key)
      if (index < 0) return
      mEstudio.splice(index, 1)
      await this.document.update({"system.magia.estudio": mEstudio})    
    }
  }

  static async #onDeletePreparacion(_event, target) {
    _event.stopPropagation()
    let mPreparacion = this.document.system.magia.preparacion
    let index = mPreparacion.findIndex(e => e.key === $(target).data('key'))
    if (index < 0) return
    mPreparacion.splice(index, 1)
    await this.document.update({"system.magia.preparacion": mPreparacion})
  }

  static async #onDeleteEstudio(_event, target) {
    _event.stopPropagation()
    let mEstudio = this.document.system.magia.estudio
    let index = mEstudio.findIndex(e => e.key === $(target).data('key'))
    if (index < 0) return
    mEstudio.splice(index, 1)
    await this.document.update({"system.magia.estudio": mEstudio})
  }

  static async #onPayHechizoPta(_event, target) {
    _event.stopPropagation()
    let mEstudio = this.document.system.magia.estudio
    let estudio = mEstudio.find(e => e.key === $(target).data('key'))
    estudio.ptaPaid = true
    let ptaValue = this.document.system.atributos.pta.value - estudio.step02.pta
    estudio.step02.ptaPaid = true
    if (ptaValue < 0) {
      helperDialog.error('error.noPta')
      return
    }
    await this.document.update({
      "system.atributos.pta.value": ptaValue,
      "system.magia.estudio": mEstudio
    })
  }

  static async #onPayEnsalmoPta(_event, target) {
    _event.stopPropagation()
    const ordo = $(target).data('ordo')
    const nivel = aqConfig.ensalmos[this.document.system.rules].niveles[ordo]
    const sPath = "system.ritual.estudio."+ordo+".pagado"

    let ptaValue = this.document.system.atributos.pta.value - nivel.pta
    if (ptaValue < 0) {
      helperDialog.error('error.noPta')
      return
    }
    await this.document.update({
      "system.atributos.pta.value": ptaValue,
      [sPath]: true
    })
  }

  static async #onPayEnsalmoPtf(_event, target) {
    _event.stopPropagation()
    const ptf = Number($(target).data('ptf'))
    if (isNaN(ptf) || ptf <= 0) return

    let ptfValue = this.document.system.atributos.ptf.value - ptf
    if (ptfValue < 0) {
      helperDialog.error('error.noPtf')
      return
    }
    await this.document.update({
      "system.atributos.ptf.value": ptfValue,
      "system.ritual.preparacion.ptfPaid": true
    })    
  }

  static async #onDosis(_event, target) {
    _event.stopPropagation()
    let mPreparacion = this.document.system.magia.preparacion  
    let preparacion = mPreparacion.find(e => e.key === $(target).data('key')) 
    let dosis = preparacion.dosis.find(e => Number(e.index) === Number($(target).data('index')))
    dosis.llena = $(target).data('verb') === 'llenar'
    dosis.vacia = $(target).data('verb') === 'vaciar'
    await this.document.update({
      "system.magia.preparacion": mPreparacion
    })    
  }

  static async #onComponentes(_event, target) {
    _event.stopPropagation()
    let preparacion = this.document.system.magia.preparacion
    let prep = preparacion.find(e => e.key === $(target).data('key'))
    const item = this.document.items.get(prep.id)
    let mOptions = []
    prep.componentes.map(e => {
      mOptions.push({
        key: e.key,
        checked: e.checked,
        label: e.name
      })
    })
    const answer = await helperDialog.dialogListOptions(this.document.system.rules, item.name, mOptions, true)
    if (!answer) return
    prep.componentes.map(componente => {
      componente.checked = answer.find(e => Number(e.key) === Number(componente.key)).checked
    })
    await this.document.update({
      "system.magia.preparacion": preparacion
    })
  }

  static async #onLanzarHechizo(_event, target) {
    _event.stopPropagation()
    let preparacion = this.document.system.magia.preparacion
    let prep = preparacion.find(e => e.key === $(target).data('key'))
    const item = this.document.items.get(prep.id)
    helperMessages.postMessage({
      actor: this.document,
      title: this.document.name,
      subTitle: item.name,
      backImg: item.img, 
      class: '_hechizo',
      content: ''
    })
  }

  static async #onLanzarEnsalmo(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get(this.document.system.ritual.preparacion.id)
    if (!item) return

    let preparacion = { ...this.document.system.ritual.preparacion, ...{
      id: '',
      preparando: false,
      ptfPaid: false,
      ceremonia: false,
      completado: false
    }}
    await this.document.update({ "system.ritual.preparacion": preparacion })  
    
    helperMessages.postMessage({
      actor: this.document,
      title: this.document.name,
      subTitle: item.name,
      backImg: item.img, 
      class: '_ensalmo',
      content: ''
    })
  }  

  static async #onEstudiarOrdo(_event, target) {
    _event.stopPropagation()
    const sPath = "system.ritual.estudio." + $(target).data('ordo') + ".estudiando"
    await this.document.update({
      [sPath]: true
    })
  }

  static async #onAdquirirOrdo(_event, target) {
    _event.stopPropagation()
    const ordo = $(target).data('ordo')
    if (!ordo) return
    helperSheets.importOrdo(this.document, ordo)    
  }

  static async #onPrepararEnsalmo(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    if (!item) return
    const preparacion = {...this.document.system.ritual.preparacion, ...{
      id: item.id,
      preparando: true,
      ptfPaid: false,
      ceremonia: false,
      completado: false
    }}
    await this.document.update({ "system.ritual.preparacion": preparacion })
  }

  static async #onBookHechizos(_event, target) {
    _event.stopPropagation()
    const rules = this.document.system.rules
    const mPages = helperMagia.readPagesHechizos(rules, this.document)
    await helperBooks.openBook(rules, this.document, mPages)
  }

  static async #onBookEnsalmos(_event, target) {
    _event.stopPropagation()
    const rules = this.document.system.rules
    const mPages = helperMagia.readPagesEnsalmos(rules, this.document)
    await helperBooks.openBook(rules, this.document, mPages)
  }

  static async #onMinusUnidad(_event, target) {
    _event.stopPropagation()
    const item = this.document.items.get($(target).data('id'))
    if (!item) return
    let nValue = item.system.unidades.actual - 1
    if (nValue < 0) nValue = 0
    await item.update({"system.unidades.actual": nValue})
  }

  static async #onOpenTienda(_event, target) {
    _event.stopPropagation()
    await this.document.update({"system.control.tienda": $(target).data('id')})
  }

  static #onProductoDescr(_event, target) {
    _event.stopPropagation()
    const item = game.items.get($(target).data('id'))
    helperDialog.dialogDescription(item)
  }

  static #onComprarItem(_event, target) {
    _event.stopPropagation()    
    helperSheets.comprarItem($(target).data('tienda'), $(target).data('id'), this.document)
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