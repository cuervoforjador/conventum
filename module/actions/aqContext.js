
import { aqActions } from "./aqActions.js";
import { aqCombat } from "./aqCombat.js";
import { helperSocket } from "../helpers/helperSocket.js";
import { helperSheetHuman } from "../sheets/helpers/helperSheetHuman.js";
import { helperSheetArmor } from "../sheets/helpers/helperSheetArmor.js";
import { helperActions } from "../sheets/helpers/helperActions.js";
import { helperMessages } from "../sheets/helpers/helperMessages.js";
import { helperSprites } from "../helpers/helperSprites.js";

export class aqContext {

    _actor              =null
    _action             =null
    _weapon             =null
    _weapon2            =null
    _spell              =null

    _locationId         =''

    _isSkill            =false
    _skill              =null
    _charAsSkill        =false
    _percentBase        =0
    _percentMod         =''
    _percentMult        =1
    _percent            =0
    
    _rollFormula        ='1d100'
    _rollBono           =''
    _rollLevel          = {
        text:           '',
        class:          'noLevel'
    }
    _rollPercent        =0
    _rollSuccess        =false
    _rollCritSuccess    =false
    _rollCritFailure    =false
    _roll               =null
    _noRoll             =false
    _actionConsumed     =false

    _oppoRolls          = {
        actor: {
            percent:    0,
            result:     0,
            success:    false,
            win:        false,
            rolled:     false,
            total:      0
        },
        enemy: {
            percent:    0,
            result:     0,
            success:    false,
            win:        false,
            rolled:     false,
            total:      0
        }
    }

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
    _damagePoints       =0

    _messageId          =''
    _damageMessageId    =''

    _luckMode           =false
    _modes              =[]

    _combat             =null
    _encounter          =null
    _worldId            =''
    _worldConfig        ={}

    _targets            =[]
    _targetsDamage      ={}
    _history            =[]
    _history2           =[]
    _targetsToken       =[]

    _express            =false
    _simulate           =false
    _noCombat           =false
    _noWeapon           =false
    _noAction           =false
    _useSpell           =false
    _defensive          =false
    _shielded           =false
    _shieldedTarget     =false
    _damageToShield     =false

    safeBox = {
        actorId         :null,
        tokenId         :null,
        actionId        :null,
        weaponId        :null,
        weapon2Id       :null,
        spellId         :null,
        skillId         :null,
        combatId        :null,
        encounterId     :null
    }

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

