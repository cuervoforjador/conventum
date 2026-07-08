import { SYSTEM_ID } from "../config/uiConstants.js";
import helperDialog from "../helper/helperDialog.js";
import newChatMessage from "./chatMessage.js";
import helperCombat from "../helper/helperCombat.js";
import helperContext from "../helper/helperContext.js";
import { aqConfig } from "../config/config.js";
import helperTools from "../helper/helperTools.js";

export default class newRoll extends Roll {

  get rollType() { return this.data.rollType ? this.data.rollType : 'simple' }
  get percent() { return this.data.percent ? this.data.percent : 0 }
  get mod() { return this.data.mod ? this.data.mod : '+0'}
  get modif() { return this.data.modif ? this.data.modif : '' }
  get useDiffLevel() { return this.data.useDiffLevel ? this.data.useDiffLevel : false }
  get useLocation() { return this.data.useLocation ? this.data.useLocation : false }
  get useLuck() { return this.data.useLuck ? this.data.useLuck : false }
  get rules() { return this.data.actor?.system.rules ? this.data.actor.system.rules : 'aq3'}
  get actor() { return this.data.actor ? this.data.actor : null }
  get targetActor() { return this.data.targetActor ? this.data.targetActor : null }
  get targetToken() { return this.data.targetToken ? this.data.targetToken : null }
  get targeted() { return this.data.targeted ? this.data.targeted : false }
  get title() { return this.data.title ? this.data.title : '' }
  get subtitle() { return this.data.subtitle ? this.data.subtitle : '' }
  get stats() { return this.data.stats ? this.data.stats : {}}
  get skill() { return this.data.item?.type === 'competencia' ? this.data.item : null }
  get weapon() { return this.data.item?.type === 'arma' ? this.data.item : null }
  get armadura() { return this.data.item?.type === 'armadura' ? this.data.item : null }
  get img() { return this.data.img ? this.data.img : '' }
  

  critical = {
    maxCriticalSuccess: 1,
    minCriticalFailure: 100
  }
  evaluatedResult = {
    percentBase: 0,
    percentFinal: 0,
    succes: false,
    failure: true,
    criticalSuccess: false,
    criticalFailure: false,
    text: game.i18n.localize('common.fallo'),
    class: 'failue'
  }
  diffLevel = {
    use: false,
    action: 'diff00',
    penal: '+0',
    title: game.i18n.localize('common.diffNormal')
  } 
  luck = {
    use: false,
    initial: 0,
    end: 0,
    spent: 0,
    evaluated: false
  } 
  mods = []
  competencia = null
  history = []
  armadura = []
  proteccion = 0
  localizacion = {
    key: '',
    label: '',
    properties: {}
  }
  heridaGrave = 0
  secuela = {
    apply: false,
    item: null
  }

  /** @override */
  constructor(formula="", data={}, options={}) {
    super(formula, data, options)
    if (data.history && data.history.length > 0) this.history = data.history
  }

  /**
   * rollStat
   */
  async rollStat() {
    let rendered = false
    const byPass = (this.useDiffLevel || this.useLuck)
    this._addMods()
    if (byPass) rendered = await this.askDiffLevel() 
    if (byPass && !rendered) return
    
    this._recalcPercent()

    await this.evaluate()
    if (game.dice3d) await game.dice3d.showForRoll(this)
    this._evalResult()
    this._spendLuck()
    this.postMessage()
  }

  /**
   * rollFormula
   */
  async rollFormula() {
    await this.evaluate()
    if (game.dice3d) await game.dice3d.showForRoll(this)
    this.postMessage()
  }

  /**
   * rollLocation
   */
  async rollLocation(sFormula) {
    const rollLocation = new newRoll( (sFormula ? sFormula : this.formula), {
      rules: this.rules,
      actor: this.actor,
      targetActor: this.targetActor,
      title: game.i18n.localize('common.localizacion'),
      subtitle: this.targetActor.name,
      img: this.targetActor.img,
      rollType: 'location',
      targeted: true
    });

    await rollLocation.evaluate()
    if (game.dice3d) await game.dice3d.showForRoll(rollLocation)
    const localizaciones = helperContext.getMLocalizaciones(this.rules, this.targetActor)
    rollLocation.data.location = localizaciones.find(e => e.low <= rollLocation.total && e.high >= rollLocation.total)

    localizaciones.map(o => { rollLocation.history.push({
        label: o.low + ' - ' + o.high,
        field: game.i18n.localize('common.' + o.key)
    }) })
    await rollLocation.postMessage()
    return rollLocation.data.location.key
  }

