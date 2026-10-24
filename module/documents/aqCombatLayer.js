import { SYSTEM_ID } from "../config/uiConstants.js"
import helperCombat from "../helper/helperCombat.js"
import helperDialog from "../helper/helperDialog.js"
import helperTools from "../helper/helperTools.js"

export default class aqCombatLayer extends foundry.canvas.layers.InteractionLayer {

  /**
   * _activate
   */
  _activate() {
    super._activate();
    $("#aqCombatLayer").show().css("pointer-events", "auto");
  }

  /**
   * _deactivate
   */
  _deactivate() {
    super._deactivate();
    $("#aqCombatLayer").hide().css("pointer-events", "none");
  }

  /**
   * refreshLayer
   * @param {*} position 
   * @param {*} scale 
   */
  static refreshLayer(position, scale) {
    /*
    $("#aqCombatLayer").css(
        "transform", 
        `translate(${position.x}px, ${position.y}px) scale(${scale})`
    )
    */
  }

  /**
   * renderAQCombatLayer
   */
  static renderAQCombatLayer() {
    const activeTab = ui.sidebar.tabGroups.primary === 'combat'
    if (!activeTab) return

    const layer = $('#aqCombatLayer')
    if (layer.length === 0) return
    layer.find('._combatBar').each((i,e) => $(e).remove())
    layer.find('._actionsBar').each((i,e) => $(e).remove())

    if (!game.combat) return

    const sideBar = $("#sidebar")
    const sceneControls = $("#scene-controls")
    const _combatBar = $(`<div class="_combatBar"></div>`) 
    
    const _stepsBar = $(`<div class="_stepsBar"></div>`)

    CONFIG.ui.combat._cbExpanded = CONFIG.ui.combat._cbExpanded === undefined ||
                                   CONFIG.ui.combat._cbExpanded
                     
    const _combatantsBar = $(`<div class="_combatantsBar ${CONFIG.ui.combat._cbExpanded ? '_expanded' : ''}">
                                <div class="_divider">
                                  <div class="_wrap"></div>
                                </div>      
                              </div>`)

    // Combatientes
    var nCombatants = 0
    game.combat.combatants.map(combatant => {
        if (combatant.actor.ownership[game.user.id] !== 3) return
        const _initiative = helperCombat.calcIniciativa(combatant)
        const _combatant = $(`<div class="_combatant" 
                                   data-tooltip="${game.i18n.localize('explain.anadirPaso')}"
                                   data-initiative="${_initiative.value}"
                                   data-combatant="${combatant.id}">
                                <div class="_background" style="background-image: url(${combatant.img})"></div>
                                <div class="_initiative" data-tooltip="${_initiative.tooltip}">${_initiative.value}</div>
                                <label class="_name">${combatant.name}</label>
                              </div>`)
        _combatant.on("click", aqCombatLayer.clickCombatant.bind(this))        
        _combatantsBar.append(_combatant)
        nCombatants++
    })
    _combatantsBar.append( _combatantsBar.find('._combatant').sort((a, b) =>
                            Number($(b).attr('data-initiative')) - Number($(a).attr('data-initiative')) ))

    // Turnos
    const asalto = game.combat.extendData.asaltos.find(e => e.index === game.combat.round)
    if (asalto) {

      asalto.steps.map((step, index) => {
        const combatant = game.combat.combatants.get(step.combatantId)
        const target = step.targetId !== '' ? game.combat.combatants.get(step.targetId) : null
        const weapon = step.weaponId !== '' ? combatant.actor.items.get(step.weaponId) : null
        const action = step.actionId !== '' ? combatant.actor.items.get(step.actionId) : null

        const _target = target ? `<div class="_target" 
                                       data-tooltip="${game.i18n.localize('common.objetivo')}: ${target.name}">
                                     <div class="_background" style="background-image: url(${target.img})"></div>
                                  </div>` : ''

        const sClass = step.active ? 
                              step.type === 'attack' ? '_draggable' :
                              step.type === 'movement' ? '_draggable' : '' :
                              '_inactive'

        const _step = $(`<div class="_step _${step.type} ${sClass}"
                              data-id="${step.id}"
                              data-combatantId="${step.combatantId}"
                              data-targetId="${target ? target.id : ''}"
                              data-weaponId="${weapon ? weapon.id : ''}"
                              data-actionId="${action ? action.id : ''}"
                              data-index="${index}">
                            <div class="_background" style="background-image: url(${combatant.img})"></div>
                            <div class="_initiative">${step.initiative}</div>
                            ${_target}
                            <label class="_name">
                                ${combatant.name}</br>
                                (${action.name})
                            </label>
                            <label class="_delete" data-tooltip="${game.i18n.localize('explain.deleteStep')}">
                                <i class="fa-solid fa-trash"></i>
                            </label> 
                            ${step.type === 'defense' ? `<div class="_defending" data-tooltip="${game.i18n.localize('tooltip.defending')}">
                                                              <i class="fa-solid fa-shield-halved"></i>
                                                         </div>`: ''}                         
                         </div>`)

        if (game.user.isGM) {
          _step.find('._delete').on('click', (_event) => {
              _event.stopPropagation()
              helperCombat.deleteStepCombat($(_event.currentTarget).parents('._step').data('id'))            
          })
        }
        _step.hover(() => this._onStepIn.bind(this), this._onStepOut.bind(this))
        _stepsBar.append(_step)
      })

      /**
      const stepTurn = helperCombat._getCurrentStep()
      const _stepTurn = _stepsBar.find(`._step[data-id=${stepTurn?.id}]`)
      if (_stepTurn) {
        _stepTurn.addClass('_myTurn')
        _stepTurn.hover(() => {
          layer.find('._verbs').css({'display': 'flex'});
        }, () => {
          layer.find('._verbs').css({'display': 'none'});
        })   
      }
      */

      _stepsBar.sortable({
        items: '._step._draggable',
        containment: 'parent', 
        axis: 'x',
        revert: true,
        cursor: 'move',
        start: (event, ui) => { ui.item.addClass('_dragging') },                
        stop: this._onStepDragStop.bind(this)
      })

      _combatantsBar.find('._divider').on('click', (_event) => {
        _event.stopPropagation()
        const _cb = $(_event.currentTarget).parents('._combatantsBar')
        if (_cb.hasClass('_expanded')) _cb.removeClass('_expanded')
                                  else _cb.addClass('_expanded')
        CONFIG.ui.combat._cbExpanded = _cb.hasClass('_expanded')
      })

      _combatBar.append(_stepsBar)
      if (nCombatants > 0) _combatBar.append(_combatantsBar)
      layer.append(_combatBar)

      const sideBarWidth = ui.sidebar.expanded ? 345 : 50
      _combatBar.css({
          "width": "calc(100% - "+(sideBarWidth + sceneControls.width() + 45)+"px)",
          "left": (sceneControls.width() + 30) + "px",
      })   

      layer.show()

      /**
      //Añadiendo verbos...
      layer.find('._verbs').remove()
      if (stepTurn) {
        const _stepRef = _stepsBar.find(`._step[data-id="${stepTurn.id}"]`)
        const _verbs = $(`<div class="_verbs"></div>`)
        _verbs.css({
          top: ( _combatBar.position().top + (_combatBar.height() / 2)) +'px',
          left: ( _combatBar.position().left + _stepRef.position().left) +'px',
        })
        _verbs.hide()

        const oStep = helperCombat.getStepInfo()
        const oAction = oStep.main.action.system

        if (oStep.type === 'attack') {
          if (!stepTurn.rolls.skill.rolled) {
            const _verbAtaque = $(`<div class="_verb" data-id="${stepTurn.id}">
                                      <i class="fa-solid fa-dice-d10"></i>
                                      ${game.i18n.localize('common.atacar')}
                                  </div>`)
            _verbAtaque.on('click', (_event) => helperCombat.playStep($(_event.currentTarget).data('id')))
            _verbs.append(_verbAtaque)

          } else if (!stepTurn.rolls.damage.rolled) {
            const _verbDano = $(`<div class="_verb" data-id="${stepTurn.id}">
                                      ${game.i18n.localize('common.danar')}
                                  </div>`)
            _verbDano.on('click', (_event) => helperCombat.playStep($(_event.currentTarget).data('id')))
            _verbs.append(_verbDano)
          }
        }
        
        if (oStep.type === 'defense') {
          const _verbDefensa = $(`<div class="_verb" data-id="${stepTurn.id}">
                                    <i class="fa-solid fa-dice-d10"></i>
                                    ${game.i18n.localize('common.defender')}
                                </div>`)
          _verbDefensa.on('click', (_event) => helperCombat.playStep($(_event.currentTarget).data('id')))
          _verbs.append(_verbDefensa)          
        }

        const _verbCancel = $(`<div class="_verb" data-id="${stepTurn.id}">
                                    <i class="fa-solid fa-ban"></i>
                                    ${game.i18n.localize('common.cancelar')}
                                </div>`)
          _verbCancel.on('click', (_event) => helperCombat.cancelStepCombat($(_event.currentTarget).data('id')))
          _verbs.append(_verbCancel)  

        const _verbRemove = $(`<div class="_verb" data-id="${stepTurn.id}">
                                    <i class="fa-solid fa-trash"></i>
                                    ${game.i18n.localize('common.borrar')}
                                </div>`)
          _verbRemove.on('click', (_event) => helperCombat.deleteStepCombat($(_event.currentTarget).data('id')))
          _verbs.append(_verbRemove)  

        layer.append(_verbs)   
      }
      */

    }
  }

