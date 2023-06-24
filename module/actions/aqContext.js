
import { aqActions } from "./aqActions.js"
import { helperSocket } from "../helpers/helperSocket.js"
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";
import { helperRolls } from "../sheets/helpers/helperRolls.js";
import { helperActions } from "../sheets/helpers/helperActions.js";
import { helperMessages } from "../sheets/helpers/helperMessages.js";

export class aqContext {

    _actor              =null
    _action             =null
    _weapon             =null
    _weapon2            =null
    _spell              =null
    _location           =''

    _skill              =null
    _percentBase        =0
    _percentMod         =''
    _percentMult        =1
    _percent            =0
    
    _rollFormula        ='1d100'
    _rollBono           =''
    _rollLevel          =null
    _rollPercent        =0
    _rollSuccess        =false
    _rollCritSuccess    =false
    _rollCritFailure    =false
    _roll               =null

    _damageBase         =''
    _damageBon          =''
    _damageMod          =''
    _damageMult         =1
    _damage             =''
    _damage2Base        =''
    _damage2Bon         =''
    _damage2Mod         =''
    _damage2Mult        =1
    _damage2            =''

    _luckMode           =false

    _combat             =null
    _encounter          =null
    _worldId            =''
    _worldConfig        ={}

    _targets            =[]
    _history            =[]
    _history2           =[]
    _targetsToken       =[]

    _express            =false

    /**
     * constructor
     * @param {*} options {
     *      actorId
     *      weaponId
     *      express
     *      import
     *
     * }
     * @returns 
     */
    constructor(options) {
        this._preparePacks();

        if (options.import) {
            this.import(options.import);
        } else {

            this._actor = game.actors.get(options.actorId);
            if (!this._actor) {
                this.msgError("There is no actor for this Id!");
                return;              
            }
            this.setWorld(this._actor.system.control.world);

            this._weapon = this._actor.items.get(options.weaponId);
            if (!this._weapon) {
                this.msgError("There is no weapon for this Id!");
                return;              
            }
            this.msgHistory("common.weapon", this._weapon.name);

            if (options.express) return;

            this._combat = aqActions.getCurrentCombat();
            if (!this._combat) {
                this.msgError("There is no active combat!");
                return;              
            }

            this._encounter = aqActions.getCurrentEncounter();
            if (!this._encounter) {
                this.msgError("There is no active encounter!");
                return;              
            }

            this._action = aqActions.getCurrentAction(this._actor.id);
            if (!this._action) {
                this.msgError("Error with Action!");
                return;
            }        

            const step = aqActions.getCurrentStep();
            if ((!step) || (step.actor !== this._actor.id)) {
                this.msgError("No Step found or this step does not belong to the actor!");
                return;
            }
            this._location = step.applyLocation;
        }
    }

    /**
     * export
     * @returns 
     */
    export() {
        return {
            actorId:            this._actor.id,
            actionId:           (this._action) ? this._action.id : '',
            weaponId:           (this._weapon) ? this._weapon._id : '',
            weapon2Id:          (this._weapon2) ? this._weapon2._id : '',
            spellId:            (this._spell) ? this._spell._id : '',
            location:           this._location,
        
            skillId:            (this._skill) ? this._skill._id : '',
            percentBase:        this._percentBase,
            percentMod:         this._percentMod,
            percentMult:        this._percentMult,
            percent:            this._percent,
            
            rollFormula:        this._rollFormula,
            rollBono:           this._rollBono,
            rollLevel:          this._rollLevel,
            rollPercent:        this._rollPercent,
            rollSuccess:        this._rollSuccess,
            rollCritSuccess:    this._rollCritSuccess,
            rollCritFailure:    this._rollCritFailure,
            roll:               this._roll,
        
            damageBase:         this._damageBase,
            damageBon:          this._damageBon,
            damageMod:          this._damageMod,
            damageMult:         this._damageMult,
            damage:             this._damage,
            damage2Base:        this._damage2Base,
            damage2Bon:         this._damage2Bon,
            damage2Mod:         this._damage2Mod,
            damage2Mult:        this._damage2Mult,
            damage2:            this._damage2,
        
            luckMode:           this._luckMode,
        
            combatId:           (this._combat) ? this._combat.id : '',
            encounterId:        (this._encounter) ? this._encounter.id : '',
            worldConfig:        this._worldConfig,
        
            targets:            this._targets,
            history:            this._history,
            history2:           this._history2,
            targetsToken:       this._targetsToken
        };
    }    

