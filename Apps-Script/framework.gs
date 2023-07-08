/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

// create menu items
function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  var menu = DocumentApp.getUi().createAddonMenu();
  menu.addItem('Shorten Jira links', 'shortenLinkText').addToUi();
  menu.addItem('Replace Jira links with issue summary', 'replaceLinkTextWithSummary').addToUi();
  menu.addSeparator();
  menu.addItem('Settings', 'openSettingsDialog').addToUi();
}

// Open settings dialog
function openSettingsDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('settings.html')
    .setWidth(500)
    .setHeight(500);
  DocumentApp.getUi().showModalDialog(htmlOutput, 'Settings');
}

function getSettings() {
  props = PropertiesService.getUserProperties();
  return {email: props.getProperty("email"), apiToken: props.getProperty("apiToken")}
}

function saveSettings(settings){
  props = PropertiesService.getUserProperties();
  props.setProperty("email", settings.email);
  props.setProperty("apiToken", settings.apiToken);
}