  /**
   * _onStepDragStop
   * @param {*} _event 
   * @param {*} ui 
   */
  static async _onStepDragStop(_event, ui) {
    ui.item.removeClass('_dragging')
    const mSteps = []
    const mStepsDefense = []
    
    const data = game.combat.extendData
    let asalto = data.asaltos.find(e => e.index === game.combat.round)
    const mSteps0 = asalto.steps

    ui.item.parents('._stepsBar').find('._step').each((i,o) => {
      const _step = mSteps0.find(e => e.id === $(o).data('id'))
      if ($(o).hasClass('_defense')) mStepsDefense.push(_step)
                                else mSteps.push(_step)
    })

    mStepsDefense.map(_step => {
      const nIndex = mSteps.findIndex(e => e.id === _step.stepTargetId)
      if (nIndex !== -1) mSteps.splice(nIndex + 1, 0, _step);
    })

    asalto.steps = mSteps
    await game.combat.saveExtendData(data)

  }

  /**
   * _onStepIn
   * @param {*} _event 
   * @param {*} ui 
   */
  static _onStepIn(_event, ui) {
    const layer = $('#aqCombatLayer')
    
    const stepId = $(_event).data('id')
    const step = helperCombat._getStep(stepId)

    const combatantId = $(_event).data('combatantId')
    const combatant = game.combat.get(combatantId)

    const targetId = $(_event).data('targetId')
    const target = targetId !== '' ? game.combat.get(targetId) : null

    const actionId = $(_event).data('actionId')
    const action = actionId !== '' && combatant ? combatant.actor.items.get(actionId) : null

    const weaponId = $(_event).data('weaponId')
    const weapon = weaponId !== '' && combatant ? combatant.actor.items.get(weaponId) : null

    layer.find('._verbs').css({'display': 'flex'});
  }

