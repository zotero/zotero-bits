{
	"translatorID" : "0db1c2d0-eaae-4f3d-94ef-d4b3aa61de16",
	"label" : "Журнальный зал",
	"creator" : "Avram Lyon",
	"target" : "^http://magazines\\.russ\\.ru/[a-zA-Z -_]+/[0-9]+/[0-9]+/",
	"minVersion" : "2.0",
	"maxVersion" : "",
	"priority" : 100,
	"inRepository" : "1",
	"translatorType" : 4,
	"lastUpdated" : "2010-04-29 00:41:42"
}

function detectWeb(doc, url) {
	var n = doc.documentElement.namespaceURI;
        var ns = n ? function(prefix) {
                if (prefix == 'x') return n; else return null;
        } : null;

	var results = doc.evaluate('//div[@class="opub"]', doc, ns, XPathResult.ANY_TYPE, null);
	if (results.iterateNext()) {
		return "journalArticle";
	}
}

function doWeb(doc, url) {
	var n = doc.documentElement.namespaceURI;
        var ns = n ? function(prefix) {
                if (prefix == 'x') return n; else return null;
        } : null;

	var publication = doc.evaluate('//div[@class="opub"]/a', doc, ns, XPathResult.ANY_TYPE, null);
	publication = publication.iterateNext().textContent;
	var pieces = publication.match(/«(.*)»[\n\t ]*([0-9]+), №([0-9]+)/);

	var title = doc.evaluate('//div[@class="title1"]', doc, ns, XPathResult.ANY_TYPE, null);
	title = title.iterateNext().textContent;

	var author = doc.evaluate('//*[@class="avt1"]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext();
	author = author.textContent;

	item = new Zotero.Item("journalArticle");
	item.publicationTitle = pieces[1];
	item.title = title;
	item.date = pieces[2];
	item.issue = pieces[3];
	// Try to fix caps--some journals like to capitalize last name
	author = Zotero.Utilities.capitalizeTitle(author.toLowerCase(), true);
	item.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
	item.url = url;
	item.attachments.push({url:url, title: (item.publicationTitle + " Snapshot"), mimeType:"text/html"});

	item.complete();
	
}
