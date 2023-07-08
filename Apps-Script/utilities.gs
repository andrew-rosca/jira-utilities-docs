/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

// replaces the text of all Jira links with only the issue key
function shortenLinkText() {
  applyToAllElements(findJiraLinks, function (link){
      var url = link.getText()
      var issueKey = getIssueKey(url)

      link.setText(issueKey)
      link.setLinkUrl(url)

  })
}

function replaceLinkTextWithSummary() {
  applyToAllElements(findJiraLinks, function (link){
      var url = link.getText()
      var issueKey = getIssueKey(url)

      summary = getJiraSummary(url, issueKey)

      link.setText(issueKey + ": " + summary)
      link.setLinkUrl(url)
  })
}

// applies function func to all elements returned by findFunc
function applyToAllElements(findFunc, func) {
  var foundSome = true
  var elements = findFunc();
  
  while(foundSome) { //for unclear reasons, not all matches are found on each iteration, but searching repeatedly finds them all
    foundSome = elements != null;

    while(elements) {
      var element = elements.getElement();
      
      // apply the provided function
      func(element);

      elements = findFunc(elements);
    }

    elements = findFunc();
  }
}

// returns all text elements in a document which matches a Jira issue URL pattern, starting with the given startingFrom element
function findJiraLinks(startingFrom) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  // Find all Jira links in the document
  var jiraIssueUrlPattern = "https:\\/\\/.+\\.atlassian\.net\\/browse\\/\\w+-\\d+"
  
  return body.findText(jiraIssueUrlPattern, startingFrom)
}

// returns the portion of an input string which matches a Jira issue key
function getIssueKey(str) {
  return str.match(/\/(\w+-\d+)/)[1];
}

// returns the portion of an input which represents the root of a URL
function getUrlRoot(url) {
  return url.match(/http(s)?:\/\/(.+?)\//)[0];
}

// fetches the summary of a Jira issue via tht Atlassian API
function getJiraSummary(jiraUrl) {
  var issueKey = getIssueKey(jiraUrl)
  var hostUrl = getUrlRoot(jiraUrl)

  props = PropertiesService.getUserProperties();
  email = props.getProperty("email");
  apiToken = props.getProperty("apiToken");
  
  // Make an HTTP GET request to the Jira REST API to retrieve the issue details
  var apiUrl = hostUrl + "rest/api/latest/issue/" + issueKey;
  var headers = {
    "Authorization": "Basic " + Utilities.base64Encode(email + ":" + apiToken),
    "Accept": "application/json"
  };
  var options = {
    "headers": headers,
    "method": "GET",
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  var responseData = JSON.parse(response.getContentText());
  
  // Extract the issue summary from the response data
  var summary = responseData.fields.summary;
  
  return summary;
}