    /**
     * import
     * @param {*} oContext 
     */
    import(oContext) {

        this._actor = game.actors.get(oContext.actorId);
        if (!this._actor) {
            this.msgError("There is no actor for this Id!");
            return;              
        }
        this.setWorld(this._actor.system.control.world);

        this._skill = null
        if (oContext.skillId) {
            this._skill = this._actor.items.get(oContext.skillId);
            if (!this._skill) {
                this.msgError("There is no skill for this Id!");
                return;              
            } 
        }

        this._action = null;
        if (oContext.actionId) {
            this._action = this._actor.items.get(oContext.actionId);
            if (!this._action) {
                this.msgError("Error with Action!");
                return;
            } 
        }

        this._weapon = null;
        if (oContext.weaponId) {
            this._weapon = this._actor.items.get(oContext.weaponId);
            if (!this._weapon) {
                this.msgError("There is no weapon for this Id!");
                return;              
            } 
        }

        this._weapon2 = null;
        if (oContext.weapon2Id) {
            this._weapon2 = this._actor.items.get(oContext.weapon2Id);
            if (!this._weapon2) {
                this.msgError("There is no weapon for this Id!");
                return;              
            }            
        }

        this._spell = null
        if (oContext.spellId) {
            this._spell = this._actor.items.get(oContext.spellId);
            if (!this._spell) {
                this.msgError("There is no spell for this Id!");
                return;              
            } 
        }

        this._combat = null
        if (oContext.combatId) {
            this._combat = game.combats.get(oContext.combatId);
            if (!this._combat) {
                this.msgError("There is no combat for this Id!");
                return;              
            } 
        }    
        
        this._encounter = null
        if (oContext.encounterId) {
            this._encounter = game.items.get(oContext.encounterId);
            if (!this._encounter) {
                this.msgError("There is no combat for this Id!");
                return;              
            } 
        }        
        
        this._location = (oContext.location) ? oContext.location : this._location;
        this._percentBase = (oContext.percentBase) ? oContext.percentBase : this._percentBase;
        this._percentMod = (oContext.percentMod) ? oContext.percentMod : this._percentMod;
        this._percentMult = (oContext.percentMult) ? oContext.percentMult : this._percentMult;
        this._percent = (oContext.percent) ? oContext.percent : this._percent;

        this._rollFormula = (oContext.rollFormula) ? oContext.rollFormula : this._rollFormula;
        this._rollBono = (oContext.rollBono) ? oContext.rollBono : this._rollBono;
        this._rollLevel = (oContext.rollLevel) ? oContext.rollLevel : this._rollLevel;
        this._rollPercent = (oContext.rollPercent) ? oContext.rollPercent : this._rollPercent;
        this._rollPercent = (oContext.rollSuccess) ? oContext.rollSuccess : this._rollPercent;
        this._rollSuccess = (oContext.rollSuccess) ? oContext.rollSuccess : this._rollSuccess;
        this._rollCritSuccess = (oContext.rollCritSuccess) ? oContext.rollCritSuccess : this._rollCritSuccess;
        this._rollCritFailure = (oContext.rollCritFailure) ? oContext.rollCritFailure : this._rollCritFailure;
        this._roll = (oContext.roll) ? oContext.roll : this._roll;

        this._damageBase = (oContext.damageBase) ? oContext.damageBase : this._damageBase;
        this._damageBon = (oContext.damageBon) ? oContext.damageBon : this._damageBon;
        this._damageMod = (oContext.damageMod) ? oContext.damageMod : this._damageMod;
        this._damageMult = (oContext.damageMult) ? oContext.damageMult : this._damageMult;
        this._damage = (oContext.damage) ? oContext.damage : this._damage;
        this._damage2Base = (oContext.damage2Base) ? oContext.damage2Base : this._damage2Base;
        this._damage2Bon = (oContext.damage2Bon) ? oContext.damage2Bon : this._damage2Bon;
        this._damage2Mod = (oContext.damage2Mod) ? oContext.damage2Mod : this._damage2Mod;
        this._damage2Mult = (oContext.damage2Mult) ? oContext.damage2Mult : this._damage2Mult;
        this._damage2 = (oContext.damage2) ? oContext.damage2 : this._damage2;

        this._luckMode = (oContext.luckMode) ? oContext.luckMode : this._luckMode;
        this._worldConfig = (oContext.worldConfig) ? oContext.worldConfig : this._worldConfig;
        this._targets = (oContext.targets) ? oContext.targets : this._targets;
        this._history = (oContext.history) ? oContext.history : this._history;
        this._history2 = (oContext.history2) ? oContext.history2 : this._history2;
        this._targetsToken = (oContext.targetsToken) ? oContext.targetsToken : this._targetsToken;
    }

    /**
     * setExpress
     * @param {*} bExpress 
     */
    setExpress(bExpress) {
        this._express = bExpress;
    }

