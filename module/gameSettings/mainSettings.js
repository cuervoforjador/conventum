export class mainSettings {

    /**
     * init
     */
    static init() {


        /** --- SETTINGS --- */

        game.settings.register(game.system.id, "tokenCircle", {
            name: 'settings.tokenCircle',
            hint: 'settings.tokenCircleTxt',
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
            onChange: value => {}
        });

        game.settings.register(game.system.id, "lens", {
            name: 'settings.lens',
            hint: 'settings.lensTxt',
            scope: 'world',
            config: true,
            type: Boolean,
            default: false,
            onChange: value => {}
        });        

    }

}