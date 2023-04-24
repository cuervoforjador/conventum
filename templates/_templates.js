export const preloadTemplates = async function() {
  
  return loadTemplates({
      humanFrame: CONFIG._root+"/templates/fragments/humanFrame.html",
      humanCrest: CONFIG._root+"/templates/fragments/humanCrest.html",
      humanPageMain: CONFIG._root+"/templates/fragments/humanPageMain.html",
<<<<<<< HEAD
      humanBoxHeader: CONFIG._root+"/templates/fragments/humanBoxHeader.html",
      
      itemFrame: CONFIG._root+"/templates/fragments/itemFrame.html",
      itemHeader: CONFIG._root+"/templates/fragments/itemHeader.html",
      itemDescription: CONFIG._root+"/templates/fragments/itemDescription.html",

      skillHeader: CONFIG._root+"/templates/fragments/skillHeader.html",
=======
      humanPageBio: CONFIG._root+"/templates/fragments/humanPageBio.html",
      humanPageSkills: CONFIG._root+"/templates/fragments/humanPageSkills.html",
      humanPageCombat: CONFIG._root+"/templates/fragments/humanPageCombat.html",
      humanPageItems: CONFIG._root+"/templates/fragments/humanPageItems.html",
      humanHeader: CONFIG._root+"/templates/fragments/humanHeader.html",
      
      itemFrame: CONFIG._root+"/templates/fragments/itemFrame.html",
      itemDescription: CONFIG._root+"/templates/fragments/itemDescription.html",
      itemLanguages: CONFIG._root+"/templates/fragments/itemLanguages.html",

>>>>>>> 48ae91f0c39a0c8e5746703da684780f1db7deaf
  });
};