    /**
     * getExpress
     */
    getExpress() {
        return this._express;
    }    

    /**
     * getStep
     */
    getStep() {
        return aqActions.getCurrentStep();
    }

    /**
     * setWorld
     * @param {*} sWorld 
     */
    async setWorld(sWorld) {
        await this._preparePacks();
        const world = await game.packs.get('conventum.worlds').get(sWorld);

        this._worldId = world.id;
        this._worldConfig = world.system.config;        
    }

    /**
     * getWorldId
     */
    getWorldId() {
        return this._worldId;
    }

    /**
     * getWorldConfig
     */
    getWorldConfig() {
        return this._worldConfig;
    }

    /**
     * mTargetsId
     * @param {Array} mTargetsId 
     */
    async _setTargetsExpress(mTargetsId) {

        const mTargets = [],
              mTargetsToken = [];
        for (const sTargetId of mTargetsId) {
            const actor = game.actors.get(sTargetId);
            if (!actor) {
                this.msgError("There is no actor for this Id!");
                return;
            }

            mTargets.push(actor.id);
            if (actor.getActiveTokens().length > 0) {
                mTargetsToken.push(actor.getActiveTokens()[0].id);
                await game.user.updateTokenTargets(actor.getActiveTokens()[0].id);
            }
            if (this._actor.sheet.rendered) this._actor.sheet.render(true);       
        }
        this._targets = mTargets;
        this._targetsToken = mTargetsToken;
    }

    /**
     * mTargetsId
     * @param {Array} mTargetsId 
     */
    async setTargets(mTargetsId) {

        if (this._express) {
            await this._setTargetsExpress(mTargetsId);
            return;
        }

        let currentStep = this._encounter.system.steps.filter(e => !e.consumed)[0];
        currentStep.targets = [];
        currentStep.targetsToken = [];

        for (const sTargetId of mTargetsId) {
            const actor = game.actors.get(sTargetId);
            if (!actor) {
                this.msgError("There is no actor for this Id!");
                return;
            }
            currentStep.targets.push(actor.id);
            if (actor.getActiveTokens().length > 0)
                currentStep.targetsToken.push(actor.getActiveTokens()[0].id);
            this.msgHistory("common.target", actor.name);            
        }

        this._targets = currentStep.targets;
        this._targetsToken = currentStep.targetsToken;
        await this.updateTokensTargets();

        helperSocket.update(this._encounter, {
            system: {steps: this._encounter.system.steps}
        });
        helperSocket.refreshSheets();
    
    }

    /**
     * updateTokensTargets
     */
    async updateTokensTargets() {
        const currentStep = aqActions.getCurrentStep();

        if ((!currentStep) || (currentStep.actor !== this._actor.id))
            await game.user.updateTokenTargets([]);

        await game.user.updateTokenTargets(this._targetsToken);
        if (this._actor.sheet.rendered) this._actor.sheet.render(true);
    }

    /**
     * prepareContext
     */
    async prepareContext() {
        await this._preparePacks();

        if (this._express) {
            this._prepareExpress();
            return;
        }

        this._getActionSkill();
        this._get2Weapon();

        this._getPercentBase();
        this._getActionMulty();

        this._getPercentPenal();
        this._getHandPenal();
        this._getWeaponPenal();
        this._getWeaponRequirementPenal();
        this._getActionPenal();
        this._getByTargetPenalMulty();
        this._getPercentFinal();

        this._getDamageBase();
        this._getActionDamageMulty();

        this._getDamageBon();
        this._getWeaponRequirmDamagePenal();
        this._getDamageByTargetPenal();
        this._getDamageFinal();
    }

    /**
     * prepareExpress
     */
    async _prepareExpress() {

        this._getActionSkill();
        this._getPercentBase();
        this._getPercentPenal();
        this._getHandPenal();
        this._getWeaponPenal();
        this._getWeaponRequirementPenal();  
        this._getPercentFinal();

        this._getDamageBase();
        this._getDamageBon();
        this._getWeaponRequirmDamagePenal();
        this._getDamageFinal();              
    }

    /**
     * getAskForLevels
     */
    getAskForLevels() {
        if (this._express) return true;
        return this._action.system.rolls.leveled;
    }

    /**
     * setRoll
     * @param {*} roll 
     */
    async roll(roll) {
        this._roll = new Roll(this._rollFormula, {});
        this._roll.evaluate({async: false});
        if (game.dice3d)
          await game.dice3d.showForRoll(this._roll, game.user, true);  
        await this._evalRoll();      
    }

