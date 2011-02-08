{
        "translatorID":"6ec8008d-b206-4a4c-8d0a-8ef33807703b",
        "label":"The Economist",
        "creator":"Michael Berkowitz",
        "target":"^http://(www\\.)?economist\\.com/",
        "minVersion":"1.0.0b4.r5",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-02-05 18:26:24"
}

function detectWeb(doc, url) {
       if (doc.location.href.indexOf("search") != -1) {
		/* Multiple article download disabled-- broken.
		TODO Fix multiple article download. */
               //return "multiple";
       } else if (doc.location.href.toLowerCase().indexOf("node") != -1) {
       var nsResolver = null;
	var flyTitle = doc.evaluate('//div[@class="headline"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (flyTitle) 
               return "magazineArticle";
       }
}

function scrape(doc, url) {
       var namespace = doc.documentElement.namespaceURI;
       var nsResolver = namespace ? function(prefix) {
               if (prefix == "x" ) return namespace; else return null;
       } : null;

       newItem = new Zotero.Item("magazineArticle");
       newItem.ISSN = "0013-0613";
       newItem.url = doc.location.href;
       newItem.publicationTitle = "The Economist";
newItem.ns = namespace;
Zotero.debug("Item url is:" + newItem.url);
	var flyTitle = doc.evaluate('//h2[@class="fly-title"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent; 
	var headline = doc.evaluate('/html/body/div[2]/div[3]/div/div/div/div', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent; 
      newItem.title= flyTitle + ': ' + headline;

      
       if (newItem.abstractNote) newItem.abstractNote = Zotero.Utilities.trimInternal(newItem.abstractNote);
       //get date and extra stuff
   if (doc.evaluate('//p[@class="ec-article-info"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext() ) {
               newItem.date = Zotero.Utilities.trim(doc.evaluate('/html/body/div[2]/div[3]/div/div/div/p', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.split("|")[0]);
       }
	
	var url = doc.location.href;
       newItem.attachments = [
       		{url:url.replace("displaystory", "PrinterFriendly"), title:"The Economist Snapshot", mimeType:"text/html"}
       	];
       	
       newItem.complete();
}


function doWeb(doc, url) {
       var namespace = doc.documentElement.namespaceURI;
       var nsResolver = namespace ? function(prefix) {
               if (prefix == "x" ) return namespace; else return null;
       } : null;

       var urls = new Array();

       if (doc.title == "Search | Economist.com") {
               var items = new Array();
               var uris = new Array();
               var results = doc.evaluate('//ol[@class="search-results"]/li/h2/a', doc, nsResolver, XPathResult.ANY_TYPE, null);
               var headline = results.iterateNext();
               while (headline) {
                       items.push(headline.textContent);
                       uris.push(headline.href);
                       Zotero.debug(headline.href);
                       headline = results.iterateNext();
               }

               var newItems = new Object();
               for (var i = 0 ; i <items.length ; i++) {
                       newItems[uris[i]] = items[i];
               }

               newItems = Zotero.selectItems(newItems);
               if (!newItems) {
                       return true;
               }

               for (var i in newItems) {
                       urls.push(i);
               }
       } else if (doc.location.href.toLowerCase().indexOf("node") != -1) {
               scrape(doc, url);
               return;
       }
       
       Zotero.Utilities.processDocuments(urls, scrape, function() { Zotero.done(); });
       
       Zotero.wait();
}
