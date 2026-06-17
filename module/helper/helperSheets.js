import { SYSTEM_ID } from "../config/uiConstants.js"

import extendCharacterSheet from "../sheets/character/character.js"
import extendCharacterNPCSheet from "../sheets/character/npc.js"

import sheetItem from "../sheets/item/item.js"
import sheetCompetencia  from "../sheets/item/competencia.js"
import sheetArma  from "../sheets/item/arma.js"
import sheetArmadura  from "../sheets/item/armadura.js"
import sheetSociedad  from "../sheets/item/sociedad.js"
import sheetPueblo  from "../sheets/item/pueblo.js"
import sheetReino  from "../sheets/item/reino.js"
import sheetEstrato  from "../sheets/item/estrato.js"
import sheetPosicion  from "../sheets/item/posicion.js"
import sheetProfesion  from "../sheets/item/profesion.js"
import sheetSecuela  from "../sheets/item/secuela.js"
import sheetRasgo  from "../sheets/item/rasgo.js"
import sheetTableExtend from "../sheets/table/base.js"

import helperContext from "./helperContext.js"
import helperDialog from "./helperDialog.js"
import helperPxTools from "../../libs/helperPxTools.js"
import { aqConfig } from "../config/config.js"
import { configRULES } from "../config/rules.js"
import helperTools from "./helperTools.js"

export default class helperSheets {

    /**
     * initSheets
     */
    static initSheets() {       
        
        const v2 = foundry.applications.sheets.ActorSheetV2        
        const actorTypes = [
            "character",
            "npc"
        ]

        v2.unregisterSheet?.("core", "Actor", { types: actorTypes })

        const vA = foundry.documents.collections.Actors
        foundry.appv1?.sheets?.ActorSheet && vA.unregisterSheet("core", foundry.appv1.sheets.ActorSheet)

        vA.registerSheet(SYSTEM_ID, extendCharacterSheet, {
            types: ["character"],
            makeDefault: true,
            label: "sheet.character",
        })  
        
        const vI = foundry.documents.collections.Items
        foundry.appv1?.sheets?.ItemSheet && vI.unregisterSheet("core", foundry.appv1.sheets.ItemSheet)

        vI.registerSheet(SYSTEM_ID, sheetItem, { types: ["item"], makeDefault: true, label: "sheet.item" })
        vI.registerSheet(SYSTEM_ID, sheetCompetencia, { types: ["competencia"], makeDefault: true, label: "sheet.competencia" })
        vI.registerSheet(SYSTEM_ID, sheetArma, { types: ["arma"], makeDefault: true, label: "sheet.arma" })
        vI.registerSheet(SYSTEM_ID, sheetArmadura, { types: ["armadura"], makeDefault: true, label: "sheet.armadura" })
        vI.registerSheet(SYSTEM_ID, sheetSociedad, { types: ["sociedad"], makeDefault: true, label: "sheet.sociedad" })
        vI.registerSheet(SYSTEM_ID, sheetPueblo, { types: ["pueblo"], makeDefault: true, label: "sheet.pueblo" })
        vI.registerSheet(SYSTEM_ID, sheetReino, { types: ["reino"], makeDefault: true, label: "sheet.reino" })
        vI.registerSheet(SYSTEM_ID, sheetEstrato, { types: ["estrato"], makeDefault: true, label: "sheet.estrato" })
        vI.registerSheet(SYSTEM_ID, sheetPosicion, { types: ["posicion"], makeDefault: true, label: "sheet.posicion" })
        vI.registerSheet(SYSTEM_ID, sheetProfesion, { types: ["profesion"], makeDefault: true, label: "sheet.profesion" })
        vI.registerSheet(SYSTEM_ID, sheetSecuela, { types: ["secuela"], makeDefault: true, label: "sheet.secuela" })
        vI.registerSheet(SYSTEM_ID, sheetRasgo, { types: ["rasgo"], makeDefault: true, label: "sheet.rasgo" })

        const vT = foundry.documents.collections.RollTables
        vT.registerSheet(SYSTEM_ID, sheetTableExtend, { types: ["base"], makeDefault: true, label: "sheet.lore" })
    }

