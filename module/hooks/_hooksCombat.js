import { helperSocket } from "../helpers/helperSocket.js";
import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js"

export class HookCombat {

    /**
     * changeCombatTabHtml
     * @param {*} html 
     */
    static changeCombatTabHtml(html) {
        this._changeCombatTabHtml(html);
    }    

   /** --- _changeCombatTabHtml ---
     * @param {*} html          html element
     * @description             Add AQ options to Combat Tab
     */
    static _changeCombatTabHtml(html, update) {
        let component = (html[0]) ? html[0] : html;

        $(component).addClass("_myCombat");
        if (!game.scenes) {return;}

        //AQ Button! (Only for GameMaster)
        if (game.user.isGM) {
            if ($(component).find(".encounter-controls").find("a[data-control='AQaction']").length == 0) {
                $(component).find(".encounter-controls").prepend('<a class="combat-button combat-control" title="AQ" data-control="AQaction"><div class="AQbutton">AQ</div></a>');
                $(component).find("a.combat-control[data-control='AQaction']").on("click", HookCombat.onAQAction).bind(this);
            }
        }

        //Combatants
        let combatants = [];
        $(component).find("ol#combat-tracker li").each(function(i, li) {
            combatants.push(li.dataset.combatantId);
        });

        if (combatants.length > 0) {

            //let combat = this._getCombatFromCombatants(combatants);
            let combat = Array.from(game.combats).filter(e => e.active)[0];
            if (!combat) return;

            //Combatants Header
            const sHeader = 
                '<li class="combatant directory-item flexrow _header">'+
                    '<div style="width:48px;max-width: 48px;"></div>'+
                    '<div class="token-name flexcol"></div>'+
                    '<div class="token-initiative">'+
                        '<span class="initiative combatInitTitle">1D10</span>'+
                        '<span class="charact combatInitTitle">'+game.i18n.localize("config.combatTitleSkill")+'</span>'+
                        '<span class="charact combatInitTitle">'+game.i18n.localize("config.combatTitleMod")+'</span>'+
                        '<span class="charact combatInitTitle">'+game.i18n.localize("config.combatTitleTotal")+'</span>'+
                        '<span class="charact combatInitTitle"></span>'+
                    '</div>'+
                '</li>';
            if ($(component).find("ol#combat-tracker li._header").length == 0) {
                $(component).find("ol#combat-tracker").prepend(sHeader);
            }       

            //Initiative
            $(component).find("ol#combat-tracker li").each(function(i, li) {

                let actor = null,
                    oInitiative = null,
                    sIniMod = "",
                    sTotal = 0;

                if ((combat.combatants.get(li.dataset.combatantId)) &&
                    (combat.combatants.get(li.dataset.combatantId).actor)) {

                    actor = combat.combatants.get(li.dataset.combatantId).actor;
                    oInitiative = helperSheetHuman.calcInitiative(actor);
                    
                    sIniMod = actor.system.initiative.mod;  
                    if ((!sIniMod)  || (sIniMod === '')) sIniMod = oInitiative.mod;

                    sTotal = Number($(li).find(".token-initiative .initiative").text()) 
                        + Number(oInitiative.base) 
                        + Number(sIniMod);
                }
                if ( ($(li).find(".token-initiative span.charact").length == 0) && (actor) ) {

                    let sShield = actor.system.action.blocked ? '<a class="_unlockTargetCombat" data-actorid="'+actor._id+'">'+
                                                                    '<img src="systems/conventum/image/texture/shield.png" class="_initShield">'+
                                                                '</a>'
                                                                : '<a class="_lockTargetCombat" data-actorid="'+actor._id+'">'+
                                                                    '<img src="systems/conventum/image/texture/shield.png" class="_initShield _alpha">'+
                                                                '</a>';

                    $(li).find(".token-initiative").append(
                        '<span class="charact _ibase">'+oInitiative.base+'</span>'+
                        ( (game.user.isGM) ? 
                            '<span class="charact _imod">'+
                                '<input class="cbInitiativeMod" '+
                                    ' value="'+sIniMod+'" '+
                                    ' data-actorid="'+actor._id+'"'+
                                    ' data-combatantid="'+li.dataset.combatantId+'" /></mod>'+
                            '</span>' :
                            '<span class="charact _imod" data-actorid="'+actor._id+'">'+sIniMod+'</span>'
                        )+
                        '<span class="charact _itotal" data-actorid="'+actor._id+'">'+sTotal.toString()+'</span>'+
                        '<span class="charact">'+sShield+'</span>');
                    
                    $(li).attr('data-initotal', sTotal.toString());
                }

                //Updating...
                if (update && (i>0)) {
                    $(li).find('._itotal').text(sTotal.toString() );
                    if (game.user.isGM) 
                        $(li).find('._imod input').val(sIniMod);
                    else
                        $(li).find('._imod').text(sIniMod);
                    
                    $(li).attr('data-initotal', sTotal.toString());
                }
            });
        }
        $(html).find("ol#combat-tracker")
            .find("li.actor")
            .sort((a,b) => 
                    Number($(b).find('._itotal').text()) - Number($(a).find('._itotal').text()) )
            .appendTo("ol#combat-tracker");        
    }

