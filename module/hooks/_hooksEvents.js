/**
 * EVENTS
 */
export class HookEvents {

    /**
     * Displaying Info in Sheets...
     */    
    static sheetInfoEvent() {
        
        //Show Info for label (Sheets)
        $(document).on('click', 'info', function (event) {
            HookEvents._showInfo($(this).data('id'));
        });
    }

    /**
     * Handling panels in Sheets...
     */    
    static sheetPanelEvent() {
        
    }

    /**
     * Compendium Events... 
     */    
    static compendiumEvent() {
        
        //Filtering rows...
        $(document).on('change', 'select._cFilter', function (event) {
            
            const sValue = $(this).val();
            const sFilter = $(this).data('filter');
            const sDiv = (sFilter === 'world') ? '._worldInfo' : '._extraInfo';
            $(".compendium ol.directory-list li.directory-item").each(function(i,e) {
                if ( $(e).find(sDiv).data("filter") === sValue ) $(e).show();
                else $(e).hide();
                if (sValue === '') $(e).show();
            }.bind(this));

            //Changing others select control...
            if (sFilter === 'world') {
                $("._cFilter").each(function(i0, e0) {
                    if ( $(e0).data('filter') !== 'world' ) {
                        $(e0).find("option:selected").prop("selected", false);
                        $(e0).find('option').each(function(i, e) {
                            if ( $(e).data('world') === sValue ) $(e).show();
                            else $(e).hide();
                            if (sValue === '') $(e).show();
                            if ( $(e).data('world') === '' ) $(e).show();
                        }.bind(this));
                    }
                }.bind(this));
            }
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