    /**
     * checkStats
     * @param {*} system 
     */
    static checkStats(system) {

        let _attrs = system.atributos,
            _chars = system.caracteristicas;
        const rules = system.rules;

        //Características
        for (var s in _chars) {
            let char = _chars[s];
            ['value', 'total'].map(field => {
                char[field] = this._checkMinMax(char[field], char.min, char.max)
            })             
        }

        //Suerte
        _attrs.sue.total = _chars.com.value + _chars.per.value + _chars.cul.value;
        _attrs.sue.max = _attrs.sue.total 
        _attrs.sue.value = this._checkMinMax(_attrs.sue.value, _attrs.sue.min, _attrs.sue.max)

        //Pt. Vida
        _attrs.ptv.total = _chars.res.value
        _attrs.ptv.max = _attrs.ptv.total
        _attrs.ptv.min = _attrs.ptv.total * (-1)
        _attrs.ptv.value = this._checkMinMax(_attrs.ptv.value, _attrs.ptv.min, _attrs.ptv.max)

        //Altura y Peso
        const charEval = _chars.fue.value > _chars.res.value ? _chars.fue.value : _chars.res.value;
        system.info.altura = Math.round(charEval*2.49 + 139.36)/100;
        system.info.peso =  Math.round(charEval*3.72 + 88.49);
        [[5,106], [6,110], [7,118], [8,120], [9,122], [10,125], [11,128], [12,132], [13,134], [14,140], [15,146]].map(e => {
            if (charEval === e[0]) system.info.peso = e[1]
        })
        
        //Templanza
        _attrs.tem.min = 0
        _attrs.tem.max = 100       
        _attrs.tem.total = this._checkMinMax(_attrs.tem.total, _attrs.rr.min, _attrs.rr.max)
        _attrs.tem.value = _attrs.tem.total

        //Racionalidad e Irracionalidad
        _attrs.rr.min = 0
        _attrs.rr.max = 200
        _attrs.rr.value = this._checkMinMax(_attrs.rr.value, _attrs.rr.min, _attrs.rr.max)

        _attrs.irr.min = 0
        _attrs.irr.max = 200
        _attrs.irr.value = this._checkMinMax(_attrs.irr.value, _attrs.irr.min, _attrs.irr.max)

        //Pt. Concentración y Fe
        _attrs.ptc.total = Math.ceil(_attrs.irr.value * 0.2)
        _attrs.ptc.min = 0
        _attrs.ptc.max = _attrs.ptc.total
        _attrs.ptc.value = this._checkMinMax(_attrs.ptc.value, _attrs.ptc.min, _attrs.ptc.max)

        _attrs.ptf.total = Math.ceil(_attrs.rr.value * 0.2)
        _attrs.ptf.min = 0
        _attrs.ptf.max = _attrs.ptf.total        
        _attrs.ptf.value = this._checkMinMax(_attrs.ptf.value, _attrs.ptf.min, _attrs.ptf.max)

        //Estatus de Vida
        this.checkStatusVida(rules, system.atributos.ptv, system.salud.estado)

        system.salud.heridaGrave = Math.ceil(system.atributos.ptv.total / 2)
        return system
    }

    static _checkMinMax(val, min, max) {
        return  Number(val) < min ? min :
                Number(val) > max ? max : Number(val);
    }

    /**
     * checkStatusVida
     * @param {*} system 
     */
    static checkStatusVida(rules, ptv, estados) {

        if (rules === 'aq3') {
            for (var s in estados) {
                let status = estados[s]
                status.checked = false

                const low = ptv.total - Math.ceil(ptv.total * status.low)
                const high = ptv.total - Math.ceil(ptv.total * status.high)
                status.value = high
                if (ptv.value <= high && ptv.value > low) status.checked = true
            }
        } else {
            let _high = ptv.total
            let _low = Math.ceil(ptv.total / 2)
            
            for (var s in estados) {
                let status = estados[s]
                status.checked = false

                var low = Math.ceil(ptv.total/2)*2 - Math.ceil(ptv.total * status.low)
                var high = Math.ceil(ptv.total/2)*2 - Math.ceil(ptv.total * status.high)
                
                switch (s) {
                    case 'sano':
                        high = ptv.total; low = Math.ceil(ptv.total / 2);
                        break;
                    case 'inconsciente':
                        high = 0; low = -1 * ptv.total;
                        break;
                    case 'muerto':
                        high = -1 * ptv.total;  low: -100;
                        break;                                                
                }
                status.value = high 
                if (ptv.value <= high && ptv.value > low) status.checked = true
            }
        }        
    }