  /**
   * _onStepOut
   * @param {*} _event 
   * @param {*} ui 
   */
  static _onStepOut(_event, ui) {
    const layer = $('#aqCombatLayer')
    layer.find('._verbs').css({'display': 'none'});
  }    

  /**
   * hideAQCombatLayer
   */
  static hideAQCombatLayer() {
    const layer = $('#aqCombatLayer')
    if (layer.length === 0) return
    layer.find('._combatBar').remove()
    layer.hide()
  }

  /**
   * clickCombatant
   * @param {*} _event 
   */
  static clickCombatant(_event) {
    _event.stopPropagation()
    if (!game.combat || Array.from(game.combat.combatants).length == 0) return
    const layer = $('#aqCombatLayer')
    const target = $(_event.currentTarget)
    const combatantId = target.data('combatant')

    layer.find('._combatantsBar ._combatant').each((i,e) => {
      $(e).removeClass('_selected')
    })
    target.addClass('_selected')

    layer.find('._weaponsBar').remove()
    layer.find('._actionsBar').remove()
    this.renderWeaponsMenu(game.combat.combatants.get(combatantId))    
  } 

  /**
   * renderWeaponsMenu
   * @param {*} combatant 
   */
  static renderWeaponsMenu(combatant) {
    const _actor = combatant.actor
    if (!_actor) return
    if (!game.combat) return 

    const layer = $('#aqCombatLayer')
    if (layer.length === 0) return
    const _combatBar = layer.find('._combatBar') 
    const _selectedCombatant = _combatBar.find('._combatantsBar').find('._combatant._selected')
    
    layer.find('._weaponsBar').each((i,e) => $(e).remove())
    const _weaponsBar = $(`<div class="_weaponsBar"><div class="_wrap"></div></div>`) 

    const mItems = _actor.items.filter(e => e.type === 'arma' && e.system.rules === _actor.system.rules)    
    const esquivar = _actor.items.find(e => e.type === 'competencia' && e.system.key === 'esquivar')   
    if (esquivar) {
      mItems.push({
        id: esquivar.id,
        name: game.i18n.localize('common.otras'),
        img: esquivar.img,
      })
    }

    mItems.map(item => {
        const _weapon = $(`<div class="_weapon"
                              data-id="${item.id}"
                              data-combatant="${combatant.id}">

                            <div class="_background" style="background-image: url(${item.img})"></div>
                            <label class="_name">${item.name}</label>                              
                         </div>`)
        _weapon.on("click", aqCombatLayer.clickWeapon.bind(this))
        _weaponsBar.find('._wrap').append(_weapon)
    })
    
    layer.append(_weaponsBar)     

    const _closeButton = $(`<div class="_closeButton">X</div>`)
    _closeButton.on("click", () => { 
        layer.find('._weaponsBar').remove() 
        layer.find('._actionsBar').remove() 
    })
    _weaponsBar.append(_closeButton)

    _weaponsBar.css({"maxWidth": _combatBar.width() + 'px'})
    helperTools.centerBox( _combatBar.position().left + _selectedCombatant.position().left + _selectedCombatant.width()/2,
                           _combatBar.position().top + _selectedCombatant.position().top + _selectedCombatant.height()/2,
                           _weaponsBar)
     
    _weaponsBar.css({"top": ( _combatBar.position().top + _combatBar.height() + 6 ) + 'px'})
  }

