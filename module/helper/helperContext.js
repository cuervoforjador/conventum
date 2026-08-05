import { SYSTEM_ID } from "../config/uiConstants.js"
import { configRULES } from "../config/rules.js"
import extendCharacter_Character from "../models/character/character.js"
import { aqConfig } from "../config/config.js"
import helperMessages from "./helperMessages.js"
import helperDialog from "./helperDialog.js"
import newRoll from "../documents/roll.js"

export default class helperContext {

    /**
     * getRules
     */
    static getRules() {
        const rules = game.settings.settings.get('aquelarre.rules').choices
        let oReturn = {}
        for (var s in rules) {
            oReturn[s] = {
                key: s,
                label: game.i18n.localize(rules[s])
            }
        }
        return oReturn
    }

    /**
     * getWorldRules
     */
    static getWorldRules() {
        return game.settings.get(SYSTEM_ID, "rules");
    }

    /**
     * getCaracteristicas
     */
    static getCaracteristicas() {

        let oReturn = {};
        const schema = extendCharacter_Character.defineSchema();
        for (var s in schema.caracteristicas.fields) {
            const label = game.i18n.localize(schema.caracteristicas.fields[s].label) +
                          ' (' + game.i18n.localize(schema.caracteristicas.fields[s].hint) + ')'
            oReturn[s] = { key: s, label: label };
        }
        return oReturn
    }

    /**
     * getAtributos
     */
    static getAtributos() {

        let oReturn = {};
        const schema = extendCharacter_Character.defineSchema();
        for (var s in schema.atributos.fields) {
            const label = game.i18n.localize(schema.atributos.fields[s].label) +
                          ' (' + game.i18n.localize(schema.atributos.fields[s].hint) + ')'
            oReturn[s] = { key: s, label: label };
        }
        return oReturn
    }

    /**
     * getCompetencias
     * @param {*} rules 
     */
    static async getCompetencias(rules) {
        const mSkills = await this.getFromCompendium(rules, 'competencia')
        mSkills.sort((a,b) => a.name.localeCompare(b.name))
        return mSkills           
    }
    static async getCompetenciasObject(rules) {
        let oReturn = {};
        (await this.getCompetencias(rules)).map(e => {
            oReturn[e.system.key] = {
                key: e.system.key,
                label: e.name + ' (' + game.i18n.localize('CHAR.'+e.system.caracteristica) + ')'
            }
        })
        return oReturn
    }    

    /**
     * getCompetenciasArmas
     * @param {*} rules 
     */
    static async getCompetenciasArmas(rules) {
        return (await this.getCompetencias(rules)).filter(e => e.system.armas)
    }
    static async getCompetenciasArmasSheet(rules) {
        let oReturn = {}
        const mSkills = await this.getCompetenciasArmas(rules)
        mSkills.map(o => {
            oReturn[o.system.key] = {
                key: o.system.key,
                label: o.name
            }
        })
        return oReturn
    }    

    /**
     * getSociedades
     */
    static async getSociedades(rules) {
        const mDocs = await this.getFromCompendium(rules, 'sociedad')
        return this._toObject(mDocs)     
    }

    /**
     * getIdiomas
     */
    static async getIdiomas(rules) {
        const mDocs = await this.getFromCompendium(rules, 'competencia')
        const mLangs = mDocs.filter(e => e.system.idioma)
        return this._toObject(mLangs)    
    }

    /**
     * getPueblos
     */
    static async getPueblos(rules) {
        const mDocs = await this.getFromCompendium(rules, 'pueblo')
        return this._toObject(mDocs)   
    }

    /**
     * getEstratos
     */
    static async getEstratos(rules) {
        const mDocs = await this.getFromCompendium(rules, 'estrato')
        return this._toObject(mDocs)   
    }

    /**
     * getPosiciones
     */
    static async getPosiciones(rules) {
        const mDocs = await this.getFromCompendium(rules, 'posicion')
        return this._toObject(mDocs)   
    }

