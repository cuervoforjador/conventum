/**
 * UTILS
 */
export class mainUtils {

    /**
     * Checking if Expression is evaluable...
     * @param {string} sValue
     */    
    static checkExpression(sValue) {

        if ( isNaN(sValue) ) {
            sValue = sValue.replaceAll('x', '*');
            sValue = sValue.toLowerCase();
            
            // Primary Characteristics...
            for (const c in game.template.Actor.templates.base.characteristics.primary) {
              sValue = sValue.replaceAll(c, 
                game.template.Actor.templates.base.characteristics.primary[c].value);
            }
  
            // Secondary Characteristics...
            for (const c in game.template.Actor.templates.base.characteristics.secondary) {
              sValue = sValue.replaceAll(c, 
                game.template.Actor.templates.base.characteristics.secondary[c].value);
            }     
            try {
                sValue = eval(sValue);
            } catch(e) {
                return false;
            }            
            return !(isNaN(sValue));

          } else return true;
    }

    /**
     * If file not exists...
     * @param {string} sUrl
     */    
    static ifNotExists(sUrl, oFunction) {
        $.ajax({
            url: sUrl,
            type: 'HEAD',
            error: oFunction
        });
    }

}
