{
        "translatorID": "fce388a6-a847-4777-87fb-6595e710b7e7",
        "label": "ProQuest 2",
        "creator": "Avram Lyon",
        "target": "^https?://search.proquest.com[^/]*/pqrl/docview/",
        "minVersion": "2.0",
        "maxVersion": "",
        "priority": 100,
        "inRepository": "1",
        "translatorType": 4,
        "lastUpdated": "2011-03-01 08:00:11"
}

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	var record_rows = doc.evaluate('//div[@class="display_record_indexing_row"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
	if (record_rows.iterateNext()) {
		return "journalArticle";	
	}
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	 var hostRegexp = new RegExp("^(https?://[^/]+)/");
        var hMatch = hostRegexp.exec(url);
        var host = hMatch[1];

	
	var item = new Zotero.Item();
	var record_rows = doc.evaluate('//div[@class="display_record_indexing_row"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
	var record_row;
	item.place = [];
	var account_id;
	while (record_row = record_rows.iterateNext()) {
		var field = doc.evaluate('./div[@class="display_record_indexing_fieldname"]', record_row, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.trim();
		var value = doc.evaluate('./div[@class="display_record_indexing_data"]', record_row, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent.trim();
		var valueAResult = doc.evaluate('./div[@class="display_record_indexing_data"]/a', record_row, nsResolver, XPathResult.ANY_TYPE, null);
		var valueA;
		var valueAArray = [];
		if (valueAResult) {
			while(valueA = valueAResult.iterateNext()) {
				valueAArray.push(valueA.textContent);
			}
		}
		switch (field) {
			case "Title":
					item.title = value; break;
			case "Authors":
					item.creators = valueAArray.map(
							function(author) {
								return Zotero.Utilities.cleanAuthor(author,"author",true);
							});
					break;
			case "Publication title":
					item.publicationTitle = value; break;
			case "Volume":
					item.volume = value; break;
			case "Issue":
					item.issue = value; break;
			case "Pages":
					item.pages = value; break;
			case "Number of pages":
					item.numPages = value; break;
			case "Publication year": 
			case "Year":
					item.date = (item.date) ? item.date : value; break;
			case "Publication Date":
					item.date = value; break;
			case "Publisher":
					item.publisher = value; break;
			case "Place of Publication":
					item.place[0] = value; break;
			case "Country of publication":
					item.place[1] = value; break;
			case "ISSN":
					item.ISSN = value; break;
			case "Source type":
			case "Document Type":
					item.itemType = (mapToZotero(value)) ? mapToZotero(value) : item.itemType; break;
			case "Copyright":
					item.rights = value; break;
			case "Database":
					item.libraryCatalog = value; break;
			case "Language of Publication":
					item.language = value; break;
			case "Subjects":
					item.tags = valueAArray; break;
			default: Zotero.debug("Discarding unknown field '"+field+"' => '" +value+ "'");
		}
	}
	
	var abs = doc.evaluate('//div[@id="abstract_field"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
	if (abs) {
		item.abstractNote = abs.iterateNext().textContent.replace(/\[ Show less \]/,"").trim();
	}
	
	var pdf = doc.evaluate('//a[@class="formats_base_sprite format_pdf"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (pdf) {
		var pdfDoc = Zotero.Utilities.retrieveDocument(pdf.href);
		var realLink = pdfDoc.evaluate('//div[@id="pdffailure"]/div[@class="body"]/a', pdfDoc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (realLink) {
			item.attachments.push({url:realLink.href, title:"ProQuest PDF", mimeType:"application/pdf"});
		}
	}
	
	item.place = item.place.join(', ');
	if(!item.itemType) item.itemType="journalArticle";
	item.complete();
}

function mapToZotero (type) {
	var map = {
	"Scholarly Journals" : "journalArticle",
	"Book Review-Mixed" : null, // FIX AS NECESSARY
	"Reports" : "report",
	"REPORT" : "report"
	}
	if (map[type]) return map[type];
	Zotero.debug("No mapping for type: "+type);
	return false;
}