    /**
     * getFromCompendium
     * @param {*} rules 
     * @param {*} sType 
     * @returns 
     */
    static async getFromCompendium(rules, sType=null) {
        let mReturn = [];
        let mPacks = game.packs.filter(e => e.metadata.flags.rules === rules)
        for (var pack of mPacks) {
            const mDocs = (!sType || sType === '') ? await pack.getDocuments() :
                                                    (await pack.getDocuments()).filter(e => e.type === sType)
            mDocs.map(o => { mReturn.push(o) })
        }
        mReturn.sort((a,b) => a.name.localeCompare(b.name))
        return mReturn
    }

    /**
     * getLoreItem
     * @param {*} rules 
     * @param {*} lore 
     * @param {*} key 
     */
    static async getLoreItem(rules, lore, key) {
        const mDocs = await this.getFromCompendium(rules, lore)
        return mDocs.find(e => e.system.key === key)
    }

    /**
     * getLoreOptions
     * @param {*} rules 
     * @param {*} lore 
     * @param {*} actor
     */
    static async getLoreOptions(rules, lore, actor) {
        const mDocs = await this.getFromCompendium(rules, lore)
        let mReturn = []
        switch (lore) {

            case 'reino':
                mDocs.map(o => { mReturn.push({ low: o.system.roll.low, high: o.system.roll.high, item: o }) })
                break;

            case 'pueblo':
                const reino = actor.items.find(e => e.type === 'reino')
                mReturn = this._getLoreTable(reino, "system.pueblos", mDocs)
                break;

            case 'estrato':
                if (configRULES[rules].estratoRoll) {
                    const pueblo = actor.items.find(e => e.type === 'pueblo')
                    mReturn = this._getLoreTable(pueblo, "system.estratos", mDocs)
                } 
                break;

            case 'posicion':
                if (configRULES[rules].posicionRoll) {
                    const sociedad = actor.items.find(e => e.type === 'sociedad')
                    const mEstratos = await this.getFromCompendium(rules, 'estrato')
                    const mEstratosFiltered = mEstratos.filter(e => e.system.sociedad.key === sociedad.system.key)
                    mEstratosFiltered.map(estrato => {
                        estrato.system.posiciones.map(posicion => {
                            const doc = mDocs.find(e => e.system.key === posicion.key)
                            if (!doc) return
                            mReturn.push({ low: doc.system.roll.low, high: doc.system.roll.high, item: doc })
                        })
                    })
                } else {
                    const estrato = actor.items.find(e => e.type === 'estrato')
                    mReturn = this._getLoreTable(estrato, "system.posiciones", mDocs)
                }
                break;
        }
        mReturn.sort((a,b) => a.low - b.low)            
        return mReturn        
    }

    /**
     * getLoreReinos
     * @param {*} rules 
     */
    static async getLoreReinos(rules) {
        const mDocs = await this.getFromCompendium(rules, 'reino')
        return {...{null: {key:'', label:''}}, ...this._toObject(mDocs)}
    }

    /**
     * getArmasTamanos
     * @param {*} rules 
     */
    static getArmasTamanos(rules) {
        let mReturn = []
        for (var s in aqConfig.armas.tamanos) {
            mReturn.push({
                key: s,
                label: game.i18n.localize(aqConfig.armas.tamanos[s].label)
            })
        }
        return mReturn
    }
    static getArmasTamanosSheet(rules) {
        let oReturn = {}
        this.getArmasTamanos(rules).map(o => {
            oReturn[o.key] = o
        })
        return oReturn
    }

    /**
     * getArmadurasTipos
     * @param {*} rules 
     */
    static getArmadurasTipos(rules) {
        let mReturn = []
        for (var s in aqConfig.armaduras.tipos) {
            mReturn.push({
                key: s,
                label: game.i18n.localize(aqConfig.armaduras.tipos[s].label)
            })
        }
        return mReturn
    }
    static getArmadurasTiposSheet(rules) {
        let oReturn = {}
        this.getArmadurasTipos(rules).map(o => {
            oReturn[o.key] = o
        })
        return oReturn
    }

    /**
     * getLocalizacionesTipos
     * @param {*} rules 
     */
    static getLocalizacionesTipos(rules) {
        let oReturn = {}
        for (var s in aqConfig.localizaciones) {
            oReturn[s] = {
                key: s,
                label: game.i18n.localize('common.'+s)
            }
        }
        return oReturn
    }