    /**
     * setRollFormula
     * @param {*} sFormula 
     */
    setRollFormula(sFormula) {
        this._rollFormula = sFormula;
    }

    /**
     * setRollLevel
     * @param {*} sLevel 
     */
    setRollLevel(sLevel) {
        this._rollLevel = this._worldConfig.rolllevel[sLevel];
    }

    /**
     * setRollBono
     * @param {*} sBono 
     */
    setRollBono(sBono) {
        this._rollBono = sBono;
    }

    /**
     * message
     */
    message() {
        helperMessages.chatMessage(
            this._getMessageContent(), this._actor, false, '', '200px');
        
        if (this._weapon2)
            helperMessages.chatMessage(
                    this._getMessageContent(true), this._actor, false, '', '200px');
    }

    /**
     * consumeStep
     */
    consumeStep() {
        if (!this._express) {
            if (aqActions.getCurrentStep().actor === this._actor.id)
                                            aqActions.consumeCurrentStep();
        }
    }

    /**
     * _evalRoll
     */
    async _evalRoll() {
        this._rollPercent = Number(eval(this._percent.toString() + this._rollBono));
        this._rollSuccess = Number(this._roll.result) <= this._rollPercent;

        this._evalCritical();
        await this._evalLuck();

        this.msgHistory("common.roll", this._rollFormula);
        if (this._rollLevel)
            this.msgHistory("", this._rollLevel.text + ' ' + this._rollBono.toString());
        this.msgHistory("common.total", this._rollPercent.toString()+'%');
        this.msgHistory("common.rollResult", this._roll.result.toString()); 
        if (this._rollSuccess) this.msgHistory("common.success", "");
                          else this.msgHistory("common.failed", "");
    }

    /**
     * _evalCritical
     */
    _evalCritical() {

        const dec = Math.trunc(Number(this._percent) / Number(this._worldConfig.rolls.skillRange), 0);
        const rest = ( Number(this._percent) % Number(this._worldConfig.rolls.skillRange) > 0) ? 1 : 0 ;
        let cFailureLow = Number(this._worldConfig.rolls.failureRange) +
                   (dec + rest) * Number(this._worldConfig.rolls.criticalFailureStep);
          cFailureLow = (cFailureLow >= Number(this._worldConfig.rolls.failureMin) ) ? 
                                            Number(this._worldConfig.rolls.failureMin) : cFailureLow;
        let cSuccessHigh = (dec + rest) * Number(this._worldConfig.rolls.criticalSuccessStep);
        
        this._rollCritSuccess = ( Number(this._roll.result) <= Number(cSuccessHigh) ),
        this._rollCritFailure = ( Number(this._roll.result) >= Number(cFailureLow) );

        if (this._rollCritSuccess) this.msgHistory("common.rollCriticalSuccess", "");
        if (this._rollCritFailure) this.msgHistory("common.rollCriticalFailure", "");
    }

    /**
     * _evalLuck
     */
    async _evalLuck() {
        const modeLuck = Array.from(await game.packs.get("conventum.modes"))
                              .find(e => ( (e.system.control.world === this._actor.system.control.world)
                                        && (e.system.luck)) );
        if (!modeLuck) return;
        this._luckMode = (this._actor.system.modes.find(e => e === modeLuck.id));

        if (this._luckMode) {
            const nDiff = (this._roll.result - this._rollPercent) > 0 ? 
                                                        this._roll.result - this._rollPercent : 1;
            const myLuck = this._actor.system.characteristics.secondary.luck.value;
            const myFinalLuck = (myLuck >= nDiff) ? myLuck - nDiff : 0;        
            
            // Two times!, Twice as effective!!! ;)
            await helperSocket.update(this._actor, { system: {
                        characteristics: {secondary: {luck: {value: myFinalLuck}}} }});
            await helperSocket.update(this._actor, { system: {
                        characteristics: {secondary: {luck: {value: myFinalLuck}}} }});                        
            await helperActions.playMode(this._actor, modeLuck);

            this.msgHistory("common.luck", '');
            this.msgHistory("common.luckLost", nDiff.toString());
            this.msgHistory("common.luckChange", myLuck.toString()+' -> '+myFinalLuck.toString());

            if (myLuck >= nDiff) 
                this._rollSuccess = true;
        }
    }

    /**
     * _preparePacks
     */
    async _preparePacks() {
        await game.packs.get('conventum.worlds').getDocuments();
        await game.packs.get('conventum.skills').getDocuments();
        await game.packs.get('conventum.modes').getDocuments();
    }

