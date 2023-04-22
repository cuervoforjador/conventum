/**
 * EVENTS
 */
export class HookEvents {

    /**
     * Styling Compendium List element 
     * @param {object} tab
     */    
    static _sheetInfoEvent() {
        
        //Show Info for label 
        $(document).on('click', 'info', function (event) {
            HookEvents._showInfo($(this).data('id'));
        });
    }

    /**
     * Display Info message
     * @param {*} langId 
     */
    static _showInfo(langId) {
    
        let content = '<div class="_infoDialog">'+game.i18n.localize(langId);+'</div>';    
        let _dialog = new Dialog({
          title: game.i18n.localize('common.dialogInfo'),
          content: content,
          buttons: {}
          });
          _dialog.render(true, {
              width: 300,
              height: 300,
          });    
      }

}