    /**
     * getLocalizaciones
     * @param {*} rules 
     * @param {*} option (Actor / location Type)
     */
    static getLocalizaciones(rules, option) {
        if (option === '') option = 'humanoide'
        const location = typeof option === 'string' ? option : option.system.info.localizacion
        return aqConfig.localizaciones[location]
    }
    static getMLocalizaciones(rules, option) {
        const locations = this.getLocalizaciones(rules, option)
        let mReturn = []
        for (var s in locations.partes) { mReturn.push({...locations.partes[s], ...{key: s}}) }
        return mReturn
    }
    static getLocalizacionesPartes(rules, option) {
        let oReturn = {}
        const locations = this.getLocalizaciones(rules, option)  
        for (var s in locations.partes) {
            oReturn[s] = {
                key: s,
                label: game.i18n.localize('common.'+s)
            }
        }
        return oReturn              
    }

    static getMagiaRequisitos(rules) {
        return {
            hechizos: aqConfig.hechizos[rules].requisitos,
            ensalmos: aqConfig.ensalmos[rules].requisitos
        }        
    }

    /**
     * getHechizosRequisitos
     * @param {*} rules 
     * @returns 
     */
    static getHechizosRequisitos(rules) {
        return aqConfig.hechizos[rules].requisitos
    }

    /**
     * getHechizosNiveles
     * @param {*} rules 
     * @returns 
     */
    static getHechizosNiveles(rules) {
        return this._mapObject(aqConfig.hechizos[rules].niveles)
    }

    /**
     * getHechizosTipos
     * @param {*} rules 
     * @returns 
     */
    static getHechizosTipos(rules) {
        return this._mapObject(aqConfig.hechizos[rules].tipos)
    }    
    
    /**
     * getHechizosNaturaleza
     * @param {*} rules 
     * @returns 
     */
    static getHechizosNaturaleza(rules) {
        return this._mapObject(aqConfig.hechizos[rules].naturaleza)
    }

    /**
     * getHechizosOrigen
     * @param {*} rules 
     * @returns 
     */
    static getHechizosOrigen(rules) {
        return this._mapObject(aqConfig.hechizos[rules].origen)
    }

    /**
     * getHechizosFabPociones / getHechizosFabTalismanes / getHechizosFabUnguentos
     * @param {*} rules 
     * @returns 
     */
    static getHechizosFabPociones(rules) {
        return aqConfig.hechizos[rules].fabricacion.pociones
    }
    static getHechizosFabTalismanes(rules) {
        return aqConfig.hechizos[rules].fabricacion.talismanes
    }
    static getHechizosFabUnguentos(rules) {
        return aqConfig.hechizos[rules].fabricacion.unguentos
    }

    static getFabPocion(rules, alchemy) {
        return this.getHechizosFabPociones(rules).find(e => e.low <= alchemy && e.high >= alchemy)
    }  
    static getFabTalisman(rules, alchemy) {
        return this.getHechizosFabTalismanes(rules).find(e => e.low <= alchemy && e.high >= alchemy)
    }
    static getFabUnguento(rules, alchemy) {
        return this.getHechizosFabUnguentos(rules).find(e => e.low <= alchemy && e.high >= alchemy)
    }              

    /**
     * getEnsalmosNiveles
     * @param {*} rules 
     * @returns 
     */
    static getEnsalmosNiveles(rules) {
        return this._mapObject(aqConfig.ensalmos[rules].niveles)
    }

    static _mapObject(root) {
        let oReturn = {}
        for (var s in root) {
            const prop = root[s]
            const sKey = prop.key ? prop.key : s
            oReturn[sKey] = {...prop, ...{
                key: prop.key,
                label: game.i18n.localize(prop.label)
            }}
        }
        return oReturn        
    }