  /**
   * rollDamage
   */
  async rollDamage() {
    let rendered = false
    if (this.useLocation) rendered = await this.askLocation() 
    if (this.useLocation && !rendered) return

    this._preEvalDamage()
    this._preEvalTargetArmor()

    await this.evaluate()
    if (game.dice3d) await game.dice3d.showForRoll(this)
    this._evalDamage()
    this.postMessage()
  }

  _addMods() {
    if (!this.data.mods) return
    this.data.mods.map(o => {
      for (var s in aqConfig.modificadores) {
        const mod = aqConfig.modificadores[s].find(e => Number(e.id) === Number(o))
        if (mod && !this.mods.find(e => e.id === mod.id)) {
            mod.label = game.i18n.localize(mod.label)
            this.mods.push(mod)
        }
      }
    })
  }

  /**
   * _preEvalDamage
   */
  _preEvalDamage() {
    
    // Bonificador de Daño
    this.history.push({label: game.i18n.localize('common.base'), field: this.formula})

    if (!this.weapon) return;
    this.competencia = this.actor.getCompetencia(this.weapon.system.competencia.key)
    this.history.push({label: game.i18n.localize('common.armaCompetencia'),
                       field: this.competencia.name})
    if (this.rules === 'aq3') {
      this.history.push({label: game.i18n.localize('common.armaCaracteristica'),
                        field: game.i18n.localize('CHAR.'+ this.competencia.system.caracteristica)})
    }
    const damageMod = helperCombat.damageMod(this.rules, this.actor, this.competencia.system.caracteristica)
    this.history.push({label: game.i18n.localize('common.bonDanno'), field: damageMod.string !== '' ? damageMod.string : ' - '})

    if (damageMod.string !== '') {
        this.data.formula = this.data.formula + ' ' + damageMod.string
        damageMod.terms.map(e => this.terms.push(e))
        this.resetFormula()
    }
  }

  /**
   * _preEvalTargetArmor
   */
  _preEvalTargetArmor() {
    if (!this.useLocation || !this.targetActor || !this.localizacion.key) return
    let nProteccion = 0

    this.history.push({label: game.i18n.localize('common.localizacion'), field: this.localizacion.label})
    this.targetActor.items.filter(o => o.type === 'armadura' 
                                    && o.system.rules === this.rules 
                                    && o.system.enUso 
                                    && o.system.localizaciones.find(e => e.key === this.localizacion.key)).map( armor => {
      nProteccion += armor.system.proteccion
      this.armadura.push(armor)
      this.history.push({label: '* ' + armor.name, field: armor.system.proteccion +' pt'})
    })
    
    this.history.push({label: game.i18n.localize('common.proteccionTotal'), field: nProteccion +' pt'})
    this.proteccion = nProteccion
  }

  /**
   * _evalDamage
   */
  _evalDamage() {
    this.heridaGrave = Math.ceil(this.targetActor.system.atributos.ptv.total/2)
    this.history.push({label: game.i18n.localize('common.resultadoTirada'), field: this.total +' pt'})
    this.damageTransfer = this.total - this.proteccion    
    if (this.damageTransfer < 0) this.damageTransfer = 0
    this.secuela.apply = this.damageTransfer > this.heridaGrave    
    this.history.push({label: game.i18n.localize('common.danoTransferido'), field: this.damageTransfer +' pt'})
    this.history.push({label: game.i18n.localize('common.heridaGrave'), field: this.heridaGrave +' pt'})
    if (this.secuela.apply) this.history.push({label: game.i18n.localize('explain.aplicaSecuela'), field: ''})
                       else this.history.push({label: game.i18n.localize('explain.noAplicaSecuela'), field: ''})

    this.history.push({label: game.i18n.localize('common.localizacionMult'), field: 'x '+this.localizacion.properties.mult})
    this.damageTotal = this.localizacion.properties.mult * this.damageTransfer
    this.history.push({label: game.i18n.localize('common.danoTotal'), field: this.damageTotal +' pt'})
  } 

