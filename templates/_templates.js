export const preloadTemplates = async function() {
  
  return loadTemplates({
    actorMainName: CONFIG._root+"/templates/fragments/actor/portrait/actor_main_name.html",
    actorMainPortrait: CONFIG._root+"/templates/fragments/actor/portrait/actor_main_portrait.html",
    actorMainCharacteristics: CONFIG._root+"/templates/fragments/actor/portrait/actor_main_characteristics.html",
    actorMainHitPoints: CONFIG._root+"/templates/fragments/actor/portrait/actor_main_hitPoints.html",
    actorMainComplex: CONFIG._root+"/templates/fragments/actor/portrait/actor_main_complex.html",
    actorMenu: CONFIG._root+"/templates/fragments/actor/portrait/actor_menu.html",

    actorActorPageLeft: CONFIG._root+"/templates/fragments/actor/actor/actor_pageLeft.html",
    actorActorPageRight: CONFIG._root+"/templates/fragments/actor/actor/actor_pageRight.html",

    actorActorPortrait: CONFIG._root+"/templates/fragments/actor/actor/actor_actor_portrait.html",
    /*
    actorActorOctagon: CONFIG._root+"/templates/fragments/actor/actor/actor_actor_octagon.html",
    */

    actorSheetActor: CONFIG._root+"/templates/fragments/actor/sheets/actor_sheet_actor.html",
    actorSheetCombat: CONFIG._root+"/templates/fragments/actor/sheets/actor_sheet_combat.html",
    actorSheetEquipment: CONFIG._root+"/templates/fragments/actor/sheets/actor_sheet_equipment.html",
    actorSheetMagic: CONFIG._root+"/templates/fragments/actor/sheets/actor_sheet_magic.html",
    actorSheetSkills: CONFIG._root+"/templates/fragments/actor/sheets/actor_sheet_skills.html",
    actorModes: CONFIG._root+"/templates/fragments/actor/common/actor_modes.html",

    actorSkillsDetail: CONFIG._root+"/templates/fragments/actor/skills/actor_skillDetail.html",
    actorSkills: CONFIG._root+"/templates/fragments/actor/skills/actor_skills.html",

    actorCombatMainFrame: CONFIG._root+"/templates/fragments/actor/combat/actor_combat_mainFrame.html",
    
    actorCombatActionDiag: CONFIG._root+"/templates/fragments/actor/combat/common/actor_combat_actionDiag.html",
    actorCombatHeader: CONFIG._root+"/templates/fragments/actor/combat/common/actor_combat_header.html",
    actorCombatMenuFrame: CONFIG._root+"/templates/fragments/actor/combat/common/actor_combat_menuFrame.html",
    actorCombatStepsBar: CONFIG._root+"/templates/fragments/actor/combat/common/actor_combat_stepsBar.html",

    actorCombatCombatBar: CONFIG._root+"/templates/fragments/actor/combat/combat/actor_combat_combatBar.html",
    
    actorCombatFrameMyCombat: CONFIG._root+"/templates/fragments/actor/combat/frame/actor_combatFrame_myCombat.html",
    actorCombatFrameCombat: CONFIG._root+"/templates/fragments/actor/combat/frame/actor_combatFrame_combat.html",
    actorCombatFrameEncounter: CONFIG._root+"/templates/fragments/actor/combat/frame/actor_combatFrame_encounter.html",
    actorCombatFrameCombatant: CONFIG._root+"/templates/fragments/actor/combat/frame/actor_combatFrame_combatant.html",
    actorCombatFrameSummary: CONFIG._root+"/templates/fragments/actor/combat/frame/actor_combatFrame_summary.html",   

    actorCombatFrameMyWeapons: CONFIG._root+"/templates/fragments/actor/combat/myCombat/actor_combatFrame_myWeapons.html",
    actorCombatFrameMyArmor: CONFIG._root+"/templates/fragments/actor/combat/myCombat/actor_combatFrame_myArmor.html",
    actorCombatFrameMyActions: CONFIG._root+"/templates/fragments/actor/combat/myCombat/actor_combatFrame_myActions.html",
    actorCombatWeaponDiag: CONFIG._root+"/templates/fragments/actor/combat/myCombat/actor_combat_weaponDiag.html",
    actorCombatWeaponInfo1: CONFIG._root+"/templates/fragments/actor/combat/myCombat/actor_combat_weaponDiag_info1.html",
    actorCombatWeaponInfo2: CONFIG._root+"/templates/fragments/actor/combat/myCombat/actor_combat_weaponDiag_info2.html",

    actorCombatFrameTurnFlux: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_flux.html",
    actorCombatFrameTurnAttacker: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_attacker.html",
    actorCombatFrameTurnTarget: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_target.html",
    actorCombatFrameTurnOppoRoll: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_oppoRoll.html",
    actorCombatFrameTurnDamage: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_damage.html",
    actorCombatFrameTurnAttackerWeapon: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_attackWeapon.html",
    actorCombatFrameTurnTargetWeapon: CONFIG._root+"/templates/fragments/actor/combat/turn/actor_combatFrame_turn_targetWeapon.html",
    
    actorEquipmentArmor: CONFIG._root+"/templates/fragments/actor/equipment/actor_equipment_armor.html",
    actorEquipmentArmorTree: CONFIG._root+"/templates/fragments/actor/equipment/actor_equipment_armorTree.html",
    actorEquipmentEquipment: CONFIG._root+"/templates/fragments/actor/equipment/actor_equipment_equipment.html",
    actorEquipmentWeapons: CONFIG._root+"/templates/fragments/actor/equipment/actor_equipment_weapons.html",

    actorMagicCells: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_cells.html",
    actorMagicTheo: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_theo.html",
    actorMagicStudy: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_study.html",
    actorMagicStudyTheo: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_studyTheo.html",
    actorMagicThrow: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_throw.html",
    actorMagicThrowTheo: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_throwTheo.html",
    actorListMagic: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_listMagic.html",
    actorMagicBooks: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_books.html",
    actorMagicList: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_list.html",
    actorMagicInfo: CONFIG._root+"/templates/fragments/actor/magic/actor_magic_info.html",
    
    actorWmain: CONFIG._root+"/templates/fragments/actor/window/main.html",
    actorWbookmarks: CONFIG._root+"/templates/fragments/actor/window/bookmarks.html",
    actorWSheetActor: CONFIG._root+"/templates/fragments/actor/window/sheets/actorSheetActor.html",
    actorWSheetSkills: CONFIG._root+"/templates/fragments/actor/window/sheets/actorSheetSkills.html",
    actorWSheetEquipment: CONFIG._root+"/templates/fragments/actor/window/sheets/actorSheetEquipment.html",
    actorWSheetMagic: CONFIG._root+"/templates/fragments/actor/window/sheets/actorSheetMagic.html",
    actorWSheetCombat: CONFIG._root+"/templates/fragments/actor/window/sheets/actorSheetCombat.html",

    actionDamage: CONFIG._root+"/templates/fragments/action/action_damage.html",
    actionDescription: CONFIG._root+"/templates/fragments/action/action_description.html",
    actionFencing: CONFIG._root+"/templates/fragments/action/action_fencing.html",
    actionMain: CONFIG._root+"/templates/fragments/action/action_main.html",
    actionModifiers: CONFIG._root+"/templates/fragments/action/action_modifiers.html",
    actionRoll: CONFIG._root+"/templates/fragments/action/action_roll.html",
    actionDefense: CONFIG._root+"/templates/fragments/action/action_defense.html",
    actionWeapons: CONFIG._root+"/templates/fragments/action/action_weapons.html",

    weaponMain: CONFIG._root+"/templates/fragments/weapon/weapon_main.html",
    weaponContext: CONFIG._root+"/templates/fragments/weapon/weapon_context.html",
    weaponShields: CONFIG._root+"/templates/fragments/weapon/weapon_shields.html",
    weaponDescription: CONFIG._root+"/templates/fragments/weapon/weapon_description.html",

    armorMain: CONFIG._root+"/templates/fragments/armor/armor_main.html",
    armorDescription: CONFIG._root+"/templates/fragments/armor/armor_description.html",  

    loreCusto: CONFIG._root+"/templates/loreCusto.html",
    frame: CONFIG._root+"/templates/fragments/frame.html",
    
  });
};