    /**
     * assignLoreToActor
     * @param {*} rules 
     * @param {*} lore 
     * @param {*} actor 
     * @param {*} key 
     */
    static async assignLoreToActor(rules, lore, actor, key) {
        const item = await this.getLoreItem(rules, lore, key)
        if (!item) return

        for (var sLore of this._loreToClean(lore)) {
            for (var oItem of actor.items.filter(e => e.type === sLore )) {
                await oItem.delete()
            }
        }
        await Item.create(item, {parent: actor})
        
        //Añadiendo Sociedad y Limpieza de Sangre en el caso de ser un Origen
        if (item.type === 'pueblo') {
            const newItem = await this.getLoreItem(rules, 'sociedad', item.system.sociedad.key)
            if (!newItem) return
            await Item.create(newItem, {parent: actor})
            actor.update({"system.info.limpiezaSangre": item.system.sangre})
        }
    }

    /**
     * assignSecuelaToActor
     * @param {*} actor 
     * @param {*} secuela 
     */
    static async assignSecuelaToActor(actor, secuela) {
        if (!secuela) return
        await Item.create(secuela, {parent: actor})
    }
    

    /**
     * activeSecuela
     * @param {*} item 
     */
    static async activeSecuela(item) {
        if (!item || !item.parent || item.system.applied) return
        const actor = item.parent
        let bRender = false

        await helperMessages.postMessage({
            actor: actor,
            title: actor.name,
            subTitle: game.i18n.localize('common.secuela'),
            content: `<h4 class="_lineTitle">${item.name}</h4><div class="_descripcion">${item.system.descripcion}</div>`
        })

        for (const efecto of item.system.efectos) {
            let nValue = Number(efecto.value)
            if (isNaN(nValue)) nValue = 0

            if (efecto.formula !== '' && efecto.formula[0] !== '=' && efecto.formula[0] !== '*') {
                const diceRoll = new newRoll(efecto.formula, {actor})
                await diceRoll.evaluate()
                if (game.dice3d) await game.dice3d.showForRoll(diceRoll)               
                nValue = diceRoll.total
            }

            efecto.text = efecto.text.replaceAll('#result#', nValue)

            if (efecto.path !== '') {
                const pathRoot = efecto.path.split('.')[0]
                let nOldValue = 0
                let nNewValue = 0

                if (pathRoot === 'system') {
                    nOldValue = Number(this._access(actor, efecto.path))
                    nNewValue = nOldValue + Number(nValue)
                    if (efecto.formula !== '' && efecto.formula[0] === '=') nNewValue = Number(efecto.formula.slice(1))
                    if (efecto.formula !== '' && efecto.formula[0] === '*') {
                        nNewValue = Math.round(Number(eval(nOldValue+efecto.formula)))
                    }
                    await actor.update({[efecto.path]: nNewValue})
                    bRender = true
                }

                if (pathRoot === 'skill') {
                    const key = efecto.path.split('.')[1]
                    let competencias = actor.system.competencias
                    let target = competencias.find(e => e.key === key)

                    nOldValue = Number(target.stats.value)
                    let nOldTotal = Number(target.stats.total)
                    nNewValue = nOldValue + Number(nValue)
                    let nNewTotal = nOldTotal + Number(nValue)
                    if (efecto.formula !== '' && efecto.formula[0] === '=') {
                        nNewValue = Number(efecto.formula.slice(1))
                        nNewTotal = Number(efecto.formula.slice(1))
                    }
                    if (efecto.formula !== '' && efecto.formula[0] === '*') {
                        nNewValue = Math.round(Number(eval(nOldValue+efecto.formula)))
                        nNewTotal = Math.round(Number(eval(nNewTotal+efecto.formula)))
                    }
                    target.stats.value = nNewValue
                    target.stats.total = nNewTotal
                    await actor.update({"system.competencias": competencias})
                    bRender = true
                }

                efecto.text = efecto.text.replaceAll('#oldValue#', nOldValue)
                efecto.text = efecto.text.replaceAll('#newValue#', nNewValue)                
            }

            if (efecto.rasgo !== '') {
                const mDocs = await helperContext.getFromCompendium(actor.system.rules, 'rasgo')
                const rasgo = mDocs.find(e => e.system.key === efecto.rasgo)
                if (!rasgo) continue
                await Item.create(rasgo, {parent: actor})
            }

            await helperMessages.postMessage({
                actor: actor,
                title: actor.name,
                subTitle: game.i18n.localize('common.efecto'),
                content: `<div class="_descripcion">${efecto.text}</div>`
            })            
        }
        item.update({"system.applied": true})
        if (bRender && actor.sheet.rendered) actor.sheet.render(true)
    }

