export const preloadTemplates = async function() {
  
  return loadTemplates({
      humanFrame: CONFIG._root+"/templates/fragments/humanFrame.html",
      humanCrest: CONFIG._root+"/templates/fragments/humanCrest.html",
      humanPageMain: CONFIG._root+"/templates/fragments/humanPageMain.html",
      humanBoxHeader: CONFIG._root+"/templates/fragments/humanBoxHeader.html",
      
      itemFrame: CONFIG._root+"/templates/fragments/itemFrame.html",
      itemHeader: CONFIG._root+"/templates/fragments/itemHeader.html",
      itemDescription: CONFIG._root+"/templates/fragments/itemDescription.html",

      skillHeader: CONFIG._root+"/templates/fragments/skillHeader.html",
  });
};