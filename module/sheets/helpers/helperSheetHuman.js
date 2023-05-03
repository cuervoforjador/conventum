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
      frame: systemData.control.frame
    };
  }

  /**
   * checkSystemData
   * @param {*} systemData 
   */
  static async checkSystemData(systemData, backend) {

    this._checkCharacteristics(systemData);
    this._calcCharacteristics(systemData);
    this._calcHPStatus(systemData);
    this._calcAPPStatus(systemData);
    this._calcWeight(systemData);
    this._calcHeight(systemData);
    this._checkBio(systemData, backend);
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


}