    /**
     * showHechizo
     * @param {*} rules 
     * @param {*} item 
     */
    static showHechizo(rules, item) {
        const sContent = this._contentHechizo(rules, item)
        helperDialog.dialogDescription(null, sContent, item.name, rules, 700, item.img)
    }
    static _contentHechizo(rules, item, bBook=false) {
        const _noApp = !item.system.aprendido
        const _config = aqConfig.hechizos[rules]
        const stats = {
            tipo: _config.tipos.find(e => e.key === item.system.info.forma),
            naturaleza: _config.naturaleza.find(e => e.key === item.system.info.naturaleza),
            origen: _config.origen.find(e => e.key === item.system.info.origen),
            nivel: _config.niveles[item.system.vis]
        }
        const textos = {
            caducidad: item.system.propiedades.caducidad.useFormula ? 
                            item.system.propiedades.caducidad.formula.replaceAll('#', '') : 
                            item.system.propiedades.caducidad.text,
            duracion: item.system.propiedades.duracion.useFormula ? 
                            item.system.propiedades.duracion.formula.replaceAll('#', '') : 
                            item.system.propiedades.duracion.text 
        }
        let sComponentes = ''
            item.system.componentes.map(o => { sComponentes += sComponentes === '' ? o.name : ', ' + o.name })
        if (sComponentes === '') sComponentes = game.i18n.localize('common.noAplica')
        
        let sButtons = ''
        if (bBook) {
            sButtons = `<div class="_buttons _gapped">
                            <button type="button" 
                                    class="_action" 
                                    ${_noApp ? 'disabled="disabled"' : ''}
                                    data-action="preparar" 
                                    data-id="${item.id}">${game.i18n.localize('common.preparar')}</button>
                            <button type="button" 
                                    class="_action" 
                                    ${_noApp ? '' : 'disabled="disabled"'}
                                    data-action="estudiar" 
                                    data-id="${item.id}">${game.i18n.localize('common.estudiar')}</button>
                        </div>`
        }
            
        return `
            <div class="_wrapImg">
                <img class="_spellImg" src="${item.img}"/>
                <div class="_header">
                    ${sButtons}
                    <h1 class="_title">${item.name}</h1>                    
                    <h4>VIS ${game.i18n.localize(stats.nivel.label)} (-${stats.nivel.ptc} PC, ${stats.nivel.mod}%)</h4>  
                </div>
            </div>          
            <div class="_row _stats ${ _noApp ? '_semi' : ''}">
                <div class="_combo">
                    <label>${game.i18n.localize('common.forma')}:</label>
                    <label class="_field">${game.i18n.localize(stats.tipo.label)}</label>
                </div>
                <div class="_combo">
                    <label>${game.i18n.localize('common.naturaleza')}:</label>
                    <label class="_field">${game.i18n.localize(stats.naturaleza.label)}</label>
                </div>              
                <div class="_combo">
                    <label>${game.i18n.localize('common.origen')}:</label>
                    <label class="_field">${game.i18n.localize(stats.origen.label)}</label>
                </div>            
            </div>
            <div class="_row _marginBottom ${ _noApp ? '_semi' : ''}">
                <label><span class="_pseudoTitle _small">${game.i18n.localize('common.caducidad')}:</span> ${textos.caducidad}</label>
            </div>
            <div class="_row _marginBottom ${ _noApp ? '_semi' : ''}">
                <label><span class="_pseudoTitle _small">${game.i18n.localize('common.duracion')}:</span> ${textos.duracion}</label>
            </div>
            <div class="_row _marginBottom ${ _noApp ? '_semi' : ''}">
                <label><span class="_pseudoTitle _small">${game.i18n.localize('common.tiradaRR')}:</span> ${item.system.tiradaRR ? game.i18n.localize('common.si') : 
                                                                                                                            game.i18n.localize('common.no')}</label>
            </div>
            <div class="_row ${ _noApp ? '_semi' : ''}">
                <label><span class="_pseudoTitle">${game.i18n.localize('common.componentes')}:</span> ${sComponentes}</label>
            </div>        
            <div class="_row ${ _noApp ? '_semi' : ''}">
                <label><span class="_pseudoTitle">${game.i18n.localize('common.preparacion')}:</span> ${item.system.propiedades.preparacion}</label>
            </div>     
            <div class="_row ${ _noApp ? '_semi' : ''}">
                <label><span class="_pseudoTitle">${game.i18n.localize('common.descripcion')}:</span> ${item.system.descripcion}</label>
            </div>                                   
            `
    }