    /**
     * checkSkills
     * @param {*} actor 
     */
    static async checkSkills(actor) {
        const mSkills = actor.items.filter(e => e.type === 'competencia')
        if (mSkills.length === 0 && !actor.system.control.importedSkills) await this._importSkills(actor)
        
        let addSkills = []
        let systemSkills = actor.system.competencias
        
        mSkills.map(skill => {
            let systemSkill = actor.system.competencias.find(e => e.key === skill.system.key)
            if (!systemSkill) { addSkills.push({ key: skill.system.key }) }
        })
        if (addSkills.length > 0) {
            addSkills.map(o => {systemSkills.push(o)})
            await actor.update({"system.competencias": systemSkills})
        }        

        let changed = false
        const competencias = actor.system.competencias
        mSkills.map(skill => {
            const base = actor.system.caracteristicas[skill.system.caracteristica].value
            let systemSkill = competencias.find(e => e.key === skill.system.key)
            let stats = systemSkill.stats
            const min = (systemSkill.primaria) ? base*3 : base
            const value = this._checkMinMax(stats.value, stats.min, stats.max)

            if ((stats.min !== min) || (stats.value !== value)) changed = true
            stats.min = min
            stats.value = value
            stats.penal = this.checkSkillPenal(actor, skill.system.key)
            stats.total = stats.value + stats.penal
        })
        if (changed) {
            await actor.update({"system.competencias": competencias})
        }
    }

    /**
     * checkSkillPenal
     * @param {*} actor 
     * @param {*} key 
     */
    static checkSkillPenal(actor, key) {        
        const actorSkill = actor.system.competencias.find(e => e.key === key)
        const skill = actor.items.find(e => e.type === 'competencia' && e.system.key === key)

        let nPenal = Number(actorSkill.penal)
        if (isNaN(nPenal)) nPenal = 0

        //Armaduras
        actor.items.filter(e => e.type === 'armadura' && e.system.rules === actor.system.rules && e.system.enUso).map(skill => {
            skill.system.penalizaciones.filter(e => e.key === key).map(skillPenal => {
                nPenal += Number(skillPenal.penal)
            })
        })

        return nPenal
    }  
    
    /**
     * getSkillPenals
     * @param {*} actor 
     * @param {*} key 
     */
    static getSkillPenals(actor, key) {
        const skill = actor.items.find(e => e.type === 'competencia' && e.system.key === key)
        let mPenals = []

        //Armaduras
        actor.items.filter(e => e.type === 'armadura' && e.system.rules === actor.system.rules && e.system.enUso).map(armadura => {
            armadura.system.penalizaciones.filter(e => e.key === key).map(skillPenal => {
                mPenals.push({label: armadura.name, field: skillPenal.penal})
            })
        })  
        
        return mPenals
    }

    /**
     * getActorSkills
     * @param {*} actor 
     */
    static getActorSkills(actor) {
        const mSkills = actor.items.filter(e => e.type === 'competencia', e.system.rules === actor.system.rules)
        mSkills.sort((a,b) => a.name.localeCompare(b.name))
        return mSkills
    }

    /**
     *_importSkills
     * @param {*} actor 
     */
    static async _importSkills(actor) {
        const rules = actor.system.rules
        const mSkills = (await helperContext.getFromCompendium(rules, 'competencia')).filter(e => e.system.basica)
        let skillsInfo = ""
        mSkills.map(skill => {
            skillsInfo += skillsInfo !== "" ? ', ' + skill.name : skill.name
        })
        const content = `<h4 class="_title divider">${game.i18n.localize('RULES.'+rules)}</h4>
                         <p>${game.i18n.localize("explain.newSkills")}</p>
                         <p><strong>${game.i18n.localize("common.competencias")}: </strong> ${skillsInfo}</p>`
        await helperDialog.dialogDescription(null, content, game.i18n.localize('competencias'), rules, 500)
        
        await Item.create(mSkills, {parent: actor})
        actor.update({"system.control.importedSkills": true})
    }