    /**
     * refreshCombatTrak
     */
    static async refreshCombatTrak() {
        this._changeCombatTabHtml($("section#combat._myCombat"), true);
    }

    /**
     * changeInitiativeMod
     * @param {*} actor 
     * @param {*} value 
     */
    static async changeInitiativeMod(actorId, value, noRefresh) {
        noRefresh = (!noRefresh) ? false : noRefresh;

        let actor = game.actors.get(actorId);
        await actor.update({
            system: { initiative: {
                mod: value } }            
        });

        if (!noRefresh)
            this._changeCombatTabHtml($("section#combat._myCombat"), true);
        helperSocket.refreshCombatTrack();
    }

    /**
     * resetAllInitiativeMod
     */
    static async resetAllInitiativeMod() {
        const activeCombat = game.combats.find(e => e.active);
        for (var turn of activeCombat.turns) {
            await this.changeInitiativeMod(turn.actorId, '', false);
            await this.resetInitiativeMod(turn.actorId);
        }
    }

    /**
     * resetInitiativeMod
     * @param {*} actorId 
     */
    static async resetInitiativeMod(actorId) {
        let actor = game.actors.get(actorId);
        let selector = $('section#combat input.cbInitiativeMod[data-actorid="'+actorId+'"]');
        let oInitiative = helperSheetHuman.calcInitiative(actor);
        selector.val(oInitiative.mod);
        await this.changeInitiativeMod(actorId, '', false);
    }

    /**
     * updateCombat
     * @param {*} combat 
     * @param {*} combatants 
     * @param {*} options 
     * @param {*} sId 
     */
    static async updateCombat(combat) {
        
        //Initiative mods
        for (const turn of combat.turns) {
            if (!turn.initiative) {
                let actor = game.actors.get(turn.actorId);
                actor.update({
                    system: { initiative: {
                        mod: '' }}            
                });
                await this.resetInitiativeMod(turn.actorId);
            }
        }
    }

    /** --- onAQAction ---
     * @param html 
     */    
    static async onAQAction(event) {

        const activeCombat = game.combats.find(e => e.active);
        let poolAction = game.items.find(e => e.system.combat === activeCombat._id);

        if (!poolAction) {
            const newItem = await Item.create([{
                                        name: game.i18n.localize("common.encounter"),
                                        type: 'actionPool',
                                        img: 'systems/conventum/image/texture/encounter.png',
                                        system: {
                                            combat: activeCombat._id
                                        }
                                    }]);
            poolAction = newItem[0];
        } 
        poolAction.sheet.render(true, {
            editable: game.user.isGM
        });
    }    

    /** --- targetDialogs ---
     * @param {*} dialog 
     * @param {*} element 
     * @param {*} content 
     */
    static targetDialogs(dialog, element, content) {
        const mButtons = dialog.data.buttons;
        for (const s in mButtons) {
            let button = $(element).find('button[data-button="'+mButtons[s].actorId+'"]');
            button.html('<img src="'+mButtons[s].img+'"/><label>'+mButtons[s].label+'</label>');
        }
    }

    /** --- deleteEncounter ---
     * @param {*} combatId 
     */
    static async deleteEncounter(combatId) {
        let poolAction = game.items.find(e => e.system.combat === combatId);
        await poolAction.delete();
    }    

    /** --- _getCombatFromCombatants ---
     * @param combatants
     */
    static _getCombatFromCombatants(combatants) {
        let combat;
        game.combats.forEach(oCombat => {
            let isThis = true;
            combatants.forEach(combatantId => {
                if (!oCombat.combatants.get(combatantId)) {isThis = false;}
            });
            if (isThis) {combat = oCombat;}
        });
        return combat;
    }    

}