{
	"translatorID":"9220fa99-b936-430e-a8ea-43ca6cb04145",
	"translatorType":4,
	"label":"AGU Journals",
	"creator":"Ben Parr",
	"target":"^https?://(?:www.)?agu.org",
	"minVersion":"1.0.0b4.r1",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2011-01-11 04:31:00"
}

function detectWeb(doc,url)
{
     var namespace = doc.documentElement.namespaceURI;
     var nsResolver = namespace ? function(prefix) {
     if (prefix == 'x') return namespace; else return null;
     } : null;

       var xpath;

       //abstract
       xpath='//p[@id="citation"]';
       if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext())
               { return "journalArticle"; }

       //full text
       xpath='//frameset[@rows="98, *"]';
       if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext())
               { return "journalArticle"; }

       //issue page
       xpath='//tr/td/p[@class="title"]';
       if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext())
               { return "multiple"; }

       //Search  Page
       if(doc.title.indexOf("Query Results")>-1)
               {return "multiple";}
}


function fixCaps(s)
{
       if(s!='')
       {
               words=Zotero.Utilities.trimInternal(s).toLowerCase().split(" ");
               for (var j = 0 ; j < words.length ; j++)
               {
                       if (j==0||(words[j][0] ==words[j][0].toLowerCase()&&words[j]!="or"&&words[j]!="and"&&words[j]!="of"&&words[j]!="in"))
                               {   words[j]= words[j][0].toUpperCase() +words[j].substr(1);   }
               }
               return words.join(" ");
       }
       return '';
}

function scrape(doc,url)
{
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
	for (var i = 0; i< metaTags.length; i++) {
		var tag = metaTags[i].getAttribute("name");
		var value = metaTags[i].getAttribute("content");
		Zotero.debug(pages + pdf);
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
			// Google. We don't need most of it.
			case "citation_journal_title": if (!newItem.publicationTitle) newItem.publicationTitle = value; break;
			case "citation_authors":
				if (newItem.creators.length == 0)
					newItem.creators.push(value.split(',').map(Zotero.Utilities.cleanAuthor));
				break;
			case "citation_title": if (!newItem.title) newItem.title = value; break;
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
			case "citation_doi": if (!newItem.DOI && (doi = value.match(/^doi:(.*)/))) newItem.DOI = doi[1]; break;
			case "citation_abstract": newItem.abstractNote = value; break;
			case "citation_abstract_html_url": newItem.url = value; break;
			case "citation_pdf_url": if(!pdf) pdf = value; break;
			case "fulltext_pdf": if(!pdf) pdf = value; break;
			default:
				Zotero.debug("Ignoring meta tag: " + tag + " => " + value);
		}
	}
	Zotero.debug(pages + pdf);
	if (pdf) newItem.attachments = [{url:pdf, title:"AGU Full Text PDF", mimeType:"application/pdf"}];
	if (pages[0] && pages[1]) newItem.pages = pages.join('-')
	else newItem.pages = pages[0] ? pages[1] : (pages[1] ? pages[1] : "");
       newItem.complete();
}


function processList(items)
{
               items = Zotero.selectItems(items);
               var uris=new Array();

              if (!items)
                       {return true;}

              for (var i in items)
                       {uris.push(i);}

             Zotero.Utilities.processDocuments(uris, scrape,function() {Zotero.done(); });
             Zotero.wait();

             return true;
}

function doWeb(doc,url)
{
     var namespace = doc.documentElement.namespaceURI;
     var nsResolver = namespace ? function(prefix) {
     if (prefix == 'x') return namespace; else return null;
     } : null;

       //abstract
       var xpath='//p[@id="citation"]';
       if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext())
       {
               scrape(doc,url);
               return true;
       }

       //full text
       xpath='//frameset[@rows="98, *"]';
       if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext())
       {
               Zotero.Utilities.processDocuments(url+"0.shtml", scrape, function(){ Zotero.done(); });
               Zotero.wait();

               return true;
       }

       //issue page
       xpath='//tr/td/p[@class="title"]';
       if(doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext())
       {
               var titlerows=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null);
               xpath='//tr/td/p[@class="pubdate"]/a';
               var linkrows=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null);

               var titlerow;
               var linkrow;
               var items=new Array();

               while(titlerow=titlerows.iterateNext())
               {
                       linkrow=linkrows.iterateNext();
                       while(linkrow.textContent.indexOf("Abstract")<0)
                               {linkrow=linkrows.iterateNext();}
                       items[linkrow.href]=titlerow.textContent;
               }

               return processList(items);
       }


       //Search page
       if(doc.title.indexOf("Query Results")>-1)
       {
               //FASTFind Search

               xpath='//tr/td/h2';
               var tt=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE,null).iterateNext().textContent;
               if(tt.indexOf("FASTFIND")>-1)
               {
                       xpath='//tr/td[1]/font';
                       var citerows=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null);
                       xpath='//tr/td[2]/font/a';
                       var linkrows=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null);

                       var citerow;
                       var linkrow;
                       var items=new Array();
                       var temp;
                       var title;

                       while(citerow=citerows.iterateNext())
                       {
                               linkrow=linkrows.iterateNext();
                               items[linkrow.href]=Zotero.Utilities.trimInternal(citerow.textContent);
                       }
                       return processList(items);
               }
               else
               {
                       //Advanced Search

                       xpath='//tr/td[1]/font/a';
                       var titlerows=doc.evaluate(xpath, doc,nsResolver,XPathResult.ANY_TYPE, null);
                       xpath='//tr/td[2]/font/a';
                       var linkrows=doc.evaluate(xpath, doc, nsResolver,XPathResult.ANY_TYPE, null);

                       var titlerow;
                       var linkrow;
                       var items=new Array();
                       var temp;

                       while(titlerow=titlerows.iterateNext())
                       {
                               linkrow=linkrows.iterateNext();
                               while(linkrow.textContent.indexOf("Abstract")<0)
                                       {linkrow=linkrows.iterateNext();}

                               items[linkrow.href]=titlerow.textContent;
                       }
                       return processList(items);
               }
       }

}