    /**
     * _getActionSkill  
     */
    _getActionSkill() {
        this._skill = null;

        if ((this._weapon.system.combatSkill) && 
            (this._weapon.system.combatSkill !== ''))
        this._skill = game.packs.get('conventum.skills').get(this._weapon.system.combatSkill);

        if ((this._action) &&
            (this._action.system.skill.skillAsCombat) &&
            (this._action.system.skill.skill !== ''))
        this._skill = game.packs.get('conventum.skills').get(actionItem.system.skill.skill);

        this.msgHistory("common.skill", this._skill.name); 
    }

    /**
     * _get2Weapon
     */
    _get2Weapon() {
        this._weapon2 = null;
        if ((this._action) &&
            (this._action.system.skill.doubleAttack)) {
            const mHandWeapons = this._actor.items.filter(e => (e.type === 'weapon') 
                                                           && ((e.system.inHands.inLeftHand) || 
                                                               (e.system.inHands.inRightHand)) );
            if (mHandWeapons.length == 2) {
                this._weapon2 = mHandWeapons.filter(e => e.id !== this._weapon.id)[0];
                this.msgHistory("common.2weapon", this._weapon2.name);
            }
        } else
            this.msgHistory("common.no2Weapon");
    }

    /**
     * _getPercentBase
     */
    _getPercentBase() {
        this._percentBase = this._actor.system.skills[this._skill.id].value;
        if (!this._percentBase)
            this._percentBase = 0;
        this.msgHistory("common.basePercent", this._percentBase.toString()+'%');
    }

