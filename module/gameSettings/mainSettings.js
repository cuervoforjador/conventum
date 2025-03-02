export class mainSettings {

    /**
     * init
     */
    static init() {

        /** --- SETTINGS --- */

        game.settings.register(game.system.id, "rules", {
            name: game.i18n.localize('common.rules'),
            hint: game.i18n.localize('info.rules'),
            scope: 'world', //'client',
            config: true,
            type: String,          
            default: 'aq3',
            requiresReload: true,
            choices: {
                "aq3": game.i18n.localize('common.aq3'),
                "aq4": game.i18n.localize('common.aq4'),
                "vyc": game.i18n.localize('common.vyc'),
                "cus": game.i18n.localize('common.custom'),
            },
            onChange: value => {
                //See event onChangeRules!
                //mainSettings.setConfigValues();
            },                      
        }); 

        game.settings.register(game.system.id, "showFirstTour", {
            name: 'Aquelarre Tour',
            scope: 'world',
            config: false,
            type: String,
            default: '0'
        }); 

        game.settings.register(game.system.id, "fontSize", {
            name: game.i18n.localize('common.fontSize'),
            hint: game.i18n.localize('info.fontSize'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: String,
            default: '1.25em'
        });

        game.settings.register(game.system.id, "lightMode", {
            name: game.i18n.localize('common.lightMode'),
            hint: game.i18n.localize('info.lightMode'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.BooleanField(),
            default: true
        });

        game.settings.register(game.system.id, "applyCoefRatio", {
            name: game.i18n.localize('common.applyCoefRatio'),
            hint: game.i18n.localize('info.applyCoefRatio'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.BooleanField(),
            default: false
        });        

        game.settings.register(game.system.id, "coefRatio", {
            name: game.i18n.localize('common.coefRatio'),
            hint: game.i18n.localize('info.coefRatio'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: Number,
            default: 1.8285
        });        

        game.settings.register(game.system.id, "sheetsLocked", {
            name: game.i18n.localize('common.sheetsLocked'),
            hint: game.i18n.localize('info.sheetsLocked'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.BooleanField(),
            default: true
        });

        game.settings.register(game.system.id, "rulesNewActionsPrev", {
            name: game.i18n.localize('common.rulesNewActionsPrev'),
            hint: game.i18n.localize('info.rulesNewActionsPrev'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.BooleanField(),
            default: true
        });

        game.settings.register(game.system.id, "rulesMaxSteps", {
            name: game.i18n.localize('common.rulesMaxSteps'),
            hint: game.i18n.localize('info.rulesMaxSteps'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.NumberField({nullable: false, min: -10, max: 10, step: 1}),         
            default: 2
        });

        game.settings.register(game.system.id, "rulesPenInit", {
            name: game.i18n.localize('common.rulesPenInit'),
            hint: game.i18n.localize('info.rulesPenInit'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.NumberField({nullable: false, min: -100, max: 100, step: 1}),         
            default: 0
        });        

        game.settings.register(game.system.id, "rulesPenSkill", {
            name: game.i18n.localize('common.rulesPenSkill'),
            hint: game.i18n.localize('info.rulesPenSkill'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.NumberField({nullable: false, min: -100, max: 100, step: 1}),         
            default: 0
        });     
        
        game.settings.register(game.system.id, "loreKingdomRoll", {
            name: game.i18n.localize('common.loreKingdomRoll'),
            hint: game.i18n.localize('info.loreKingdomRoll'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: '1D10'
        });          

        game.settings.register(game.system.id, "loreNationRoll", {
            name: game.i18n.localize('common.loreNationRoll'),
            hint: game.i18n.localize('info.loreNationRoll'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: '1D10'
        });

        game.settings.register(game.system.id, "loreStratumRoll", {
            name: game.i18n.localize('common.loreStratumRoll'),
            hint: game.i18n.localize('info.loreStratumRoll'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: '1D10'
        });
        
        game.settings.register(game.system.id, "lorePositionRoll", {
            name: game.i18n.localize('common.lorePositionRoll'),
            hint: game.i18n.localize('info.lorePositionRoll'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: '1D10'
        });        

        game.settings.register(game.system.id, "loreProfessionRoll", {
            name: game.i18n.localize('common.loreProfessionRoll'),
            hint: game.i18n.localize('info.loreProfessionRoll'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: '1D100'
        });  

        game.settings.register(game.system.id, "traitRoll", {
            name: game.i18n.localize('common.traitRoll'),
            hint: game.i18n.localize('info.traitRoll'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: '1D100'
        });         

        game.settings.register(game.system.id, "loreHUnit", {
            name: game.i18n.localize('common.loreHUnit'),
            hint: game.i18n.localize('info.loreHUnit'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: 'varas'
        });

        game.settings.register(game.system.id, "loreWUnit", {
            name: game.i18n.localize('common.loreWUnit'),
            hint: game.i18n.localize('info.loreWUnit'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: 'libras'
        });        

        game.settings.register(game.system.id, "loreCoin", {
            name: game.i18n.localize('common.loreCoin'),
            hint: game.i18n.localize('info.loreCoin'),
            scope: 'world',
            config: true,
            requiresReload: true,
            type: new foundry.data.fields.StringField(),
            default: 'mrs'
        });          

    }

    /**
     * uiConfigControls
     * @returns 
     */
    static uiConfigControls() {
        return {
            maxSteps: {
                range: $('#client-settings range-picker[name="'+game.system.id+'.rulesMaxSteps"] input[type="range"]'),
                number: $('#client-settings range-picker[name="'+game.system.id+'.rulesMaxSteps"] input[type="number"]'),
                base: $('#client-settings range-picker[name="'+game.system.id+'.rulesMaxSteps"]')
            },            
            penInit: {
                range: $('#client-settings range-picker[name="'+game.system.id+'.rulesPenInit"] input[type="range"]'),
                number: $('#client-settings range-picker[name="'+game.system.id+'.rulesPenInit"] input[type="number"]'),
                base: $('#client-settings range-picker[name="'+game.system.id+'.rulesPenInit"]')
            },
            penSkill: {
                range: $('#client-settings range-picker[name="'+game.system.id+'.rulesPenSkill"] input[type="range"]'),
                number: $('#client-settings range-picker[name="'+game.system.id+'.rulesPenSkill"] input[type="number"]'),
                base: $('#client-settings range-picker[name="'+game.system.id+'.rulesPenSkill"]')
            },
            newActionsPrev: $('#client-settings input[name="'+game.system.id+'.rulesNewActionsPrev"]'),
            loreKingdomRoll: $('#client-settings input[name="'+game.system.id+'.loreKingdomRoll"]'),
            loreNationRoll: $('#client-settings input[name="'+game.system.id+'.loreNationRoll"]'),
            loreStratumRoll: $('#client-settings input[name="'+game.system.id+'.loreStratumRoll"]'),
            lorePositionRoll: $('#client-settings input[name="'+game.system.id+'.lorePositionRoll"]'),
            loreProfessionRoll: $('#client-settings input[name="'+game.system.id+'.loreProfessionRoll"]'),
            traitRoll: $('#client-settings input[name="'+game.system.id+'.traitRoll"]'),
            loreHUnit: $('#client-settings input[name="'+game.system.id+'.loreHUnit"]'),
            loreWUnit: $('#client-settings input[name="'+game.system.id+'.loreWUnit"]'),
            loreCoin: $('#client-settings input[name="'+game.system.id+'.loreCoin"]')
        };
    }

    /**
     * onChangeRules
     * @param {*} event 
     */
    static async onChangeRules(event) {

        const sRules = event.currentTarget.selectedOptions[0].value;
        const rules = CONFIG.ExtendConfig.rules[sRules];
        if (!rules) return;

        mainSettings.uiConfigControls().maxSteps.range.val(rules.maxSteps);
        mainSettings.uiConfigControls().maxSteps.number.val(rules.maxSteps);    
        mainSettings.uiConfigControls().maxSteps.base.val(rules.maxSteps);
        mainSettings.uiConfigControls().penInit.range.val(rules.penInit);
        mainSettings.uiConfigControls().penInit.number.val(rules.penInit);
        mainSettings.uiConfigControls().penInit.base.val(rules.penInit);
        mainSettings.uiConfigControls().penSkill.range.val(rules.penSkill);
        mainSettings.uiConfigControls().penSkill.number.val(rules.penSkill);
        mainSettings.uiConfigControls().penSkill.base.val(rules.penSkill);
        mainSettings.uiConfigControls().newActionsPrev.prop("checked", rules.newActionsPrev);
        mainSettings.uiConfigControls().loreKingdomRoll.val(rules.loreKingdomRoll);
        mainSettings.uiConfigControls().loreNationRoll.val(rules.loreNationRoll);
        mainSettings.uiConfigControls().loreStratumRoll.val(rules.loreStratumRoll);
        mainSettings.uiConfigControls().lorePositionRoll.val(rules.lorePositionRoll);
        mainSettings.uiConfigControls().loreProfessionRoll.val(rules.loreProfessionRoll);
        mainSettings.uiConfigControls().traitRoll.val(rules.traitRoll);
        mainSettings.uiConfigControls().loreHUnit.val(rules.loreHUnit);
        mainSettings.uiConfigControls().loreWUnit.val(rules.loreWUnit);
        mainSettings.uiConfigControls().loreCoin.val(rules.loreCoin);
    }

    /**
     * setRules
     * @param {*} value 
     */
    static setRules(value) {

        const rules = CONFIG.ExtendConfig.rules[value];
        if (!rules) return;

        [
         'rulesMaxSteps', 'rulesPenInit', 'rulesPenSkill', 'rulesNewActionsPrev', 'loreKingdomRoll', 
         'loreNationRoll', 'loreStratumRoll','lorePositionRoll', 'loreProfessionRoll', 'traitRoll', 
         'loreHUnit', 'loreWUnit', 'loreCoin'
        ].map(s => {
            game.settings.set(game.system.id, s, rules[s]);    
        });
    }

    /**
     * setConfigValues
     */
    static setConfigValues() {  
        /*
        game.settings.set(game.system.id, "rulesMaxSteps", Number(mainSettings.uiConfigControls().maxSteps.number.val()));
        game.settings.set(game.system.id, "rulesPenInit", Number(mainSettings.uiConfigControls().penInit.number.val()));
        game.settings.set(game.system.id, "rulesPenSkill", Number(mainSettings.uiConfigControls().penSkill.number.val()));
        game.settings.set(game.system.id, "rulesNewActionsPrev", mainSettings.uiConfigControls().newActionsPrev.prop("checked"));
        game.settings.set(game.system.id, "loreKingdomRoll", mainSettings.uiConfigControls().loreKingdomRoll.val());
        game.settings.set(game.system.id, "loreNationRoll", mainSettings.uiConfigControls().loreNationRoll.val());
        game.settings.set(game.system.id, "loreStratumRoll", mainSettings.uiConfigControls().loreStratumRoll.val());
        game.settings.set(game.system.id, "lorePositionRoll", mainSettings.uiConfigControls().lorePositionRoll.val());
        game.settings.set(game.system.id, "loreProfessionRoll", mainSettings.uiConfigControls().loreProfessionRoll.val());
        game.settings.set(game.system.id, "traitRoll", mainSettings.uiConfigControls().traitRoll.val());
        game.settings.set(game.system.id, "loreHUnit", mainSettings.uiConfigControls().loreHUnit.val());
        game.settings.set(game.system.id, "loreWUnit", mainSettings.uiConfigControls().loreWUnit.val());
        game.settings.set(game.system.id, "loreCoin", mainSettings.uiConfigControls().loreCoin.val());
        */
    }

}