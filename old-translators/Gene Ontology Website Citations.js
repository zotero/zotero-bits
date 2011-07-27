{"translatorID":"cee0cca2-e82a-4618-b6cf-16327970169d","translatorType":4,"label":"GO Website Citations","creator":"girlwithglasses","target":".*geneontology.org/.*html","minVersion":"1.0","maxVersion":"","priority":100,"inRepository":false,"lastUpdated":"2009-06-14 21:28:58"}

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI; var nsResolver = namespace ? function(prefix) {
		if (prefix == "x" ) return namespace; else return null;
	} : null;

	var xPath = '//cite';
	var cites = doc.evaluate(xPath, doc, null, XPathResult.ANY_TYPE, null);
	var c = cites.iterateNext();

	while (c) {
		if (c.className && c.className.match('hcite') && c.className.match('paper')) {
			return "multiple journalArticle";
		}
	}
	return;
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var articleObjects = new Array();
	var articleTitles = new Array();
	var myX = '//cite[@class="hcite paper"] | //cite[@class="hcite paper"]//*[@class]';
	var cites = doc.evaluate(myX, doc, nsResolver, XPathResult.ANY_TYPE, null);
	var n_cites = 0;

	var myPMID = '//cite//*[@class="pmid"]';
	var pmids = doc.evaluate(myPMID, doc, nsResolver, XPathResult.ANY_TYPE, null);
	var pmid_list = new Array();
	var unknown_list = new Array();
	var x;
	while (x = pmids.iterateNext()) {
		if (x.href && x.href.match('pubmed')) {
			// get the number
			var n = x.href.lastIndexOf("/");
			n++;
			pmid_list.push(x.href.substr(n));
			Zotero.debug("Got a pubmed href! " + x.href.substr(n));
/*		      Zotero.Utilities.HTTP.doGet(x.href, function(text) {
	                // load translator for PubMed
	       	         var translator = Zotero.loadTranslator("import");
       		         translator.setTranslator("fcf41bed-0cbc-3704-85c7-8062a0068a7a");
       		         translator.setString(text);
//			Zotero.debug(text);
			translator.translate();
			});
*/
		}
		else {
			unknown_list.push(x);
		}
	}
	if (unknown_list.length > 0) {
		Zotero.debug("Couldn't work out what to do with these refs: " + unknown_list.join("\n"));
	}
	if (pmid_list.length > 0) {
		Zotero.debug( "Found " + pmid_list.length + " PMIDs!" );
	}
	// get the data from the NCBI server
	var pmids = pmid_list.join(",");
	var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=" + pmids;
	Zotero.debug("url is " + url);
	Zotero.Utilities.HTTP.doGet(url, function(text) {
		// Remove xml parse instruction and doctype

		Zotero.debug("got this text: " + text);

		text = text.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\?xml[^>]*\?>/, "");

		var xml = new XML(text);

		for(var i=0; i<xml.PubmedArticle.length(); i++) {
			var citation = xml.PubmedArticle[i].MedlineCitation;
			var PMID = citation.PMID.text().toString();

			var newItem = new Zotero.Item("journalArticle");
			newItem.url = "http://www.ncbi.nlm.nih.gov/pubmed/" + PMID;
			newItem.extra = "PMID: "+PMID;
			// add attachments
			if(doc) {
				newItem.attachments.push({document:doc, title:"PubMed Snapshot"});
			} else {
				var url = "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=pubmed&cmd=Retrieve&dopt=AbstractPlus&list_uids="+PMID;
				newItem.attachments.push({url:url, title:"PubMed Snapshot",
							 mimeType:"text/html"});
			}

			var article = citation.Article;
			if(article.ArticleTitle.length()) {
				var title = article.ArticleTitle.text().toString();
				if(title.substr(-1) == ".") {
					title = title.substring(0, title.length-1);
				}
				newItem.title = title;
			}

			if (article.Pagination.MedlinePgn.length()){
				var fullPageRange = article.Pagination.MedlinePgn.text().toString();
				var pageRange = fullPageRange.match(/\d+-\d+/g);
				for (var j in pageRange) {
					var pageRangeStart = pageRange[j].match(/^\d+/)[0];
					var pageRangeEnd = pageRange[j].match(/\d+$/)[0];
					if (pageRangeStart.length > pageRangeEnd.length) {
						pageRangeEnd = pageRangeStart.substring(0,pageRangeStart.length-pageRangeEnd.length) + pageRangeEnd;
						fullPageRange = fullPageRange.replace(pageRange[j],pageRangeStart+"-"+pageRangeEnd);
					}
				}
				newItem.pages = fullPageRange;
			}

			if(article.Journal.length()) {
				var issn = article.Journal.ISSN.text().toString();
				if(issn) {
					newItem.ISSN = issn;
				}

				if(citation.Article.Journal.ISOAbbreviation.length()) {
					newItem.journalAbbreviation = Zotero.Utilities.superCleanString(citation.Article.Journal.ISOAbbreviation.text().toString());
				} else if(citation.MedlineJournalInfo.MedlineTA.length()) {
					newItem.journalAbbreviation = Zotero.Utilities.superCleanString(citation.MedlineJournalInfo.MedlineTA.text().toString());
				}

				if(article.Journal.Title.length()) {
					newItem.publicationTitle = Zotero.Utilities.superCleanString(article.Journal.Title.text().toString());
				} else if(newItem.journalAbbreviation.length()) {
					newItem.publicationTitle = newItem.journalAbbreviation;
				}

				if(article.Journal.JournalIssue.length()) {
					newItem.volume = article.Journal.JournalIssue.Volume.text().toString();
					newItem.issue = article.Journal.JournalIssue.Issue.text().toString();
					if(article.Journal.JournalIssue.PubDate.length()) {	// try to get the date
						if(article.Journal.JournalIssue.PubDate.Day.text().toString() != "") {
							newItem.date = article.Journal.JournalIssue.PubDate.Month.text().toString()+" "+article.Journal.JournalIssue.PubDate.Day.text().toString()+", "+article.Journal.JournalIssue.PubDate.Year.text().toString();
						} else if(article.Journal.JournalIssue.PubDate.Month.text().toString() != "") {
							newItem.date = article.Journal.JournalIssue.PubDate.Month.text().toString()+" "+article.Journal.JournalIssue.PubDate.Year.text().toString();
						} else if(article.Journal.JournalIssue.PubDate.Year.text().toString() != "") {
							newItem.date = article.Journal.JournalIssue.PubDate.Year.text().toString();
						} else if(article.Journal.JournalIssue.PubDate.MedlineDate.text().toString() != "") {
							newItem.date = article.Journal.JournalIssue.PubDate.MedlineDate.text().toString();
						}
					}
				}
			}

			if(article.AuthorList.length() && article.AuthorList.Author.length()) {
				var authors = article.AuthorList.Author;
				for(var j=0; j<authors.length(); j++) {
					var lastName = authors[j].LastName.text().toString();
					var firstName = authors[j].FirstName.text().toString();
					if(firstName == "") {
						var firstName = authors[j].ForeName.text().toString();
					}
					if(firstName || lastName) {
						newItem.creators.push({lastName:lastName, firstName:firstName});
					}
				}
			}
			if (citation.MeshHeadingList && citation.MeshHeadingList.MeshHeading) {
				var keywords = citation.MeshHeadingList.MeshHeading;
				for (var k = 0 ; k < keywords.length() ; k++) {
					newItem.tags.push(keywords[k].DescriptorName.text().toString());
				}
			}
			newItem.abstractNote = article.Abstract.AbstractText.toString()

			newItem.DOI = xml.PubmedArticle[i].PubmedData.ArticleIdList.ArticleId.(@IdType == "doi" ).text().toString();
			newItem.publicationTitle = Zotero.Utilities.capitalizeTitle(newItem.publicationTitle);
//			newItem.complete();
//			articles.push(newItem);
			articleObjects[ newItem.url ] = newItem;
			articleTitles[ newItem.url ] = newItem.title;
			Zotero.debug(newItem);
		}

		var items = Zotero.selectItems(articleTitles);
		var articles = new Array();
		for (var i in items)
		{	articleObjects[i].complete();
			articles.push( articleObjects[i] );
		}
//		items = Zotero.selectItems(articles);

		Zotero.done();
	});

	Zotero.wait();
}