    /**
     * systemSkills
     * @param {*} actor 
     */
    static systemSkills(actor, rules) {
        let mContext = []
        const mSkills = actor.items.filter(e => e.type === 'competencia' && e.system.rules === actor.system.rules)
        mSkills.sort((a,b) => a.name.localeCompare(b.name))

        let mFolders = []
        mSkills.filter(e => e.system.superior !== '').map(skill => {
            if (mFolders.find(s => s === skill.system.superior)) return
            mFolders.push(skill.system.superior)
        })

        mSkills.filter(e => e.system.superior === '').map(skill => {
            const actorSkill = actor.system.competencias.find(e => e.key === skill.system.key)
            const folder = mFolders.find(s => s === skill.system.key)
            let classes = folder ? (skill.system.folder) ? '_folder _onlyFolder' : '_folder' : ''

            mContext.push({...{
                key: skill.system.key,
                item: skill,
                char: skill.system.caracteristica.toUpperCase(),
                folder: !!folder,
                subSkill: false,
                classes: classes
            }, ...actorSkill})

            if (folder) {

                mSkills.filter(e => e.system.superior === skill.system.key).map(subSkill => {
                    const actorSubSkill = actor.system.competencias.find(e => e.key === subSkill.system.key)
                    mContext.push({...{
                        key: subSkill.system.key,
                        item: subSkill,
                        char: subSkill.system.caracteristica.toUpperCase(),
                        folder: false,
                        subSkill: true,
                        classes: '_subSkill'
                    }, ...actorSubSkill})                    
                })
            }
        })

        //Las competencias de arma van al final
        mContext.sort((a,b) => (!a.item.system.armas*1 > !b.item.system.armas*1)*-1)
        const nIndex = mContext.findIndex(e => e.item.system.armas)
        mContext.splice(nIndex, 0, {blank: true});

        return mContext
    }

    /**
     * systemShields
     * @param {*} actor 
     * @param {*} rules 
     */
    static systemShields(actor, rules) {
        let oReturn = {};
        const sLocalType = actor.system.info.localizacion ? actor.system.info.localizacion : 'humanoide'
        const locations = aqConfig.localizaciones[sLocalType].partes
        for (var s in locations) {
            const armaduras = actor.items.filter(e => e.type === 'armadura' 
                                                   && e.system.rules === rules
                                                   && e.system.enUso
                                                   && e.system.localizaciones.find(e2 => e2.key === s))
            let nProteccion = 0
            armaduras.map(e => nProteccion += e.system.proteccion)                                                   
            oReturn[s] = {
                label: game.i18n.localize('common.'+s),
                value: nProteccion
            }
        }
        return oReturn
    }

