
import { helperSheetArmor } from "./helperSheetArmor.js";
import { helperSheetMagic } from "./helperSheetMagic.js";

/**
 * Helpers for Human Sheet
 */
export class helperSheetHuman {

  /**
   * checkWorld
   * @param {*} checkWorld 
   */
  static async checkWorld(systemData) {

    //Actor without World... -> First World
    if (systemData.control.world === "") {
      const mWorlds = await game.packs.get("conventum.worlds").getDocuments();
      systemData.control.world = mWorlds[0].id;
    }
  }

  /**
   * getCusto
   * @param {*} systemData 
   */
  static async getCusto(systemData, backend) {
    
    const myCulture = backend.cultures.find(e => e.id === systemData.bio.culture),
          myKingdom = backend.kingdoms.find(e => e.id === systemData.bio.kingdom),
          mySociety = (myCulture) ? 
                      backend.societies.find(e => e.id === myCulture.system.backend.society) :
                      null;

    if (mySociety)
      systemData.control.frame = mySociety.system.backend.frame;
    
    return {
      crest: myKingdom ? myKingdom.img : '',
      frame: systemData.control.frame,
      body: (systemData.bio.female) ? 'bodyF.png' : 'bodyM.png',
    };
  }

  /**
   * checkSystemData
   * @param {*} systemData 
   */
  static async checkSystemData(actor, systemData, backend) {

    this._checkCharacteristics(systemData);
    this._calcCharacteristics(systemData);
    this._calcHPStatus(systemData);
    this._calcAPPStatus(systemData);
    this._calcWeight(systemData);
    this._calcHeight(systemData);
    this._checkBio(systemData, backend);
    this._checkWeaponsInHands(actor, systemData);
  }

  /**
   * criatures
   * @param {*} actor 
   * @param {*} systemData 
   * @param {*} backend 
   */
  static criatures(actor, systemData, backend) {
    systemData.control.criature = (actor.type !== 'human');
  }

  /**
   * checkMyItems
   * @param {*} actor 
   */
  static async checkMyItems(actor, systemData) {
    let mItems = actor.items;

    //Forbidden items...
    for (const s of CONFIG.ExtendConfig.noHumanItems) {
      const pack = await game.packs.get('conventum.'+s);
      if (!pack) continue;
      if (Array.from(pack).length < 1) continue;
      const sType = Array.from(pack)[0].type;
      for (const oItem of Array.from(mItems).filter(e => e.type === sType)) {
        //Deleting...
        oItem.delete();
      }
    }

    //Initial actions...
    if (actor.type === 'human') {
      const actionsPack = game.packs.get('conventum.actions');
      const mActorActions = Array.from(actor.items).filter(e => e.type === 'action');

      //Adding Action...
      let newActionItems = [];
      for (const oAction of Array.from(actionsPack)
                                .filter(e => e.system.type.initial)) {
          let thisAction = mActorActions.find(e => ( (e.name === oAction.name) ||
                                                     (e.system.control.mold === oAction.id) ))
          if (!thisAction) {
            newActionItems.push(oAction);
          }
      }
      if (newActionItems.length > 0) {      
          await Item.createDocuments(newActionItems, {parent: actor});
      }

      //Removing actions duplicated...
      let uniqueActionItemsUpd = mActorActions.reduce((duplex, current) => {
        if (!duplex.find((item) => item.name === current.name)) {
          duplex.push(current);
        }
        return duplex;
      }, []);   
      if (uniqueActionItemsUpd.length !== mActorActions.length) {
        let mDelete = [];
        for (let action of mActorActions) {
          if (!uniqueActionItemsUpd.find(e => e.id === action.id)) {
            mDelete.push(action.id);
          }
        }
        if (mDelete.length > 0)
          await Item.deleteDocuments(mDelete, {parent: actor});
          actor.sheet.render(true);
      }

    }
  }

