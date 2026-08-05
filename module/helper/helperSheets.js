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
import sheetGrimorio  from "../sheets/item/grimorio.js"
import sheetHechizo  from "../sheets/item/hechizo.js"
import sheetEnsalmo  from "../sheets/item/ensalmo.js"
import sheetFormula  from "../sheets/item/formula.js"
import sheetTienda  from "../sheets/item/tienda.js"

import sheetTableExtend from "../sheets/table/base.js"

import helperContext from "./helperContext.js"
import helperDialog from "./helperDialog.js"
import helperPxTools from "../../libs/helperPxTools.js"
import { aqConfig } from "../config/config.js"
import { configRULES } from "../config/rules.js"
import helperTools from "./helperTools.js"
import helperSocket from "./helperSocket.js"
import helperMessages from "./helperMessages.js"

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
        vI.registerSheet(SYSTEM_ID, sheetGrimorio, { types: ["grimorio"], makeDefault: true, label: "sheet.grimorio" })
        vI.registerSheet(SYSTEM_ID, sheetHechizo, { types: ["hechizo"], makeDefault: true, label: "sheet.hechizo" })
        vI.registerSheet(SYSTEM_ID, sheetEnsalmo, { types: ["ensalmo"], makeDefault: true, label: "sheet.ensalmo" })
        vI.registerSheet(SYSTEM_ID, sheetFormula, { types: ["formula"], makeDefault: true, label: "sheet.formula" })
        vI.registerSheet(SYSTEM_ID, sheetTienda, { types: ["tienda"], makeDefault: true, label: "sheet.tienda" })

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
            char.max = 99;
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
        _attrs.tem.max = 999       
        _attrs.tem.total = this._checkMinMax(_attrs.tem.total, _attrs.tem.min, _attrs.tem.max)
        _attrs.tem.value = _attrs.tem.total

        //Racionalidad e Irracionalidad
        _attrs.rr.min = 0
        _attrs.rr.max = 999
        _attrs.rr.value = this._checkMinMax(_attrs.rr.value, _attrs.rr.min, _attrs.rr.max)

        _attrs.irr.min = 0
        _attrs.irr.max = 999
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

        //Hechizos, Ensalmos y Fórmulas
        const requisitos = helperContext.getMagiaRequisitos(rules)
        const conMagico = system.competencias.find(e => e.key === requisitos.hechizos.skillID)
        const teologia  = system.competencias.find(e => e.key === requisitos.ensalmos.skillID)

        system.magia.tipo.hechizos = !conMagico ? false :
                                        _attrs.irr.value >= requisitos.hechizos.minIRR &&
                                        conMagico.stats.value >= requisitos.hechizos.minSkill

        system.magia.tipo.ensalmos = !teologia ? false : 
                                        _attrs.rr.value >= requisitos.ensalmos.minRR &&
                                        teologia.stats.value >= requisitos.ensalmos.minSkill

        if (system.magia.tipo.formulas) system.magia.tipo.hechizos = false

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
            let value = this._checkMinMax(stats.value, stats.min, stats.max)

            if (systemSkill.normal && systemSkill.checked) systemSkill.normal = false
            if (systemSkill.normal) value = min

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

    /**
     * itemsHechizos
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsHechizos(actor, rules) {
        const _config = aqConfig.hechizos[rules]
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'hechizo' && e.system.rules === rules)
        mItems.sort((a,b) => a.name.localeCompare(b.name))
        mItems.map(item => {
            const oTipo = _config.tipos.find(e => e.key === item.system.info.forma)
            const oItem = {
                item: item,
                nivel: item.system.vis,
                nivelTxt: game.i18n.localize(_config.niveles[item.system.vis]?.label) || '',
                pta: _config.niveles[item.system.vis]?.pta || 0,
                ptc: _config.niveles[item.system.vis]?.ptc || 0,
                mod: _config.niveles[item.system.vis]?.mod || '',
                tipoTxt: game.i18n.localize(oTipo?.label) || '',
                tipoLetter: game.i18n.localize(oTipo?.label)[0] || '',
                tipoIcon: oTipo?.icon || '',
                base: actor.system.atributos.irr.value,
            }
            oItem.total = Number(oItem.base) + Number(oItem.mod)
            mReturn.push(oItem)
        })
        return mReturn        
    }

    /**
     * itemsEnsalmos
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsEnsalmos(actor, rules) {
        const _config = aqConfig.ensalmos[rules]
        let mReturn = []
        let mItems = actor.items.filter(e => e.type === 'ensalmo' && e.system.rules === rules)
        mItems.sort((a,b) => a.name.localeCompare(b.name))
        mItems.map(item => {
            const oItem = {
                item: item,
                nivel: item.system.ordo,
                nivelTxt: game.i18n.localize(_config.niveles[item.system.ordo]?.label) || '',
                pta: _config.niveles[item.system.ordo]?.pta || 0,
                ptf: _config.niveles[item.system.ordo]?.ptf || 0,
                mod: _config.niveles[item.system.ordo]?.mod || '',
                base: actor.system.atributos.rr.value,
            }
            oItem.total = Number(oItem.base) + Number(oItem.mod)
            mReturn.push(oItem)
        })
        return mReturn        
    }

    /**
     * itemsHechizosEstudio
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsHechizosEstudio(actor, rules) {
        let mReturn = []
        actor.system.magia.estudio.map(estudio => {
            let oEstudio = {...estudio, ...{
                item: actor.items.find(e => e.system.key === estudio.key)
            }}
            mReturn.push(oEstudio)
        })
        return mReturn
    }

    /**
     * ensalmosEstudio
     * @param {*} actor 
     */
    static ensalmosEstudio(actor, rules) {
        const _config = aqConfig.ensalmos[rules]
        const teologia = actor.system.competencias.find(e => e.key === 'teologia')?.stats.value || 0
        let mReturn = []
        for (var s in actor.system.ritual.estudio) {
            
            const oRitual = actor.system.ritual.estudio[s]
            const oRitualAux = {...oRitual, ...{
                level: s,
                levelText: game.i18n.localize('common.'+s),
                minTeo: _config.niveles[s].teologia.min,
                actTeo: teologia,
                available: teologia >= _config.niveles[s].teologia.min,
                estudiable: false,
                meses: oRitual.meses,
                mesesTotal: _config.niveles[s].estudioMeses,
                percent: Math.round((oRitual.meses / _config.niveles[s].estudioMeses) *100),
                usePta: _config.requisitos.ptAprendizaje,
                pta: _config.niveles[s].pta,
                pagado: oRitual.pagado,
                mod: _config.niveles[s].mod,
                mods: _config.niveles[s].mods,
            }}
            oRitualAux.aprendizaje = (oRitualAux.percent === 100)
            mReturn.push(oRitualAux)
        }
        let estudiable = mReturn.find(e => e.available && !e.completado && !e.estudiando)
        if (estudiable) estudiable.estudiable = true
        return mReturn
    }

    /**
     * itemsHechizosPreparacion
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsHechizosPreparacion(actor, rules) {
        let mReturn = []
        actor.system.magia.preparacion.map(preparado => {
            let oPreparado = {...preparado, ...{
                item: actor.items.find(e => e.system.key === preparado.key)
            }}
            mReturn.push(oPreparado)
        })
        return mReturn
    }

    /**
     * itemsEnsalmosPreparacion
     * @param {*} actor 
     * @param {*} rules 
     */
    static itemsEnsalmosPreparacion(actor, rules) {
        let mReturn = []
        actor.system.magia.preparacion.map(preparado => {
            let oPreparado = {...preparado, ...{
                item: actor.items.find(e => e.system.key === preparado.key)
            }}
            mReturn.push(oPreparado)
        })
        return mReturn
    }

    /**
     * ensalmoPreparacion
     * @param {*} actor 
     * @param {*} rules 
     */
    static ensalmoPreparacion(actor, rules) {
        const item = actor.items.get(actor.system.ritual.preparacion.id)
        if (!item) return {}

        const _config = aqConfig.ensalmos[rules]
        const _nivel = _config.niveles[item.system.ordo]
        
        return {
            ptf: _nivel.ptf,
            ptfOK: item.system.propiedades.estadoGracia ? actor.system.atributos.ptf.value >= _nivel.ptf &&
                                                        actor.system.atributos.ptf.value == actor.system.atributos.ptf.max :
                                                        actor.system.atributos.ptf.value >= _nivel.ptf,
            mod: _nivel.mod,
            mods: _nivel.mods,
            item: item
        }
    }

    /**
     * importOrdo
     * @param {*} actor 
     * @param {*} ordo 
     */
    static async importOrdo(actor, ordo) {
        const rules = actor.system.rules
        const sPath = "system.ritual.estudio."+ordo+".completado"

        const mEnsalmos = (await helperContext.getFromCompendium(rules, 'ensalmo')).filter(e => e.system.ordo === ordo)
        if (mEnsalmos.length === 0) {
            helperDialog.error('error.noOrdo')
            return
        }
        let itemsInfo = ""
        mEnsalmos.map(ensalmo => {
            itemsInfo += itemsInfo !== "" ? ', ' + ensalmo.name : ensalmo.name
        })
        const content = `<h4 class="_title divider">${game.i18n.localize('common.'+ordo)}</h4>
                         <p>${game.i18n.localize("explain.adquirirOrdo")}</p>
                         <p><strong>${game.i18n.localize("common.ensalmos")}: </strong> ${itemsInfo}</p>`

        const answer = await helperDialog.dialogConfirm(rules, game.i18n.localize('common.'+ordo), content)
        if (!answer) return
        
        const mMyEnsalmos = actor.items.filter(e => e.type === 'ensalmo')
        const mAddEnsalmos = mEnsalmos.filter(e1 => !mMyEnsalmos.find(e2 => e2.system.key === e1.system.key))

        await Item.create(mAddEnsalmos, {parent: actor})
        await actor.update({
            "system.control.importedSkills": true,
            [sPath]: true
        })
    }

    /**
     * provisiones
     * @param {*} actor 
     * @param {*} rules 
     */
    static provisiones(actor, rules) {
        let oReturn = {
            comida: {
                actual: 0,
                total: 0,
                percent: 0,
                items: []
            },
            bebida: {
                actual: 0,
                total: 0,
                percent: 0,
                items: []
            }
        };

        ["comida", "bebida"].map(s => {
            oReturn[s].items = actor.items.filter(e => e.type === 'item' && e.system[s])
            oReturn[s].items.sort((a,b) => a.name.localeCompare(b.name))
            oReturn[s].items.map(o => {
                if (!o.system.unidades.use) return;
                oReturn[s].actual += Number(o.system.unidades.actual)
                oReturn[s].total += Number(o.system.unidades.total)
            })
            oReturn[s].percent = oReturn[s].total > 0 ? Math.round((oReturn[s].actual / oReturn[s].total) * 100) : 0
        })
        return oReturn
    }

    /**
     * municion
     * @param {*} actor 
     * @param {*} rules 
     */
    static municion(actor, rules) {
        let mReturn = actor.items.filter(e => e.type === 'item' && e.system.municion)
        mReturn.sort((a,b) => a.name.localeCompare(b.name))
        return mReturn
    }

    /**
     * equipo
     * @param {*} actor 
     * @param {*} rules 
     */
    static equipo(actor, rules) {
        let mReturn = actor.items.filter(e => e.type === 'item' && 
                                            (!e.system.municion && !e.system.comida && !e.system.bebida))
        mReturn.sort((a,b) => a.name.localeCompare(b.name))
        return mReturn
    }

    /**
     * tiendas
     * @param {*} id 
     * @param {*} activeId 
     * @param {*} rules 
     */
    static tiendas(id, activeId, rules) {
        let mReturn = []
        const mTiendas = game.items.filter(e => e.type === 'tienda' && !!e.system.actors.find(o => o.id === id))
        if (!mTiendas || mTiendas.length === 0) return
        mTiendas.map(tienda => {
            mReturn.push({
                id: tienda.id,
                name: tienda.name,
                img: tienda.img,
                folder: tienda.system.folder,
                active: tienda.id === activeId
            })
        })
        return mReturn
    }

    /**
     * tienda
     * @param {*} id 
     * @param {*} activeId 
     * @param {*} rules 
     */
    static tienda(id, activeId, rules) {
        let oReturn = {
            id: id,
            active: false,
            name: '',
            descripcion: '',
            items: []
        }
        if (!activeId) return oReturn

        const itemTienda = game.items.find(e => e.type === 'tienda' 
                                             && !!e.system.actors.find(o => o.id === id)
                                             && e.id === activeId)
        if (!itemTienda) return oReturn   
        
        oReturn.id = itemTienda.id
        oReturn.name = itemTienda.name
        oReturn.descripcion = itemTienda.system.descripcion

        game.folders.get(itemTienda.system.folder).contents.map(item => {
            const oItem = itemTienda.system.productos.find(e => e.id === item.id)
            if (!oItem || !oItem.visible) return
            oReturn.items.push({
                id: item.id,
                img: item.img,
                name: item.name,
                precio: item.system.precio,
                limitado: oItem.limitado,
                unidades: oItem.unidades
            })
        })
        oReturn.active = oReturn.items.length > 0
        return oReturn
    }

    /**
     * comprarItem
     * @param {*} tiendaID 
     * @param {*} itemID 
     * @param {*} actor 
     */
    static comprarItem(tiendaID, itemID, actor) {
        const rules = actor.system.rules
        const tienda = game.items.get(tiendaID)
        const item = game.items.get(itemID)  
        if (!tienda || !item) return

        if ((actor.system.economia.dineros - item.system.precio) < 0) {
            helperDialog.dialogConfirm(rules, actor.name, game.i18n.localize('explain.sinDinero'))
            return
        }

        helperSocket.requestBuyItem({
            actorId: actor.id,
            tokenId: actor.token?.tokenId,
            stats: {
                tiendaId: tiendaID,
                itemId: itemID
            }
        })      
    }

    /**
     * requestComprarItem
     * @param {*} param0 
     */
    static async requestComprarItem({actorId, tokenId, stats}) {
         if (!game.user.isGM) return

        const actor = helperTools.getActor(actorId, tokenId)
        const tienda = game.items.get(stats.tiendaId)
        const item = game.items.get(stats.itemId)
        if (!actor || !tienda || !item) return

        const oItem = tienda.system.productos.find(e => e.id === item.id)
        if (!oItem || !oItem.visible || (oItem.limitado && oItem.unidades <= 0)) return

        const precio = item.system.precio
        const dineros = actor.system.economia.dineros - precio
        if (dineros < 0) return
   
        await Item.create([item], {parent: actor})
      
        if (oItem.limitado && oItem.unidades === 1) {
            const index = tienda.system.productos.findIndex(e => e.id === item.id)            
            let mProductos = tienda.system.productos
            mProductos.splice(index, 1)
            await tienda.update({"system.productos": mProductos})        
            await item.delete()

        } else if (oItem.limitado && oItem.unidades > 1) {
            let mProductos = tienda.system.productos
            const index = mProductos.findIndex(e => e.id === item.id)
            mProductos[index].unidades -= 1
            await tienda.update({"system.productos": mProductos})

        }
        
        await actor.update({"system.economia.dineros": dineros})
        await helperMessages.postMessage({
            actor: actor,
            title: item.name,
            subTitle: game.i18n.localize('common.comprarItem'),
            textAuxiliar: game.i18n.localize('common.precio') + ': ' + precio + ' ' + configRULES[actor.system.rules].moneda,
            backImg: item.img,
            content: '',
            class: '_producto',
            whisper: [game.users.activeGM.id, game.user.id]
        })
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
     * getItemsRenderOptions
     * @param {*} sheet 
     * @returns 
     */
    static getItemsRenderOptions(sheet, html) {
        const pxUnit = sheet ? helperPxTools.toPX(sheet.document.system.control.textSize) :
                               helperPxTools.toPX(window.getComputedStyle(html[0]).getPropertyValue('--fSize'))
        const formWidth = sheet ? sheet.position.width -25: html.width() + 1.4 -25
        const formHeight = sheet ? sheet.position.height : html.height() + 1.4
        const divStats = pxUnit * 29.5
        const divItem = formWidth - divStats - (sheet.isEditMode ? 10 : 5)
        const divRow = pxUnit * 15

        const options = {
            side: divItem > divStats,
            width: divItem > divRow ? divItem+'px' : '100%',
            columns: divItem > divRow ? Math.trunc(divItem / divRow) : Math.trunc(formWidth / divRow)
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

            const skillOptions = this.getItemsRenderOptions(false, html)
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
     * addEditClass
     * @param {*} html 
     * @param {*} document 
     */
    static addEditClass(html, document) {
        if (document.sheet._sheetMode === 0) html.addClass('_editing')
                                        else html.removeClass('_editing')
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

    /**
     * clearKey
     * @param {*} sKey 
     */
    static clearKey(sKey) {
        let sReturn = sKey.replaceAll(' ', '_').toLowerCase()
        sReturn = sReturn.replaceAll('ú', 'u').replaceAll('ó', 'o').replaceAll('í', 'i').replaceAll('é', 'e').replaceAll('á', 'a')
        sReturn = sReturn.replaceAll('ü', 'u').replaceAll('ö', 'o').replaceAll('ï', 'i').replaceAll('ë', 'e').replaceAll('ä', 'a')
        sReturn = sReturn.replaceAll('ù', 'u').replaceAll('ò', 'o').replaceAll('ì', 'i').replaceAll('è', 'e').replaceAll('à', 'a')
        sReturn = sReturn.replaceAll('û', 'u').replaceAll('ô', 'o').replaceAll('î', 'i').replaceAll('ê', 'e').replaceAll('â', 'a')
        sReturn = sReturn.replaceAll('(', '').replaceAll(')', '').replaceAll('[', '').replaceAll(']', '').replaceAll('ñ', 'n')
        sReturn = sReturn.replaceAll('/', '').replaceAll('"', '').replaceAll("'", '').replaceAll('`', '').replaceAll('´', '')
        sReturn = sReturn.replaceAll('*', '').replaceAll('?', '').replaceAll('¿', '').replaceAll('!', '').replaceAll('¡', '')
        sReturn = sReturn.replaceAll('^', '').replaceAll('¨', '').replaceAll('+', '').replaceAll('-', '').replaceAll('.', '')
        sReturn = sReturn.replaceAll(',', '').replaceAll(';', '').replaceAll(':', '').replaceAll('<', '').replaceAll('>', '')
        return sReturn
    }

    /**
     * getFolders
     */
    static getFolders() {
        let oReturn = {}
        game.folders.filter(e => e.type === 'Item' && e.depth === 1).map(e => {
            oReturn[e.id] = {
                key: e.id,
                label: e.name
            }
        })
        return oReturn
    }

    /**
     * getUsers
     */
    static getUsers() {
        let mUsers = []
        Array.from(game.users).map(user => {
            mUsers.push({
                id: user.id,
                name: user.name,
                icon: user.role === 4 ? 'fa-user-beard' : 'fa-user',
            })
        })
        mUsers.sort((a,b) => a.name.localeCompare(b.name))
        return mUsers
    }

    /**
     * getActors
     * @param {*} actors 
     * @returns 
     */
    static getActors(actors) {
        let mActors = []
        Array.from(game.actors).map(actor => {
            const oActor = actors.find(o => o.id ===  actor.id)
            mActors.push({
                id: actor.id,
                name: actor.name,
                img: actor.img,
                visible: oActor.visible
            })
        })
        mActors.sort((a,b) => a.name.localeCompare(b.name))
        return mActors
    }

    /**
     * getProductos
     * @param {*} folder 
     * @param {*} productos 
     * @returns 
     */
    static getProductos(folder, productos) {
        if (!folder || !game.folders.get(folder)) return
        let mItems = game.folders.get(folder).contents
        let mProductos = []

        mItems.map(item => {
            const oItem = productos.find(o => o.id ===  item.id)
            mProductos.push({
                id: item.id,
                name: item.name,
                img: item.img,
                visible: oItem ? oItem.visible : true,
                limitado: oItem ? oItem.limitado : false,
                unidades: oItem ? oItem.limitado ? oItem.unidades : '' : ''
            })
        })
        mProductos.sort((a,b) => a.name.localeCompare(b.name))
        return mProductos
    }

    /**
     * reconocerHechizo
     * @param {*} rules
     * @param {*} sContent 
     */
    static reconocerHechizo(rules, sContent) {
        const _config = aqConfig.hechizos[rules]
        let oItem = {
            name: '',
            key: '',
            nivel: '1',
            tipo: '',
            naturaleza: '',
            origen: '',
            caducidad: '',
            caducidadFormula: 'no',
            duracion: '',
            duracionFormula: 'no',
            tiradaRR: 'no',
            componentes: '',
            preparacion: '',
            descripcion: ''
        }
        let mLines = sContent.replaceAll('</p>', '').split('<p>').filter(e => e !== '')
        let linesInit = 2
        oItem.name = mLines[0].trim()
        oItem.name = oItem.name.trim().charAt(0).toUpperCase() + oItem.name.trim().slice(1)
        oItem.key = this.clearKey(oItem.name)

        if (rules === 'aq3') {
            linesInit = 3
            const sProperties = mLines[2].toLowerCase().replaceAll('.', '').trim()
            let sTipo = this.clearKey(sProperties.split(',')[0].trim())
            let sNaturaleza = this.clearKey(sProperties.split(',')[1].split(' de origen ')[0].trim().replaceAll('magia ',''))
            let sOrigen = this.clearKey(sProperties.split(',')[1].split(' de origen ')[1].trim())
            if (sOrigen === 'alquimico') sOrigen = 'alquimica'
            if (sOrigen === 'prohibido') sOrigen = 'prohibida'

            oItem.tipo = aqConfig.hechizos[rules].tipos.find(o => o.key === sTipo)?.key
            oItem.naturaleza = aqConfig.hechizos[rules].naturaleza.find(o => o.key === sNaturaleza)?.key
            oItem.origen = aqConfig.hechizos[rules].origen.find(o => o.key === sOrigen)?.key
        }
        if (rules === 'vyc') {
            linesInit = 2
            const sVIS = mLines[1].split('(')[0].trim().split(' ')[1];
            ['vis1', 'vis2', 'vis3', 'vis4', 'vis5', 'vis6', 'vis7'].map(s => {
                if (game.i18n.localize('common.'+s).toLowerCase() === sVIS) oItem.nivel = s.substr(3,1)
            })
            let sTipo = this.clearKey(mLines[1].split(',')[2].trim())
            let sNaturaleza = this.clearKey(mLines[1].split(',')[3].trim().split(' de origen ')[0].trim().replaceAll('magia ',''))
            let sOrigen = this.clearKey(mLines[1].split(',')[3].trim().split(' de origen ')[1].trim())
            if (sOrigen === 'alquimico') sOrigen = 'alquimica'
            if (sOrigen === 'prohibido') sOrigen = 'prohibida'

            oItem.tipo = aqConfig.hechizos[rules].tipos.find(o => o.key === sTipo)?.key
            oItem.naturaleza = aqConfig.hechizos[rules].naturaleza.find(o => o.key === sNaturaleza)?.key
            oItem.origen = aqConfig.hechizos[rules].origen.find(o => o.key === sOrigen)?.key
        }        

        let sRest = ''
        let sProperty = ''
        for (var i = linesInit; i < mLines.length; i++) {
            const line = mLines[i]
            if (line.split('ProseMirror').length > 1) continue
            if (line.substr(0, 2) === 'a ' ||                
                line.substr(0, 10) === 'Caducidad:' ||
                line.substr(0, 9) === 'Duración:' ||
                line.substr(0, 13) === 'Tirada de RR:' ||
                line.substr(0, 12) === 'Componentes:' ||
                line.substr(0, 12) === 'Preparación:' ||
                line.substr(0, 12) === 'Descripción:') {

                if (sProperty !== '') oItem[sProperty] = sRest
                if (line.substr(0, 2) === 'a ') sProperty = this.clearKey(line.substr(2).split(':')[0].toLowerCase())
                                           else sProperty = this.clearKey(line.split(':')[0].toLowerCase())

                if (sProperty === 'descripcion' || 
                    sProperty === 'preparacion') sRest = '<p>' + line.substr(2).split(':')[1].trim() + '</p>'
                                            else sRest = line.substr(2).split(':')[1].trim()
                
            } else {
                if (sProperty === 'descripcion' || 
                    sProperty === 'preparacion') sRest += '<p>' + line + '</p>'
                                            else sRest += line
            }
        }
        oItem[sProperty] = sRest        

        oItem.componentes = oItem.componentes.replaceAll(' y ', ', ').replaceAll('.', '').replaceAll('*', '')
        oItem.caducidad = oItem.caducidad.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.caducidad
        oItem.duracion = oItem.duracion.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.duracion
        oItem.preparacion = oItem.preparacion.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.preparacion

        return `<p><b>Nombre:</b> ${oItem.name}</p>
                <p><b>Key:</b> ${oItem.key}</p>
                <p><b>VIS:</b> ${oItem.nivel}</p>
                <p><b>Tipo:</b> ${oItem.tipo}</p>
                <p><b>Naturaleza:</b> ${oItem.naturaleza}</p>
                <p><b>Origen:</b> ${oItem.origen}</p>
                <p><b>Caducidad:</b> ${oItem.caducidad}</p>
                <p><b>Caducidad (Es una Fórmula):</b> ${oItem.caducidadFormula}</p>
                <p><b>Duración:</b> ${oItem.duracion}</p>
                <p><b>Duración (Es una Fórmula):</b> ${oItem.duracionFormula}</p>
                <p><b>Tirada de RR:</b> ${oItem.tirada_de_rr ? oItem.tirada_de_rr : 'no'}</p>
                <p><b>Componentes:</b> ${oItem.componentes}</p>
                <p><b>PREPARACIÓN</b> ${oItem.preparacion}</p>
                <p><b>DESCRIPCIÓN</b> ${oItem.descripcion}</p>`
    }

    /**
     * parseHechizo
     * @param {*} sText 
     * @param {*} item 
     */
    static async parseHechizo(sText, item) {
        try {
            const folder = item.system.massEditFolder
            let mLines = sText.split('<p><b>').filter(e => e !== '')
            if (mLines.length === 1) mLines = sText.split('<p><strong>').filter(e => e !== '')
            let oSystem = {
                info: {},
                propiedades: {
                    caducidad: {},
                    duracion: {}
                },
                componentes: [],
                rules: item.system.rules
            }
            let name = ''
            mLines.map(line => {
                line = line.replaceAll('<b>', '<strong>').replaceAll('</b>', '</strong>')

                let sProperty = this.clearKey(line.replace('</strong></p>', '</strong> ').split('</strong> ')[0].toLowerCase().replaceAll(':', ''))
                let sRest = ''
                const temp = line.replace('</strong> ', '#--#').split('#--#')
                if (temp.length === 1 ) sRest = line.split('</strong></p>')[1].replaceAll('<p></p>', '')
                                   else sRest = line.replace('</strong> ', '#--#').split('#--#')[1].split('</p>\n')[0].trim()

                if (sProperty !== 'preparacion' &&
                    sProperty !== 'descripcion') sRest = sRest.split('</p>')[0]

                if (sProperty === 'nombre') name = sRest
                if (sProperty === 'key')  oSystem.key = sRest
                if (sProperty === 'vis')  oSystem.vis = 'vis'+sRest
                if (sProperty === 'tipo')  oSystem.info.forma = sRest
                if (sProperty === 'naturaleza')  oSystem.info.naturaleza = sRest
                if (sProperty === 'origen')  oSystem.info.origen = sRest
                if (sProperty === 'caducidad') oSystem.propiedades.caducidad.text = sRest
                if (sProperty === 'tirada_de_rr') oSystem.tiradaRR = this.clearKey(sRest.toLowerCase()) === 'si'
                if (sProperty === 'caducidad_es_una_formula' && sRest.toLowerCase() === 'si') {                    
                    oSystem.propiedades.caducidad.useFormula = true
                    oSystem.propiedades.caducidad.formula = oSystem.propiedades.caducidad.text
                    oSystem.propiedades.caducidad.text = ''
                }
                if (sProperty === 'duracion') oSystem.propiedades.duracion.text = sRest
                if (sProperty === 'duracion_es_una_formula' && sRest.toLowerCase() === 'si') {                    
                    oSystem.propiedades.duracion.useFormula = true
                    oSystem.propiedades.duracion.formula = oSystem.propiedades.duracion.text
                    oSystem.propiedades.duracion.text = ''
                }
                if (sProperty === 'componentes') {
                    let nIndex = 1
                    sRest.split(',').map(comp => {
                        oSystem.componentes.push({
                            key: nIndex.toString(),
                            name: comp.trim().charAt(0).toUpperCase() + comp.trim().slice(1),
                            checked: false
                        })
                        nIndex++
                    })
                }
                if (sProperty === 'preparacion') oSystem.propiedades.preparacion = sRest
                if (sProperty === 'descripcion') oSystem.descripcion = sRest
            })
            oSystem.fuente = (item.system.rules === 'aq3') ? "Fuente: Aquelarre Manual básico ( 3a Edición - NoSoloRol )" :
                             (item.system.rules === 'aq4') ? "Fuente: Aquelarre Manual básico ( 4a Edición - NoSoloRol )" :
                             (item.system.rules === 'vyc') ? "Fuente: Villa y Corte Manual básico ( NoSoloRol )" : ''

            if (item.system.rules === 'aq3') {
                oSystem.vis = item.system.vis
            }

            const newItem = await Item.create([{
                                        name: name, 
                                        img: item.img,
                                        type: item.type, 
                                        system: oSystem,
                                        folder: folder}])
        } catch(error) {
            ui.notifications.error(`Error en el Sistema: ${error.message}`, { permanent: true });            
        }
    }

    /**
     * reconocerEnsalmo
     * @param {*} rules
     * @param {*} sContent 
     */
    static reconocerEnsalmo(rules, sContent) {
        const _config = aqConfig.hechizos[rules]
        let oItem = {
            name: '',
            key: '',
            nivel: '1',
            requisitos: '',
            ceremonia: '',
            duracion: '',
            descripcion: ''
        }
        let mLines = sContent.replaceAll('</p>', '').split('<p>').filter(e => e !== '')
        let linesInit = 2
        oItem.name = mLines[0].trim()
        oItem.name = oItem.name.trim().charAt(0).toUpperCase() + oItem.name.trim().slice(1)
        oItem.key = this.clearKey(oItem.name)

        if (rules === 'aq3') {
            linesInit = 2
        }
        if (rules === 'vyc' || rules === 'aq4') {
            linesInit = 2
            const sORDO = mLines[1].split('(')[0].trim().split(' ')[1];
            ['ordo1', 'ordo2', 'ordo3', 'ordo4', 'ordo5', 'ordo6', 'ordo7'].map(s => {
                if (game.i18n.localize('common.'+s).toLowerCase() === sORDO) oItem.nivel = s.substr(3,1)
            })
        }        

        let sRest = ''
        let sProperty = ''
        for (var i = linesInit; i < mLines.length; i++) {
            const line = mLines[i]
            if (line.split('ProseMirror').length > 1) continue
            if (line.substr(0, 2) === 'a ' ||                
                line.substr(0, 10) === 'Ceremonia:' ||
                line.substr(0, 11) === 'Requisitos:' ||
                line.substr(0, 25) === 'Duración de la Ceremonia:' ||
                line.substr(0, 8) === 'Efectos:') {

                if (sProperty !== '') oItem[sProperty] = sRest
                if (line.substr(0, 2) === 'a ') sProperty = this.clearKey(line.substr(2).split(':')[0].toLowerCase())
                                           else sProperty = this.clearKey(line.split(':')[0].toLowerCase())

                if (sProperty === 'ceremonia' || 
                    sProperty === 'requisitos' ||
                    sProperty === 'duracion de la ceremonia' ||
                    sProperty === 'efectos') sRest = '<p>' + line.substr(2).split(':')[1].trim() + '</p>'
                                        else sRest = line.substr(2).split(':')[1].trim()
                
            } else {
                if (sProperty === 'ceremonia' ||
                    sProperty === 'requisitos' ||
                    sProperty === 'duracion de la ceremonia' || 
                    sProperty === 'efectos') sRest += '<p>' + line + '</p>'
                                        else sRest += line
            }
        }
        oItem[sProperty] = sRest        

        oItem.requisitos = oItem.requisitos.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.requisitos
        oItem.ceremonia = oItem.ceremonia.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.ceremonia
        oItem.duracion = oItem.duracion.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.duracion
        oItem.efectos = oItem.efectos.trim() === '' ? game.i18n.localize('common.noAplica') : oItem.efectos

        return `<p><b>Nombre:</b> ${oItem.name}</p>
                <p><b>Key:</b> ${oItem.key}</p>
                <p><b>ORDO:</b> ${oItem.nivel}</p>
                <p><b>REQUISITOS</b> ${oItem.requisitos}</p>
                <p><b>CEREMONIA</b> ${oItem.ceremonia}</p>
                <p><b>Duración:</b> ${oItem.duracion_de_la_ceremonia}</p>                
                <p><b>EFECTOS</b> ${oItem.efectos}</p>`
    }

    /**
     * parseEnsalmo
     * @param {*} sText 
     * @param {*} item 
     */
    static async parseEnsalmo(sText, item) {
        try {
            const folder = item.system.massEditFolder
            let mLines = sText.split('<p><b>').filter(e => e !== '')
            if (mLines.length === 1) mLines = sText.split('<p><strong>').filter(e => e !== '')
            let oSystem = {
                propiedades: {},
                rules: item.system.rules
            }
            let name = ''
            mLines.map(line => {
                line = line.replaceAll('<b>', '<strong>').replaceAll('</b>', '</strong>')

                let sProperty = this.clearKey(line.replace('</strong></p>', '</strong> ').split('</strong> ')[0].toLowerCase().replaceAll(':', ''))
                let sRest = ''
                const temp = line.replace('</strong> ', '#--#').split('#--#')
                if (temp.length === 1 ) sRest = line.split('</strong></p>')[1].replaceAll('<p></p>', '')
                                   else sRest = line.replace('</strong> ', '#--#').split('#--#')[1].split('</p>\n')[0].trim()

                if (sProperty !== 'requisitos' &&
                    sProperty !== 'ceremonia' &&
                    sProperty !== 'duracion' &&
                    sProperty !== 'efectos') sRest = sRest.split('</p>')[0]

                if (sProperty === 'nombre') name = sRest
                if (sProperty === 'key')  oSystem.key = sRest
                if (sProperty === 'ordo')  oSystem.ordo = 'ordo'+sRest

                if (sProperty === 'requisitos') oSystem.propiedades.requisitos = sRest
                if (sProperty === 'ceremonia') oSystem.propiedades.ceremonia = sRest
                if (sProperty === 'duracion') oSystem.propiedades.duracion = sRest
                if (sProperty === 'efectos') oSystem.descripcion = sRest
            })
            oSystem.fuente = (item.system.rules === 'aq3') ? "Fuente: Aquelarre Manual básico ( 3a Edición - NoSoloRol )" :
                             (item.system.rules === 'aq4') ? "Fuente: Aquelarre Manual básico ( 4a Edición - NoSoloRol )" :
                             (item.system.rules === 'vyc') ? "Fuente: Villa y Corte Manual básico ( NoSoloRol )" : ''

            if (item.system.rules === 'aq3') {
                oSystem.ordo = item.system.ordo
            }

            const newItem = await Item.create([{
                                        name: name, 
                                        img: item.img,
                                        type: item.type, 
                                        system: oSystem,
                                        folder: folder}])
        } catch(error) {
            ui.notifications.error(`Error en el Sistema: ${error.message}`, { permanent: true });            
        }
    }    
}