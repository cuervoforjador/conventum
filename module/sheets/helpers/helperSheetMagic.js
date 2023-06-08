/**
 * Helpers for Actions
 */

import { mainUtils } from "../../mainUtils.js";
import { helperMessages } from "./helperMessages.js";
import { helperSheetCombat } from "./helperSheetCombat.js";
import { helperActions } from "./helperActions.js";
import { helperRolls } from "./helperRolls.js";

export class helperSheetMagic {

    /**
     * getMagic
     * @param {*} actor 
     * @param {*} systemData 
     */
    static async getMagic(actor, systemData) {

        let oMagic = {};

        await game.packs.get('conventum.skills').getDocuments();
        oMagic.skills = Array.from(game.packs.get('conventum.skills'))
                                     .filter(e => ( (e.system.control.world === actor.system.control.world) 
                                                 && (e.system.magic.magic)));
        return oMagic;

    }

    /**
     * getMagicPenals
     * @param {*} actor 
     * @param {*} systemData 
     */
    static getMagicPenals(actor, systemData) {


        //By armor...
        let modByArmor = '-0';
        let mArmor = [];
        for (var s in systemData.armor) {
            let piece = systemData.armor[s];
            if ( !(mArmor.find(e => e === piece.itemID))) {
                mArmor.push(piece.itemID);
            }
        }
        mArmor.map(armorID => {
            const armor = actor.items.get(armorID);
            if (armor) {
                const sMod = CONFIG.ExtendConfig.armorTypes.find(e => e.id === armor.system.armorType).spellMod;
                if (Number(sMod) < Number(modByArmor))
                    modByArmor = sMod;
            }
        });

        systemData.magic.penal.armor = modByArmor;

        systemData.magic.penal.method = this.penalValue(systemData.magic.penal.method);
        systemData.magic.penal.armor = this.penalValue(systemData.magic.penal.armor);
        systemData.magic.penal.concentration = this.penalValue(systemData.magic.penal.concentration);
        systemData.magic.penal.ceremony = this.penalValue(systemData.magic.penal.ceremony);
        systemData.magic.penal.others = this.penalValue(systemData.magic.penal.others);

    }

    /**
     * magicSkillValue
     * @param {*} systemData 
     * @param {*} item 
     */
    static magicSkillValue(systemData, item) {

        let nFinal = 0;
        const nValue = 
           ((item.system.percent.secondary) && (item.system.percent.secondary !== '')) ?
              systemData.characteristics.secondary[item.system.percent.secondary].value :
              systemData.skills[item.system.percent.skill].value;
        if (item.type === 'ritual')
           nFinal = eval( nValue.toString()+' '+helperSheetMagic.penalValue(systemData.magic.penal.ceremony)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.concentration)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.others));
        else
           nFinal = eval( nValue.toString()+' '+helperSheetMagic.penalValue(systemData.magic.penal.method)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.armor)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.concentration)
                                           +' '+helperSheetMagic.penalValue(systemData.magic.penal.others));
        return nFinal;
    }

    /**
     * playSpell
     * @param {*} actor 
     * @param {*} spellId 
     */
    static async playSpell(actor, spellId) {
        const spellItem = actor.items.get(spellId);
        if (!spellItem) return;
        
        const actorActions = helperActions.getActions(actor);
        const actorTargets = helperActions.getTargets(actor);
        
        //No actions...
        /*
        if (!actorActions.showPoster) {
            ui.notifications.warn(game.i18n.localize("info.noAction"));
            return;
        }
        */

        const combatSkill = null;
        let actorSkill = null;
        
        if (spellItem.system.percent.secondary)
            actorSkill = actor.system.characteristics.secondary[spellItem.system.percent.secondary];
        else
            actorSkill = actor.system.skills[spellItem.system.percent.skill];
        if (!actorSkill) return;

        //Other mods...
        let mods = {};
        let finalPercent = helperSheetMagic.magicSkillValue(actor.system, spellItem);

        //Damage
        let finalDamage = (spellItem.system.damage.apply) ? 
                                spellItem.system.damage.damage : '';

        //Leveled Rolls
        //let bLeveled = spellItem.system.rolls.leveled;
        const bLeveled = true;

        helperRolls.rollAction(actor, actorTargets, null, bLeveled,
                               combatSkill, finalPercent,
                               null, finalDamage,
                               mods, spellItem);
    }

    /**
     * _penalValue
     * @param {*} sPenal 
     */
    static penalValue(sPenal) {
        if (Number(sPenal) === NaN) return '-0';
        if (Number(sPenal) >= 0) return '+'+Number(sPenal).toString();
                           else return Number(sPenal).toString();
    }

}