  /**
   * itemsInUse
   * @param {*} actor 
   * @param {*} systemData 
   */
  static async itemsInUse(actor, systemData) {
    
    //Armor...
    let mArmor = actor.items.filter(e => e.type === 'armor');
    for (let item of mArmor) {
      let inUse = false;
      for (const s in systemData.armor) {
        if (systemData.armor[s].itemID === item.id) inUse = true;
      }
      await item.update({system: {inUse: inUse}});
    }

    //Weapons...
    let mWeapons = actor.items.filter(e => e.type === 'weapon');
    for (let item of mWeapons) {

      const bInLeftHand = (item.system.inHands.inLeftHand === 'true') ? true : 
                          (item.system.inHands.inLeftHand === 'false') ? false : 
                          (!item.system.inHands.inLeftHand) ? false : 
                            item.system.inHands.inLeftHand;
      const bInRightHand = (item.system.inHands.inRightHand === 'true') ? true : 
                          (item.system.inHands.inRightHand === 'false') ? false : 
                          (!item.system.inHands.inRightHand) ? false : 
                            item.system.inHands.inRightHand;                            
      const bInBothHands = (item.system.inHands.inBothHands === 'true') ? true : 
                          (item.system.inHands.inBothHands === 'false') ? false : 
                          (!item.system.inHands.inBothHands) ? false : 
                            item.system.inHands.inBothHands;
      const inUse = (bInLeftHand || bInRightHand || bInBothHands);

      await item.update({system: {
                          inUse: inUse,
                          inHands: {
                            inLeftHand: bInLeftHand,
                            inRightHand: bInRightHand,
                            inBothHands: bInBothHands
                          }
                        }});
    }    

  }

  /**
   * getSkills
   * @param {*} context 
   */
  static getSkills(actor, context) {

    context.backend.skills.forEach( skill => {
      if (!context.systemData.skills[skill.id]) {
        context.systemData.skills[skill.id] = {
          value: 0,
          penal: 0,
          initial: 0,
          acquired: false
        };
      }
      let actorSkill = context.systemData.skills[skill.id];

      actorSkill.initial = 
          context.systemData.characteristics.primary[skill.system.characteristic.primary].value;
      if (actorSkill.value < actorSkill.initial) actorSkill.value = actorSkill.initial;
      actorSkill.penal = helperSheetArmor.calcPenalByArmor(actor, skill);

      //add Penalizations by Traits...
      const mTraits = actor.items.filter(e => ( (e.type === 'trait')  
                                             && (e.system.control.world === actor.system.control.world)
                                             && (e.system.mod.skill.apply) 
                                             && (e.system.mod.skill.id === skill.id)));
      mTraits.map(e => {
        actorSkill.penal = eval( (Number(actorSkill.penal).toString()
                                    + helperSheetMagic.penalValue(e.system.mod.skill.bono)).toString());
        actorSkill.penal = helperSheetMagic.penalValue(actorSkill.penal);
      });

    });

    //Acquiring Skills...
    for (const oItem of Array.from(actor.items).filter(e => e.type === 'skill')) {
        if (oItem.system.control.mold !== '') {
          context.systemData.skills[oItem.system.control.mold].acquired = true;
          let path = {system: {skills: {}}};
          path.system.skills[oItem.system.control.mold] = {acquired: true};
          actor.update(path);
        }
    }
  }

  /**
   * getModes
   * @param {*} actor 
   * @param {*} context 
   */
  static async getModes(actor, context) {
    const sWorld = actor.system.control.world;
    const oWorld = await game.packs.get('conventum.worlds').get(sWorld);

    //Synchr DB...
    await game.packs.get("conventum.modes").getDocuments();

    const mModes = Array.from(await game.packs.get('conventum.modes'))
                                .filter(e => e.system.control.world === sWorld);
    return mModes;
  }

/** ***********************************************************************************************
  SYSTEM CUSTOMIZATION...
*********************************************************************************************** */ 

  /**
   * _checkCharacteristics
   * @param {*} systemData 
   */
  static _checkCharacteristics(systemData) {
    
    //Primary Characteristics...
    ["primary", "secondary"].forEach(sGroup => {
      for (const s in systemData.characteristics[sGroup]) {

        let _root = systemData.characteristics[sGroup][s];
        _root.value =  Number(_root.value);   //Numeric values...

        //Hit Points exception
        if (s === 'hp') {
          _root.initial = (systemData.control.initial) ? _root.value : _root.initial;
          if ( _root.value > _root.initial ) _root.value = _root.initial;
          continue;
        } else {
          if ( _root.value < _root.min ) _root.value = _root.min;
          if ( _root.value > _root.max ) _root.value = _root.max;
        }    

        //Initial && temporal values...
        _root.temp = _root.value.value;  
        _root.initial = (systemData.control.initial) ? _root.value : _root.initial;
        _root.class = (_root.initial != _root.temp) ? "_temporal" : "";
      }
    });

  }

