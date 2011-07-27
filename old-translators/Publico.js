{
        "translatorID": "4f5d687a-2af9-476b-8717-46b9b93afc43",
        "label": "Publico.es",
        "creator": "Joan Junyent Tarrida",
        "target": "^http://www\\.publico\\.es/",
        "minVersion": "1.0.0b3r1",
        "maxVersion": "",
        "priority": 100,
        "inRepository": "1",
        "translatorType": 4,
        "lastUpdated": "2010-09-12 18:08:37"
}

        function detectWeb(doc, url) {
	XPATH_RIGHT_SITE = '//div[@id="cuerpoNoticia"]';
		if (!doc.evaluate(XPATH_RIGHT_SITE, doc, null,
			XPathResult.BOOLEAN_TYPE,
		    null).booleanValue)
		return;
	return "newspaperArticle";
}

function scrape(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

       var newItem = new Zotero.Item("newspaperArticle");
       newItem.publicationTitle = "Público";
       newItem.edition = "publico.es";
       newItem.language = "Castellano";
       newItem.rights = "Copyright Diario Público. CC-by-sa";
       newItem.ISSN = "";
       newItem.url = doc.location.href;
       newItem.repository = "publico.es";

// Titulo
      var xpath = '//h1';
      var titulo = Zotero.Utilities.trimInternal(doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
      newItem.title = titulo;
Zotero.debug(titulo);

// Snapshot
       newItem.attachments.push({url:doc.location.href+"/version-imprimible", title:"Público - "+titulo, mimeType:"text/html"});
             
// Fecha
	var xpathfecha ='//span[@class="fecha"]';
	newItem.date = Zotero.Utilities.trimInternal(doc.evaluate(xpathfecha, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
// Lugar
		var xpathlugar ='//span[@class="lugar"]';
		newItem.place = Zotero.Utilities.trimInternal(doc.evaluate(xpathlugar, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
// Autor
       var xpathautor ='//span[@class="autor"]';
       var autor = doc.evaluate(xpathautor, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	if (autor) {
		var authors = autor.split(" / ");
		for each(var author in authors) {
			

				newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
				Zotero.debug(author);

		}
	} else { newItem.creators.push({lastName:"Público", creatorType:"author", fieldMode:true}); }	
	
// Resumen
	var xpathresumen ='//div[@id="cuerpoNoticia"]/p[1]';
	newItem.abstractNote = Zotero.Utilities.trimInternal(doc.evaluate(xpathresumen, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);

	
       newItem.complete();

}

function doWeb(doc, url) {
		scrape(doc);
		Zotero.wait();
}
