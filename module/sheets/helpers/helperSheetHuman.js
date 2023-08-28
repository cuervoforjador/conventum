
import { helperSheetArmor } from "./helperSheetArmor.js";
import { helperSheetMagic } from "./helperSheetMagic.js";
import { helperActions } from "./helperActions.js";
import { helperSheetCombat } from "./helperSheetCombat.js";
import { mainBackend } from "../backend/mainBackend.js";

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

    this._checkCharacteristics(actor, systemData);
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
          acquired: false,
          experienced: false,
          profPrimary: false,
          profSecondary: false
        };
      }
      let actorSkill = context.systemData.skills[skill.id];

      //Penalizations...
      
      //by armor...
      actorSkill.penal = helperSheetArmor.calcPenalByArmor(actor, skill);

      //by Traits...
      const mTraits = actor.items.filter(e => ( (e.type === 'trait')  
                                             && (e.system.control.world === actor.system.control.world)
                                             && (e.system.mod.skill.apply) 
                                             && (e.system.mod.skill.id === skill.id)));
      mTraits.map(e => {
        actorSkill.penal = eval( (Number(actorSkill.penal).toString()
                                    + helperSheetMagic.penalValue(e.system.mod.skill.bono)).toString());
        actorSkill.penal = helperSheetMagic.penalValue(actorSkill.penal);
      });

      //Values
      if (!actor.system.control.criature) {
        actorSkill.initial = 
            context.systemData.characteristics.primary[skill.system.characteristic.primary].value + 
            Number(context.systemData.characteristics.primary[skill.system.characteristic.primary].penal);

        if (!actorSkill.acquired) actorSkill.value = actorSkill.initial;
      }

    });

    //Acquiring Skills...
    for (const oItem of Array.from(actor.items).filter(e => e.type === 'skill')) {
        if ((oItem.system.control.mold !== '') &&
            (context.systemData.skills[oItem.system.control.mold])) {
              
          context.systemData.skills[oItem.system.control.mold].acquired = true;
          let path = {system: {skills: {}}};
          path.system.skills[oItem.system.control.mold] = {acquired: true};
          actor.update(path);
        }
    }
  }

  /**
     * getLanguages
     * @param {*} context 
     */
  static async getLanguages(actor, context) {

    await game.packs.get('conventum.cultures').getDocuments();
    const myCulture = game.packs.get('conventum.cultures').get(context.systemData.bio.culture);

    context.backend.languages.forEach( lang => {
      if (!context.systemData.languages[lang.id]) {
        context.systemData.languages[lang.id] = {
          value: 0,
          penal: 0,
          initial: 0,
          acquired: false
        };
      }

      let actorSkill = context.systemData.languages[lang.id];
      actorSkill.initial = 0;
      let expr = myCulture.system.backend.languages[lang.id].toUpperCase();
      
      for (const s in context.systemData.characteristics.primary) {
        expr = expr.replace(s.toUpperCase(), 
                context.systemData.characteristics.primary[s].value);
        expr = expr.replace('X', '*');
      }
      if (expr === '') expr = '0';
      actorSkill.initial = Number(eval(expr));

      if (context.systemData.control.initial) 
        actorSkill.value = actorSkill.initial;

    });
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

  /**
   * getHandPenal
   * @param {*} actor 
   * @param {*} weapon 
   * @returns 
   */
  static getHandPenal(actor, weapon) {

    if ( ((actor.system.status.rightHanded) &&
          (weapon.system.inHands.inLeftHand)) || 
         ((!actor.system.status.rightHanded) &&
          (weapon.system.inHands.inRightHand)) ) return '-25'
                                            else return '-0';

  }

  /**
   * askForWizard
   * @param {*} actor 
   * @param {*} systemData 
   */
  static async askForWizard(actor, systemData) {
    if ( (systemData.control.initial)
      && (!systemData.control.askedForWizard)
      && (!systemData.control.wizard) ) {

        let dialog = new Dialog({
          title: game.i18n.localize("common.wizard"),
          content: game.i18n.localize("info.askForWizard"),
          buttons: {
            "yes": {
              label: game.i18n.localize("common.yes"),
              callback: async () => {
                systemData.control.wizard = true;
                systemData.control.askedForWizard = true;
                await actor.update({system: {control: {
                                          wizard: true,
                                          askedForWizard: true
                                      }}});
              }              
            },
            "no": {
              label: game.i18n.localize("common.no"),
              callback: async () => {
                systemData.control.wizard = false;
                systemData.control.askedForWizard = true;
                await actor.update({system: {control: {
                    wizard: false,
                    askedForWizard: true
                }}});                
              }              
            }
          },
          world: systemData.control.world });
        dialog.options.classes.push('_wizardQuestion');
        dialog.render(true);
        await actor.update({system: {control: {
          askedForWizard: true
        }}});          
    }
  }

  /**
   * wz_UpdateWorld
   * @param {*} actor 
   * @param {*} world 
   */
  static async wz_UpdateWorld(actor, world) {
    await actor.update({ system: {
                            control: {world: world},
                            wizard: {
                              "01": false,
                              "02": true
                            }
                          }});
  }  

  /**
   * wz_Dices
   * @param {*} actor 
   * @param {*} sField 
   * @param {*} sPack
   */
  static async wz_Dices(actor, sField, sPack) {
    const backend = await mainBackend.getBackendForActor(actor, actor.system);
    let sFormula = '1d100';

    let mDocuments = null;
    if (sField === 'world')
        mDocuments = (await (game.packs.get('conventum.'+sPack)).getDocuments()).filter(e => 
                                                                    e.system.control.world === actor.system.control.world);
    else
        mDocuments = backend[sPack];

    if (sField === 'kingdom') {
      sFormula = '1d10';
    }
    if (sField === 'culture') {
      sFormula = '1d10';
    }   
    if (sField === 'stratum') {
      sFormula = '1d10';
    }
    if (sField === 'status') {
      sFormula = '1d10';
    }

    //Rolling...
    let roll = new Roll(sFormula, {});
    roll.evaluate({async: false});
    if (game.dice3d) {
        await game.dice3d.showForRoll(roll, game.user, true);
    }    
    const result = Number(roll.result);

    let item = mDocuments.find(e => 
                  ((e.system.range.low <= result) &&
                   (e.system.range.high >= result)) );
    
    await actor.update(this._wz_dataUpdate(sField, item));

    let dialog = new Dialog({
      title: game.i18n.localize("common.wizard"),
      content: '<div class="_content">'+
                  '<img src="'+item.img+'" />'+
                  '<h1>'+item.name+'</h1>'+
                  '<desc>'+item.system.description+'</desc>'+
               '</div>',
      buttons: {},
      world: actor.system.control.world });
    dialog.options.classes.push('_wizardDialog _wizardResult');
    dialog.options.width = 300;
    dialog.options.height = 380;    
    dialog.render(true);

  }

  /**
   * _wz_dataUpdate
   * @param {*} sField
   * @param {*} item 
   */
  static _wz_dataUpdate(sField, item) {

    if (sField === 'kingdom') {
      return {system: {
              bio: { kingdom: item.id },
              wizard: {
                "02": false,
                "03": true
              }              
             }};
    }
    if (sField === 'culture') {
      return {system: {
              bio: { culture: item.id },
              wizard: {
                "03": false,
                "04": true
              }              
             }};
    }
    if (sField === 'stratum') {
      return {system: {
              bio: { stratum: item.id },
              wizard: {
                "04": false,
                "05": true
              }              
             }};
    }    
    if (sField === 'position') {
      return {system: {
              bio: { position: item.id },
              wizard: {
                "05": false,
                "06": true
              }              
             }};
    }    

  }

  /**
   * addProfession
   * @param {*} item 
   * @param {*} sNewId 
   */
  static async addProfession(item, sId) {
    const actor = item.parent;

    //Only initialized actors...
    if (!item.parent.system.control.initial) {
      ui.notifications.warn(game.i18n.localize('info.profActorNoInitial'));
      await item.delete();
      return;
    }

    //Last Profession...
    let mProfessions = Array.from(item.parent.items).filter(e => e.type === 'profession');
    for (var i=0; i < (mProfessions.length - 1); i++) {
      mProfessions[i].delete();
    }

    //Requeriments

      //Kingdom
      if  ( !( (item.system.requirement.kingdoms[actor.system.bio.kingdom]) &&
               (item.system.requirement.kingdoms[actor.system.bio.kingdom].apply) )) {
        ui.notifications.warn(game.i18n.localize('info.profNoKingdom'));
        await item.delete();
        return;
      }

      //Society
      const culture = await (game.packs.get("conventum.cultures")).getDocument(actor.system.bio.culture);
      actor.system.bio.society = culture.system.backend.society;
      if  ( !( (item.system.requirement.societies[actor.system.bio.society]) &&
               (item.system.requirement.societies[actor.system.bio.society].apply) )) {
        ui.notifications.warn(game.i18n.localize('info.profNoSociety'));
        await item.delete();
        return;
      }

      //Culture
      if  ( !( (item.system.requirement.cultures[actor.system.bio.culture]) &&
               (item.system.requirement.cultures[actor.system.bio.culture].apply) )) {
        ui.notifications.warn(game.i18n.localize('info.profNoCulture'));
        await item.delete();
        return;
      }      
    
      //Stratum
      const stratum = await game.packs.get("conventum.stratums").getDocument(actor.system.bio.stratum);
      if  ( !( (item.system.requirement.stratums[actor.system.bio.stratum]) &&
               (item.system.requirement.stratums[actor.system.bio.stratum].apply) )) {
        ui.notifications.warn(game.i18n.localize('info.profNoStratum'));
        await item.delete();
        return;
      }      
    
      //Status
      const status = await game.packs.get("conventum.status").getDocument(actor.system.bio.status);
      const mStatus = (await game.packs.get("conventum.status").getDocuments()).
                                              filter(e => e.system.backend.stratum === stratum.id);
      if (!mStatus.find(e => e._id === actor.system.bio.status)) {
        actor.system.bio.status = mStatus[0]._id;
      }

      if  ( !( (item.system.requirement.status[actor.system.bio.status]) &&
               (item.system.requirement.status[actor.system.bio.status].apply) )) {
        ui.notifications.warn(game.i18n.localize('info.profNoStatus'));
        await item.delete();
        return;
      }      
    
      //Primary characteristics...
      for (let s in item.system.requirement.primary) {
        if ((s != '') && (item.system.requirement.primary[s].apply)) {
          if ( Number(item.parent.system.characteristics.primary[s].value) <
                 Number(item.system.requirement.primary[s].mod) ) {
            
            ui.notifications.warn(game.i18n.localize('info.profNoChar'));
            await item.delete();
            return;
          }
        }
      }

      //Secondary characteristics...
      for (let s in item.system.requirement.secondary) {
        if ((s != '') && (item.system.requirement.secondary[s].apply)) {
          if ( Number(item.parent.system.characteristics.secondary[s].value) <
                 Number(item.system.requirement.secondary[s].mod) ) {
            
            ui.notifications.warn(game.i18n.localize('info.profNoChar'));
            await item.delete();
            return;
          }
        }
      }      

    //Reset skills...
    let data = {};
    for (let s in actor.system.skills) {
      if ((actor.system.skills[s])
       && (actor.system.skills[s] !== undefined)) {
        data[s] = {};
        data[s].value = 0;
        data[s].acquired = false;
        data[s].experienced = false;
        data[s].profPrimary = false;
        data[s].profSecondary = false;
      }
    }

    //Adding skills...
    const mSkills = await (game.packs.get("conventum.skills")).getDocuments();

    for (let s in item.system.skills.primary) {
      let value = 0;
      if ((item.system.skills.primary[s].apply) 
        && (actor.system.skills[s])
        && (actor.system.skills[s] !== undefined)) {

        const skill = mSkills.find(e => e._id === s);
        const charBase = skill.system.characteristic.primary;
        const nValue = Number(actor.system.characteristics.primary[charBase].value) *
                         Number(item.system.skills.primary[s].mod);

        data[s].value = nValue;
        data[s].acquired = true;
        data[s].profPrimary = true;
      }
    }
    for (let s in item.system.skills.secondary) {
      let value = 0;
      if ((item.system.skills.secondary[s].apply) 
        && (actor.system.skills[s])
        && (actor.system.skills[s] !== undefined)) {

        const skill = mSkills.find(e => e._id === s);
        const charBase = skill.system.characteristic.primary;
        const nValue = Number(actor.system.characteristics.primary[charBase].value) *
                         Number(item.system.skills.secondary[s].mod);
        
        data[s].value = nValue;
        data[s].acquired = true;
        data[s].profSecondary = true;
      }
    }

    await actor.update({
            system: { skills: data }});

  }
    

/** ***********************************************************************************************
  SYSTEM CUSTOMIZATION...
*********************************************************************************************** */ 

  /**
   * _checkCharacteristics
   * @param {*} systemData 
   */
  static _checkCharacteristics(actor, systemData) {
    
    if (systemData.control.criature) return;

    //Primary Characteristics...
    ["primary", "secondary"].forEach(sGroup => {
      for (const s in systemData.characteristics[sGroup]) {

        let _root = systemData.characteristics[sGroup][s];
        _root.value =  Number(_root.value);   //Numeric values...

        //Hit Points exception
        if (s === 'hp') {
          _root.initial = (systemData.control.initial) ? _root.value : _root.initial;
          if (!systemData.control.initial) {
             if (_root.value > _root.initial) _root.max = _root.value;
                                         else _root.max = _root.initial;
          } else {
             if ( _root.value > _root.initial ) _root.value = _root.initial;
          }
          continue;
        } else {
          if (( _root.value < _root.min ) && (systemData.control.initial)) 
            _root.value = _root.min;
          if (( _root.value > _root.max ) && (systemData.control.initial)) 
            _root.value = _root.max;
        }    

        //Initial && temporal values...
        _root.temp = _root.value.value;  
        _root.initial = (systemData.control.initial) ? _root.value : _root.initial;
        _root.class = (_root.initial != _root.temp) ? "_temporal" : "";

        //Penalizations...
        const mTraits = actor.items.filter(e => ( (e.type === 'trait')  
                                               && (e.system.control.world === actor.system.control.world)
                                               && (e.system.mod.characteristic.apply) 
                                               && (e.system.mod.characteristic.id === s)));        
        mTraits.map(e => {
          _root.penal = '+0';
          _root.penal = eval( Number(_root.penal).toString() +
                              helperSheetMagic.penalValue(e.system.mod.characteristic.bono)).toString();
          _root.penal = helperSheetMagic.penalValue(_root.penal);
        });

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
    } else {
      _root.secondary.hp.max = _root.primary.end.value;
      _root.secondary.hp.initial = _root.primary.end.value;
    }

    //Rationality & Irrationality
    _root.secondary.rr.last = Number(_root.secondary.rr.last);
    _root.secondary.irr.last = Number(_root.secondary.irr.last);
    if (!systemData.control.criature) {
      if ( _root.secondary.irr.value != _root.secondary.irr.last )
              _root.secondary.rr.value = 100 - _root.secondary.irr.value;
          else _root.secondary.irr.value = 100 - _root.secondary.rr.value;

      _root.secondary.rr.last = _root.secondary.rr.value;
      _root.secondary.irr.last = _root.secondary.irr.value;
    }

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
    //if (systemData.control.initial) {
    //  _root.primary.app.initial = (systemData.bio.female) ? 17 : 15;
    //  _root.primary.app.value = (systemData.bio.female) ? 17 : 15;
    //}

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
  static async _checkBio(systemData, backend) {
    //...

    //const status = await game.packs.get("conventum.status").getDocument(systemData.bio.status);

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

        //Actions
        let myActiveCombat = helperSheetCombat.myActiveCombat(actor);
        if ((myActiveCombat) && (myActiveCombat.encounter.system.steps.length > 0)) {
           let mStillActiveActions = myActiveCombat.encounter.system.steps.filter(e => ((!e.consumed) && (e.actor === actor.id)));
           mStillActiveActions.map(e => {
             const action = actor.items.get(e.action);
             if (action.system.steps.initiative !== '+0')
              sModificator += ' ' + action.system.steps.initiative;
           });
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
  
  /**
   * calcDamageMod
   * @param {*} actor 
   * @param {*} weapon 
   * @param {*} history 
   * @returns 
   */
  static calcDamageMod(actor, weapon, action) {
      
      if (!history) history = [];
      let sDamageMod = '-2D6';

      let nCharValue = 0;
      if (weapon.system.characteristics === '') return '';
      
      nCharValue = (!weapon.system.type.range) ?
                      actor.system.characteristics.primary[weapon.system.characteristics].value :
                      actor.system.characteristics.primary['str'].value;

      if ((action) && (action.system.damage.mod.modDamage1))  nCharValue += 5;
      if ((action) && (action.system.damage.mod.modDamage2))  nCharValue += 10;

      if (nCharValue >= 1) sDamageMod = '-1D6';
      if (nCharValue >= 5) sDamageMod = '-1D4';
      if (nCharValue >= 10) sDamageMod = '';
      if (nCharValue >= 15) sDamageMod = '+1D4';
      if (nCharValue >= 20) sDamageMod = '+1D6';
      if (nCharValue >= 25) sDamageMod = '+2D6';
      if (nCharValue >= 30) sDamageMod = '+3D6';
      if (nCharValue >= 35) sDamageMod = '+4D6';
      if (nCharValue >= 40) sDamageMod = '+5D6';
      if (nCharValue >= 45) sDamageMod = '+6D6';

      return sDamageMod;
  }

  /**
   * calcDamageMod
   * @param {*} actor 
   * @param {*} weapon 
   * @param {*} history 
   * @returns 
   */
  static calcDamageForceMod(actor, weapon, history) {

    let sDamageForceMod = "";
    if (weapon.system.requeriment.primary.apply) {
      history.push(game.i18n.localize("common.weaponRequirement1")+': '+
                   game.i18n.localize("characteristic."+weapon.system.requeriment.primary.characteristic) +
                   ' > ' + weapon.system.requeriment.primary.minValue);
      if (actor.system.characteristics.primary[weapon.system.requeriment.primary.characteristic].value < 
        weapon.system.requeriment.primary.minValue) {

          const nMinVal = weapon.system.requeriment.primary.minValue - 
              actor.system.characteristics.primary[weapon.system.requeriment.primary.characteristic].value;
          
          sDamageForceMod = '-' + nMinVal.toString();
          history.push(game.i18n.localize("common.damageMod")+': '+sDamageForceMod);
      }
    }    
    return sDamageForceMod;

  }

}