  /**
   * _calcCharacteristics
   * @param {*} systemData 
   */
  static _calcCharacteristics(systemData) {

    let _root = systemData.characteristics;
   
    //Luck
    if (systemData.control.initial) {
      _root.secondary.luck.initial = _root.primary.per.value +
                                     _root.primary.com.value +
                                     _root.primary.cul.value;
      _root.secondary.luck.value = _root.secondary.luck.initial;
    }

    //Temperance
    if (systemData.control.initial) {
      _root.secondary.temp.initial = 50;
      _root.secondary.temp.value = 50;
    }

    //Hit Points
    if (systemData.control.initial) {
      _root.secondary.hp.value = _root.primary.end.value;
      _root.secondary.hp.initial = _root.primary.end.value;
      _root.secondary.hp.max = _root.primary.end.initial;
    }

    //Rationality & Irrationality
    _root.secondary.rr.last = Number(_root.secondary.rr.last);
    _root.secondary.irr.last = Number(_root.secondary.irr.last);
    if ( _root.secondary.irr.value != _root.secondary.irr.last )
             _root.secondary.rr.value = 100 - _root.secondary.irr.value;
        else _root.secondary.irr.value = 100 - _root.secondary.rr.value;

    _root.secondary.rr.last = _root.secondary.rr.value;
    _root.secondary.irr.last = _root.secondary.irr.value;
    
    //Faith && Concentration points
    _root.secondary.fp.value = Math.round(_root.secondary.rr.value * 0.20);
    _root.secondary.cp.value = Math.round(_root.secondary.irr.value * 0.20);
    if (systemData.control.initial) {
      _root.secondary.fp.initial = _root.secondary.fp.value;
      _root.secondary.cp.initial = _root.secondary.cp.value;
    }
    if (_root.secondary.cp.current > _root.secondary.cp.value)
        _root.secondary.cp.current = _root.secondary.cp.value;
    if (_root.secondary.fp.current > _root.secondary.fp.value)
        _root.secondary.fp.current = _root.secondary.fp.value;

    //Appearance
    if (systemData.control.initial) {
      _root.primary.app.initial = (systemData.bio.female) ? 17 : 15;
      _root.primary.app.value = (systemData.bio.female) ? 17 : 15;
    }

  }

  /**
   * _calcHPStatus
   * @param {*} systemData 
   */
  static _calcHPStatus(systemData) {

        //--- Health Status ---
        const nValue = systemData.characteristics.secondary.hp.value,
              nInitial = systemData.characteristics.secondary.hp.initial;
        let status = systemData.status.life;
        
        status.healthy = (nValue >= Math.round(nInitial * 0.5));
        status.injured = ( (nValue < Math.round(nInitial * 0.5))
                        && (nValue >= Math.round(nInitial * 0.25)) );
        status.wounded = ( (nValue < Math.round(nInitial * 0.25))
                        && (nValue > 0) );
        status.unconscious = ( (nValue <= 0)
                            && (nValue > (-1) * nInitial) );
        status.dead = ( nValue <= (-1) * nInitial );  
  }

  /**
   * _calcAPPStatus
   * @param {*} systemData 
   */
  static _calcAPPStatus(systemData) {

    const nValue = systemData.characteristics.primary.app.value;
    let nStatus = 'app4';
    
    if  (nValue <= 5) nStatus = 'app1';
    if ((nValue > 5) && (nValue <= 8)) nStatus = 'app2';
    if ((nValue > 8) && (nValue <= 11)) nStatus = 'app3';
    if ((nValue > 11) && (nValue <= 17)) nStatus = 'app4';
    if ((nValue > 18) && (nValue <= 20)) nStatus = 'app5';
    if ((nValue > 20) && (nValue <= 23)) nStatus = 'app6';
    if  (nValue > 23) nStatus = 'app7';

    systemData.status.appearance = game.i18n.localize('status.'+nStatus);
  }

