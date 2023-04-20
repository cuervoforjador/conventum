export class mainSettings {

    /**
     * init
     */
    static init() {


        /** --- SETTINGS --- */

        game.settings.register(game.system.id, "tokenCircle", {
            name: 'SETTINGS.tokenCircle',
            hint: 'SETTINGS.tokenCircleDesc',
            scope: 'world',
            config: true,
            type: Boolean,
            default: true,
            onChange: value => {}
        });

    }

}