        if (!options) return;
        if (options.import) {
            this.import(options.import);
        } 
        else if (options.context) {
            this._actor = options.context._actor;
            this._weapon = options.context._weapon;
            this._combat = options.context._combat;
            this._encounter = options.context._encounter;
            this._action = options.context._action;
            this._applyLocation();
        } 
        else {

            this._actor = (options.tokenId) ?
                                game.scenes.active.tokens.get(options.tokenId).getActor() :
                                game.actors.get(options.actorId);
            if (!this._actor) {
                this.msgError("There is no actor for this Id!");
                return;              
            }
            this.setWorld(this._actor.system.control.world);

            if ((options.spellId !== undefined) && (options.spellId !== '')) {
                this._spell = this._actor.items.get(options.spellId);
                if (!this._spell) {
                    this.msgError("There is no spell for this Id!");
                    return;              
                }
                this.msgHistory("common.spell", this._spell.name);            
                this._useSpell = true;
                this._noCombat = true;
                this._noAction = true;
            }

            this._isSkill = (options.isSkill === true); 
            if (this._isSkill) this._noCombat = true;

            if (options.express) {
                this._noAction = true;
            }

            this._action = aqActions.getCurrentAction(this._actor.id);
            this._action = (this._action !== undefined) ? this._action : null;
            if ((!this._action) && (!this._noCombat) && (!this._noAction)) {
                this.msgError("Error with Action!");
                return;
            } 

            //Skill combat as action...
            if ((!this._isSkill) && (!this._noAction)) {
                this._isSkill = ((this._action.system.skill.useSkill) &&
                                 (!this._action.system.skill.skillAsCombat));
            }

            this._weapon = this._actor.items.get(options.weaponId);
            this._weapon = (this._weapon !== undefined) ? this._weapon : null;
            if ( ((!this._weapon) && (!this._noCombat)) &&
                 ((!this.weapon) && (!this._isSkill)) ) {
                this.msgError("There is no weapon for this Id!");
                return;              
            }
            if (this._weapon)
                this.msgHistory("common.weapon", this._weapon.name);
            else
                this._noWeapon =  ( (this._useSpell) || 
                                    ((this._action.system.skill.useSkill) &&
                                     (!this._action.system.skill.skillAsCombat)) );

            if (options.simulate) this._simulate = options.simulate;

            if (this._noAction) return;

            this._combat = aqActions.getCurrentCombat();
            this._combat = (this._combat !== undefined) ? this._combat : null;
            if ((!this._combat) && (!this._noCombat)) {
                this.msgError("There is no active combat!");
                return;              
            }

            this._encounter = aqActions.getCurrentEncounter();
            this._encounter = (this._encounter !== undefined) ? this._encounter : null;
            if ((!this._encounter) && (!this._noCombat)) {
                this.msgError("There is no active encounter!");
                return;              
            }      

            //Defensive action
            if ((this._action) && (this._action.system.type.defense)) {
                this._defensive = true;
            }

            this._consolidate();
            this._applyLocation();
        }
    }

    /**
     * init
     */
    init() {
        if (this.safeBox.actorId) this._actor = game.actors.get(this.safeBox.actorId);
        else {
            this.msgError("Critic error!");
            return;              
        }

        if (this.safeBox.actionId) this._action = this._actor.items.get(this.safeBox.actionId);
        if (this.safeBox.weaponId) this._weapon = this._actor.items.get(this.safeBox.weaponId);
        if (this.safeBox.weapon2Id) this._weapon2 = this._actor.items.get(this.safeBox.weapon2Id);
        if (this.safeBox.spellId) this._spell = this._actor.items.get(this.safeBox.spellId);
        
        this._getActionSkill();
        this._combat = aqActions.getCurrentCombat();
        this._encounter = aqActions.getCurrentEncounter();
    }

    /**
     * _consolidate
     */
    _consolidate() {
        this.safeBox = {
            actorId: this._actor ? this._actor._id : null,
            tokenId: (this._actor && this._actor.isToken) ? this._actor.token._id : null, 
            actionId: this._action ? this._action._id : null,
            weaponId: this._weapon ? this._weapon._id : null,
            weapon2Id: this._weapon2 ? this._weapon2._id : null,
            spellId: this._spell ? this._spell._id : null,
            skillId: this._skill ? this._skill._id : null,
            combatId: this._combat ? this._combat._id : null,
            encounterId: this._encounter ? this._encounter._id : null
        };
    }

    /**
     * export
     * @returns 
     */
    export() {
        return {
            actorId:            this._actor.id,
            tokenId:            this._actor.isToken ? this._actor.token._id : null,
            actionId:           (this._action) ? this._action.id : '',
            weaponId:           (this._weapon) ? this._weapon._id : '',
            weapon2Id:          (this._weapon2) ? this._weapon2._id : '',
            spellId:            (this._spell) ? this._spell._id : '',

            locationId:         this._locationId,
            location:           this._location,
        
            isSkill:            this._isSkill,
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
            noRoll:             this._noRoll,
            noWeapon:           this._noWeapon,
            useSpell:           this._useSpell,
            actionConsumed:     this._actionConsumed,
        
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
        
            oppoRolls:          this._oppoRolls,

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

        this._isSkill = (oContext.isSkill) ? oContext.isSkill : this._isSkill;
        this._skill = null;
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
        
        this._locationId = (oContext.locationId) ? oContext.locationId : this._locationId;
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
        this._noRoll = (oContext.noRoll) ? oContext.noRoll : this._noRoll;
        this._noWeapon = (oContext.noWeapon) ? oContext.noWeapon : this._noWeapon; 
        this._useSpell = (oContext.useSpell) ? oContext.useSpell : this._useSpell; 
        
        this._actionConsumed = (oContext.actionConsumed) ? oContext.actionConsumed : this._actionConsumed;
        this._oppoRolls = (oContext.oppoRolls) ? oContext.oppoRolls : this._oppoRolls;

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
     * _applyLocation
     */
    _applyLocation() {
        if (this._noCombat) {
            this._locationId = '';
            return;
        }

        const step = aqActions.getCurrentStep();
        if ((!step) || (step.actor !== this._actor.id)) {
            this.msgError("No Step found or this step does not belong to the actor!");
            return;
        }
        this._locationId = (step.applyLocation) ? step.applyLocation.location : '';
    }

    /**
     *acquireActor
     * @param {*} uniqeId 
     */
    acquireActor(uniqeId) {
        return (game.scenes.active.tokens.get(uniqeId)) ? 
                    game.scenes.active.tokens.get(uniqeId).getActor() :
                    game.actors.get(uniqeId);
    }

    /**
     * acquireUniqeId
     * @param {*} actor 
     */
    acquireUniqeId(actor) {
        return (actor.isToken) ? actor.token.id : actor.id;
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
            const actor = this.acquireActor(sTargetId);
            if (!actor) {
                this.msgError("There is no actor for this Id!");
                return;
            }
            
            mTargets.push(this.acquireUniqeId(actor));
            if (actor.getActiveTokens().length > 0) {
                mTargetsToken.push(actor.getActiveTokens()[0].id);
                await game.user.updateTokenTargets(actor.getActiveTokens()[0].id);
            }
            if (this._actor.sheet.rendered) this._actor.sheet.render(true);       
        }
        this._targets = mTargets;
        this._targetsToken = mTargetsToken;
        await this.updateTokensTargets();
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
            const actor = this.acquireActor(sTargetId);
            if (!actor) {
                this.msgError("There is no actor for this Id!");
                return;
            }
            currentStep.targets.push(this.acquireUniqeId(actor));
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

        if (!this._simulate)
            await this._preparePacks();

        if (this._express) {
            this._prepareExpress();
            return;
        }

        this._getActionSkill();
        this._get2Weapon();

        this._getPercentBase();
        this._getActionMulty();
        this._getModesMulty();

        this._getPercentPenal();
        this._getPercentModesPenal();
        this._getMagicMods();
        this._getHandPenal();
        this._getWeaponPenal();
        this._getRangePenal();
        this._getWeaponRequirementPenal();
        this._getActionPenal();
        this._getByTargetPenalMulty();
        this._getPercentFinal();

        this._getDamageBase();
        this._getSpellDamageBase();
        this._getActionDamageMulty();
        this._getModeDamageMulty();

        this._getDamageBon();
        this._getDamageAction();
        this._getWeaponRequirmDamagePenal();
        this._getDamageByTargetPenal();
        this._getDamageFinal();
        this._evalNoRoll();
        this._getOpposedStats();

        if (!this._simulate) {
            this._removeModes();
        }
    }

    /**
     * prepareExpress
     */
    async _prepareExpress() {

        this._getActionSkill();
        this._getPercentBase();
        this._getModesMulty();
        this._getPercentPenal();
        this._getPercentModesPenal();
        this._getHandPenal();
        this._getWeaponPenal();
        this._getWeaponRequirementPenal();  
        this._getPercentFinal();

        this._getDamageBase();
        this._getModeDamageMulty();
        this._getDamageBon();
        this._getWeaponRequirmDamagePenal();
        this._getDamageFinal();    
        this._removeModes();          
    }

    /**
     * getAskForLevels
     */
    getAskForLevels() {
        if (this._express) return true;
        if ((this._action) && (this._action !== undefined)) {
            return this._action.system.rolls.leveled;
        } else {
            if (this._noCombat) return true;
            return false;
        }
    }

    /**
     * setRoll
     * @param {*} roll 
     */
    async roll(roll) {
        this._roll = new Roll(this._rollFormula, {});
        this._roll.evaluate({async: false});
        if (    ( (game.dice3d) &&
                    ((!this._noAction) && (!this._action.system.skill.autoSuccess)) ) ||
                ( (game.dice3d) &&
                    (this._useSpell) )
           )
          await game.dice3d.showForRoll(this._roll, game.user, true);  

        await this._evalRoll();
        await this._postRoll();
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
    async message() {

        let message = await helperMessages.chatMessage(
            this._getMessageContent(), this._actor, false, '', '280px', true);
        this._messageId = message.id;
        this._consolidate();

        await helperSocket.update(message, {flags: Object.assign({}, this)});

        if (this._weapon2) {           
            let message2 = await helperMessages.chatMessage(
                this._getMessageContent(true), this._actor, false, '', '280px', true);
            
            this._messageId = message2.id;
            this._consolidate();                 
            await helperSocket.update(message2, {flags: Object.assign({}, this)});
        }

        game.messages.directory.activate();
    }

    /**
     * consumeStep
     */
    async consumeStep() {
        if ((!this._express) && (!this._noCombat)) {
            if (aqActions.getCurrentStep().actor === this._actor.id)
                                      await aqActions.consumeCurrentStep();
        }
    }

    /**
     * rollOppo
     * @param {*} message
     * @param {*} actorId 
     */
    async rollOppo(message, actorId) {
        const enemy = this._getEnemy();
        const isActor = (actorId === this._actor.id);
        const isEnemy = (actorId === enemy.id); 

        let roll = new Roll('1d100', {});
        roll.evaluate({async: false});
        if (game.dice3d)
            await game.dice3d.showForRoll(roll);        

        let myRoll = {};
        let otRoll = {};
        if (isActor) {
            myRoll = this._oppoRolls.actor;
            otRoll = this._oppoRolls.enemy;
        }
        if (isEnemy) {
            myRoll = this._oppoRolls.enemy;
            otRoll = this._oppoRolls.actor;
        }

        myRoll.result = roll.total;
        myRoll.success = (myRoll.percent >= roll.total);
        myRoll.rolled = true;

        if ((myRoll.rolled) && (otRoll.rolled)) {

            if ((myRoll.success) && (otRoll.success)) {
                myRoll.win = (myRoll.result >= otRoll.result);
                otRoll.win = (otRoll.result > myRoll.result);
            }
            if ((myRoll.success) && (!otRoll.success))
                myRoll.win = true;
            if ((!myRoll.success) && (otRoll.success))
                otRoll.win = true;
            if ((!myRoll.success) && (!otRoll.success)) {
                myRoll.win = false;
                otRoll.win = false;
            }
            
            const bSuccess = ((isActor) && (myRoll.win))

            //Modes..
            if ( (this._action.system.rolls.opposedRoll) && 
                 (this._action.system.rolls.replaceRoll) ) {
                    
                    this._rollSuccess = ( ((isActor) && (myRoll.win)) ||
                                          ((isEnemy) && (otRoll.win))  );
                    this._evalModes();
            }
        }

        let newContent = this._updateOpposedMessage(isActor);

        await helperSocket.update(message, {flags: Object.assign({}, this),
                                            content: newContent});

    }

    /**
     * rollDamage
     */
    async rollDamage() {

        this._damagePoints = 0;
        this._history = [];

        //Checking targets.
        let itsOk = true;
        this._targets.map(targetId => {
            let target =this.acquireActor(targetId);

            //Shield target...
            if ((this._action) && (this._action.system.damage.target.shield)) {
                let shield = aqCombat.getShield(target);
                if (!shield) {
                    itsOk = false;
                    new Dialog({
                        title: "",
                        content: game.i18n.localize("info.noShield"),
                        buttons: {} }).render(true);                
                }
            }              
        });
        if (!itsOk) return;


        if (this._rollCritSuccess) {

            //Critical Success applies max damage            
            this._damagePoints = eval( this._damage.toUpperCase().replaceAll('D','*') );
            this.msgHistory("common.rollCriticalSuccess", '');
            this.msgHistory("common.maxDamage", this._damagePoints);

        } else {

            //Damage roll
            let roll = new Roll(this._damage, {});
            roll.evaluate({async: false});
            if (game.dice3d)
                await game.dice3d.showForRoll(roll);

            this._damagePoints = Math.round(roll.total);
            this.msgHistory("common.damagePoints", this._damagePoints);
        }

        //Updating Message...
        await this._updateDamageMessage();

        //Applying damage each target...
        this._applyTargetDamage();
   
    }

    /**
     * _evalRoll
     */
    async _evalRoll() {
        this._rollPercent = Number(eval(this._percent.toString() + this._rollBono));
        this._rollSuccess = Number(this._roll.result) <= this._rollPercent;

        if ((!this._noAction) && (this._action.system.skill.autoSuccess)) {
            this._rollPercent = 0;
            this._rollSuccess = true;
            this._rollCritSuccess = false;
            this._rollCritSuccess = false;
            return;
        }

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
        if (this._rollCritFailure) this._rollSuccess = false;

        if (this._rollCritSuccess) this.msgHistory("common.rollCriticalSuccess", "");
        if (this._rollCritFailure) this.msgHistory("common.rollCriticalFailure", "");

        //Damage x Endurance (Critical Failure)
        if ((!this._noAction) &&            
            (this._action.system.damage.damageXendurance) &&
            (this._rollCritFailure)) {

                //this._action.system.damage.noDamage = false;
                //this._action.system.damage.damageXendurance = false;
                this._noDamageXendurance = true;
                this._rollSuccess = true;
        }

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
            
            await helperSocket.update(this._actor, { system: {
                        characteristics: {secondary: {luck: {value: myFinalLuck}}},
                        modes: helperActions.modesWithoutLuck(this._actor)
                    }});

            this.msgHistory("common.luck", '');
            this.msgHistory("common.luckLost", nDiff.toString());
            this.msgHistory("common.luckChange", myLuck.toString()+' -> '+myFinalLuck.toString());

            if (myLuck >= nDiff) 
                this._rollSuccess = true;
        }
    }

    /**
     * _postRoll
     */
    async _postRoll() {
        await this._evalShields();
        await this._evalModes();
        await this._removeDamageMessage();  
        await this._consumeAction(); 
    }

    /**
     * postNoRoll
     */
    async postNoRoll() {
        await this._evalModes();
        await this._consumeAction(); 
    }

    /**
     * _consumeAction
     */
    async _consumeAction() {

        if (this._actionConsumed) return;

        //Consuming action in Encounter
        this._actionConsumed = true;
        if (!this._express) {   
            let encounter = aqActions.getCurrentEncounter();
            await helperSocket.update(encounter, {
                system: { 
                    //context: this,
                    steps: aqActions.getUpdatedSteps()
                }
            });
            helperSocket.refreshSheets();
        }  
    }

    /**
     * _evalShields
     */
    async _evalShields() {

        if (!this._weapon) return;
        if ((!this._defensive) || (!this._weapon.system.type.shield)) return;
        
        this._shielded = true;
        let mActionMessages = Array.from(game.messages).filter(e => ((e.flags) && (e.flags.safeBox)));
        if (mActionMessages.length === 0) return;

        //Updating messages...
        for (var i=0; i<this._targets.length; i++ ) {
            let sTarget = this._targets[i];

            let nMessage = mActionMessages.filter(e => 
                ( $(e.content).find('._messageFrame').data('actorid') === sTarget )); 
            let message = nMessage[nMessage.length - 1]; 
            if (!message) {
                this.msgError("No message found!");
                return;              
            } 

            let content = message.content;
            let sToFind = $(content).find("._messageDamage").html();
            sToFind = sToFind.replace('.png">', '.png" />');
            sToFind = sToFind.replaceAll('=""', '');           
            let sShield = sToFind+'<div class="_shield">'+
                '<img src="/systems/conventum/image/texture/shield.png" '+
                    'title="'+game.i18n.localize("info.damageToShield")+'"/>'+
            '</div>';
            let newContent = content.replace(sToFind, sShield);

            await helperSocket.update(message, {content: newContent,
                                                flags: {
                                                    _shieldedTarget: this._rollSuccess,
                                                    _damageToShield: true } });
        }
    }

    /**
     * _evalModes
     */
    async _evalModes() {
        if (!this._rollSuccess) return;
        if (this._noAction) return;

        const mModes = Array.from(await game.packs.get('conventum.modes'))
                            .filter(e => (e.system.control.world === this._worldId));
        
        for (const s in this._action.system.modes) {
            const mode = mModes.find(e => e.id === s);
            const systemMode = this._action.system.modes[s];
            
            if (systemMode.active)
                helperActions.playMode(this._actor, mode, true);
            if (systemMode.break)
                helperActions.removeMode(this._actor, mode);
            //if (systemMode.allowed)
            //if (systemMode.target)
            if ( (systemMode.targetIn) ||
                 ((this._rollCritSuccess) && (systemMode.targetCriticalIn)) ) {
                for (const sTarget of this._targets) {
                    const target = game.actors.get(sTarget);
                    helperActions.playMode(target, mode, true);
                }
            }                                         
        }
    }

    /**
     * _preparePacks
     */
    async _preparePacks() {
        await game.packs.get('conventum.worlds').getDocuments();
        await game.packs.get('conventum.skills').getDocuments();
        await game.packs.get('conventum.modes').getDocuments();
        await game.packs.get('conventum.locations').getDocuments();
    }

    /**
     * _getActionSkill  
     */
    _getActionSkill() {
        this._skill = null;

        //Direct Skill
        if (this._isSkill) {
            this._skill = game.packs.get('conventum.skills').get(this._action.system.skill.skill);
            this.msgHistory("common.skill", this._skill.name);
            return;
        }

        //No Combat
        if (this._noCombat) {
            
            //Spells
            if (this._spell) {

                if (this._spell.system.percent.secondary) {
                    this._skill = this._spell.system.percent.secondary;
                    this._charAsSkill = true;
                    this.msgHistory("common.skill", game.i18n.localize('characteristic.'+this._spell.system.percent.secondary));                    
                } else {
                    this._skill = game.packs.get('conventum.skills').get(this._spell.system.percent.skill);
                    this.msgHistory("common.skill", this._skill.name);
                }
            }

            return;
        }

        //Skill from Weapon
        if ((this._weapon.system.combatSkill) && 
            (this._weapon.system.combatSkill !== ''))
        this._skill = game.packs.get('conventum.skills').get(this._weapon.system.combatSkill);

        //Skill from Action
        if ((this._action) &&
            (this._action.system.skill.skillAsCombat) &&
            (this._action.system.skill.skill !== ''))
        this._skill = game.packs.get('conventum.skills').get(this._action.system.skill.skill);

        //From Opposed roll !!!
        if ((this._action) &&
            (this._action.system.rolls.replaceRoll)) {

            //Skills
            if (this._action.system.rolls.actor.skill !== '')
            this._skill = game.packs.get('conventum.skills').get(this._action.system.rolls.actor.skill);

            //Characterists
            if (this._action.system.rolls.actor.primaryChar !== '') {
                this._charAsSkill = true;
                this._skill = this._action.system.rolls.actor.primaryChar;
            }
            if (this._action.system.rolls.actor.secondaryChar !== '') {
                this._charAsSkill = true;
                this._skill = this._action.system.rolls.actor.secondaryChar;
            }            
        }     
        
        if (this._skill)
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
        if (!this._charAsSkill)
            this._percentBase = this._actor.system.skills[this._skill.id].value;
        else {
            if (this._actor.system.characteristics.primary[this._skill] !== undefined)
                this._percentBase = this._actor.system.characteristics.primary[this._skill].value;
            if (this._actor.system.characteristics.secondary[this._skill] !== undefined)
                this._percentBase = this._actor.system.characteristics.secondary[this._skill].value;            
        }
        if (!this._percentBase)
            this._percentBase = 0;
        this.msgHistory("common.basePercent", this._percentBase.toString()+'%');
    }

    /**
     * _getPercentPenal
     */
    _getPercentPenal() {
        let penal = (!this._charAsSkill) ?
                this.clearPenalty(this._actor.system.skills[this._skill.id].penal) : '0';
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.penalSkill", penal.toString()+'%');
        }
    }

    /**
     * _getArmorPenal
     */
    _getArmorPenal() {
        
        let penal = helperSheetArmor.calcPenalByArmor(this._actor, this._skill);
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.penalArmorSkill", penal.toString()+'%');
        }
    }

    /**
     * _getPercentModesPenal
     */
    _getPercentModesPenal() {
        this._actor.system.modes.map(sMode => {
            const mode = game.packs.get("conventum.modes").get(sMode);
            if ((mode.system.config.combatSkill.apply) &&
                (mode.system.config.combatSkill.mod) &&
                (mode.system.config.combatSkill.mod !== '')) {

                let penal = this.clearPenalty(mode.system.config.combatSkill.mod);
                if (Number(penal) !== 0) {
                    this._percentMod = this.addPenalties(this._percentMod, penal);
                    this.msgHistory("common.penalModesSkill", penal.toString()+'%');
                }                
            }
        });
    }

    /**
     * _getRangePenal
     */
    _getRangePenal() {
        if (this._simulate) return;
        let penal = this.clearPenalty(this._getTargetRangePenal());
        if (Number(penal) !== 0) {
            this._percentMod = this.addPenalties(this._percentMod, penal);
            this.msgHistory("common.modRange", this._percentMod.toString()+'%');
        }
    }

    /**
     * _getMagicMods
     */
    _getMagicMods() {
        if (!this._spell) return;

        const systemData = this._actor.system;
        if (this._spell.type === 'ritual') {
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.ceremony);
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.concentration);
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.others);

        } else {
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.method);
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.armor);
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.concentration);
            this._percentMod = this.addPenalties(this._percentMod, systemData.magic.penal.others);
        }
        this.msgHistory("common.penalSkill", this._percentMod.toString()+'%');
    }

    /**
     * _getHandPenal
     */
    _getHandPenal() {
        if ((this._noCombat) || (this._noWeapon)) return;
        if (this._weapon.system.type.shield) return;

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
        if ((this._noCombat) || (this._noWeapon)) return;
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
        if ((this._noCombat) || (this._noWeapon)) return;

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
        if (this._noAction) return;

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
        if (this._noAction) return;

        let mod = this.clearMult(this._action.system.skill.mod.multSkill);
        if (mod !== 1) {
            this._percentMult = this.multPenalties(this._percentMult, mod);
            this.msgHistory("common.modAction", mod);
        }
    }

    /**
     * _getModesMulty
     */
    _getModesMulty() {
        this._actor.system.modes.map(sMode => {
            const mode = game.packs.get("conventum.modes").get(sMode);
            if ((mode.system.config.combatSkill.apply) &&
                (mode.system.config.combatSkill.mult) &&
                (mode.system.config.combatSkill.mult !== 1) &&
                (mode.system.config.combatSkill.mult !== 0)) {

                //Only attack, defense actions
                if ((mode.system.config.combatSkill.onlyAttack)
                    && (!this._action.system.type.attack)) return;
                if ((mode.system.config.combatSkill.onlyDefense)
                    && (!this._action.system.type.defense)) return;
                

                let mod = this.clearMult(mode.system.config.combatSkill.mult);

                if (Number(mod) !== 0) {
                    this._percentMult = this.multPenalties(this._percentMult, mod);
                    this.msgHistory("common.multSkillMode", mod);
                }                
            }
        });
    }

    /**
     * _getByTargetPenalMulty
     */
    _getByTargetPenalMulty() {
        if (this._noCombat) return;

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
        this._percent = Math.round(Number(eval(
                (Number(this._percentBase) * Number(this._percentMult)).toString() + this._percentMod) ));
        if (this._percent < 0) this._percent = 0;
        this.msgHistory("common.finalPercent", this._percent+'%');
    }

    /**
     * _getDamageBase
     */
    _getDamageBase() {
        if ((this._noCombat) || (this._defensive)) return;

        this._damageBase = (!this._noWeapon) ? this._weapon.system.damage : '';
        if ((!this._noAction) && (this._action.system.damage.formula !== ''))
                this._damageBase = this._action.system.damage.formula;

        this.msgHistory("common.baseDamage", this._damageBase.toString());
        if (this._weapon2) {
            this._damage2Base = this._weapon2.system.damage;
            this.msgHistory("common.baseDamage", this._damage2Base.toString(), true);
        }
    }

    /**
     * _getDamageAction
     */
    _getDamageAction() {
        if ((this._noCombat) || (this._defensive)) return;

        let penal = this._action.system.damage.mod.damage;
        
        if ((!penal) || (penal === '') || (penal === '0') || (penal === '+0')) return;

        this._damageMod = this.addPenalties(this._damageMod, penal);          
        this.msgHistory("common.actionDamage", penal);

    }          

    /**
     * _getSpellDamageBase
     */
    _getSpellDamageBase() {
        if ((!this._spell) || (!this._spell.system.damage.apply)) return;

        this._damageBase = this._spell.system.damage.damage;
        this.msgHistory("common.baseDamage", this._damageBase.toString());
    }    

    /**
     * _getActionDamageMulty
     */
    _getActionDamageMulty() {
        if ((this._noCombat) || (this._defensive)) return;

        let mod = this.clearMult(this._action.system.damage.mod.multDamage);
        if (mod !== 1) {
            this._damageMult = this.multPenalties(this._damageMult, mod);
            this.msgHistory("common.multDamage", this._damageMult);
            if (this._weapon2) {
                this._damage2Mult = this.multPenalties(this._damage2Mult, mod);
                this.msgHistory("common.multDamage", mod, true);                
            }
        }
    }

    /**
     * _getModeDamageMulty
     */
    _getModeDamageMulty() {
        if ((this._noCombat) || (this._defensive)) return;

        this._actor.system.modes.map(sMode => {
            const mode = game.packs.get("conventum.modes").get(sMode);
            if ((mode.system.config.damage.apply) &&
                (mode.system.config.damage.mult) &&
                (mode.system.config.damage.mult !== '')) {

                let mod = this.clearMult(mode.system.config.damage.mult);
                if (mod !== 1) {
                    this._damageMult = this.multPenalties(this._damageMult, mod);
                    this.msgHistory("common.multDamageMode", mod);
                    if (this._weapon2) {
                        this._damage2Mult = this.multPenalties(this._damage2Mult, mod);
                        this.msgHistory("common.multDamageMode", mod, true);                
                    }
                }              
            }
        });
    }    

    /**
     * _getDamageBon
     */
    _getDamageBon() {
        if ((this._noCombat) || (this._defensive) || (this._noWeapon)) return;

        let penal = helperSheetHuman.calcDamageMod(this._actor, this._weapon, this._action);
        let penal2 = (this._weapon2) ? 
                        helperSheetHuman.calcDamageMod(this._actor, this._weapon2, this._action) : '';
        if ((this._action) &&
            (this._action.system.damage.mod.modDamage1)) {
            this.msgHistory("common.modDamage1", '');
            this.msgHistory("common.modDamage1", '', true);
        }
        if ((this._action) &&
            (this._action.system.damage.mod.modDamage2)) {
            this.msgHistory("common.modDamage2", '');
            this.msgHistory("common.modDamage2", '', true);                
        }    

        if ((this._action) &&
            (this._action.system.damage.mod.noDamageBon)) {
            penal = '';
            this.msgHistory("common.noDamageBon", "");
            this.msgHistory("common.noDamageBon", "", true);            
        }

        //Modes
        this._actor.system.modes.map(sMode => {
            const mode = game.packs.get("conventum.modes").get(sMode);
            if ((mode.system.config.damage.apply) &&
                (mode.system.config.damage.mod) &&
                (mode.system.config.damage.mod !== '')) {

                let modePenal = this.clearPenalty(mode.system.config.damage.mod);
                if (Number(modePenal) !== 0) {
                    penal = this.addPenalties(penal, modePenal);
                    this.msgHistory("common.modDamageMode", modePenal.toString());
                }                
            }
        });

        //Final
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
        if ((this._noCombat) || (this._defensive) || (this._noWeapon)) return;

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
        if ((this._noCombat) || (this._defensive)) return;

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
        if ( ((this._noCombat) && (this._damageBase === "")) || (this._defensive)) return;

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
     * _evalNoRoll
     */
    _evalNoRoll() {
        this._noRoll = (this._noAction) ? false : this._action.system.rolls.replaceRoll;
    }

    /**
     * getNoRoll
     */
    getNoRoll() {
        return this._noRoll;
    }

    /**
     * _removeModes
     */
    async _removeModes() {
        this._actor.system.modes.map(sMode => {
            const mode = game.packs.get("conventum.modes").get(sMode);
            if (!mode.system.permanent) {
                helperActions.removeMode(this._actor, mode);              
            }
        });
    }

    /**
     * _removeDamageMessage
     */
    async _removeDamageMessage() {
        if ((!this._defensive) || (this._shielded)) return;

        if (this._rollSuccess)
            await this._clearDamageMessage();
    }

    /**
     * _getMessageContent
     * @param {*} b2weapon 
     */
    _getMessageContent(b2weapon) {
        b2weapon = (!b2weapon) ? false : b2weapon;
        if ((!this._noAction) && 
            (this._action.system.skill.autoSuccess)) this._noRoll = true;

        // ----- SECOND WEAPON!!! -----
        if (b2weapon) {
            return '<div class="_messageFrame" data-actorid="'+this._actor.id+'">'+
                this._getHeaderBox(true)+
                this._getRollBox(true)+
                this._getActionBox()+
                this._getWeaponBox(b2weapon)+
                this._getLinksBox()+
                this._getMessageLinkToDamage(b2weapon)+
                this._getMessageHelpTab()+
                this._getMessageTargets()+                    
            '</div>';
        }

        // ----- FIRST WEAPON!!! -----
        return '<div class="_messageFrame" data-actorid="'+this._actor.id+'">'+            
            this._getHeaderBox()+
            this._getRollBox()+
            this._getActionBox()+
            this._getWeaponBox()+
            this._getLinksBox()+
            this._getMessageOppoRolls()+
            this._getMessageLinkToDamage(b2weapon)+
            this._getMessageHelpTab()+
            this._getMessageTargets()+        
        '</div>';
    }

    /**
     * _getDamageMessageContent
     * @param {*} targetId 
     * @returns 
     */
    _getDamageMessageContent(targetId) {
        const targetData = this._targetsDamage[targetId];
        const bToShield = ( ((this._action) && (this._action.system.damage.target.shield)) ||
                            (this._damageToShield)); 
        const bDamageXendurance = ((!this._noAction) && 
                                   (this._action.system.damage.damageXendurance) &&
                                   (!this._noDamageXendurance));

        let mainInfo = '<li>'+targetData.armor.name+'</li>'+
                       '<li>'+game.i18n.localize("common.finalProtection")+': '+
                                targetData.armor.finalProtection.toString()+'</li>';

        if (bToShield) mainInfo = '<li>'+this._action.name+'</li>';

        //Damage x Resistance (Stuning...)
        if (bDamageXendurance) {
            mainInfo = this._getStunnedText(targetId);
        }
        return      '<div class="_msgDamLocation">'+
                        ((!bToShield) ? targetData.location.name : 
                            game.i18n.localize("common.shield"))+
                    '</div>'+
                    '<ul class="_msgDamInfo">'+mainInfo+'</ul>'+
                    this._getMessageHelpTab()+
                    ( (  ((!this._noAction) && (this._action.system.damage.noDamage)) 
                      || (bToShield) || (bDamageXendurance) ) ? '' :
                    '<div class="_msgDamTotal">'+targetData.finalHitDamage.toString()+'</div>'+
                    '<div class="_hitPoints">'+game.i18n.localize("common.hp")+'</div>' );
    }

    /**
     * _getStunnedText
     * @param {*} targetId 
     */
    _getStunnedText(targetId) {
        const targetData = this._targetsDamage[targetId];
        let mainInfo = '';

        mainInfo = '<li>'+
                        game.i18n.localize("characteristic.end")+': '+
                        '<b>'+targetData.target.system.characteristics.primary.end.value.toString()+'</b> vs '+
                        game.i18n.localize("common.finalDamage")+': '+
                        '<b>'+targetData.finalHitDamage.toString()+'</b> '+
                    '<li>';
        if (targetData.finalHitDamage >= targetData.target.system.characteristics.primary.end.value) {
            let mins = (targetData.finalHitDamage - 
                            targetData.target.system.characteristics.primary.end.value)*10;
            if (mins === 0) mins = 10;
            mainInfo += '<li>'+
                            '<b>'+game.i18n.localize("mode.stun")+'</b> '+
                            mins.toString()+' min.'+
                        '<li>';
        } else {
            mainInfo += '<li><b> NO '+game.i18n.localize("mode.stun")+'</b><li>';
        }
        return mainInfo;
    }

    /**
     * _getTargetDistance
     * @param {*} bOnlyNumber 
     * @returns 
     */
    _getTargetDistance(bOnlyNumber) {
        if (this._targetsToken.length == 0) return null;

        const targetToken = game.scenes.active.tokens.get(this._targetsToken[0]);
        const myToken = (this.safeBox.tokenId) ?
                            game.scenes.active.tokens.get(options.tokenId) :
                            Array.from(game.scenes.active.tokens).find(
                                            e => e.actorId === this.safeBox.actorId);

        let ruler = new Ruler();
        ruler._addWaypoint({x: myToken.x,
                            y: myToken.y});
        ruler.measure({x: targetToken.x,
                        y: targetToken.y});
        const distance = ruler.totalDistance;
        ruler.measure({});
        ruler.destroy();   
        
        if (bOnlyNumber) return distance;
                    else return distance + ' ' + ( (game.scenes.active.grid.units) ?
                                                        game.scenes.active.grid.units :
                                                        game.i18n.localize("common.distanceUnit"));
    }

    /**
     * _getTargetRange
     */
    _getTargetRange() {
        const distance = this._getTargetDistance(true);
        const nStr = this._actor.system.characteristics.primary.str.value;
        let sReturn = '';

        if (this._action.system.item.weapon.throw) {

            if (distance <= 2) 
                sReturn = game.i18n.localize("common.targetPointBlack");
            if (distance > 2)
                sReturn = game.i18n.localize("common.weaponLowRange");
            if (distance > Number(nStr/2))
                sReturn = game.i18n.localize("common.weaponMediumRange");
            if (distance > Number(nStr))
                sReturn = game.i18n.localize("common.weaponLargeRange");
            if (distance > Number(nStr*2))  
                sReturn = game.i18n.localize("common.outOfRange");

        } else {

            if (distance <= 2) 
                sReturn = game.i18n.localize("common.targetPointBlack");
            if (distance > 2)
                sReturn = game.i18n.localize("common.weaponLowRange");
            if (distance > Number(this._weapon.system.range.lowRange))
                sReturn = game.i18n.localize("common.weaponMediumRange");
            if (distance > Number(this._weapon.system.range.mediumRange))
                sReturn = game.i18n.localize("common.weaponLargeRange"); 
            if (distance > Number(this._weapon.system.range.largeRange))  
                sReturn = game.i18n.localize("common.outOfRange"); 

        }

        return sReturn;
    }

    /**
     * _getTargetRangePenal
     */
    _getTargetRangePenal() {
        const distance = this._getTargetDistance(true);
        const nStr = this._actor.system.characteristics.primary.str.value;
        let sReturn = '';

        if (this._useSpell) return '';

        if ( (!this._action.system.item.weapon.range) &&
             (!this._action.system.item.weapon.throw) )
                return sReturn;

        if (this._action.system.item.weapon.throw) {

            if (distance <= 2) 
                sReturn = '-50';
            if (distance > 2)
                sReturn = '+20';
            if (distance > Number(nStr/2))
                sReturn = '';
            if (distance > Number(nStr))
                sReturn = '-20';
            if (distance > Number(nStr*2))  
                sReturn = '-200'; 

        } else {

            if (distance <= 2) 
                sReturn = '-50';
            if (distance > 2)
                sReturn = '+20';
            if (distance > Number(this._weapon.system.range.lowRange))
                sReturn = '';
            if (distance > Number(this._weapon.system.range.mediumRange))
                sReturn = '-20';
            if (distance > Number(this._weapon.system.range.largeRange))  
                sReturn = '-200'; 
        }
        
        return sReturn;
    }

    /**
     * _getMultiplerFromWeaponSize
     */
    _getMultiplerFromWeaponSize(bActor) {
        
        let weapon = null;
        if (bActor) {
            weapon = this._weapon;
            this.msgHistory("", this._actor.name);
        }
        else {
            const enemy = this._getEnemy();
            this.msgHistory("", enemy.name);
            const mWeapons = Array.from(enemy.items).filter(e => e.type === 'weapon');
            if (mWeapons.length === 0) return 0;
            weapon = mWeapons.find(e => ( (e.system.inUse) 
                                       && (!e.system.type.shield)) );
            if (!weapon) return 0;
        }

        const size = CONFIG.ExtendConfig.weaponSizes.find(
                                e => e.id === weapon.system.size);
                                 
        this.msgHistory("common.weapon", weapon.name); 
        this.msgHistory("common.multiplicatorByWeapon", 'x'+size.multipler); 

        return size.multipler;
    }

    /**
     * _getEnemy
     */
    _getEnemy() {
        const targetToken = game.scenes.active.tokens.get(this._targetsToken[0]);  
        if (targetToken === undefined) return null;    
        return targetToken.actor;
    }

    /**
     * _getOpposedStats
     * @returns 
     */    
    _getOpposedStats() {
        if (this._simulate) return;
        if ((this._noAction) || (!this._action.system.rolls.opposedRoll)) return ;

        const enemy = this._getEnemy();
        
        let playerRoll = '';
        if (this._action.system.rolls.actor.skill !== '') {
            playerRoll = (this._actor.system.skills[this._action.system.rolls.actor.skill].acquired) ?
                Number(this._actor.system.skills[this._action.system.rolls.actor.skill].value) :
                Number(this._actor.system.skills[this._action.system.rolls.actor.skill].initial);
        }

        if (this._action.system.rolls.actor.primaryChar !== '')
            playerRoll = this._actor.system.characteristics.primary[
                    this._action.system.rolls.actor.primaryChar].value;  

        if (this._action.system.rolls.actor.secondaryChar !== '')
            playerRoll = this._actor.system.characteristics.secondary[
                    this._action.system.rolls.actor.secondaryChar].value; 

        if (this._action.system.rolls.actor.damage) {
            playerRoll = this._damage;
        }

        const mult1 = (!this._action.system.rolls.actor.byWeapon) ?
                            this._action.system.rolls.actor.mult :
                            this._getMultiplerFromWeaponSize(true);

        playerRoll = Math.round(
            Number(this.multPenalties(playerRoll, mult1)));
        playerRoll = Math.round(
            Number(this.addPenalties(playerRoll, this._action.system.rolls.actor.mod)));

        let enemyRoll = '';
        if (this._action.system.rolls.opponent.skill !== '') {
            enemyRoll = (enemy.system.skills[
                this._action.system.rolls.opponent.skill].acquired) ?
                Number(enemy.system.skills[this._action.system.rolls.opponent.skill].value) :
                Number(enemy.system.skills[this._action.system.rolls.opponent.skill].initial);            
        }

        if (this._action.system.rolls.opponent.primaryChar !== '')
            enemyRoll = enemy.system.characteristics.primary[
                    this._action.system.rolls.opponent.primaryChar].value;  

        if (this._action.system.rolls.opponent.secondaryChar !== '')
            enemyRoll = enemy.system.characteristics.secondary[
                    this._action.system.rolls.opponent.secondaryChar].value; 

        const mult2 = (!this._action.system.rolls.opponent.byWeapon) ?
                            this._action.system.rolls.opponent.mult :
                            this._getMultiplerFromWeaponSize(false);  

        enemyRoll = Math.round(
            Number(this.multPenalties(enemyRoll, mult2)));
        enemyRoll = Math.round(
            Number(this.addPenalties(enemyRoll, this._action.system.rolls.opponent.mod)));

        this._oppoRolls.actor.percent = playerRoll;
        this._oppoRolls.enemy.percent = enemyRoll;        
    }

    /**
     * _getImageMessageContent
     */
    _getImageMessageContent() {

        let img = '';
        if (this._skill.img !== undefined) 
            img = this._skill.img;
        else if (this._weapon)
            img = this._weapon.img;

        if (this._useSpell) { 
            img = "/systems/conventum/image/content/skills/magic.png";
        }

        return  '<div class="_Img">'+
                    '<img src="'+img+'"/>'+
                '</div>';
    }

    /**
     * _getHeaderBox
     */
    _getHeaderBox(bSimple) {

        if (bSimple) {
            return  '<div class="_messageImg">'+
                        '<img src="'+this._actor.img+'"/>'+
                    '</div>'+
                    '<div class="_vertical">'+
                        '<div class="_title">'+this._actor.name+'</div>'+
                            '<a class="_infoSkill" data-itemId=""><div class="_Img"></div></a>' +
                            '<div class="_skill"></div>' +
                    '</div>'; 
        }

        let sSkillName = this._skill.name;
        if (sSkillName === undefined) {
            if (this._actor.system.characteristics.primary[this._skill] !== undefined)
                sSkillName = game.i18n.localize("characteristic."+this._skill);
            if (this._actor.system.characteristics.secondary[this._skill] !== undefined)
                sSkillName = game.i18n.localize("characteristic."+this._skill);
        }

        return  '<div class="_messageImg">'+
                    '<img src="'+this._actor.img+'"/>'+
                '</div>'+

                '<div class="_vertical">'+
                    '<div class="_title">'+this._actor.name+'</div>'+
                        '<a class="_infoSkill" data-itemId="'+this._skill.id+'">'+
                            this._getImageMessageContent()+
                        '</a>'+
                        '<div class="_skill">'+(sSkillName)+
                            ( ((!this._noAction) && 
                            (this._action.system.skill.autoSuccess)) ?  '' :
                                ' ('+this._percentBase+'%)' )+ 
                        '</div>' +
                '</div>';        
    }

    /**
     * _getRollBox
     * @returns 
     */
    _getRollBox(bAuto) {
        
        let sMod = '';
        const nFinalRoll = this._rollPercent - Number(this._rollBono);
        if (nFinalRoll < this._percentBase) 
            sMod = '-' + (this._percentBase - nFinalRoll).toString();
        if (nFinalRoll > this._percentBase) 
            sMod = '+' + (nFinalRoll - this._percentBase).toString();

        if (bAuto) {
            return  '<div class="_automatic">'+
                        game.i18n.localize("common.automatic")+
                    '</div>'+
                    ( (this._rollSuccess) ?
                        (this._rollCritSuccess) ?
                        '<div class="_successCrit">'+game.i18n.localize("common.rollCriticalSuccess")+'</div>' :
                        '<div class="_success">'+game.i18n.localize("common.success")+'</div>' 
                    :   (this._rollCritFailure) ?
                        '<div class="_failedCrit">'+game.i18n.localize("common.rollCriticalFailure")+'</div>' :
                        '<div class="_failed">'+game.i18n.localize("common.failed")+'</div>'
                    );
        }

        return  '<div class="_result">'+
                    ((this._noRoll) ?  '&nbsp;': this._roll.total)+
                '</div>'+
                '<div class="_resultOver">'+
                    ((this._noRoll) ?  
                        ((this._action.system.rolls.opposedRoll) ?
                            this._oppoRolls.actor.percent : '&nbsp;') : 
                        this._rollPercent.toString())+
                '</div>'+

                '<div class="_bonif '+this._rollLevel.class+'">'+
                    ((this._noRoll) ? '&nbsp;' :
                        '<span class="_bonifText">'+this._rollLevel.text+'</span>'+
                        ((this._rollBono !== '') ? this._rollBono+'%' : '+0') ) +
                '</div>'+

                ( ((sMod !== '') && (!this._noRoll)) ? 
                    '<div class="_percentMod">'+sMod+'%</div>'+
                    '<div class="_percentLit">'+game.i18n.localize("common.modif")+'</div>' :
                    '' ) +

                ( (this._noRoll) ? 
                    '<div class="_waitSuccess">&nbsp;</div>' :

                    ( (this._rollSuccess) ?
                        (this._rollCritSuccess) ?
                        '<div class="_successCrit">'+game.i18n.localize("common.rollCriticalSuccess")+'</div>' :
                        '<div class="_success">'+game.i18n.localize("common.success")+'</div>' 
                    :   (this._rollCritFailure) ?
                        '<div class="_failedCrit">'+game.i18n.localize("common.rollCriticalFailure")+'</div>' :
                        '<div class="_failed">'+game.i18n.localize("common.failed")+'</div>'
                    ) 
                );
    }

    /**
     * _getActionBox
     */
    _getActionBox() {

        if (!this._noAction) {

            return  '<div class="_actionTitle">' + 
                        ( (this._action.system.item.weapon.range) ? 
                            '<div>' + this._action.name + '</div>' +
                            '<div class="_targetDistance">' + 
                                this._getTargetRange() +  ' - ' +
                                this._getTargetDistance(false) + 
                            '</div>' :
                            this._action.name ) + 
                    '</div>'+            
                    '<div class="_actionImage">'+
                        '<a class="_showItem"'+
                            ' data-itemid="' + this._action.id + '"'+
                            ' data-actorid="' + this._actor.id + '">'+
                                '<img src="' + this._action.img + '"/>'+
                        '</a>'+
                    '</div>';          
        }
        if (this._useSpell) {
            
            return  '<div class="_actionTitle">' + 
                            this._spell.name + 
                    '</div>'+            
                    '<div class="_actionImage">'+
                        '<a class="_showItem"'+
                            ' data-itemid="' + this._spell.id + '"'+
                            ' data-actorid="' + this._actor.id + '">'+
                                '<img src="' + this._spell.img + '"/>'+
                        '</a>'+
                    '</div>';
        }
        return '<div class="_actionTitle"></div>'+
               '<div class="_actionImage"></div>';

    }

    /**
     * _getWeaponBox
     */
    _getWeaponBox(b2weapon) {
        b2weapon = (!b2weapon) ? false : b2weapon;

        if (this._isSkill)
        return '<div class="_messageWeapon">'+
                  ((this._action.system.type.movement) ?        
                    '<div class="_name">'+ game.i18n.localize("common.movement")+ '</div>' :
                    '<div class="_name">'+ game.i18n.localize("common.skillRoll")+ '</div>') + 
               '</div>';

        if (this._useSpell) {
            return '<div class="_messageWeapon">'+   
                        '<a class="_showItem" data-itemid="'+this._spell.id+'" data-actorid="'+this._actor.id+'">'+
                            '<div class="_name">'+this._spell.name+'</div>'+ 
                        '</a>'+  
                    '</div>';
        }

        let weapon = (!b2weapon) ? this._weapon : this._weapon2;
        return '<div class="_messageWeapon">'+
                    '<a class="_showItem" data-itemid="'+weapon.id+'" data-actorid="'+this._actor.id+'">'+
                        '<div class="_name">'+weapon.name +' ('+weapon.system.damage+')'+ '</div>'+ 
                    '</a>'+        
                '</div>';
    }

    /**
     * _getLinksBox
     */
    _getLinksBox() {
        if (this._targets.length === 0) return '';
        if (this._noAction) return '';
        if (!this._action.system.type.attack) return '';

        let sLink = '<a class="_showTargetLinks">'+
            '<i class="fa-solid fa-arrow-up-from-bracket" title="'+
                game.i18n.localize("info.showLinks")+'"></i>'+
        '</a>'+
        '<ul class="_targetLinks" style="display:none;">';

        sLink += this.getLinks();
        sLink +='</ul>';

        //return (mLinks.length > 0) ? sLink : '';
        return sLink;
    }

    /**
     * getLinks
     */
    getLinks() {

        let sLink = '';
        const firstStep = this._encounter.system.steps.filter(e => (!e.consumed))[0];

        let mLinks = [];
        this._targets.map(targetId => {
            const mSteps = this._encounter.system.steps.filter(e => 
                                                 ((e.actor === targetId) &&
                                                  (!e.consumed)) );
            mSteps.map(step => {
                const actor = (step.isToken) ?
                    game.scenes.active.tokens.get(step.tokenId).getActor() :
                    game.actors.get(step.actor);
                const action = actor.items.get(step.action);
                if (action.system.type.defense)
                    mLinks.push({
                        actor: actor,
                        action: action,
                        step: step,
                        active: ((firstStep.action === step.action) &&
                                 (firstStep.uniqeId === step.uniqeId))
                    });
            });
        });

        mLinks.map(link => {
            sLink += '<a class="_linkToAction" '+
                        'data-actorid="'+link.step.actor+'" '+
                        'data-tokenid="'+link.step.tokenId+'" >'+
                        '<li>'+
                            '<img class="_linkImg" src="'+link.actor.img+'" />'+
                            '<i class="fa-solid fa-arrow-right-from-bracket '+
                                ((link.active) ? '_active' : '_noActive' )+'">'+
                            '</i>'+
                            '<label class="_linkAction '+
                                ((link.active) ? '_active' : '_noActive' )+'">'+
                            link.action.name+'</label>'+
                        '</li>'+
                     '</a>';
        });
        return sLink;
    }

    /**
     * _getMessageOppoRolls
     */
    _getMessageOppoRolls() {

        if (this._noAction) return '';
        if (!this._action.system.rolls.opposedRoll) return '';
        if ((!this._action.system.rolls.replaceRoll) && (!this._rollSuccess)) return '';

        const enemy = this._getEnemy();

        const playerMe = 
            '<div class="_player _actor">'+
                '<div class="_title">'+
                    this._actor.name+
                '</div>'+
                '<div class="_roll">'+
                    '<a class="_rollOppo"'+
                                ' data-actorid="'+this._actor.id+'" '+
                                ' data-tokenid="'+this._actor.tokenId+'" '+
                                ' data-percent="'+this._oppoRolls.actor.percent+'">'+
                        '<img src="/systems/conventum/image/texture/dice.png">'+
                        '<div class="_name">'+this._oppoRolls.actor.percent+'</div>'+
                    '</a>'+ 
                '</div>'+                
            '</div>';

        const playerOppo = 
            '<div class="_player _enemy">'+
                '<div class="_title">'+
                    enemy.name+
                '</div>'+  
                '<div class="_roll">'+
                    '<a class="_rollOppo"'+
                                ' data-actorid="'+enemy.id+'" '+
                                ' data-tokenid="'+enemy.tokenId+'" '+
                                ' data-percent="'+this._oppoRolls.enemy.percent+'">'+
                        '<img src="/systems/conventum/image/texture/dice.png">'+
                        '<div class="_name">'+this._oppoRolls.enemy.percent+'</div>'+
                    '</a>'+                     
                '</div>'+                            
            '</div>';            

        return '<div class="_messageOppoRolls">'+
            playerMe +
            playerOppo +
        '</div>'+
        '<div class="_messageDamageOppoRolls">'+
        '</div>';
    }

    /**
     * _getMessageLinkToDamage
     * @param {*} b2weapon 
     */
    _getMessageLinkToDamage(b2weapon, bPostRoll) {
        b2weapon = (!b2weapon) ? false : b2weapon;
        bPostRoll = (!bPostRoll) ? false : bPostRoll;

        if ((!this._noAction) && 
            (this._action.system.rolls.opposedRoll) && 
            (!bPostRoll)) return '';

        let sTargets = '';
        this._targets.map(e => {
            if (e.id === undefined) {
                let actorTarget = game.actors.get(e);
                if (sTargets === '') sTargets = actorTarget.id;
                                else sTargets += '.'+actorTarget.id;                
            } else {
                if (sTargets === '') sTargets = e.id;
                                else sTargets += '.'+e.id;
            }
        });

        if ((this._damage === '') && (this._damage2 === '')
         || ((!this._rollSuccess) && (!bPostRoll))
         || ((!this._noAction) && (this._action.system.damage.noDamage)) )
            return '<div class="_messageDamage"></div>';

        return  '<div class="_messageDamage">'+
                    '<a class="_rollDamage" data-weaponid="'+
                                                ((b2weapon) ? 
                                                    this._weapon2.id : (this._weapon) ? this._weapon.id : '')+'" '+
                                        ' data-spellid="'+((this._spell)? this._spell.id : '')+'" '+
                                        ' data-actorid="'+this._actor.id+'" '+
                                        ' data-targets="'+sTargets+'" '+
                                        ' data-critsuccess="'+this._critSuccess+'" '+
                                        ' data-critfailure="'+this._critFailure+'" '+
                                        ' data-locationid="'+this._locationId+'" '+
                                        ' data-actionid="'+ ((this._action) ? this._action.id : '')+'" '+
                                        ' data-damage="'+((b2weapon) ? this._damage2 : this._damage)+'">'+
                    '<img src="/systems/conventum/image/texture/dice.png">'+
                    '<div class="_name">'+((b2weapon) ? this._damage2 : this._damage)+'</div>'+
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
          
          let target = null;
          target = this.acquireActor(targetId);

          if ((!this._noAction) && 
              (this._action.system.damage.target.mount)) {
            target = game.actors.get(target.system.equipment.mount);
          }
          sContent += '<li style="background-image: url('+"'"+target.img+"'"+')">'+
                          '<label class="_targetName">'+target.name+'</label>'+
                      '</li>';
        });
        return '<ul class="_messageTargets">'+sContent+'</ul>';      
    }

    /**
     * _updateOpposedMessage
     */    
    _updateOpposedMessage(bActor) {

        let message = game.messages.get(this._messageId);
        if (!message) {
            this.msgError("There is no message for this Id!");
            return;              
        } 

        const sLiteral = (bActor) ? '_actor' : '_enemy';

        let myRoll = {};
        let otRoll = {};
        if (bActor) {
            myRoll = this._oppoRolls.actor;
            otRoll = this._oppoRolls.enemy;
        } else {
            myRoll = this._oppoRolls.enemy;
            otRoll = this._oppoRolls.actor;
        }

        let sToFind = $(message.content).find('._messageOppoRolls ._player.'+sLiteral+' ._roll').html();
        const sToReplace = '<div class="_finalResult">'+
                                myRoll.result+' / '+myRoll.percent+
                           '</div>';
        let newContent = message.content.replace(sToFind, sToReplace);

        sToFind = sToFind.replace('.png">', '.png" />');
        sToFind = sToFind.replaceAll('=""', '');
        newContent = message.content.replace(sToFind, sToReplace);
        
        if (bActor) {
            newContent = newContent.replace(/\u00a0/, myRoll.result);
        }

        if ((myRoll.rolled) && (otRoll.rolled)) {
            
            if (this._oppoRolls.actor.win) {
                newContent = newContent.replace('"_player _actor"', '"_player _actor _green"');
                newContent = newContent.replace('"_player _enemy"', '"_player _enemy _red"');
            }
            else if (this._oppoRolls.enemy.win) {
                newContent = newContent.replace('"_player _actor"', '"_player _actor _red"');
                newContent = newContent.replace('"_player _enemy"', '"_player _enemy _green"');                
            }
            else {
                newContent = newContent.replace('"_player _actor"', '"_player _actor _red"');
                newContent = newContent.replace('"_player _enemy"', '"_player _enemy _red"');                  
            }

            //Damage
            if ((this._damage !== '') && (!this._action.system.damage.noDamage)) {
                let sDamage = this._getMessageLinkToDamage(false, true);

                // sToFind = $(newContent).find("._messageOppoRolls ._enemy ._roll").html();
                sToFind = $(newContent).find("._actionTitle").html();
                sToFind = sToFind.replace('.png">', '.png" />');
                sToFind = sToFind.replaceAll('=""', '');           
                const sEmpty = '<div class="_actionTitle"></div>';
                newContent = newContent.replace(sToFind, sEmpty);

                sToFind = $(newContent).find("._messageDamageOppoRolls").html();
                sToFind = sToFind.replace('.png">', '.png" />');
                sToFind = sToFind.replaceAll('=""', '');           
                sDamage = sDamage.replace('"_messageDamage"', '"_messageDamage _messageOppoDamage"');
                newContent = newContent.replace(sToFind, sDamage);
            }            
        }

        return newContent;
    }

    /**
     * _updateDamageMessage
     */
    async _updateDamageMessage() {

        let message = game.messages.get(this._messageId);
        if (!message) {
            this.msgError("There is no message for this Id!");
            return;              
        } 

        let content = message.content;
        let sToFind = $(content).find('._messageDamage ._shield').html();
        if (sToFind !== undefined) {
            sToFind = sToFind.replaceAll('.png">', '.png" />');
            sToFind = sToFind.replaceAll('=""', '');
            sToFind = sToFind.replaceAll('">', '" />');
            sToFind = '<div class="_shield">'+sToFind+'</div>';
            content = content.replace(sToFind, '');
        }

        sToFind = $(content).find('._rollDamage ._name').parent().parent().html();
        sToFind = sToFind.replaceAll('.png">', '.png" />');
        sToFind = sToFind.replaceAll('=""', '');

        const sToReplace = '<div class="_name _finalDamage">'+this._damagePoints.toString()+'</div>'+
                           '<div class="_damagePoints">'+game.i18n.localize("common.damagePoints")+'</div>';
        let newContent = content.replace(sToFind, sToReplace);
        newContent = newContent.replace(sToFind, sToReplace);

        let subContent = $(newContent);
        subContent.find('a._showTargetLinks').remove();
        subContent.find('ul._targetLinks').remove();
        newContent = '<div class="_chatBox" style="height:280px">'+
                        subContent.html()+
                     '</div>';        

        this._consolidate();
        await helperSocket.update(message, {content: newContent });

    }

    /**
     * _clearDamageMessage
     */
    async _clearDamageMessage() {

        let mActionMessages = Array.from(game.messages).filter(e => ((e.flags) && (e.flags.safeBox)));
        
        for (var i=0; i<this._targets.length; i++ ) {
            let sTarget = this._targets[i];

            let nMessage = mActionMessages.filter(e => 
                ( $(e.content).find('._messageFrame').data('actorid') === sTarget )); 
            let message = nMessage[nMessage.length - 1];      
            if (!message) {
                this.msgError("No message found!");
                return;              
            } 

            let newContent = undefined;
            let sToFind = $(message.content).find('._rollDamage ._name').parent().parent().html();
            if (sToFind !== undefined) {
                const sToReplace = '';
                newContent = message.content.replace(sToFind, sToReplace);                
                sToFind = sToFind.replace('.png">', '.png" />');
                sToFind = sToFind.replaceAll('=""', '');
                newContent = message.content.replace(sToFind, sToReplace);
            }

            if ((newContent) && (newContent !== undefined)) {
                let subContent = $(newContent);
                subContent.find('a._showTargetLinks').remove();
                subContent.find('ul._targetLinks').remove();
                newContent = '<div class="_chatBox" style="height:280px">'+
                                subContent.html()+
                            '</div>';              
            }

            this._consolidate();
            await helperSocket.update(message, {content: newContent });
        }

    }    

    /**
     * _applyTargetDamage
     */
    async _applyTargetDamage() {
        
        for (var i=0; i<this._targets.length; i++) {
            await this._applyDamage(this._targets[i]);
        }
    }

    /**
     * _applyDamage
     * @param {*} targetId 
     */
    async _applyDamage(targetId) {
        this._preparePacks();
       
        this._targetsDamage[targetId] = {
            target: null,
            location: null,
            armor: {
                name: game.i18n.localize("common.noArmor"),
                protection: 0,
                finalProtection: 0,
                endurance: 0,                
                finalEndurance: 0,
                armorDamage: 0,
                modProtection: '',
                modEndurance: ''
            },
            hitPoints: 0,
            finalDamagePoints: 0,
            finalHitDamage: 0,
            finalHitPoints: 0,
            concentration: 0,
            concentrationPenal: 0,
            finalConcentration: 0
        };
        let targetData = this._targetsDamage[targetId];

        //Modes
        this._modes = this._actor.system.modes;

        //Target
        targetData.target = await this._getDamageTarget(targetId);
        if (!targetData.target) return;       
        let target = targetData.target;     

        //Shields...
        let shield = null;
        let bToShield = ((this._action) && (this._action.system.damage.target.shield)); 
        if (bToShield) this._damageToShield = true;

            //From Modes
            this._actor.system.modes.map(sMode => {
                const mode = game.packs.get("conventum.modes").get(sMode);
                if (mode.system.config.location.shield) {
                    bToShield = true;      
                    this._damageToShield = true;         
                }
            });     

            if (this._damageToShield) {
                shield = aqCombat.getShield(target);
                if (!shield) {
                    this._damageToShield = false;
                    bToShield = false;
                }
            }

        //Location formula from Modes
        let damageFormula = '1d10';
        this._actor.system.modes.map(sMode => {
            const mode = game.packs.get("conventum.modes").get(sMode);
            if (mode.system.config.location.formula !== '') {
                damageFormula =  mode.system.config.location.formula;
            }
        });  

        //Location...
        targetData.location = await this._getDamageLocation(targetId, damageFormula);
        if (!targetData.location) return;
        let location = targetData.location;
        let modeLocation = aqActions.getModeLocation(target);
        if (modeLocation !== '') location = modeLocation;
        
        //No Damage...
        let noDamage = (this._noAction) ? false : (this._action.system.damage.noDamage);
        if ((noDamage) || (bToShield))
            this.msgHistory("common.noDamage", this._action.name);

        //Armor
        let armor = ((target.system.armor[location.id]) &&
                     (target.system.armor[location.id].itemID) )? target.system.armor[location.id] : null;
        if (!bToShield) {
            if (armor) {
                targetData.name = armor.name;
                targetData.armor.protection = armor.protection;
                targetData.armor.endurance = armor.resistance;
                targetData.armor.modProtection = this._getArmorModProtection(targetId);
                targetData.armor.modEndurance = this._getArmorModEndurance(targetId);
                this.msgHistory("common.armor", armor.name);
            } else
                this.msgHistory("common.noArmor", '');
        }

        //Calculating...
        let bShieldAbs = false;     //Shield absorbs damage...
        if ((this._action) && (this._action.system.damage.target.shield)) bShieldAbs = true;

        if ((this._shieldedTarget) && (shield)) {
            targetData.armor.finalProtection = eval(shield.system.protection + targetData.armor.protection + targetData.armor.modProtection);
            bShieldAbs = (shield.system.protection >= this._damagePoints);
        } else {
            targetData.armor.finalProtection = eval(targetData.armor.protection + targetData.armor.modProtection);        
        }

        if (targetData.armor.finalProtection >= this._damagePoints) 
            targetData.finalDamagePoints = 0;            
        else 
            targetData.finalDamagePoints = Math.round((this._damagePoints - targetData.armor.finalProtection))
        if (shield) {
            this.msgHistory("common.shieldProtection", shield.system.protection);         
        }
        if ((armor) && (!bShieldAbs)) {
            this.msgHistory("common.armorProtection", targetData.armor.protection);
            this.msgHistory("common.modProtection", targetData.armor.modProtection);
            this.msgHistory("common.finalProtection", targetData.armor.finalProtection);
        }
        
        this.msgHistory("common.finalDamage", targetData.finalDamagePoints);

        //Final Hit Damage
        if (!bToShield) {
            targetData.finalHitDamage = Math.round(targetData.finalDamagePoints *
                Number(targetData.location.system.modDamage)); 

            this.msgHistory("common.locationMod", targetData.location.system.modDamage);
            this.msgHistory("common.finalHitDamage", targetData.finalHitDamage);            
        }
            
        //Hiting...
        let characteristicsUpdate = {};
        if (!bToShield) {
            targetData.hitPoints = target.system.characteristics.secondary.hp.value;
            targetData.finalHitPoints = targetData.hitPoints - targetData.finalHitDamage;
                if (noDamage) targetData.finalHitPoints = targetData.hitPoints;
            characteristicsUpdate = { secondary: { hp: { value: targetData.finalHitPoints }}};

            this.msgHistory("common.hitPoints", targetData.hitPoints);
            this.msgHistory("common.finalHitPoints", targetData.finalHitPoints);
        }

        //Armor damage
        let armorDataUpdate = {};
        if ((armor) && (!noDamage) && (!bShieldAbs) && (!bToShield)) {
            targetData.armor.armorDamage = eval(targetData.endurance + targetData.armor.modEndurance);
            targetData.armor.finalEndurance = Number(targetData.armor.endurance) - targetData.armor.armorDamage;
                if (targetData.armor.finalEndurance < 0) targetData.armor.finalEndurance = 0;

            this.msgHistory("common.armorEnduranceLg", targetData.armor.endurance);
            this.msgHistory("common.modEndurance", targetData.armor.modEndurance);
            this.msgHistory("common.armorDamage", targetData.armor.armorDamage);
            this.msgHistory("common.finalEndurance", targetData.armor.finalEndurance);

            armorDataUpdate[location.id] = {value: targetData.armor.finalEndurance};

            //Updating armor...
            let armorItem = target.items.get(target.system.armor[location.id].itemID);
            await helperSocket.update(armorItem, {
                system: {
                    enduranceCurrent: targetData.armor.finalEndurance
                }
            });  
            
            //Destroying armor...
            if ( ((this._action) && (this._action.system.armor.breakArmor)) ||
                 (targetData.armor.finalEndurance == 0) ) {
                    helperSheetArmor.destroyArmor(target, armorItem.id);
                    this.msgHistory("common.brokeArmor", armor.name);
            }            
        }

        //Shield Damage
        if ((this._shieldedTarget) || (bToShield)) {
            let nShieldEndurance = Number(shield.system.endurance) - this._damagePoints;
            if (nShieldEndurance < 0) nShieldEndurance = 0;

            //Updating shield...
            await helperSocket.update(shield, {
                system: {
                    endurance: nShieldEndurance,
                    protection: (nShieldEndurance === 0) ? 0 : shield.system.protection
                }
            }); 
            this.msgHistory("common.shieldDamage", this._damagePoints);
            this.msgHistory("common.finalEndurance", nShieldEndurance);                        

            if (nShieldEndurance === 0)
                this.msgHistory("common.shieldBroken", shield.name);
        }                                


        //Concentration penalization
        let magicUpdate = {};
        if ((!noDamage) && (!bToShield)) {
            targetData.concentration = Number(target.system.magic.penal.concentration);
            targetData.concentrationPenal =  targetData.finalHitDamage*10;
            targetData.finalConcentration = targetData.concentration - targetData.finalHitDamage*10;
                if (targetData.finalConcentration < 0) targetData.finalConcentration = 0;

            this.msgHistory("common.concentration", targetData.concentration);
            this.msgHistory("common.penalConc", targetData.concentrationPenal);
            this.msgHistory("common.finalConcentration", targetData.finalConcentration);

            magicUpdate = { penal: { concentration: targetData.concentrationPenal }};
        }

        //Damage x Endurance
        let damageXendurance = false;
        if ((!this._noAction) && (this._action.system.damage.damageXendurance) && 
            (!bToShield) && (!this._noDamageXendurance)) {
            const stunMode = Array.from(await game.packs.get('conventum.modes'))
                                                        .filter(e => e.system.stun)[0];            
            characteristicsUpdate.secondary.hp.value = 
                                            target.system.characteristics.secondary.hp.value;

            if (targetData.finalHitDamage >= target.system.characteristics.primary.end.value) {
                damageXendurance = true;
            } else {
                helperActions.removeMode(target, stunMode);
            }
        }

        //Updating...
        if (!bToShield) {
            await helperSocket.update(target, {
                system: {
                    characteristics: characteristicsUpdate,
                    armor: armorDataUpdate,
                    magic: magicUpdate,
                    modes: this._modes
                }
            });
        }

        //Hit Message
        let message = await helperMessages.chatMessage(
            this._getDamageMessageContent(targetId), target, true);
        this._messageId = message.id;
        this._consolidate();
        await helperSocket.update(message, {flags: this});

        //Bubble...
        //this._hitBubble(target, targetData.finalHitDamage);

        //Sprite
        helperSprites.blood(targetData.finalHitDamage);

    }

    /**
     * _getMount
     * @param {*} actorId 
     */
    _getMount(actorId) {
        let actor = game.actors.get(actorId);
        if (actor.system.equipment.mount !== '') {
            return game.actors.get(actor.system.equipment.mount);
        } else {
            return null;
        }        
    }

    /**
     * _getMapLocations
     * @param {*} actorType 
     */
    async _getMapLocations(actorType) {
        const packLocations = await game.packs.get('conventum.locations');
        const mapLocations = await packLocations.getDocuments();
        return mapLocations.filter(e => (e.system.control.world === this._worldId) 
                                     && (e.system.actorType === actorType));
    }

    /**
     * _getDamageTarget
     * @param {*} targetId 
     */
    async _getDamageTarget(targetId) {

        let target = this.acquireActor(targetId);
        if (!target) {
            this.msgError("There is no actor for this Id!");
            return;                
        }

        //Mounted target...
        if ((this._action) && (this._action.system.damage.target.mount)) {
            target = this._getMount(targetId);
        }     

        return target;
    }

    /**
     * _getDamageLocation
     * @param {*} target 
     */
    async _getDamageLocation(targetId, damageFormula) {

        if ((!damageFormula) || (damageFormula === undefined) || (damageFormula === ''))
            damageFormula = '1D10';

        let target = this._targetsDamage[targetId].target;
        let bToShield = ((this._action) && (this._action.system.damage.target.shield));

        //Locations map
        const mapLocations = await this._getMapLocations(target.type);

        //Rolling Location...
        if ((this._locationId === '') || (!this._locationId)) {

            const sDice = damageFormula;
            let lRoll = new Roll(sDice, {});
            lRoll.evaluate({async: false});
            if ((game.dice3d) && (!bToShield))
                await game.dice3d.showForRoll(lRoll);

            this._targetsDamage[targetId].location =            
                                    mapLocations.find(e => (e.system.range.low <= lRoll.total) 
                                                        && (e.system.range.high >= lRoll.total)); 
            this._targetsDamage[targetId].locationId = this._targetsDamage[targetId].location.id;

            this.msgHistory("common.locationRoll", lRoll.total);  

        } else {
            this._targetsDamage[targetId].location = 
                                    mapLocations.find(e => e.id === this._locationId);
            this._targetsDamage[targetId].locationId = this._targetsDamage[targetId].location.id;
        }

        this.msgHistory("common.location", this._targetsDamage[targetId].location.name);
        return this._targetsDamage[targetId].location;
    }

    /**
     * _getArmorModProtection
     * @param {*} target 
     * @returns 
     */
    _getArmorModProtection(targetId) {

        let target = this._targetsDamage[targetId].target;

        let mod = '';
        let stackMod = '';
        let sAction = '';

        //By action...
        if (this._action) {

            mod = this.clearPenalty(this._action.system.armor.mod.protection);

            //Stacking and Targeting...
            const mSteps = aqActions.getCurrentEncounterSteps().filter(e => 
                ((e.actor !== target.id) && (e.consumed)) );
            for (const step of mSteps) {
                const actor = game.actors.get(step.actor);
                const action = actor.items.get(step.action);   
                if ((action.system.armor.mod.stack) && (action.id !== this._action.id)) {
                    stackMod = this.addPenalties(stackMod, action.system.armor.mod.protection);
                }  
                
                if ( (step.targets)
                  && (step.targets.find(e => e === actor.id))
                  && (this.clearPenalty(action.system.armor.mod.targetProtection) !== '+0') ) {
                    sAction = action.name;
                    mod = this.clearPenalty(action.system.armor.mod.targetProtection);
                }              
            }

            //No Protection!
            if (this._action.system.armor.noProtection) {
                this._targetsDamage[targetId].armor.modProtection = this.clearPenalty('');
                this._targetsDamage[targetId].armor.protection = 0;

                this.msgHistory("common.noProtection", sAction);              
            }

            if ((mod !== '') && (mod !== '+0')) {
                this.msgHistory("common.modProtection", sAction+' - '+mod);
            }
            if ((stackMod !== '') && (stackMod !== '+0')) {
                this.msgHistory("common.stack", sAction+' - '+stackMod);                
            }
        }

        //By Spell
        if (this._spell) {

            if (this._spell.system.damage.noArmor) {
                this._targetsDamage[targetId].armor.modProtection = this.clearPenalty('');
                this._targetsDamage[targetId].armor.protection = 0;

                this.msgHistory("common.noProtection", this._spell.name);               
            }            
        }

        return this.clearPenalty(mod);
    }

    /**
     * _getArmorModEndurance
     * @param {*} target 
     * @returns 
     */
    _getArmorModEndurance(targetId) {

        let target = this._targetsDamage[targetId].target;

        let mod = '';
        let stackMod = '';
        let sAction = '';

        //By action...
        if (this._action) {
            mod = this.clearPenalty(this._action.system.armor.mod.endurance);

            //Stacking...
            const mSteps = aqActions.getCurrentEncounterSteps().filter(e => 
                ((e.actor !== target.id) && (e.consumed)) );
            for (const step of mSteps) {
                const actor = game.actors.get(step.actor);
                const action = actor.items.get(step.action);   
                if ((action.system.armor.mod.stack) && (action.id !== this._action.id)) {
                    stackMod = this.addPenalties(stackMod, action.system.armor.mod.endurance);
                }  
                
                if ( (step.targets)
                  && (step.targets.find(e => e === actor.id))
                  && (this.clearPenalty(action.system.armor.mod.targetEndurance) !== '+0') ) {
                    sAction = action.name;
                    mod = this.clearPenalty(action.system.armor.mod.targetEndurance);
                }              
            }

            if ((mod !== '') && (mod !== '+0')) {
                this.msgHistory("common.modEndurance", sAction+' - '+mod);
            }
            if ((stackMod !== '') && (stackMod !== '+0')) {
                this.msgHistory("common.stack", sAction+' - '+stackMod);                
            }
        }

        return this.clearPenalty(mod);
    }    

    /**
     * _hitBubble
     * @param {*} target 
     * @param {*} sDamage 
     */
    _hitBubble(target, sDamage) {

        if (target.getActiveTokens()[0]) {
            let bubble = new ChatBubbles();
            bubble.broadcast(
                target.getActiveTokens()[0],
                '<div class="_damageBubble">'+sDamage.toString()+'</div>',
                {
                    defaultSelected: true,
                    selected: true
                }
            );
        }
    }

    /**
     * clearPenalty
     * @param {*} s 
     */
    clearPenalty(s) {
        if ((s === "NaN") || (s === NaN) || (s === undefined)) s = '+0';
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