    /**
     * itemsSecuelas
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsSecuelas(actor, rules) {
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'secuela' && e.system.rules === rules)
        mItems.map(item => {
            mReturn.push({
                item: item
            })
        })
        return mReturn
    }

    /**
     * itemsOrgullos
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsOrgullos(actor, rules) {
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'rasgo' && e.system.orgullo && e.system.rules === rules)
        mItems.map(item => {
            mReturn.push({
                item: item
            })
        })
        return mReturn
    }

    /**
     * itemsVerguenzas
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsVerguenzas(actor, rules) {
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'rasgo' && e.system.verguenza && e.system.rules === rules)
        mItems.map(item => {
            mReturn.push({
                item: item
            })
        })
        return mReturn
    }

    /**
     * itemsWeapons
     * @param {*} actor 
     * @param {*} rules
     */
    static itemsWeapons(actor, rules) {
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'arma' && e.system.rules === rules)
        mItems.sort((a,b) => a.name.localeCompare(b.name))
        mItems.map(item => {
            const competencia = actor.items.find(e => e.type === 'competencia'
                                                   && e.system.rules === rules
                                                   && e.system.key === item.system.competencia.key)
            const systemCompetencia = actor.system.competencias.find(e => e.key === item.system.competencia.key)
            mReturn.push({
                item: item,
                competencia: competencia,
                systemCompetencia: systemCompetencia,
                percent: systemCompetencia?.stats.total,
                tamano: game.i18n.localize(aqConfig.armas.tamanos[item.system.tamano].label),
                alcance: item.system.adistancia ? 
                            !item.system.alcance.fue ? 
                                item.system.alcance.corto+'/'+
                                item.system.alcance.medio+'/'+
                                item.system.alcance.largo :
                                game.i18n.localize('CHAR.fue') :
                            ''
            })
        })
        return mReturn
    }

    /**
     * itemsArmors
     * @param {*} actor 
     * @param {*} rules
     */
    static itemsArmors(actor, rules) {
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'armadura' && e.system.rules === rules)
        mItems.sort((a,b) => a.name.localeCompare(b.name))
        mItems.map(item => {

            mReturn.push({
                item: item,
                proteccion: item.system.proteccion,
                localizaciones: this._descrLocalizaciones(item.system.localizaciones),
                modIniciativa: item.system.penalIniciativa && item.system.penalIniciativa !== '' ? item.system.penalIniciativa : '-',
                penalizaciones: item.system.penalizaciones.length > 0
            })
        })
        return mReturn
    }

    static _descrLocalizaciones(mLocalizaciones) {
        let mDescr = [];
        if (mLocalizaciones.find(e => e.key === 'cabeza')) mDescr.push(game.i18n.localize('common.cabeza'))
    
        if (mLocalizaciones.find(e => e.key === 'pecho') && 
            mLocalizaciones.find(e => e.key === 'abdomen')) mDescr.push(game.i18n.localize('common.torso'))
        else if (mLocalizaciones.find(e => e.key === 'pecho')) mDescr.push(game.i18n.localize('common.pecho'))
        else if (mLocalizaciones.find(e => e.key === 'abdomen')) mDescr.push(game.i18n.localize('common.abdomen'))

        if (mLocalizaciones.find(e => e.key === 'brazoIzquierdo') && 
            mLocalizaciones.find(e => e.key === 'brazoDerecho')) mDescr.push(game.i18n.localize('common.brazos'))
        else if (mLocalizaciones.find(e => e.key === 'brazoIzquierdo')) mDescr.push(game.i18n.localize('common.brazoIzquierdo'))
        else if (mLocalizaciones.find(e => e.key === 'brazoDerecho')) mDescr.push(game.i18n.localize('common.brazoDerecho'))

        if (mLocalizaciones.find(e => e.key === 'piernaIzquierda') && 
            mLocalizaciones.find(e => e.key === 'piernaDerecha')) mDescr.push(game.i18n.localize('common.piernas'))
        else if (mLocalizaciones.find(e => e.key === 'piernaIzquierda')) mDescr.push(game.i18n.localize('common.piernaIzquierda'))
        else if (mLocalizaciones.find(e => e.key === 'piernaDerecha')) mDescr.push(game.i18n.localize('common.piernaDerecha'))

        return mDescr.join(', ')
    }

    /**
     * drawSpectrum
     * @param {*} html 
     */
    static drawSpectrum(html) {
        html.find('[data-spectrum="true"]').each( (i,e) => {
            let value = Number($(e).find('span._value').html())
            value = value > 100 ? 100 : isNaN(value) ? 0 : value
            let hex = Math.round((value / 100)*255).toString(16);
                hex = hex.length === 1 ? '0' + hex : hex;
            const sColor = '#'+hex + '0000' //'#FF' + hex + hex;
            $(e).css({color: sColor})
        })
    }

    /**
     * getMainRenderOptions
     * @param {*} sheet 
     * @param {*} html 
     */
    static getMainRenderOptions(sheet, html) {
        const pxUnit = sheet ? helperPxTools.toPX(sheet.document.system.control.textSize) :
                               helperPxTools.toPX(window.getComputedStyle(html[0]).getPropertyValue('--fSize'))
        const formHeight = sheet ? sheet.position.height : html.height() + 1.4
        return {
            headerHeight: pxUnit * 11 - 15,
            mainHeight: formHeight - pxUnit * 11
        }              
    }

    /**
     * getSkillRenderOptions
     * @param {*} sheet 
     * @returns 
     */
    static getSkillRenderOptions(sheet, html) {
        const pxUnit = sheet ? helperPxTools.toPX(sheet.document.system.control.textSize) :
                               helperPxTools.toPX(window.getComputedStyle(html[0]).getPropertyValue('--fSize'))
        const formWidth = sheet ? sheet.position.width -25: html.width() + 1.4 -25
        const formHeight = sheet ? sheet.position.height : html.height() + 1.4
        const divStats = pxUnit * 29.5
        const divSkills = formWidth - divStats - 5
        const divRow = pxUnit * 15

        const options = {
            side: divSkills > divStats,
            width: divSkills > divRow ? divSkills+'px' : '100%',
            columns: divSkills > divRow ? Math.trunc(divSkills / divRow) : Math.trunc(formWidth / divRow)
        }
        options.columnSize = Math.trunc(100 / options.columns) + '%'
        options.templateAreas = "'"+'a '.repeat(options.columns).trim()+"'"
        
        //Scrolled - Depende del tipo de ficha
        const rules = sheet ? sheet.actor.system.rules :
                              html.prop('class').split(' ').splice(-1)[0].replace('_', '');

        options.scrolled = rules === 'aq3' ? 
                                options.side ? pxUnit * 32 < (formHeight - pxUnit * 11) : false :
                           rules === 'aq4' ?
                                options.side ? pxUnit * 40 < (formHeight - pxUnit * 11) : false :
                           rules === 'vyc' ?
                                options.side ? pxUnit * 40 < (formHeight - pxUnit * 11) : false : 
                           false;

        return options
    }  

    /**
     * adjustContent
     * @param {*} html 
     */
    static adjustContent(html) {

        const headerOptions = this.getMainRenderOptions(false, html)
        html.find('._main').css({height: 'calc(100% - '+headerOptions.headerHeight+'px)'})

        //Competencias
        const skills = html.find('section[data-tab="stats"] ._skills')
        const stats = html.find('section[data-tab="stats"] ._stats')   
        if (skills.length > 0 && stats.width() > 0) { 

            const skillOptions = this.getSkillRenderOptions(false, html)
            skills.css({'width': skillOptions.width})
            skills.css({'gridAutoColumns': skillOptions.columnSize})
            skills.css({'gridTemplateAreas': skillOptions.templateAreas})
            if (skillOptions.scrolled) skills.addClass('_scrolled')
                                  else skills.removeClass('_scrolled')
        }
    }

    /**
     * addEditButton
     * @param {*} html 
     * @param {*} isPlayMode 
     */
    static addEditButton(html, isPlayMode) {    
        if (!helperTools.isEditable()) return;
        
        let header = html.find('.window-header')        
        if (isPlayMode) {
            header.find('button[data-action="_play"]').remove();
            if (header.find('button[data-action="_edit"]').length === 1) return;

            const sTooltip = game.i18n.localize('common.editarFicha')
            header.find('button[data-action="close"]').before(`
                <button type="button" class="header-control icon fa-solid fa-lock"
                        data-tooltip="${sTooltip}" aria-label="${sTooltip}" data-action="_edit"></button>`)

        } else {
            header.find('button[data-action="_edit"]').remove();
            if (header.find('button[data-action="_play"]').length === 1) return;

            const sTooltip = game.i18n.localize('common.editarFichaNo')
            header.find('button[data-action="close"]').before(`
                <button type="button" class="header-control icon fa-solid fa-unlock"
                        data-tooltip="${sTooltip}" aria-label="${sTooltip}" data-action="_play"></button>`)
        }
    }

    /**
     * addRulesButton
     * @param {*} html 
     */
    static addRulesButton(html) {
        if (!helperTools.isGM()) return;
        
        let header = html.find('.window-header')
        if (header.find('button[data-action="_rules"]').length === 1) return;
        const sTooltip = game.i18n.localize('common.editarReglas')
        header.find('button[data-action="close"]').before(`
            <button type="button" class="header-control icon fa-solid fa-circles-overlap-3"
                    data-tooltip="${sTooltip}" aria-label="${sTooltip}" data-action="_rules"></button>`)        
    }

    /**
     * addTextSizeButton
     * @param {*} html 
     */
    static addTextSizeButton(html) {
        let header = html.find('.window-header')
        if (header.find('button[data-action="_textsize"]').length === 1) return;
        const sTooltip = game.i18n.localize('common.editarTamano')
        header.find('button[data-action="close"]').before(`
            <button type="button" class="header-control icon fa-solid fa-text-size"
                    data-tooltip="${sTooltip}" aria-label="${sTooltip}" data-action="_textsize"></button>`)        
    }

    /**
     * adjustTextSize
     * @param {*} html 
     * @param {*} document 
     */
    static adjustTextSize(html, document) {
        const size = document.system.control.textSize
        html[0].style.setProperty('--fSize', size)
    }

    /**
     * changeTextSize
     * @param {*} document 
     */
    static async changeTextSize(document) {
        const rules = document.system.rules
        const sContent = `<div class="_main">
                            <div class="_row _spaced">
                                <label>${game.i18n.localize('common.tamanoLetra')}</label>
                                <input type="text" name="textsize" class="_sInput" value="${document.system.control.textSize}"/>
                            </div>
                          </div>
                          <div class="_row _buttons">
                            <button type="button" data-size="1rem">1rem</button>
                            <button type="button" data-size="1.25rem">1.25rem</button>
                            <button type="button" data-size="1.50rem">1.50rem</button>
                            <button type="button" data-size="1.75rem">1.75rem</button>
                            <button type="button" data-size="2.00rem">2.00rem</button>
                          </div>`

        const textSize = await foundry.applications.api.DialogV2.wait({
            classes: ['_extend', '_'+rules],
            window: { title: game.i18n.localize("common.tamanoLetra") },
            content: sContent,
            buttons: [{
                label: game.i18n.localize("common.confirmar"),
                callback: (event, button) => {
                    return $(event.currentTarget).find('input[name="textsize"]').val()
                }                
            }],
            render: (_event, dialog) => {              
                helperDialog._setShadowToDialog(dialog)
                $(dialog.element).find('button[type="button"]').on("click", _e => {
                    _e.stopPropagation()
                    if ($(_e.delegateTarget).data('size') === undefined) dialog.close()
                    $(_e.delegateTarget).parents('.dialog-content').find('input[name="textsize"]').val($(_e.delegateTarget).data('size'))
                })
            }            
        })
        if (!textSize) return
        document.update({"system.control.textSize": textSize})
    }

    /**
     * addRulesClass
     * @param {*} html 
     * @param {*} document 
     */
    static addRulesClass(html, document) {
        const mRules = game.settings.settings.get('aquelarre.rules').choices
        for (var s in mRules) { html.removeClass('_'+s) }
        html.addClass('_'+document.system.rules)
    }

    /**
     * changeRules
     * @param {*} document 
     */
    static async changeRules(document) {
        const rules0 = document.system.rules
        const rules = await helperDialog.dialogSelectRules(document)
        if (!rules || rules === rules0) return

        const confirmation = await foundry.applications.api.DialogV2.confirm({
            classes: ['_extend', '_'+rules0],
            window: { title: game.i18n.localize("common.rules") },
            position: { height: 'auto' },
            content: `<p>${game.i18n.localize("explain.cambiarReglas")}</p>`,
            yes: () => {return true},
            no: () => {return false},
            defaultYes: false
        })
        if (!confirmation) return

        await helperContext.deleteAllContext(document)        
        await document.update({"system.rules": rules, 
                               "system.control.importedSkills": false})
    }

    /**
     * hideTitle
     * @param {*} html 
     */
    static hideTitle(html) {
        let title = html.find('.window-title')
        title.hide();
    }
    static showTitle(html) {
        let title = html.find('.window-title')
        title.show();
    }

    /**
     * readLoreContext
     * @param {*} document 
     */
    static readLoreContext(document) {
        let info = {};
        [
            {type: 'reino', field: 'reino'},
            {type: 'pueblo', field: 'origen'},
            {type: 'sociedad', field: 'cultura'},
            {type: 'estrato', field: 'estamento'},
            {type: 'posicion', field: 'posicion'},
            {type: 'profesion', field: 'profesion'},
            {type: 'profesion', field: 'profesionPaterna'}

        ].map(o => {
            const oItem = document.items.find(e => e.type === o.type)
            info[o.field] = {
                id: '',
                key: '',
                label: game.i18n.localize('common.noItem'),
                img: "systems/"+SYSTEM_ID+"/assets/svg/cancel.svg"
            } 
            if (oItem) {
                info[o.field] = {...info[o.field], ...{
                    id: oItem.id,
                    key: oItem.system.key,
                    label: oItem.name,
                    img: oItem.img
                }}
            } 
        })

        return info
    }
}