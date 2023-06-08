import { mainUtils } from "../mainUtils.js";
import { mainBackend } from "../sheets/backend/mainBackend.js";

export class HookTours {

    /**
     * registerTours
     * @returns 
     */
    static async registerTours() {
        
        await game.tours.register("conventum", "firstSteps", await this._tourFirstStep());
        
        this.initTours();
    }

    /**
     * initTours
     */
    static async initTours() {
        
        const firstSteps = await game.tours.get('conventum.firstSteps');
        if (firstSteps.status === 'unstarted') firstSteps.start();
    }

    /**
     * ------------ FIRST STEPS TOUR -----------------------------------------------------------------------------------
     */
    static async _tourFirstStep() {
        let sLang = game.i18n.lang;
        return await new Tour({
            title: "tour.Title",
            description: "tour.Description",
            canBeResumed: true,                
            display: true,
            localization: {
                "tour.Title": game.i18n.localize("tour.Title"),
                "tour.Description": game.i18n.localize("tour.Description"),
                "tour.Title01": game.i18n.localize("tour.Title01"),                    
                "tour.Content01": game.i18n.localize("tour.Content01"),
                "tour.TitleWorld": game.i18n.localize("tour.TitleWorld"),                    
                "tour.ContentWorld": game.i18n.localize("tour.ContentWorld"),                    
            },
            steps: [
                {   
                    id: "step01",
                    title: "tour.Title01",
                    content: "tour.Content01",
                    selector: ""
                },
                {   
                    id: "step02",
                    title: "tour.Title02",
                    content: "tour.Content02",
                    selector: ""
                },    
                {   
                    id: "step03",
                    title: "tour.Title03",
                    content: "tour.Content03",
                    //sidebarTab: "compendium",
                    selector: '[data-tab="compendium"]',
                    action: 'click'
                },                            
                {   
                    id: "step04",
                    title: "tour.Title04",
                    content: "tour.Content04",
                    //sidebarTab: "compendium",
                    selector: '[data-pack="conventum.worlds"]', //'[data-tab="compendium"]',
                    action: 'click'
                },                    
            ]
        }, {
            id: "firstSteps",
            namespace: "conventum",
            stepIndex: -1
        });
    }

}