    /**
     * showEnsalmo
     * @param {*} rules 
     * @param {*} item 
     */
    static showEnsalmo(rules, item) {
        const sContent = this._contentEnsalmo(rules, item)
        helperDialog.dialogDescription(null, sContent, item.name, rules, 700, item.img)
    }
    static _contentEnsalmo(rules, item, bBook=false) {            
        const _config = aqConfig.ensalmos[rules]
        const nivel = _config.niveles[item.system.ordo]
        return `
            <div class="_wrapImg">
                <img class="_spellImg" src="${item.img}"/>
                <div class="_header">
                    ${sButtons}
                    <h1 class="_title _pointer" data-id="${item.id}">${item.name}</h1>
                    <h4>Ordo ${game.i18n.localize(nivel.label)} (-${nivel.ptf} PC, ${nivel.mod}%)</h4>
                    <div class="_stats">
                        <div class="_combo">
                            <label>${game.i18n.localize('common.estadoGracia')}:</label>
                            <label class="_field">${item.system.propiedades.estadoGracia ? game.i18n.localize('common.si') : game.i18n.localize('common.no')}</label>
                        </div>
                    </div>  
                </div>
            </div>          
            <div class="_row">
                <label><span class="_pseudoTitle">${game.i18n.localize('common.requisitos')}:</span> ${item.system.propiedades.requisitos}</label>
            </div>
            <div class="_row">
                <label><span class="_pseudoTitle">${game.i18n.localize('common.ceremonia')}:</span> ${item.system.propiedades.ceremonia}</label>
            </div>
            <div class="_row">
                <label><span class="_pseudoTitle">${game.i18n.localize('common.efectos')}:</span> ${item.system.descripcion}</label>
            </div>
            `
    }    

    /**
     * deleteAllContext
     * @param {*} actor 
     */
    static async deleteAllContext(actor) {
        let mItems = [];
        ['competencia', 'posicion', 'estrato', 'sociedad', 'pueblo', 'reino'].map(sType => {
            actor.items.filter(e => e.type === sType).map(o => mItems.push(o.id))
        })
        await Item.deleteDocuments(mItems, {parent: actor})
    }

    /**
     * _loreToClean 
     */    
    static _loreToClean(lore) {
        let mReturn = []
        switch (lore) {            
            case 'reino': mReturn.push('reino')
            case 'pueblo': mReturn.push('pueblo')
            case 'sociedad': mReturn.push('sociedad')
            case 'estrato': mReturn.push('estrato')
            case 'posicion': mReturn.push('posicion')
        }
        return mReturn
    }

    /**
     * _getLoreTable
     */
    static _getLoreTable(item, path, mDocs) {
        let mReturn = []
        if (!item) return []
        const content = this._access(item, path)

        content.map(row => {
            const entry = mDocs.find(o => o.system.key === row.key)
            mReturn.push({  low: row.low,
                            high: row.high,
                            item: entry })
        })         
        return mReturn
    }

    /**
     * _toObject
     */
    static _toObject(mDocs) {
        let oReturn = {}
        mDocs.map(o => { oReturn[o.system.key] = {key: o.system.key, label: o.name} })   
        return oReturn           
    }

    /**
     * _access
     */
    static _access(object, path) {
        let oReturn = object
        path.split('.').map(s => { oReturn = oReturn[s] })
        return oReturn
    }    

}