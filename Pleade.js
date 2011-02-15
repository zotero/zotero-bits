{
        "translatorID":"ce68b0ed-3137-4e38-b691-f3bc49bc1497",
        "label":"Pleade",
        "creator":"DIA Modou",
        "target":"base=ead|ead\\.html",
        "minVersion":"2.0",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-01-05 18:50:04"
}

/*
Pleade: Outil de publication pour instruments de recherche, notices
d'autorités
et corpus d'images numérisés.
Copyright (C) 2003-2011 AJLSM

AJLSM
17, rue Vital Carles
33000 Bordeaux, France
info@ajlsm.com

Paternité : Vous devez citer le nom de l'auteur original de la manière
indiquée par l'auteur de l'oeuvre ou le titulaire des droits qui vous
confère cette autorisation (mais pas d'une manière qui suggérerait
qu'ils vous soutiennent ou approuvent votre utilisation de l'oeuvre).
Pas d'Utilisation Commerciale : Vous n'avez pas le droit d'utiliser
cette création à des fins commerciales.
Pas de Modification : Vous n'avez pas le droit de modifier, de
transformer ou d'adapter cette création.
*/

/**
 * Fonction fournie par zotéro
 */
function detectWeb(doc, url) {
	if (url.match("id=") && url.match("ead.html")) {
		return "book";
	}
	else if (url.match("base=ead") && url.match("results.html")) {
		return "multiple";
	}
}

/**
 * function rechercher-remplacer
 * @expr : chaine à traiter
 * @a : chaine à rechercher
 * @b : chaine qui remplace @a
 */
function Remplace(expr,a,b) {
	var i=0
	while (i!=-1) {
		i=expr.indexOf(a,i);
		if (i>=0) {
			expr=expr.substring(0,i)+b+expr.substring(i+a.length);
			i+=b.length;
		}
	}
	return expr
}

/**
 * Récupére et traite les auteurs.
 * On considére que dans les doument ead, le nom des auteurs doit toujours précédé le prénom
 * @newItem : variable fournie par zotéro , contenant les spécification d'un élément
 * @tagAuthor :  le contenu d'une balise author
 */
function getAuthors(newItem, author, managed) {
	
	/* On considére que si la phrase contient plus de 4 mots, on est en présence d'un text */
	if(managed=="true") newItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author"));
	//else newItem.creators = author;Zotero.debug(managed);
}

/**
 * Récupére et traite les subject
 * On considére que dans les doument ead, le nom des auteurs doit toujours précédé le prénom
 * @newItem : variable fournie par zotéro , contenant les spécification d'un élément
 * @tagTags :  le contenu d'une super-balise book
 */
function getTag(newItem, book) {
	var Tags = new Array();
	
	for(var i=0; i<book.subject.length(); i++) {
		Tags.push(Zotero.Utilities.superCleanString(book.subject[i].text().toString()));
	}

	newItem.abstractNote = Tags;
}

/**
* Récupére les éléments d'un item et les place dans zotero.
* @url : l'url de la fonction de la fonction pleade qui permet d'accéder à l'élément
*/
function scrape(url) {

	// Url de la fonction pleade à appeler
	Zotero.debug("Récupération d'un term :  "  + url);

	Zotero.Utilities.HTTP.doGet(url, function(text) {

		text = text.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\?xml[^>]*\?>/, "");
		text = text.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/-/gm, "");});
		text = text.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/:/gm, "");});
		text = Zotero.Utilities.trim(text);

		XML.prettyPrinting = false;
		XML.ignoreWhitespace = false;
		var xml = new XML(text);

		for(var i=0 ; i <xml.book.length() ; i++) {
			var newItem = new Zotero.Item("book");
			var book = xml.book[i];

			newItem.url = Zotero.Utilities.superCleanString(book.link.text().toString());
			newItem.title = Zotero.Utilities.superCleanString(book.title.text().toString());
			newItem.seriesNumber = Zotero.Utilities.superCleanString(book.num.text().toString());
			for(var j=0; j<book.author.length(); j++) getAuthors(newItem, Zotero.Utilities.superCleanString(book.author[j].text().toString()));
			newItem.date = Zotero.Utilities.superCleanString(book.date.text().toString());
			newItem.publisher = Zotero.Utilities.superCleanString(book.publisher.text().toString());
			newItem.place = Zotero.Utilities.superCleanString(book.publisherAddr.text().toString());
			newItem.language = Zotero.Utilities.superCleanString(book.lang.text().toString());
			newItem.rights = Zotero.Utilities.superCleanString(book.rights.text().toString());
			getTag(newItem, book);
			//newItem.extra.push({url: Zotero.Utilities.superCleanString(book.doclink.@href.text().toString()), title: Zotero.Utilities.superCleanString(book.doclink.text().toString()), mimeType: Zotero.Utilities.superCleanString(book.doclink.@mime-type.text().toString()), snapshot: false});
			newItem.archiveLocation = Zotero.Utilities.superCleanString(book.archLoc.text().toString());
			newItem.libraryCatalog = Zotero.Utilities.superCleanString(book.serverName.text().toString());
			newItem.callNumber = Zotero.Utilities.superCleanString(book.cote.text().toString());
	
			newItem.complete();
		}

		Zotero.done();
	})
	Zotero.wait();
}