  /**
   * clickWeapon
   * @param {*} _event 
   */
  static clickWeapon(_event) {
    _event.stopPropagation()
    if (!game.combat || Array.from(game.combat.combatants).length == 0) return

    const layer = $('#aqCombatLayer')
    const target = $(_event.currentTarget)
    const combatantId = target.data('combatant')
    const weaponId = target.data('id')
        
    layer.find('._weaponsBar ._weapon').each((i,e) => {
      $(e).removeClass('_selected')
    })
    target.addClass('_selected')
    layer.find('._actionsBar').remove()

    const combatant = game.combat.combatants.get(combatantId)
    const weapon = combatant.actor.items.get(weaponId)

    this.renderActionsMenu(combatant, weapon)
  }  

  /**
   * renderActionsMenu
   * @param {*} combatant 
   */
  static renderActionsMenu(combatant, weapon) {
    const _actor = combatant.actor
    if (!_actor) return
    if (!game.combat) return  

    const layer = $('#aqCombatLayer')
    if (layer.length === 0) return
    const _combatBar = layer.find('._combatBar')
    const _weaponsBar = layer.find('._weaponsBar')
    const _selectedWeapon = _weaponsBar.find('._weapon._selected')


    layer.find('._actionsBar').each((i,e) => $(e).remove())
    const _actionsBar = $(`<div class="_actionsBar"><div class="_wrap"></div></div>`)    
    const mItems = _actor.items.filter(e => e.type === 'accion' && e.system.rules === _actor.system.rules)
    
    mItems.sort((a, b) => a.name.localeCompare(b.name))
    mItems.sort((a, b) => a.system.favorita && !b.system.favorita ? -1 : 1)

    mItems.map(item => {
        const _key = weapon.type === 'competencia' ? weapon.system.key : weapon.system.competencia.key
        const _checked = item.system.armas.find(e => e.key === _key)?.checked
        if (!_checked) return

        const _class = item.system.ataque ? '_ataque' :
                       item.system.defensa ? '_defensa' :
                       item.system.movimiento ? '_movimiento' : false

        const _action = $(`<div class="_action ${_class}"
                              data-id="${item.id}"
                              data-key="${item.system.key}"
                              data-combatant="${combatant.id}"
                              data-weapon="${weapon.id}">
                            ${item.system.favorita ? 
                                '<i class="_favorite fa-solid fa-star" data-tooltip="'+game.i18n.localize('common.favorita')+'"></i>' : ''}
                            <div class="_background" style="background-image: url(${item.img})"></div>
                            <label class="_name">${item.name}</label>                              
                         </div>`)
        _action.on("click", aqCombatLayer.clickAction.bind(this))
        _actionsBar.find('._wrap').append(_action)
    })

    layer.append(_actionsBar)

    const _closeButton = $(`<div class="_closeButton">X</div>`)
    _closeButton.on("click", () => { layer.find('._actionsBar').remove() })
    _actionsBar.append(_closeButton)    

    _actionsBar.css({"maxWidth": _combatBar.width() + 'px'})
    helperTools.centerBox( _weaponsBar.position().left + _selectedWeapon.position().left + _selectedWeapon.width()/2,
                           _weaponsBar.position().top + _selectedWeapon.position().top + _selectedWeapon.height()/2,
                           _actionsBar)
     
    _actionsBar.css({"top": ( _combatBar.position().top + _combatBar.height() + _weaponsBar.height() + 15 ) + 'px'})    
  }

