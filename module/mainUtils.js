/**
 * UTILS
 */
export class mainUtils {

    /**
     * Styling Compendium List element 
     * @param {object} tab
     */    
    static ifNotExists(sUrl, oFunction) {
        
        $.ajax({
            url: sUrl,
            type: 'HEAD',
            error: oFunction
        });
    }

}