    /**
     * _getPercentPenal
     */
    _getPercentPenal() {
        let penal = this.clearPenalty(this._actor.system.skills[this._skill.id].penal);
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.penalSkill", this._percentMod.toString()+'%');
        }
    }

    /**
     * _getHandPenal
     */
    _getHandPenal() {
        let penal = this.clearPenalty(helperSheetHuman.getHandPenal(this._actor, this._weapon));
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.clumsyHand", penal+'%');
        }
    }

    /**
     * _getWeaponPenal
     */
    _getWeaponPenal() {
        if (!this._weapon.system.penalty.skills[this._skill.id]) return;
        let penal = this.clearPenalty(this._weapon.system.penalty.skills[this._skill.id]);
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.penalWeapon", penal+'%');
        }
    }

    /**
     * _getWeaponRequirementPenal
     */
    _getWeaponRequirementPenal() {
        let penal = '+0';
        if (this._weapon.system.requeriment.primary.apply) {

            const charValue = this._actor.system.characteristics.primary[
                                        this._weapon.system.requeriment.primary.characteristic].value;

            if (charValue < this._weapon.system.requeriment.primary.minValue) {
                const nMinVal = this._weapon.system.requeriment.primary.minValue - charValue;
                penal = '-' + (nMinVal*5).toString();
                this._percentMod = this.addPenalties(this._percentMod, penal);
                
                this.msgHistory("", this._weapon.name+':')
                this.msgHistory("common.weaponRequirement1", 
                  game.i18n.localize("characteristic."+this._weapon.system.requeriment.primary.characteristic) +
                    ' > ' + this._weapon.system.requeriment.primary.minValue);
                this.msgHistory("common.weaponRequirement1", penal+'%');           
            }
        }        
    }

    /**
     * _getActionPenal
     */
    _getActionPenal() {
        let penal = this.clearPenalty(this._action.system.skill.mod.combatSkill);
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.penalAction", penal+'%');
        }
    }

    /**
     * _getActionMulty
     */
    _getActionMulty() {
        let mod = this.clearMult(this._action.system.skill.mod.multSkill);
        if (mod !== 1) {
            this._percentMult = this.multPenalties(this._percentMult, mod);
            this.msgHistory("common.penalAction", penal+'%');
        }
    }

    /**
     * _getByTargetPenalMulty
     */
    _getByTargetPenalMulty() {

        let stackPenal = '+0';
        let penal = '+0';
        let multy = 1;
        let sAction = '';

        const mSteps = aqActions.getCurrentEncounterSteps().filter(e => 
                                    ((e.actor !== this._actor.id) && (e.consumed)) );
        for (const step of mSteps) {
            const actor = game.actors.get(step.actor);
            const action = actor.items.get(step.action);
            if ((action.system.skill.mod.stack) && (action.id !== this._action.id)) {
                stackPenal = this.addPenalties(stackPenal, action.system.skill.mod.combatSkill);
            }
            if ((step.targets) && 
                (step.targets.find(e => e === actor.id))
                && ( (Number(
                        this.clearPenalty(action.system.skill.mod.targetCombatSkill)) !== 0) ||
                     (this.clearMult(action.system.skill.mod.multSkillTarget) !== 1) )) {

                sAction = action.name;
                penal = this.clearPenalty(action.system.skill.mod.targetCombatSkill);
                multy = this.clearMult(action.system.skill.mod.multSkillTarget);
            }            
        }

        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.modTargetCombatSkill", penal+'%');
        }
        if (Number(multy) !== 1) {
            this._percentMult = this.multPenalties(this._percentMult, multy);
            this.msgHistory("common.modSkillMultTarget", penal);
        }        
    }

    /**
     * _getPercentFinal
     */
    _getPercentFinal() {
        this._percent = Number(eval(
                (Number(this._percentBase) * Number(this._percentMult)).toString() + this._percentMod) );
        this.msgHistory("common.finalPercent", this._percent+'%');
    }

    /**
     * _getDamageBase
     */
    _getDamageBase() {
        this._damageBase = this._weapon.system.damage;
        this.msgHistory("common.baseDamage", this._damageBase.toString());
        if (this._weapon2) {
            this._damage2Base = this._weapon2.system.damage;
            this.msgHistory("common.baseDamage", this._damage2Base.toString(), true);
        }
    }

    /**
     * _getActionDamageMulty
     */
    _getActionDamageMulty() {
        let mod = this.clearMult(this._action.system.damage.mod.multDamage);
        if (mod !== 1) {
            this._damageMult = this.multPenalties(this._damageMult, mod);
            this.msgHistory("common.multDamage", penal);
            if (this._weapon2) {
                this._damage2Mult = this.multPenalties(this._damage2Mult, mod);
                this.msgHistory("common.multDamage", penal, true);                
            }
        }
    }

    /**
     * _getDamageBon
     */
    _getDamageBon() {
        let penal = helperSheetHuman.calcDamageMod(this._actor, this._weapon, this._action);
        let penal2 = (this._weapon2) ? 
                        helperSheetHuman.calcDamageMod(this._actor, this._weapon2, this._action) : '';
        if ((this._action) &&
            (this._action.system.damage.mod.modDamage1)) {
            this.msgHistory("common.modDamage1", "");
            this.msgHistory("common.modDamage1", "", true);
        }
        if ((this._action) &&
            (this._action.system.damage.mod.modDamage2)) {
            this.msgHistory("common.modDamage2", "");
            this.msgHistory("common.modDamage2", "", true);
        }    

        if ((this._action) &&
            (this._action.system.damage.mod.noDamageBon)) {
            penal = '';
            this.msgHistory("common.noDamageBon", "");
            this.msgHistory("common.noDamageBon", "", true);            
        }

        this._damageBon = penal;    
        this.msgHistory("common.modDamage", penal);

        if (this._weapon2) {
            this._damage2Bon = penal2;
            this.msgHistory("common.modDamage", penal2, true);
        }
    }

    /**
     * _getWeaponRequirmDamagePenal
     */
    _getWeaponRequirmDamagePenal() {
        let penal = '';
        if (this._weapon.system.requeriment.primary.apply) {

            const charValue = this._actor.system.characteristics.primary[
                                        this._weapon.system.requeriment.primary.characteristic].value;

            if (charValue < this._weapon.system.requeriment.primary.minValue) {
                const nMinVal = this._weapon.system.requeriment.primary.minValue - charValue;
                penal = '-' + nMinVal.toString();
                this._damageMod += penal;

                this.msgHistory("", this._weapon.name+':')
                this.msgHistory("common.weaponRequirement1", 
                  game.i18n.localize("characteristic."+this._weapon.system.requeriment.primary.characteristic) +
                    ' > ' + this._weapon.system.requeriment.primary.minValue);
                this.msgHistory("common.weaponRequirement1", penal);           

                if (this._weapon2) {
                    this._damage2Mod += penal;      
                    this.msgHistory("", this._weapon.name+':', true)
                    this.msgHistory("common.weaponRequirement1", 
                      game.i18n.localize("characteristic."+this._weapon.system.requeriment.primary.characteristic) +
                        ' > ' + this._weapon.system.requeriment.primary.minValue, true);
                    this.msgHistory("common.weaponRequirement1", penal, true);
                }                
            }
        }  
    }

    /**
     * _getDamageByTargetPenal
     */
    _getDamageByTargetPenal() {

        let stackPenal = '';
        let penal = '';
        let sAction = '';

        const mSteps = aqActions.getCurrentEncounterSteps().filter(e => 
                                    ((e.actor !== this._actor.id) && (e.consumed)) );
        for (const step of mSteps) {
            const actor = game.actors.get(step.actor);
            const action = actor.items.get(step.action);
            if ((action.system.damage.mod.stack) && (action.id !== this._action.id)) {
                stackPenal += action.system.damage.mod.damage;
            }
            if ((step.targets) && 
                (step.targets.find(e => e === actor.id)) &&
                (action.system.damage.mod.targetDamage !== '')) {

                sAction = action.name;
                penal = action.system.damage.mod.targetDamage;
            }            
        }
        if (penal !== '') {
            this._damageMod += penal;
            this.msgHistory("common.modTargetDamage", penal);
            if (this._weapon2) {
                this._damage2Mod += penal;
                this.msgHistory("common.modTargetDamage", penal, true);
            }
        }    
    }

    /**
     * _getDamageFinal
     */
    _getDamageFinal() {

        if (this._damageMult !== 1)
             this._damage = '(' + this._damageBase + ')*' + this._damageMult.toString() + ' '
                            + this._damageBon + this._damageMod;
        else this._damage = this._damageBase + this._damageBon + this._damageMod;
        this.msgHistory("common.finalDamage", this._damage);

        if (this._weapon2) {
            if (this._damage2Mult !== 1)
            this._damage2 = '(' + this._damage2Base + ')*' + this._damage2Mult.toString() + ' '
                           + this._damage2Bon + this._damage2Mod;
            else this._damage2 = this._damage2Base + this._damage2Bon + this._damage2Mod;
            this.msgHistory("common.finalDamage", this._damage2, true);            
        }
    }

    /**
     * _getMessageContent
     * @param {*} b2weapon 
     */
    _getMessageContent(b2weapon) {
        b2weapon = (!b2weapon) ? false : b2weapon;

        return '<div class="_messageFrame">'+
                    
                    '<div class="_messageImg">'+
                        '<img src="'+this._actor.img+'"/>'+
                    '</div>'+

                    '<div class="_vertical">'+
                        '<div class="_title">'+this._actor.name+'</div>'+
                        '<a class="_infoSkill" data-itemId="'+this._skill.id+'">'+
                            '<div class="_Img"><img src="'+this._skill.img+'"/></div>'+
                        '</a>'+
                        '<div class="_skill">'+this._skill.name+'</div>'+
                    '</div>'+

                    '<div class="_result">'+this._roll.total+'</div>'+
                    '<div class="_resultOver">'+this._rollPercent.toString()+'</div>'+

                    ( (this._spell) ? 
                     '<div class="_messageSpell">'+
                        '<a class="_showItem" data-itemid="'+this._spell.id+'" data-actorid="'+this._actor.id+'">'+
                            '<div class="_name">'+this._spell.name+'</div>'+ 
                        '</a>'+        
                     '</div>' : '' ) +

                    '<div class="_bonif '+this._rollLevel.class+'">'+
                        '<span class="_bonifText">'+this._rollLevel.text+'</span>'+
                        ((this._rollBono !== '') ? this._rollBono : '+0') +
                    '</div>'+

                    ( (this._rollSuccess) ?
                     '<div class="_success">'+game.i18n.localize("common.success")+'</div>' :
                     '<div class="_failed">'+game.i18n.localize("common.failed")+'</div>'                    
                    ) +

                    ( (this._rollCritSuccess) ?
                     '<div class="_critSuccess">'+game.i18n.localize("common.rollCriticalSuccess")+'</div>' :
                     '' ) +

                    ( (this._rollCritFailure) ?
                     '<div class="_critFailure">'+game.i18n.localize("common.rollCriticalFailure")+'</div>' :
                     '' ) +                    

                    ( ((this._action) || (this._spell)) ? 
                    '<div class="_messageAction">'+
                        '<a class="_showItem"'+
                            ' data-itemid="'+( (this._spell) ? this._spell.id : this._action.id )+'"'+
                            ' data-actorid="'+this._actor.id+'">'+
                                '<img src="'+( (this._spell) ? this._spell.img : this._action.img )+'"/>'+
                        '</a>'+
                        '<div class="_name">'+
                            ( (this._spell) ? this._spell.name : this._action.name )+
                        '</div>'+   
                    '</div>' :
                    ''
                    ) +

                    ( (this._express) ? 
                    '<div class="_messageAction">'+
                        '<img src="/systems/conventum/image/content/weapons/Dices.png"/>'+  
                    '</div>' :
                    ''
                    )+

                    ( (this._weapon) ?
                    '<div class="_messageWeapon">'+
                        '<a class="_showItem" data-itemid="'+this._weapon.id+'" data-actorid="'+this._actor.id+'">'+
                            '<div class="_name">'+this._weapon.name+'</div>'+ 
                        '</a>'+        
                    '</div>' :
                    ''              
                    ) +

                    this._getMessageLinkToDamage(b2weapon)+
                    this._getMessageHelpTab()+
                    this._getMessageTargets()+
                '</div>';
    }

    /**
     * _getMessageLinkToDamage
     * @param {*} b2weapon 
     */
    _getMessageLinkToDamage(b2weapon) {
        b2weapon = (!b2weapon) ? false : b2weapon;

        let sTargets = '';
        this._targets.map(e => {
            if (sTargets === '') sTargets = e.id;
                            else sTargets += '.'+e.id;
        });

        if ((this._damage === '') && (this._damage2 === '')
         || (!this._rollSuccess))
            return '<div class="_messageDamage"></div>';

        return  '<div class="_messageDamage">'+
                    '<a class="_rollDamage" data-weaponid="'+
                                                ((this._weapon2) ? 
                                                    this._weapon2.id : (this._weapon)? this._weapon.id : '')+'" '+
                                        ' data-spellid="'+((this._spell)? this._spell.id : '')+'" '+
                                        ' data-actorid="'+this._actor.id+'" '+
                                        ' data-targets="'+sTargets+'" '+
                                        ' data-critsuccess="'+this._critSuccess+'" '+
                                        ' data-critfailure="'+this._critFailure+'" '+
                                        ' data-locationid="'+this._location+'" '+
                                        ' data-actionid="'+ ((this._action) ?this._action.id : '')+'" '+
                                        ' data-damage="'+((this._weapon2) ? this._damage2 : this._damage)+'">'+
                    '<img src="/systems/conventum/image/texture/dice.png">'+
                    '<div class="_name">'+((this._weapon2) ? this._damage2 : this._damage)+'</div>'+
                    '</a>'+         
                '</div>';        
    }

    /**
     * _getMessageHelpTab
     * @returns 
     */
    _getMessageHelpTab() {
        let sReturn = '<div class="_showMods">'+
                        '<div class="_infoMods">i</div>'+
                          '<ul class="_messageMods">';
        this._history.map(s => sReturn += '<li>'+s+'</li>');
        sReturn += '</ul>'+
               '</div>';
        return sReturn;
    }

    /**
     * _getMessageTargets
     * @returns 
     */
    _getMessageTargets() {
        let sContent = '';
        this._targets.forEach(targetId => {
          const target = game.actors.get(targetId);
          sContent += '<li style="background-image: url('+"'"+target.img+"'"+')">'+
                          '<label class="_targetName">'+target.name+'</label>'+
                      '</li>';
        });
        return '<ul class="_messageTargets">'+sContent+'</ul>';      
    }

    /**
     * clearPenalty
     * @param {*} s 
     */
    clearPenalty(s) {
        if ((s === "NaN") || (s === NaN)) s = '+0';
        return (Number(s)>=0) ? '+'+Number(s).toString() : Number(s).toString();        
    }

    /**
     * clearMult
     * @param {*} s 
     */
    clearMult(s) {
        if (Number(s) === 0) return 1;
        if (Number(s) === NaN) return 1;
        return Number(s);
    }

    /**
     * addPenalties
     * @param {*} s1 
     * @param {*} s2 
     */
    addPenalties(s1, s2) {
        return this.clearPenalty( 
                eval( this.clearPenalty(s1) + this.clearPenalty(s2) ) );
    }

    /**
     * multPenalties
     * @param {*} s1 
     * @param {*} s2 
     */
    multPenalties(s1, s2) {
        return this.clearMult(
            this.clearMult(s1) * this.clearMult(s2) );
    }

    /**
     * msgHistory
     * @param {*} sI18n 
     * @param {*} sText 
     */
    msgHistory(sI18n, sText, bHistory2) {
        if (!sI18n) sI18n = '';
        if (!sText) sText = '';
        bHistory2 = (!bHistory2) ? false : bHistory2;

        const s1 = (sI18n !== '') ? game.i18n.localize(sI18n) : '';
        const s2 = (sText) ? '<b>'+sText+'</b>' : '';
        const s = ((s1 !== '') && (s2 !== '')) ? s1 + ': ' + s2 : 
                  ((s1 === '') && (s2 !== '')) ? s2 :
                  ((s1 !== '') && (s2 === '')) ? '<b>'+s1+'</b>' : '';
        
        if (!bHistory2) this._history.push(s);
                   else this._history2.push(s);
    }

    /**
     * msgInfo
     * @param {*} sText 
     */
    msgInfo(sText) {
        ui.notifications.info(sText);
    }

    /**
     * msgWarning
     * @param {*} sText 
     */
    msgWarning(sText) {
        ui.notifications.warn(sText);
    }

    /**
     * msgError
     * @param {*} sText 
     */
    msgError(sText) {
        ui.notifications.error(sText);
    }


}