  /**
   * clickAction
   * @param {*} _event 
   */
  static async clickAction(_event) {
    _event.stopPropagation()
    if (!game.combat || Array.from(game.combat.combatants).length == 0) return

    const layer = $('#aqCombatLayer')
    const target = $(_event.currentTarget)
    const actionId = target.data('id')
    const combatantId = target.data('combatant')
    const weaponId = target.data('weapon')    
        
    const _combatBar = layer.find('._combatBar')
    const _weaponsBar = layer.find('._weaponsBar')

    layer.find('._actionsBar ._action').each((i,e) => {
      $(e).removeClass('_selected')
    })
    target.addClass('_selected')

    const combatant = game.combat.combatants.get(combatantId)
    const weapon = combatant.actor.items.get(weaponId)
    const action = combatant.actor.items.get(actionId)

    const result = await aqCombatLayer.renderDialogAction(combatant, weapon, action)
  }

  /**
   * renderDialogAction
   * @param {*} combatant 
   * @param {*} weapon 
   * @param {*} action 
   * @returns 
   */
  static async renderDialogAction(combatant, weapon, action) {    
    const actor = combatant.actor        
    const rules = actor.system.rules
    const layer = $('#aqCombatLayer')

    let target = null
    let antiStepId = ''
    var _selectTarget = '<select id="_selectTarget" class="_selectTarget">'
    
    if (action.system.defensa) {

      const asalto = game.combat.extendData.asaltos.find(e => e.index === game.combat.round)
      if (asalto) {
        asalto.steps.filter(e => e.type === 'attack' && e.targetId === combatant.id && e.active).map(step => {
          const combatant0 = game.combat.combatants.get(step.combatantId)
          const action0 = combatant0.actor.items.get(step.actionId)
          _selectTarget += `<option value="${step.combatantId}" data-stepId="${step.id}">${action0.name} (${combatant0.name})</option>`
          target = target || combatant0
          antiStepId = antiStepId === '' ? step.id : antiStepId
        })
      }

    } else if (action.system.ataque) {

      game.combat.combatants.map(c => {
        if (c.id === combatant.id) return
        _selectTarget += `<option value="${c.id}">${c.name}</option>`
        target = target || c
      })

    } else if (action.system.movimiento) {

    }
    _selectTarget += '</select>'

    const content = `<div class="_wrap">
                        <h1 class="_title">${action.name}</h1>
                        <div class="_description">${action.system.descripcion}</div>
                        <div class="_stats">

                          <div class="_row _middle _gapped">
                            <label>${game.i18n.localize('common.iniciativa')}:</label>
                            <label id="_initiative"></label>
                          </div>

                          <div class="_row _middle _gapped">
                            <label>${game.i18n.localize('common.arma')}:</label>
                            <label id="_weapon"></label>
                          </div>

                          <div class="_row _middle _gapped">
                            <label>${game.i18n.localize('common.target')}:</label>
                            ${_selectTarget}
                          </div>

                          <div class="_row _middle _gapped">
                            <label>${game.i18n.localize('common.distancia')}:</label>
                            <label id="_distance"></label>
                          </div>

                          <div class="_row _middle _gapped">
                            <label id="_skillName"></label>
                            <label id="_skillValue" class="_bold"></label>
                          </div>

                        </div>
                     </div>`

    
    const _content = $(content)
    this._refreshDialogAction(_content, combatant, target, weapon, action, antiStepId)


    const dialog = await foundry.applications.api.DialogV2.wait({
        classes: ['_extend', '_'+rules, '_z1000', '_dialogAction'],
        //window: { title: action.name },
        position: { 
          width: 800,
          height: 'auto' 
        },
        content: _content[0].outerHTML,
        buttons: [{
            label: game.i18n.localize("common.confirmar"),
            callback: (event, button) => {
                const target = game.combat.combatants.get($(event.currentTarget).find('#_selectTarget').val())
                const stepTargetId = $(event.currentTarget).find('#_selectTarget option:selected').data('stepid')
                helperCombat.addStepCombat(combatant, target, weapon, action, stepTargetId)
                layer.find('._weaponsBar').remove()
                layer.find('._actionsBar').remove()
            }
        }],
        render: (_event, dialog) => { 
            helperDialog._setShadowToDialog(dialog)
            $(dialog.element).find('select#_selectTarget').on('change', (_event) => {                
                const antiStepId = $(_event.currentTarget).data('stepid')
                const target = game.combat.combatants.get($(_event.currentTarget).val())
                this._refreshDialogAction($(dialog.element).find('._wrap'), combatant, target, weapon, action, antiStepId)
            })
        }
    })      
    return dialog    
  }

