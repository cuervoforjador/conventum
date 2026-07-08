import { SYSTEM_ID } from "../config/uiConstants.js"
import { configRULES } from "../config/rules.js"
import { aqConfig } from "../config/config.js"
import helperContext from "./helperContext.js"
import helperDialog from "./helperDialog.js"
import helperTools from "./helperTools.js"
import helperMessages from "./helperMessages.js"
import helperSheets from "./helperSheets.js"
import helperSocket from "./helperSocket.js"
import helperTables from "./helperTables.js"
import helperRolls from "./helperRolls.js"

export default class helperMagia {

    /**
     * prepararHechizo
     * @param {*} actor 
     * @param {*} item 
     */
    static async prepararHechizo(actor, item) {
        if (!item.system.aprendido) return helperDialog.error('error.noAprendido')
        const rules = actor.system.rules
        const vis = item.system.vis
        const _config = aqConfig.hechizos[rules]
        const _tipo = _config.tipos.find(e => e.key === item.system.info.forma)
        const _skillFabricacion = actor.system.competencias.find(e => e.key === _config.requisitos.skillFabricacion)
        const _fabricacion = _tipo.fabricacion ? 
                                _config.fabricacion[item.system.info.forma].find(e => e.low <= _skillFabricacion.stats.value 
                                                                                   && e.high >= _skillFabricacion.stats.value) :
                                null
        let mPreparacion = actor.system.magia.preparacion
        let mDosis = []
        const preparado = actor.system.magia.preparacion.find(e => e.key === item.system.key)
        if (preparado) return

        if (_tipo.fabricacion) {
            if (_fabricacion.tiempo === '-') return helperDialog.error("error.noAlchemy");
            if (_fabricacion.tiempo.toString().split('D').length > 1) {
                _fabricacion.tiempo = await helperRolls.unitRoll({
                    actor: actor,
                    formula: _fabricacion.tiempo,
                    title: item.name,
                    subtitle: game.i18n.localize('common.fabricacion') + ': ' + 
                              _fabricacion.tiempo + ' ' + game.i18n.localize(_fabricacion.unidad),
                    unit: game.i18n.localize(_fabricacion.unidad),
                    rules: actor.system.rules,
                    history: [{label: 'common.alquimia', field: _skillFabricacion.stats.value + '%'},
                              {label: 'common.rango', field: _fabricacion.low + ' - ' + _fabricacion.high},
                              {label: 'common.unidad', field: game.i18n.localize(_fabricacion.unidad)}]
                })
            }
            for (var i = 1; i <= _fabricacion.dosis; i++) {
                mDosis.push({
                    index: i,
                    llena: true,
                    vacia: false
                })
            }
        } 
        let sDuracion = ''
        if (item.system.propiedades.duracion.useFormula) {
            const sFormula = item.system.propiedades.duracion.formula.split('#')[0]
            const sUnidad = item.system.propiedades.duracion.formula.split('#').length > 1 ?
                            item.system.propiedades.duracion.formula.split('#')[1] : ''
            sDuracion = await helperRolls.unitRoll({
                    actor: actor,
                    formula: sFormula,
                    title: item.name,
                    subtitle: game.i18n.localize('common.duracion') + ': ' + 
                              sFormula + ' ' + sUnidad,
                    unit: sUnidad,
                    rules: actor.system.rules,
                    history: [{label: 'common.formula', field: sFormula + ' ' + sUnidad}]
                })
            sDuracion += ' ' + sUnidad

        } else sDuracion = item.system.propiedades.duracion.text

        mPreparacion.push({
            key: item.system.key,
            id: item.id,
            completed: false,
            fabricacion: {
                use: _tipo.fabricacion, 
                unidad: _tipo.fabricacion ? game.i18n.localize(_fabricacion.unidad) : null,
                unidadesTotal: _tipo.fabricacion ? _fabricacion.tiempo : null,
                unidades: 0,
                completed: false,
                dosis: _tipo.fabricacion ?_fabricacion.dosis : null
            },
            dosis: mDosis,
            componentes: item.system.componentes,
            duracion: sDuracion
        });



        await actor.update({"system.magia.preparacion": mPreparacion})
    }

    /**
     * estudiarHechizo
     * @param {*} actor 
     * @param {*} item 
     */
    static async estudiarHechizo(actor, item) {
        if (item.system.aprendido) return helperDialog.error('error.yaAprendido')

        const rules = actor.system.rules
        const vis = item.system.vis
        const _config = aqConfig.hechizos[rules]
        let mEstudios = actor.system.magia.estudio
        const estudio = actor.system.magia.estudio.find(e => e.key === item.system.key)
        if (estudio) return

        mEstudios.push({
            key: item.system.key,
            id: item.id,
            step01: {
                completed: false,
                visible: false
            },
            step02: {
                completed: false, 
                visible: true,
                dias: 0,
                diasTotal: _config.niveles[vis].ptc * 7,
                semanas: 0,
                semanasTotal: _config.niveles[vis].ptc,
                percent: 0,
                pta: _config.requisitos.ptAprendizaje ? _config.niveles[vis].pta : 0,
                ptaUse: _config.requisitos.ptAprendizaje,
                ptaPaid: false                    
            },
            step03: {
                completed: false,
                visible: true,
                useComunicacion: _config.requisitos.useComunicacion,
                skillKey: _config.requisitos.useComunicacion ? '' : _config.requisitos.skillEnsenar
            },
            step04: {
                completed: false,
                visible: true,
                mod: _config.niveles[vis].mod,
                mods: _config.niveles[vis].mods
            }
        })

        await actor.update({"system.magia.estudio": mEstudios})
    }    

}