import { aqTours } from "./aqTours.js";

export class aqFirstSteps extends aqTours {
    constructor () {
        super(mergeObject({
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
                    selector: '[data-tab="compendium"]',
                    action: 'click'
                }                                 
            ]
        }, {
            id: "firstSteps2",
            namespace: "conventum",
            stepIndex: -1
        }));
    }

    async _preStep () {
        await super._preStep();
    
        if (this.currentStep.id === "step02") {
            //await this.waitForElement('#sidebar a.item[data-tab="compendium"]');
            //await this.waitForElement(this.currentStep.selector);
        }
    }    
}