  static _refreshDialogAction(_content, combatant, target, weapon, action, antiStepId='') {
    const actor = combatant.actor        
    const rules = actor.system.rules

    const antiStep = antiStepId !== '' ? helperCombat._getStep(antiStepId) : null

    const initiative = helperCombat.calcIniciativa(combatant)
    const measure = helperCombat.calcMeasure(combatant.token, target?.token)
    const skillValue = helperCombat.getSkillActionValue({actor, weapon, action}, null, antiStep)
    const skillName = helperCombat.getSkillActionTitle({actor, weapon, action}, null, antiStep)

    const distanceInfo = helperCombat.getInfoDistancia(weapon, measure)
    const sDistancia = distanceInfo.aDistancia ? `<span class="_bold" style="margin-left: 10px">${distanceInfo.texto} ${distanceInfo.modValue !== '' ? distanceInfo.modValue + '%' : ''}</span>` : ''

    let sSkillModValue = ''
    if (distanceInfo.aDistancia && distanceInfo.modValue !== '') sSkillModValue = distanceInfo.modValue + '%'

    _content.find('#_initiative').html(`
      <span class="_bold">${initiative.value}</span>
      (${game.i18n.localize("CHAR.agiShort")}: ${initiative.agi}, ${game.i18n.localize("common.tiradaIniciativa")}: ${initiative.roll})`)

    _content.find('#_weapon').text(`${weapon.name}`)

    _content.find('#_distance').html(`${measure.distanceText} (${measure.spacesText}) ${sDistancia}
                                      ${measure.contact ? `<span class="_contact">(${game.i18n.localize('common.contacto')})</span>` : ''}`)

    _content.find('#_skillName').text(`${skillName}:`)
    _content.find('#_skillValue').text(`${skillValue}% ${sSkillModValue}`)

  }
}