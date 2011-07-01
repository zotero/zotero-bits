{
        "translatorID": "9575e804-219e-4cd6-813d-9b690cbfc0fc",
        "label": "PLoS Journals",
        "creator": "Michael Berkowitz And Rintze Zelle",
        "target": "^http://www\\.plos(one|ntds|compbiol|pathogens|genetics|medicine|biology)\\.org/(search|article)/",
        "minVersion": "2.1",
        "maxVersion": "",
        "priority": 100,
        "inRepository": true,
        "translatorType": 4,
        "lastUpdated": "2011-07-02 01:01:44"
}

function detectWeb(doc, url) {
	if (url.indexOf("Search.action") != -1 || url.indexOf("browse.action") != -1 || url.indexOf("browseIssue.action") != -1) {
			return "multiple";
	} else if (url.indexOf("article/info") != -1) {
		return "journalArticle";
	}
}


function getSelectedItems(doc, articleRegEx) {
	var items = new Object();
	var texts = new Array();
	var articles = doc.evaluate(articleRegEx, doc, null, XPathResult.ANY_TYPE, null);
	var next_art = articles.iterateNext();
	while (next_art) {
		items[next_art.href] = next_art.textContent;
		next_art = articles.iterateNext();
	}
	items = Zotero.selectItems(items);
	for (var i in items) {
		texts.push(i);
	}
	return(texts);
}

function doWeb(doc, url) {
	if (url.indexOf("Search.action") != -1 || url.indexOf("browse.action") != -1) {
		var articlex = '//span[@class="article"]/a';
		var texts = getSelectedItems(doc, articlex);
	} else if (url.indexOf("browseIssue.action") != -1) {
		var articlex = '//div[@class="article"]/h3/a';
		var texts = getSelectedItems(doc, articlex);
	} else {
		var texts = new Array(url);
	}

	var risLinks = new Array();
	for (var i in texts) {
		texts[i]=texts[i].replace(/;jsessionid[^;]+/, "");//Strip sessionID string
		texts[i]=texts[i].replace(/\?.*/, "");//Strip referrer messes
		var risLink = texts[i].replace("info", "getRisCitation.action?articleURI=info");
		risLinks.push(risLink);
	}

	Zotero.Utilities.HTTP.doGet(risLinks, function(text) {
		var risLink = texts.shift();
        text = text.replace(/^N2  -.*^[A-Z0-9]{2}/m,'');
        Zotero.debug(text);
        var pdfURL = risLink.replace("info", "fetchObjectAttachment.action?uri=info") + '&representation=PDF';
		var doi = risLink.match(/doi(\/|%2F)(.*)$/)[2];
		text = text.replace(text.match(/(^ER[^\n]*)([^\0]*)/m)[2],"");//Remove stray M3-tag at the end of the RIS record
		text = text.replace("%2F","/");//Replace %2F characters by forward slashes in url
		doi  = doi.replace("%2F","/");//Replace %2F characters by forward slashes in doi
		
		// grab the UR link for a snapshot then blow it away 
		var snapshot = text.match(/UR\s+\-\s+(.*)/)
        if (snapshot) snapshot = snapshot[1]
        else snapshot = false;
		text = text.replace(/UR\s+\-(.*)/, "");
				
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			item.url = snapshot;
			item.attachments.push({url:pdfURL, title:"PLoS Full Text PDF", mimeType:"application/pdf"});
			item.attachments.push({url:snapshot, title:"PLoS Snapshot", mimeType:"text/html", snapshot:true});
			item.DOI = doi;
			item.repository = item.publicationTitle;
			item.complete();
		});
		translator.translate();
	}, function() {Zotero.done();});
	Zotero.wait();
}


/** BEGIN TEST CASES **/
var testCases = [
    {
        "type": "web",
        "url": "http://www.plosone.org/article/info:doi/10.1371/journal.pone.0012968",
        "items": [
            {
                "itemType": "journalArticle",
                "creators": [
                    {
                        "lastName": "Choi",
                        "firstName": "Jin Won ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Kim",
                        "firstName": "Sujung ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Kim",
                        "firstName": "Tae Min ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Kim",
                        "firstName": "Young Min ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Seo",
                        "firstName": "Hee Won ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Park",
                        "firstName": "Tae Sub ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Jeong",
                        "firstName": "Jae-Wook ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Song",
                        "firstName": "Gwonhwa ",
                        "creatorType": "author"
                    },
                    {
                        "lastName": "Han",
                        "firstName": "Jae Yong ",
                        "creatorType": "author"
                    }
                ],
                "notes": [],
                "tags": [],
                "seeAlso": [],
                "attachments": [
                    {
                        "url": false,
                        "title": "PLoS Full Text PDF",
                        "mimeType": "application/pdf"
                    },
                    {
                        "url": false,
                        "title": "PLoS Snapshot",
                        "mimeType": "text/html",
                        "snapshot": true
                    }
                ],
                "title": "Basic Fibroblast Growth Factor Activates MEK/ERK Cell Signaling Pathway and Stimulates the Proliferation of Chicken Primordial Germ Cells",
                "date": "2010",
                "abstractNote": "Long-term maintenance of avian primordial germ cells (PGCs) in vitro has tremendous potential because it can be used to deepen our understanding of the biology of PGCs. A transgenic bioreactor based on the unique migration of PGCs toward the recipients' sex cord via the bloodstream and thereby creating a germline chimeric bird has many potential applications. However, the growth factors and the signaling pathway essential for inducing proliferation of chicken PGCs are unknown.\u000a\u000aTherefore, we conducted this study to investigate the effects of various combinations of growth factors on the survival and proliferation of PGCs under feeder-free conditions. We observed proliferation of PGCs in media containing bFGF. Subsequent characterization confirmed that the cultured PGCs maintained expression of PGC-specific markers, telomerase activity, normal migrational activity, and germline transmission. We also found that bFGF activates the mitogen-activated protein kinase kinase/extracellular-signal regulated kinase (MEK/ERK) signaling. Also, the expression of 133 transcripts was reversibly altered by bFGF withdrawal.\u000a\u000aOur results demonstrate that chicken PGCs can be maintained in vitro without any differentiation or dedifferentiation in feeder free culture conditions, and subsequent analysis revealed that bFGF is one of the key factors that enable proliferation of chicken PGCs via MEK/ERK signaling regulating downstream genes that may be important for PGC proliferation and survival.\u000a",
                "publicationTitle": "PLoS ONE",
                "journalAbbreviation": "PLoS ONE",
                "volume": "5",
                "issue": "9 ",
                "pages": "e12968",
                "publisher": "Public Library of Science",
                "url": "http://dx.doi.org/10.1371/journal.pone.0012968",
                "DOI": "10.1371/journal.pone.0012968",
                "libraryCatalog": "PLoS ONE"
            }
        ]
    }
]
/** END TEST CASES **/
