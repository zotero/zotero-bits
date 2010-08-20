{"translatorID":"1b052690-16dd-431d-9828-9dc675eb55f6","label":"Papers Past","creator":"staplegun","target":"http://paperspast.natlib.govt.nz","minVersion":"1.0","maxVersion":"","priority":100,"inRepository":"0","translatorType":4,"lastUpdated":"2010-08-17 11:05:28"}

function detectWeb(doc, url) {

  // init variables
  var namespace = doc.documentElement.namespaceURI;
  var nsResolver = namespace ? function(prefix) {
    if (prefix == "x" ) return namespace; else return null;
  } : null;
  var myXPath;
  var myXPathObject;

  // look for publication title in meta tags
  myXPath          = '//meta[@name="newsarticle_publication"]/@content';
  myXPathObject    = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null);
  var meta = myXPathObject.iterateNext().textContent;
  if (meta.length > 0) {
    return "newspaperArticle";
  }
}

function doWeb(doc, url) {

  // init variables
  var namespace = doc.documentElement.namespaceURI;
  var nsResolver = namespace ? function(prefix) {
    if (prefix == "x" ) return namespace; else return null;
  } : null;
  var myXPath;
  var myXPathObject;

  // basic item details
  var newItem = new Zotero.Item('newspaperArticle');
  newItem.archive = 'Papers Past';
  
  // url - remove highlighting code
  var url = doc.location.href;
  url = url.replace(/&e=.*/,'');
  newItem.url = url;

  // publication title
  myXPath          = '//meta[@name="newsarticle_publication"]/@content';
  myXPathObject    = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null);
  newItem.publicationTitle = myXPathObject.iterateNext().textContent;

  // article title (convert to sentence case)
  myXPath          = '//meta[@name="newsarticle_headline"]/@content';
  myXPathObject    = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null);
  var title   = myXPathObject.iterateNext().textContent;
  var words = title.split(/\s/);
  var titleFixed = '';
  for (var i in words) {
   words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
   titleFixed = titleFixed + words[i] + ' ';
  }
  newItem.title = titleFixed;

  // publication date
  myXPath          = '//meta[@name="dc_date"]/@content';
  myXPathObject    = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null);
  newItem.date = myXPathObject.iterateNext().textContent;

  // page
  myXPath          = '//meta[@name="newsarticle_firstpage"]/@content';
  myXPathObject    = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null);
  var pages = myXPathObject.iterateNext().textContent;

  myXPath          = '//meta[@name="newsarticle_otherpages"]/@content';
  myXPathObject    = doc.evaluate(myXPath, doc, nsResolver, XPathResult.ANY_TYPE, null);
  pages = pages + ' ' + myXPathObject.iterateNext().textContent;

  newItem.pages = pages;

  // finish
  newItem.complete();
  Zotero.wait();
}