  /**
   * _recalcPercent
   */
  _recalcPercent() {
    let base = this.stats.total ? this.stats.total + 0 : this.data.percent + 0
    if (this.modif !== '+0' && this.modif !== '') base = eval(base.toString() + this.modif)
    this.data.percent = base
  }

  /**
   * _evalResult
   */
  _evalResult() {
      let nPercent = this.percent
      nPercent = nPercent + Number(this.diffLevel.penal)
      let nTotalLuck = this.total - this.luck.spent

      const maxCS = Math.ceil(nPercent/10)
      const minCF = Math.ceil(100 - (Math.ceil((100 - nPercent + 1)/10) - 1))
      this.critical = {...this.critical, ...{
        maxCriticalSuccess: maxCS > 0 ? maxCS : 1,
        minCriticalFailure: minCF > 99 ? 100 : minCF,
      }}

      this.evaluatedResult = {...this.evaluatedResult, ...{
        percentBase: this.percent,
        percentFinal: nPercent,
        succes: nTotalLuck <= nPercent,
        failure: nTotalLuck > nPercent,
        criticalSuccess: nTotalLuck <= this.critical.maxCriticalSuccess,
        criticalFailure: nTotalLuck >= this.critical.minCriticalFailure      
      }}
      if (this.evaluatedResult.criticalSuccess || nTotalLuck <= 5) {
        this.evaluatedResult.succes = true; 
        this.evaluatedResult.failure = false;
        this.evaluatedResult.criticalFailure = false;
      }
      if (this.evaluatedResult.criticalFailure || nTotalLuck >= 95) {
        this.evaluatedResult.succes = false; 
        this.evaluatedResult.failure = true;
        this.evaluatedResult.criticalSuccess = false;      
      }

      this.evaluatedResult.text = this.evaluatedResult.criticalSuccess ? game.i18n.localize('common.criticalSuccess') :
                                  this.evaluatedResult.criticalFailure ? game.i18n.localize('common.criticalFailure') :
                                  this.evaluatedResult.succes ? game.i18n.localize('common.exito') : game.i18n.localize('common.fallo')
      this.evaluatedResult.class = this.evaluatedResult.criticalSuccess ? 'criticalSuccess' :
                                   this.evaluatedResult.criticalFailure ? 'criticalFailure' :
                                   this.evaluatedResult.succes ? 'success' : 'failure'     
      
      // Suerte
      if (this.luck.use && !this.luck.evaluated) {
        this.luck.evaluated = true
        if (this.evaluatedResult.succes) this.luck.spent = 1
                                    else this.luck.spent = this.total - nPercent
        this.luck.initial = this.actor.system.atributos.sue.value
        this.luck.end = this.luck.initial - this.luck.spent
        if (this.luck.end < 0) {
          this.luck.end = 0
          this.luck.spent = this.luck.initial
        }
        if (this.luck.spent > 0 && this.evaluatedResult.failure
                                && !this.evaluatedResult.criticalFailure) this._evalResult()
      }
  }

