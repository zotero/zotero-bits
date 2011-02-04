{
	"translatorID":"fe728bc9-595a-4f03-98fc-766f1d8d0936",
	"translatorType":4,
	"label":"Wiley Online Library",
	"creator":"Sean Takats, Michael Berkowitz and Avram Lyon",
	"target":"^https?://onlinelibrary\\.wiley\\.com[^\\/]*/doi",
	"minVersion":"1.0.0b4.r5",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2009-08-03 01:25:00"
}

function detectWeb(doc, url){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
		
	return "journalArticle";
}

function doWeb(doc, url){
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	var host = 'http://' + doc.location.host + "/";
	
	var ids = new Array();
	if(detectWeb(doc, url) == "multiple") {  //search
		var title;
		var availableItems = new Array();
		var items = Zotero.selectItems(availableItems);
		if(!items) {
			return true;
		}
		for(var id in items) {
			ids.push(id);
		}
		Zotero.Utilities.processDocuments(urls, scrape, function () { Zotero.done(); });
	} else { //single article
		scrape(doc, url);
	}
	
	Zotero.wait();
}

function scrape(doc,url)
{
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
       
	var newItem=new Zotero.Item("journalArticle");
       var temp;
       var xpath;
       var row;
       var rows;

       newItem.url = doc.location.href;
       var metaTags = doc.getElementsByTagName("meta");

       var pages = [false, false];
       var doi = false;
       var pdf = false;
       var html = false;
	for (var i = 0; i< metaTags.length; i++) {
		var tag = metaTags[i].getAttribute("name");
		var value = metaTags[i].getAttribute("content");
		Zotero.debug(pages + pdf + html);
       		Zotero.debug("Have meta tag: " + tag + " => " + value);
		switch (tag) {
			// Dublin Core
			case "dc.publisher": newItem.publisher = value; break;
			case "dc.language": newItem.language = value; break;
			case "dc.rights": newItem.rights = value; break;
			case "dc.title": newItem.title = value; break;
			case "dc.creator": newItem.creators.push(Zotero.Utilities.cleanAuthor(value)); break;
			// This is often NaN for some reason
			case "dc.date": if (value != "NaN" && value !== "") newItem.date = value; break;
			case "dc.identifier": if (!newItem.DOI && (doi = value.match(/^doi:(.*)/))) newItem.DOI = doi[1]; break;
			// PRISM
			case "prism.publicationName": newItem.publicationTitle = value; break;
			case "prism.issn": if (!newItem.ISSN && value != "NaN" && value != "") newItem.ISSN = value; break;
			case "prism.eIssn": if (!newItem.ISSN && value != "NaN" && value != "") newItem.ISSN = value; break;
			// This is often NaN for some reason
			case "prism.publicationDate": if (!newItem.date && value != "NaN" && value !== "") newItem.date = value; break;
			case "prism.volume": if (!newItem.volume && value != "NaN" && value != "") newItem.volume = value; break;
			case "prism.number": if (!newItem.issue && value != "NaN" && value != "") newItem.issue = value; break;
			// These also seem bad
			case "prism.startingPage": if(!pages[0] && value != "null" && value != "") pages[0] = value; break;
			case "prism.endingPage": if(!pages[1] && value != "null" && value != "") pages[1] = value; break;
			case "prism.number": newItem.issue = value; break;
			// Google.
			case "citation_journal_title": if (!newItem.publicationTitle) newItem.publicationTitle = value; break;
			case "citation_authors":
				if (newItem.creators.length == 0) {
					for each(var author in value.split(';')) newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author", true));
				}
				break;
			case "citation_title": if (!newItem.title) newItem.title = value; break;
			case "citation_publisher": if (!newItem.publisher) newItem.publisher = value; break;
			case "citation_date": if (!newItem.date && value != "NaN" && value != "") newItem.date = value; break;
			case "citation_year": if (!newItem.date && value != "NaN" && value != "") newItem.date = value; break;
			case "citation_volume": if (!newItem.volume && value != "NaN" && value != "") newItem.volume = value; break;
			case "citation_issue": if (!newItem.issue && value != "NaN" && value != "") newItem.issue = value; break;
			case "citation_firstpage": if (!pages[0] && value != "NaN" && value != "") pages[0] = value; break;
			case "citation_lastpage": if (!pages[1] && value != "NaN" && value != "") pages[1] = value; break;
			case "citation_issn": if (!newItem.ISSN && value != "NaN" && value != "") newItem.ISSN = value; break;
			// Prefer long language names
			case "citation_language": if ((!newItem.language || newItem.language.length < 4)
								&& value != "null" && value != "") newItem.language = value; break;
			case "citation_doi": if (!newItem.DOI) newItem.DOI = value; break;
			case "citation_abstract": newItem.abstractNote = value; break;
			case "citation_abstract_html_url": newItem.url = value; break;
			case "citation_pdf_url": if(!pdf) pdf = value; break;
			case "citation_keywords": newItem.tags.push(value); break;
			case "citation_fulltext_html_url": if(!pdf) pdf = value; break;
			case "fulltext_pdf": if(!pdf) pdf = value; break;
			default:
				Zotero.debug("Ignoring meta tag: " + tag + " => " + value);
		}
	}
	
	if (pdf) newItem.attachments = [{url:pdf, title:"Wiley Full Text PDF", mimeType:"application/pdf"}];
	if (html) newItem.attachments = [{url:html, title:"Wiley Full Text HTML"}];
	
	if (pages[0] && pages[1]) newItem.pages = pages.join('-')
	else newItem.pages = pages[0] ? pages[1] : (pages[1] ? pages[1] : "");

	// Abstracts don't seem to come with
	if (!newItem.abstractNote) {
		var abstractNode = doc.evaluate('//div[@id="abstract"]/div[@class="para"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (abstractNode) newItem.abstractNote = abstractNode.textContent;
	}
       newItem.complete();
}