  /**
   * _calcHeight
   * @param {*} systemData 
   */
  static _calcHeight(systemData) {

    const nValue = Math.round( (systemData.characteristics.primary.str.value +
                                systemData.characteristics.primary.end.value) /2);
    const sUnit = game.i18n.localize('config.unitHeight');
    let sValue = systemData.bio.height;
    
    if  (nValue <= 5) sValue = '1,52 '+sUnit;
    if  (nValue >= 6) sValue = '1,54 '+sUnit;
    if  (nValue >= 7) sValue = '1,57 '+sUnit;
    if  (nValue >= 8) sValue = '1,59 '+sUnit;
    if  (nValue >= 9) sValue = '1,62 '+sUnit;
    if  (nValue >= 10) sValue = '1,64 '+sUnit;
    if  (nValue >= 11) sValue = '1,67 '+sUnit;
    if  (nValue >= 12) sValue = '1,69 '+sUnit;
    if  (nValue >= 13) sValue = '1,72 '+sUnit;
    if  (nValue >= 14) sValue = '1,74 '+sUnit;
    if  (nValue >= 15) sValue = '1,77 '+sUnit;
    if  (nValue >= 16) sValue = '1,79 '+sUnit;

    systemData.bio.height = sValue;
  }

  /**
   * _calcWeight
   * @param {*} systemData 
   */
  static _calcWeight(systemData) {

    const nValue = Math.round( (systemData.characteristics.primary.str.value +
                                systemData.characteristics.primary.end.value) /2);
    const sUnit = game.i18n.localize('config.unitWeight');
    let sValue = systemData.bio.weight;
    
    if  (nValue <= 5) sValue = '106 '+sUnit;
    if  (nValue >= 6) sValue = '110 '+sUnit;
    if  (nValue >= 7) sValue = '118 '+sUnit;
    if  (nValue >= 8) sValue = '120 '+sUnit;
    if  (nValue >= 9) sValue = '122 '+sUnit;
    if  (nValue >= 10) sValue = '125 '+sUnit;
    if  (nValue >= 11) sValue = '128 '+sUnit;
    if  (nValue >= 12) sValue = '132 '+sUnit;
    if  (nValue >= 13) sValue = '134 '+sUnit;
    if  (nValue >= 14) sValue = '140 '+sUnit;
    if  (nValue >= 15) sValue = '146 '+sUnit;
    if  (nValue >= 16) sValue = '150 '+sUnit;

    systemData.bio.weight = sValue;
  }

  /**
   * _checkBio
   * @param {*} systemData
   * @param {*} backend
   */  
  static _checkBio(systemData, backend) {
    //...
  }

  /**
   * _checkWeaponsInHands
   * @param {*} systemData 
   */
  static _checkWeaponsInHands(actor, systemData) {

    let mWeapons = Array.from(actor.items).filter(e => e.type === 'weapon');

  }

  /**
   * calcInitiative
   * @param {*} actor 
   * @returns 
   */
  static calcInitiative(actor) {

    const actionItem = (actor.system.action.lastAction) ?
                          actor.items.get(actor.system.action.lastAction) : 
                          null;

    const subItem = (actor.system.action.subItem) ? 
                        actor.items.get(actor.system.action.subItem) : 
                        null;
        
    const nBase = Number(actor.system.characteristics.primary.agi.value);
    let sModificator = '';

    
      //Wearing weapons
      const mWeapons = actor.items.filter(e => (
             (e.type === 'weapon') && 
            ((e.system.inHands.inLeftHand) || 
             (e.system.inHands.inRightHand) || 
             (e.system.inHands.inBothHands)) ));      
      mWeapons.map(weaponItem => {
        if (weaponItem.system.requeriment.primary.apply) {

          //Minimum Force weapon
          if (actor.system.characteristics.primary[
                weaponItem.system.requeriment.primary.characteristic].value 
              < weaponItem.system.requeriment.primary.minValue) {

            const nMinVal = 
              weaponItem.system.requeriment.primary.minValue - 
                actor.system.characteristics.primary[
                  weaponItem.system.requeriment.primary.characteristic].value;

            sModificator += ' -'+nMinVal.toString();
          }
        }

        //Penalty-Bonification
        if (weaponItem.system.penalty.initiative !== '') {
          sModificator += helperSheetMagic.penalValue(weaponItem.system.penalty.initiative);
        }
      });
 

    const nInitiative = eval(nBase.toString() + sModificator);
                    
    if (actor.permission > 0) {
        actor.update({
            system: { initiative: {
                    value: nInitiative } }
        });
    }
    return {
        base: nBase.toString(),
        mod: sModificator,
        initiative: nInitiative.toString()
    };
}      

}