
export class mainMacros {

  /**
   * registerMacros
   */
  static async registerMacros() {

    const upWeapons = (Array.from(game.macros).find(e => e.name === 'weapons')) ?
      Array.from(game.macros).find(e => e.name === 'weapons') :
      await Macro.create({
        command: "game.conventum.upWeapons();",
        name: "weapons",
        type: "script",
        img: "/systems/conventum/image/texture/weapons.png",
        ownership: {default: 3}
      });

    const upActions = (Array.from(game.macros).find(e => e.name === 'actions')) ?
      Array.from(game.macros).find(e => e.name === 'actions') :
      await Macro.create({
        command: "game.conventum.upActions();",
        name: "actions",
        type: "script",
        img: "/systems/conventum/image/texture/actions.png",
        ownership: {default: 3}
      });

      const upEncounter = (Array.from(game.macros).find(e => e.name === 'encounter')) ?
      Array.from(game.macros).find(e => e.name === 'encounter') :
      await Macro.create({
        command: "game.conventum.upEncounter();",
        name: "encounter",
        type: "script",
        img: "/systems/conventum/image/texture/combat.png",
        ownership: {default: 3}
      });



    await game.user.assignHotbarMacro(upActions, 1);
    await game.user.assignHotbarMacro(upWeapons, 2);
    await game.user.assignHotbarMacro(upEncounter, 10);
  }

  /**
   * upWeapons
   */
  static async upWeapons() {
    const actor = await mainMacros._getActor();
    actor.sheet._tabs[0].active = 'combat';
    actor.sheet._tabs[2].active = 'combatWeapons';
    actor.sheet.render(true);

  }

  /**
   * upActions
   */
  static async upActions() {
    const actor = await mainMacros._getActor();
    actor.sheet._tabs[0].active = 'combat';
    actor.sheet._tabs[2].active = 'combatActions';
    actor.sheet.render(true);

  }  

  /**
   * upEncounter
   */
  static async upEncounter() {
    const actor = await mainMacros._getActor();
    const encounter = mainMacros._getEncounter(actor);
    if (encounter)
      encounter.sheet.render(true);
  }   

  /**
   * _getActor
   * @returns 
   */
  static async _getActor() {
    let actor = Array.from(game.actors).find(e => 
      ( (e.ownership[game.userId]) 
      && (e.ownership[game.userId] > 0) ));  
    return actor;  
  }

  /**
   * _getEncounter
   * @param {*} actor 
   * @returns 
   */
  static _getEncounter(actor) {
    const currentScene = Array.from(game.scenes).find(e => e.id === game.user.viewedScene);
    if (!currentScene) return null;
    let activeCombat = Array.from(game.combats).find(e => 
                               ((e._source.scene === game.user.viewedScene) && (e.active)) );
    if (!activeCombat) return;

    const mEncounters = game.items.filter(e => e.type === 'actionPool');
    if (mEncounters.length === 0) return;
    const encounter = mEncounters.find(e => e.system.combat === activeCombat.id);
    return encounter;
  }

}