  /**
   * askDiffLevel
   */
  async askDiffLevel() {

    let barInfo = this.stats.value ?
                   `<div class="_info">
                          <label class="_title">${this.title}:</label>
                          <label class="_value">${this.stats.value}%</label>
                    </div>` :
                    `<div class="_info">
                          <label class="_title">${this.title}:</label>
                          <label class="_value">${this.percent}%</label>                    
                    </div>`
    
    let barModif = `<div class="_info _modif">
                          <label class="_title">${game.i18n.localize('common.modificador')}:</label>
                          <input type="text" id="_modif" class="_value" value="${this.mod}"/>
                          <button type="button" id="_showMods" class="icon fas fa-gear" data-tooltip="${game.i18n.localize('common.verModificadores')}" />
                    </div>`

    let barPenals = this.stats.value && Number(this.stats.penal) !== 0 ?
                   `<div class="_info _penals">
                          <label class="_title">${game.i18n.localize("common.penalizacion")}:</label>
                          <label class="_value glowBlink">${this.stats.penal}%</label>
                    </div>` : ''

    let barLuck = this.useLuck ? `<ul class="_main _luckBar">
                                    <li data-key="luck" data-tooltip="${game.i18n.localize("common.suerteActual")}: ${this.actor.system.atributos.sue.value}">
                                      <input type="checkbox" class="_switch" id="_switch" />
                                      <label class="_title" for="_switch">${game.i18n.localize("common.useLuck")}</label>
                                    </li>
                                  </ul>` : ''

    let options = '';
    this._diffLevelsMatrix().map(level => {
      options += `<li data-key="${level.action}" class="${level.action} _diffLevel">
                      <div class="_wrap">
                          <input type="checkbox" class="_selector" ${level.action === 'diff00' ? 'checked' : ''} />
                          <label class="_title">${level.title} (${this.percent}% ${level.penal}% = ${(this.percent + Number(level.penal))}%)</label>
                      </div>
                  </li>`
    })    
    const content = `${barInfo} ${barPenals} ${barModif} ${barLuck}
                    <button type="button" class="_toggleOptions">${game.i18n.localize('common.elegirDificultad')}</button>
                    <ul class="_main _diffOptions" style="display: none">
                      ${options}
                    </ul>`

    const option = await foundry.applications.api.DialogV2.wait({
        classes: ['_extend', '_'+this.rules, '_diffLevels'],
        window: { title: game.i18n.localize("common.dificultad") },
        content,
        buttons: [{
            label: game.i18n.localize("common.tirarDados"),
            class: '_selected', 
            callback: (event, button) => {
                const checked = $(event.currentTarget).find('ul._main')
                                                      .find('input[type="checkbox"]._selector:checked')
                if (!checked.length === 0) return null
                return {
                  diffLevel: checked.parents('li').data('key'),
                  modif: $(event.currentTarget).find('._modif #_modif').val(),
                  useLuck: $(event.currentTarget).find('._luckBar #_switch').prop('checked')
                }
            }
        }],
        render: (_event, dialog) => {               
            helperDialog._setShadowToDialog(dialog)
            helperDialog._setInitialDialogEvents(dialog)  
            $(dialog.element).find('button#_showMods').on('click', async event => {
              const mModificadores = await this.askModificadores()
              let nMod = 0; mModificadores.map(mod => {
                nMod += Number(mod.mod)
                this.mods.push(mod)                
              })
              const sMod = nMod < 0 ? nMod.toString() : '+' + nMod.toString()
              $(dialog.element).find('input#_modif').val(sMod)
            })
            $(dialog.element).find('button._toggleOptions').on('click', event => {
              const diffOptions = $(event.currentTarget).parent().find('._diffOptions')
              diffOptions.slideToggle()
            })
        }
    })      

    if (!option) return false    
    this.diffLevel.use = option.diffLevel !== 'diff00'
    this.diffLevel = {...this.diffLevel, ...this._diffLevelsMatrix().find(e => e.action === option.diffLevel)}
    this.luck.use = option.useLuck
    this.data.modif = option.modif
    return true
  }

  /**
   * askModificadores
   */
  async askModificadores() {
    
    let mModificadores = [];
    for (var s in aqConfig.modificadores) {
      const grupo = aqConfig.modificadores[s]
      const mMods = grupo.filter(e => e.rules.find(s2 => s2 === this.rules))
      if (mMods.length > 0) {
        mModificadores.push({
          id: '',
          label: game.i18n.localize('common.'+s),
          grupo: true,
          mod: ''
        })
      }
      mMods.map(mod => {
        mModificadores.push({
          id: mod.id,
          label: game.i18n.localize(mod.label),
          grupo: false,
          mod: mod.mod
        })        
      })
    }

    let options = '';
    mModificadores.map(mod => {
      const bChecked = !!this.mods.find(e => e.id === mod.id)
      if (mod.grupo) options += `<li class="_grupo"><label class="_title">${mod.label}</label></li>`
                else options += `<li data-id="${mod.id}">
                                    <div class="_wrap">
                                        <input type="checkbox" 
                                               class="_selector" 
                                               data-mod="${mod.id}" 
                                               data-value="${mod.mod}" 
                                               id="mod_${mod.id}"
                                               ${bChecked ? ' checked ' : ''} />
                                        <label class="_title" for="mod_${mod.id}">${mod.label}</label>
                                        <label class="_value ${mod.mod[0] === '+' ? '_good' : '_bad'}" for="mod_${mod.id}">${mod.mod}</label>
                                    </div>
                                </li>`
    })    
    const content = `<ul class="_main">${options}</ul>`    

    const finalMods = await foundry.applications.api.DialogV2.wait({
        classes: ['_extend', '_'+this.rules, '_modificadores'],
        window: { title: game.i18n.localize("common.modificadores") },
        content,
        buttons: [{
            label: game.i18n.localize("common.anadir"),
            callback: (event, button) => {
                let mMods = []
                $(event.currentTarget).find('input[type="checkbox"]._selector:checked').each((i,e) => {
                    mMods.push({id: $(e).data('mod'), mod: $(e).data('value'), label: game.i18n.localize('mods.m'+$(e).data('mod'))})
                })
                return mMods
            }
        }],
        render: (_event, dialog) => {               
            helperDialog._setShadowToDialog(dialog)
        }
    })

    return finalMods
  }