/*
* Retourne le nombre de terms d'une recherche
*/
function getNbrTerms(text)
{
	var temp1 = text.substr(text.indexOf("nb")+4,10);
	var nbr = temp1.substring(0,temp1.indexOf("\""));

	return parseInt(nbr);
}

/**
* Dans une page correspondant à un résultat de recherche, cette fonction s'occupe d'aller chercher les items de la recherche.
* Il fait ensuite appel à la fonction geteadIds qui s'occupe de traiter chaque item.
*/
function getMultipleQid2(doc,url)
{
	var qId;

	Zotero.Utilities.HTTP.doGet(url, function(text) {

		text = text.replace(/<!DOCTYPE[^>]*>/, "").replace(/<\?xml[^>]*\?>/, "");
		text = Zotero.Utilities.trim(text);
		
		var temp1 = text.substr(text.indexOf("var oid")+11,30);
		qId = temp1.substring(0,temp1.indexOf("\""));
		Zotero.debug("qId " + qId);
		
		var newURL = url.substring(url.indexOf("http"), url.indexOf("results.html"))+"functions/zotero/results/"+qId;
		Zotero.debug("Récupération des terms: " + newURL);

		//Récupération des multiple eadId et des titres
		Zotero.Utilities.HTTP.doGet(newURL, function(text2) {
	
			text2 = text2.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/-/gm, "");});
			text2 = text2.replace(/(<[^!>][^>]*>)/g, function replacer(str, p1, p2, offset, s) {return str.replace(/:/gm, "");});
			text2 = Zotero.Utilities.trim(text2);


			var temp = text2.substring(text2.indexOf("\<title\>"),text2.lastIndexOf("\<\/pleadeId\>")+11);
			var pids = new Array();
			
			var max=text2.substring(text2.indexOf("nbrresult\>")+20, text2.lastIndexOf("\<nbrresult"));
			max=parseInt(max.substring(max.indexOf("\>")+1, max.lastIndexOf("\<")));
			
			//boucle qui récupére les terms dans le résultat de la fonction sdx-results
			for(var i=0; i< max; i++) 
			{
				var title = temp.substring(temp.indexOf("\<title\>")+7,temp.indexOf("\<\/title\>"));
				var pleadeId = temp.substring(temp.indexOf("\<pleadeId\>")+10,temp.indexOf("\<\/pleadeId\>"));
				temp = temp.substring(temp.indexOf("\<result\>")+8,temp.lastIndexOf("\<\/pleadeId\>")+11);
		
				pids[pleadeId] = title;
			}

			var newURL2 = url.substring(url.indexOf("http"), url.indexOf("results.html"))+"functions/zotero/";
		
			var tpids = Zotero.selectItems(pids);
		
			for(var i in tpids) {
				scrape(newURL2+i+".xml?fragment=null");
			}

		})

		Zotero.done();
	})
	Zotero.wait();
}

/**
* Fonction fournie par zotéro
*/
function doWeb(doc, url) {
	var pids = new Array();
	var cpt = 0;
	var title;
	var pleadeId;
	var fragmentId;
	var text;
	
	if (detectWeb(doc, url) == "multiple") {
		getMultipleQid2(doc,url);
	}
	else if (detectWeb(doc, url) == "book") {

		//fabrication de l'id du document
		if(url.indexOf("\&") != -1) pleadeId = url.substring(url.indexOf("id=")+3,url.indexOf("\&"));
		else if(url.indexOf("\&") == -1) pleadeId = url.substring(url.indexOf("id=")+3,url.indexOf("#"));
		else pleadeId = url.substring(url.indexOf("id=")+3,url.length);
		
		//fabrication de l'id du fragment actuel
		var temp1 = url.substring(url.indexOf("#"),url.length);
		var temp2 = temp1.substring(temp1.indexOf(pleadeId), temp1.length);
		fragmentId = temp2.substring(0,temp2.indexOf("%"));

		scrape(url.substring(url.indexOf("http"), url.indexOf("ead.html"))+"functions/zotero/"+pleadeId+".xml?fragment="+fragmentId);
	}
}
