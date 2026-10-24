import { SYSTEM_ID } from "../config/uiConstants.js"

export default class helperTemplates {

    /**
     * preload
     */
    static preload() {

        const base = `systems/${SYSTEM_ID}/templates`
        const character = base + '/character'
        const item = base + '/item'

        foundry.applications.handlebars.loadTemplates({

            // --- CHARACTER ---
            main_Actor: `${character}/main/character.hbs`,

            character_background: `${character}/headers/_background.hbs`,            
            header_Character: `${character}/headers/character.hbs`,
            header_Lore: `${character}/headers/lore.hbs`,
            header_wizardBar: `${character}/headers/wizardBar.hbs`,

            tab_Stats: `${character}/tabs/stats.hbs`,
            tab_Combate: `${character}/tabs/combate.hbs`,
            tab_Hechizos: `${character}/tabs/hechizos.hbs`,
            tab_Ensalmos: `${character}/tabs/ensalmos.hbs`,
            tab_Formulas: `${character}/tabs/formulas.hbs`,
            tab_Equipo: `${character}/tabs/equipo.hbs`,

            competencias_comun: `${character}/parts/comun/competencias.hbs`,
            secuelas_comun: `${character}/parts/comun/secuelas.hbs`,
            orgullos_comun: `${character}/parts/comun/orgullos.hbs`,
            verguenzas_comun: `${character}/parts/comun/verguenzas.hbs`,
            trasfondo_comun: `${character}/parts/comun/trasfondo.hbs`,

            combate_armas_comun: `${character}/parts/comun/combateArmas.hbs`,
            combate_mods_comun: `${character}/parts/comun/combateMods.hbs`,
            combate_armaduras_comun: `${character}/parts/comun/combateArmaduras.hbs`,
            
            combateAcciones_comun: `${character}/parts/comun/combateAcciones.hbs`,
            hechizosGrimorio_comun: `${character}/parts/comun/hechizosGrimorio.hbs`,
            hechizosEstudio_comun: `${character}/parts/comun/hechizosEstudio.hbs`,
            hechizosPreparacion_comun: `${character}/parts/comun/hechizosPreparacion.hbs`,
            ensalmosGrimorio_comun: `${character}/parts/comun/ensalmosGrimorio.hbs`,
            ensalmosEstudio_comun: `${character}/parts/comun/ensalmosEstudio.hbs`,
            ensalmosPreparacion_comun: `${character}/parts/comun/ensalmosPreparacion.hbs`, 
            equipoGeneral_comun: `${character}/parts/comun/equipoGeneral.hbs`, 
            equipoGeneral_Equipo_comun: `${character}/parts/comun/equipoGeneral_Equipo.hbs`, 
            equipoGeneral_Provisiones_comun: `${character}/parts/comun/equipoGeneral_Provisiones.hbs`, 
            equipoGeneral_Municion_comun: `${character}/parts/comun/equipoGeneral_Municion.hbs`, 
            equipoPosesiones_comun: `${character}/parts/comun/equipoPosesiones.hbs`, 
            equipoTiendas_comun: `${character}/parts/comun/equipoTiendas.hbs`, 

            stats_main_aq3: `${character}/parts/aq3/stats_main.hbs`,
            stats_chars_aq3: `${character}/parts/aq3/stats_chars.hbs`,
            stats_extra_aq3: `${character}/parts/aq3/stats_extra.hbs`,
            stats_health_aq3: `${character}/parts/aq3/stats_health.hbs`,
            stats_rrirr_aq3: `${character}/parts/aq3/stats_rrirr.hbs`,
            stats_exper_aq3: `${character}/parts/aq3/stats_exper.hbs`,
            combat_location_aq3: `${character}/parts/aq3/combat_location.hbs`,

            stats_main_aq4: `${character}/parts/aq4/stats_main.hbs`,
            stats_chars_aq4: `${character}/parts/aq4/stats_chars.hbs`,
            stats_percents_aq4: `${character}/parts/aq4/stats_percents.hbs`,
            stats_health_aq4: `${character}/parts/aq4/stats_health.hbs`,
            stats_rrirr_aq4: `${character}/parts/aq4/stats_rrirr.hbs`,
            stats_exper_aq4: `${character}/parts/aq4/stats_exper.hbs`,
            combat_location_aq4: `${character}/parts/aq4/combat_location.hbs`,

            stats_main_vyc: `${character}/parts/vyc/stats_main.hbs`,
            stats_chars_vyc: `${character}/parts/vyc/stats_chars.hbs`,
            stats_rrirr_vyc: `${character}/parts/vyc/stats_rrirr.hbs`,
            stats_health_vyc: `${character}/parts/vyc/stats_health.hbs`,            
            stats_percents_vyc: `${character}/parts/vyc/stats_percents.hbs`,
            modSociales_vyc: `${character}/parts/vyc/modSociales.hbs`,
            combat_location_vyc: `${character}/parts/vyc/combat_location.hbs`,

            // --- ITEMS ---
            main_Item: `${item}/main/item.hbs`,
            main_Competencia: `${item}/main/competencia.hbs`,
            main_Accion: `${item}/main/accion.hbs`,
            main_Arma: `${item}/main/arma.hbs`,
            main_Armadura: `${item}/main/armadura.hbs`,
            main_Sociedad: `${item}/main/sociedad.hbs`,
            main_Pueblo: `${item}/main/pueblo.hbs`,
            main_Reino: `${item}/main/reino.hbs`,
            main_Estrato: `${item}/main/estrato.hbs`,
            main_Posicion: `${item}/main/posicion.hbs`,
            main_Profesion: `${item}/main/profesion.hbs`,
            main_Secuela: `${item}/main/secuela.hbs`,
            main_Rasgo: `${item}/main/rasgo.hbs`,
            main_Grimorio: `${item}/main/grimorio.hbs`,
            main_Hechizo: `${item}/main/hechizo.hbs`,
            main_Ensalmo: `${item}/main/ensalmo.hbs`,
            main_Formula: `${item}/main/formula.hbs`,
            main_Tienda: `${item}/main/tienda.hbs`,
            main_TecnicaSocial: `${item}/main/tecnicaSocial.hbs`,

            item_footer: `${item}/parts/_footer.hbs`,
            item_descripcion: `${item}/parts/_description.hbs`,
            item_header: `${item}/headers/_header.hbs`,
            item_background: `${item}/headers/_background.hbs`,
            
            header_Competencia: `${item}/headers/competencia.hbs`,
            header_Accion: `${item}/headers/accion.hbs`,
            header_Arma: `${item}/headers/arma.hbs`,
            header_Armadura: `${item}/headers/armadura.hbs`,
            header_Sociedad: `${item}/headers/sociedad.hbs`,
            header_Pueblo: `${item}/headers/pueblo.hbs`,
            header_Reino: `${item}/headers/reino.hbs`,
            header_Estrato: `${item}/headers/estrato.hbs`,
            header_Posicion: `${item}/headers/posicion.hbs`,
            header_Secuela: `${item}/headers/secuela.hbs`,
            header_Rasgo: `${item}/headers/rasgo.hbs`,
            header_Grimorio: `${item}/headers/grimorio.hbs`,
            header_Hechizo: `${item}/headers/hechizo.hbs`,
            header_Ensalmo: `${item}/headers/ensalmo.hbs`,
            header_Formula: `${item}/headers/formula.hbs`,
            header_Tienda: `${item}/headers/tienda.hbs`,
            header_TecnicaSocial: `${item}/headers/tecnicaSocial.hbs`,

            tab_Descripcion: `${item}/tabs/descripcion.hbs`,
            tab_Idiomas: `${item}/tabs/idiomas.hbs`,
            tab_Pueblos: `${item}/tabs/pueblos.hbs`,
            tab_Estratos: `${item}/tabs/estratos.hbs`,
            tab_Posiciones: `${item}/tabs/posiciones.hbs`,
            tab_Localizaciones: `${item}/tabs/localizaciones.hbs`,
            tab_Penalizaciones: `${item}/tabs/penalizaciones.hbs`,
            tab_Efectos: `${item}/tabs/efectos.hbs`,
            tab_Componentes: `${item}/tabs/componentes.hbs`,
            tab_HechizosPropiedades: `${item}/tabs/hechizosPropiedades.hbs`,
            tab_EnsalmosPropiedades: `${item}/tabs/ensalmosPropiedades.hbs`,
            tab_MassEdit: `${item}/tabs/massEdit.hbs`,
            tab_Actores: `${item}/tabs/actores.hbs`,
            tab_Productos: `${item}/tabs/productos.hbs`,
            tab_AccionesPropiedades: `${item}/tabs/accionesPropiedades.hbs`,
            tab_ProfesionesCaracteristicas: `${item}/tabs/profesionesCaracteristicas.hbs`,
            tab_ProfesionesCompetencias: `${item}/tabs/profesionesCompetencias.hbs`
        })
    }
}