  /**
   * askLocation
   */
  async askLocation() {
    const localizaciones = helperContext.getLocalizaciones(this.rules, this.targetActor)
    let mOptions = [{
      checked: true,
      key: '',      
      label: `${game.i18n.localize('common.alea')}`,
      input: true,
      inputField: {
        label: game.i18n.localize('common.formula'),
        value: localizaciones.formula.base,
        class: '_localizacion'
      }
    }];
    for (var s in localizaciones.partes) {
      const localizacion = localizaciones.partes[s]
      mOptions.push({
        key: s,
        label: game.i18n.localize('common.'+s) + `  <span class="_italic">(${game.i18n.localize('common.dano')} x ${localizacion.mult})</span>`
      })
    }
    const dialogResponse = await helperDialog.dialogSelectOptions(this.rules, game.i18n.localize('common.localizacion'), mOptions)
    if (dialogResponse.inputResponse) this.localizacion.key = await this.rollLocation(dialogResponse.inputValue);
                                 else this.localizacion.key = dialogResponse

    if (this.localizacion.key !== '') {
      this.localizacion.label = game.i18n.localize('common.'+this.localizacion.key)
      this.localizacion.properties = localizaciones.partes[this.localizacion.key]      
    } else {
      this.localizacion.label = game.i18n.localize('common.alea')
    }
    return true;
  }

  /** @override */
  async render(chatOptions = {}) {
    return super.render(chatOptions)
  }

  /** @override */
  async toMessage(messageData = {}, { messageMode, rollMode, create = true } = {}) {
    return super.toMessage(messageData, messageMode, rollMode, create)
  }

  /**
   * _spendLuck
   * @returns 
   */
  async _spendLuck() {
    if (!this.actor || !this.luck.use) return
    await this.actor.update({"system.atributos.sue.value": this.luck.end})
  }

  /**
   * postMessage
   */
  async postMessage() {

    const sHeader = this._messageParts_Header()   
    const sResult = `<div class="dice-roll ${this.rollType}" data-action="expandRoll">
                        <div class="dice-result">
                          ${this._messageParts_DiceFormula()}
                          ${this._messageParts_DiceToolTip()}
                          ${this._messageParts_DiceTotal()}
                        </div>
                     </div>
                     ${this._messageParts_Extra()}
                     ${this._messageParts_Buttons()}`

    const message = await newChatMessage.create({
      content: sHeader + sResult,
      title: this.title,
      flags: {
        "rules": {"value": this.rules},
        "actorId": {"value": this.actor ? this.actor.id : ''},
        "tokenId": {"value": this.actor ? helperTools.getTokenId(this.actor) : ''}
      }
    })
  }

