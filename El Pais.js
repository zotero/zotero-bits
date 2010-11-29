        {"translatorID":"2ddd2254-de8e-4b4a-924d-ce08718cfb0a","label":"El Pais","creator":"Joan Junyent Tarrida","target":"^http://www\\.elpais\\.com","minVersion":"1.0.0b3r1","maxVersion":"","priority":100,"inRepository":"1","translatorType":4,"lastUpdated":"2010-09-05 20:42:59"}

function detectWeb(doc, url) {

XPATH_RIGHT_SITE = "//a[contains(.,'EDICIONES EL PA')]";
   if (!doc.evaluate(XPATH_RIGHT_SITE, doc, null,
XPathResult.BOOLEAN_TYPE,
       null).booleanValue)
       return;

	var Rn = new RegExp("articulo");
	if(Rn.test(doc.location.href)) {
		return "newspaperArticle";
	} else { return "multiple"; }
}


function scrape(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

       var newItem = new Zotero.Item("newspaperArticle");
       newItem.publicationTitle = "El País";
       newItem.edition = "elpais.com";
       newItem.language = "Castellano";
       newItem.rights = "Copyright Diario EL PAÍS, S.L.";
       newItem.ISSN = "0213-4608";
       newItem.url = doc.location.href;
       newItem.repository = "Elpais.com";
// Captura version para imprimir
       newItem.attachments.push({url:doc.location.href+"?print=1", title:doc.title, mimeType:"text/html"});
// Autor
       var xpathautor ='//div[@class="firma"]/p/strong';
       var autor = doc.evaluate(xpathautor, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	if (autor) {
		var authors = autor.split(" / ");
		for each(var author in authors) {
			// fix capitalization
			var words = author.split(" ");
			for(var i in words) {
				words[i] = words[i][0].toUpperCase()+words[i].substr(1).toLowerCase();
			}
			author = words.join(" ");
			
			if(words[0] == "El") {
				newItem.creators.push({lastName:author, creatorType:"author", fieldMode:true});
			} else {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
			}
		}
	} else { newItem.creators.push({lastName:"El País", creatorType:"author", fieldMode:true}); }	

// Titulo
      var xpath = '//h1';
      newItem.title = Zotero.Utilities.trimInternal(doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
// Fecha
       var xpathfecha ='//div[@class="firma"]/p/text()[2]';
       newItem.date = Zotero.Utilities.trimInternal(doc.evaluate(xpathfecha, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
// Resumen
       var xpathpresentacion='//div[@class="presentacion"]/p[1]';
       var presentacion = doc.evaluate(xpathpresentacion, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
       if (presentacion){
	     presentacion = presentacion.textContent;
	     var resumen = presentacion;
       } else {
	     var xpathparrafo1 ='//div[@class="estructura_2col_1zq"]/div[@class="margen_n"]/p[1]';
	     var parrafo1 = doc.evaluate(xpathparrafo1, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	     var resumen = parrafo1;
       }
       newItem.abstractNote = Zotero.Utilities.trimInternal(resumen);
// Seccion
       //var xpathsection='//ul/li[@class="on"]/a[1]';
       //newItem.section = Zotero.Utilities.trimInternal(doc.evaluate(xpathsection, doc, nsResolver,XPathResult.ANY_TYPE, null).iterateNext().textContent);
// Extra
       var xpathextra = '//div[@class="firma"]/p';
       newItem.extra = "Firma: " + Zotero.Utilities.trimInternal(doc.evaluate(xpathextra,doc, nsResolver, XPathResult.ANY_TYPE,null).iterateNext().textContent);

       newItem.complete();

}

function doWeb(doc, url) {
	var Rn = new RegExp("articulo");
	if(Rn.test(doc.location.href)) {
		scrape(doc);
	}
	else {
		
	var items = Zotero.Utilities.getItemArray(doc, doc, "^http://www\.elpais\.com/articulo/+");
		var items2 = new Array();
		for (var i in items) {
			var Rcomen = new RegExp("#Enlace");
	                if (Rcomen.test(i)) {
		                Zotero.debug(i); } else {
		                items2.push(i);
	                }
		}
		items = Zotero.selectItems(items2);
		
	
		if(!items) {
			return true;
		}
		
		var uris = new Array();
		for (var i in items) {
			uris.push(i);
		}
		
		Zotero.Utilities.processDocuments(uris, function(doc) { scrape(doc) },
			function() { Zotero.done(); }, null);
		
		Zotero.wait();
	}
}