  _messageParts_Header() {
      const sActorImg = this.actor ? `<img src="${this.actor.img}" data-tooltip="${this.actor.name}">` : ''
      const sDiff = this.diffLevel.use ? `<h4>${game.i18n.localize('common.dificultad')}: ${this.diffLevel.title}</h4>` : ''
      const sImg = this.img !== '' ? `<div class="_backImg" style="background-image: url(${this.img})"></div>` : ''

      const sSubtitle = this.targeted ? `<div class="_targeted"><div class="_actor">${this.actor.name}</div>
                                                                <div class="_target">${this.targetActor.name}</div></div>` : 
                                        this.subtitle + ( this.modif !== '+0' && this.modif !== '' ? ' '+this.modif : '' )

      const sAuxiliar = this.rollType === 'simple' ? '' :
                        this.rollType === 'damage' ? `<div class="_auxiliar">${game.i18n.localize('tooltip.rollDamage')}</div>` :
                        this.rollType === 'location' ? '' : ''

     return  `<div class="_header">
                ${sActorImg}
                <div class="${this.actor ? '_subHeader' : '_header'}">
                  <h2>${this.title}</h2>
                  ${this.subtitle !== '' ? '<h4>'+sSubtitle+'</h4>' : ''}
                  ${sDiff}
                </div>
                ${sImg}
              </div>
              ${sAuxiliar}`
  }

  _messageParts_DiceFormula() {
    return `<div class="dice-formula" style="">${this.formula}</div>`
  }

  _messageParts_DiceToolTip() {
    return `<div class="dice-tooltip">
              <div class="wrapper">
                <section class="tooltip-part">
                  ${this._messageParts_Stats()}
                </section>
              </div>
            </div>`
  }

  _messageParts_Stats() {
    if (this.history.length > 0) {
      let sReturn = "";
      this.history.map(e => sReturn = sReturn + this._messageParts_StatsRow(e.label, e.field))
      return sReturn
    }

    if (this.rollType === 'simple') {

      let sMods = ''
      this.mods.map(mod => {
          sMods +=   `<div class="_row" data-tooltip="${mod.label}">
                        <label class="_label">${mod.label}: </label>
                        <label class="_field">${mod.mod}%</label>
                      </div>`
      })

      return ( this.stats.value ? 
               this._messageParts_StatsRow('common.base', this.stats.value+'%') +
               ( this.stats.penal !== 0 ? this._messageParts_StatsRow('common.penalizacion', this.stats.penal+'%') : '' ) : 
               this._messageParts_StatsRow('common.base', this.evaluatedResult.percentBase+'%') ) +

            sMods +

            ( this.modif !== '+0' && this.modif !== '' ? 
              this._messageParts_StatsRow('common.modificador', this.modif) +
              this._messageParts_StatsRow('common.modificadorTras', this.percent+'%') : '' ) +
            
            this._messageParts_StatsRow('common.dificultad', this.diffLevel.title+' ('+this.diffLevel.penal+'%)') +
            this._messageParts_StatsRow('common.usaSuerte', this.luck.use ? game.i18n.localize('common.si') : game.i18n.localize('common.no')) +
            ( this.luck.use ?
                  this._messageParts_StatsRow('common.suerteGastada', this.luck.spent) +
                  this._messageParts_StatsRow('common.suerteInicial', this.luck.initial) +
                  this._messageParts_StatsRow('common.suerteActual', this.luck.end) : '' ) +
            this._messageParts_StatsRow('common.porcentajeFinal', this.evaluatedResult.percentFinal+'%') +
            this._messageParts_StatsRow('common.criticalSuccess', '0% - '+this.critical.maxCriticalSuccess+'%') +
            this._messageParts_StatsRow('common.exito', this._messageParts_Success()) +
            this._messageParts_StatsRow('common.fallo', this._messageParts_Failure()) +
            this._messageParts_StatsRow('common.criticalFailure', this.critical.minCriticalFailure + '% - 100%')
    }

    if (this.rollType === 'unit') {
      return this._messageParts_StatsRow('common.unidad', this.data.unit)
    }

    return ''
  }

  _messageParts_DiceTotal() {

    let boxLeftContent = this.rollType === 'simple' ? `${this.total} <span class="_percent"> / ${this.evaluatedResult.percentFinal}</span>` : 
                         this.rollType === 'damage' ? `<div class="_subTitle">${game.i18n.localize('common.dano')}</div>
                                                       <div class="_value">${this.damageTotal}</div>` : 
                         this.rollType === 'location' ? this.total :
                                                        this.total

    let resultClass = this.rollType === 'simple' ? this.evaluatedResult.class :
                      this.rollType === 'damage' ? 'damage' : 
                      this.rollType === 'location' ? 'location' :
                      this.rollType === 'unit' ? 'unit' : ''

    let boxRightContent = this.rollType === 'simple' ? this.evaluatedResult.text :
                          this.rollType === 'damage' ? this._messageParts_Armors() : 
                          this.rollType === 'location' ? game.i18n.localize('common.'+this.data.location.key) :
                          this.rollType === 'unit' ? this.data.unit : 
                                                   ''

    let luckIcon = this.luck.use ? `<i class="fa-solid fa-horseshoe lucky" data-tooltip="${game.i18n.localize('common.suerteGastada')+': '+this.luck.spent}"></i>` : ''
    let boxLeft = `<span class="_number">${boxLeftContent}</span>`
    let boxRight = `<span class="_result ${resultClass}">${boxRightContent}</span>`

    return `<h4 class="dice-total">${luckIcon} ${boxLeft} ${boxRight}</h4>`
  }

  _messageParts_StatsRow(label, field, bI18n=true) {
    return `<div class="_row">
              <label class="_label">${bI18n ? game.i18n.localize(label) : label}: </label>
              <label class="_field">${field}</label>
            </div>`
  }

  _messageParts_Success() {
    return this.evaluatedResult.percentFinal < 5 ? '0% - 5%' : 
           this.evaluatedResult.percentFinal > 95 ? '0% - 95%' : 
           '0% - ' + this.evaluatedResult.percentFinal + '%'
  }

  _messageParts_Failure() {
    return this.evaluatedResult.percentFinal < 5 ? '6% - 100%' :
           this.evaluatedResult.percentFinal > 95 ? '95% - 100%' :
					 (this.evaluatedResult.percentFinal + 1) + '% - 100%'
  }

  _messageParts_Armors() {
    let sArmaduras = ''
    this.armadura.map(armor => sArmaduras += sArmaduras === '' ? armor.name : ', '+armor.name)
    return `<div class="_armaduras" data-tooltip="${sArmaduras}">
               <div class="_localizacion">${this.localizacion.label}</div>
               <div class="_armor">
                  <label>${game.i18n.localize('common.proteccion')}: 
                      <span style="font-size: 1.3rem; font-weight: 900;">${this.proteccion} </span>pt.
                  </label>
                </div>
            </div>`
  }

  _messageParts_Buttons() {
    let sButtons = this.rollType === 'damage' ? 
                      this.damageTotal > 0 ? 
                          `<button type="button" 
                                   data-action="apply-damage" 
                                   data-location="${this.localizacion.key}"
                                   data-damage="${this.damageTotal}"
                                   data-secuela="${this.secuela.apply}"                                   
                                   data-actorid="${this.targetActor.id}"
                                   data-tokenid="${this.targetActor.token?.id}">
                                ${game.i18n.localize('common.aplicarDano')} (${this.damageTotal} pt)
                           </button>` : '' :
                   this.rollType === 'simple' ? '' :
                   this.rollType === 'location' ? '' : ''
    return sButtons !== '' ? `<div class="_buttons">${sButtons}</div>` : ''
  }

  _messageParts_Extra() {
    let sText = this.rollType === 'damage' ? 
                    this.secuela.apply ? `<div class="_extra _secuela">${game.i18n.localize('explain.aplicaSecuela')}</div>` : '' :
                this.rollType === 'simple' ? '' :
                this.rollType === 'location' ? '' : ''
    return sText
  }

  /**
   * _diffLevelsMatrix
   */
  _diffLevelsMatrix() {
    return [
      {title: game.i18n.localize("common.diffInfalible"), penal: '+75', action: "diffB3"},
      {title: game.i18n.localize("common.diffMuyFacil"), penal: '+50', action: "diffB2"},
      {title: game.i18n.localize("common.diffFacil"), penal: '+25', action: "diffB1"},
      {title: game.i18n.localize("common.diffNormal"), penal: '+0',  action: "diff00"},
      {title: game.i18n.localize("common.diffDificil"), penal: '-25', action: "diffP1"},
      {title: game.i18n.localize("common.diffMuyDificil"), penal: '-50', action: "diffP2"},
      {title: game.i18n.localize("common.diffImposible"), penal: '-75', action: "diffP3"}
    ]
  }

}