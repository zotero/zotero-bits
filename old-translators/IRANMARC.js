{
        "translatorID": "0dc5fbe8-f6b0-46e4-aafb-73b3a75c7e59",
        "label": "IRANMARC",
        "creator": "CRCIS",
        "target": "txt",
        "minVersion": "1.0",
        "maxVersion": "",
        "priority": 100,
        "inRepository": true,
        "translatorType": 1,
        "lastUpdated": "2011-06-08 20:04:25"
}

//most of the code is from "MARC" translator by "Simon Kornblith" and "Sylvain Machefert"

function detectImport() {
	var marcRecordRegexp = /^[0-9]{5}[a-z ]{3}$/
	var read = Zotero.read(8);
	if(marcRecordRegexp.test(read)) {
		return true;
	}
}
//test
var fieldTerminator = "\x1E";
var recordTerminator = "\x1D";
var subfieldDelimiter = "\x1F";

/*
 * CLEANING FUNCTIONS
 */
 

 

// general purpose cleaning
function clean(value) {
	value = value.replace(/^[\s\.\,\/\:;]+/, '');
	value = value.replace(/[\s\.\,\/\:;]+$/, '');
	value = value.replace(/ +/g, ' ');

	
	var char1 = value[0];
	var char2 = value[value.length-1];
	if((char1 == "[" && char2 == "]") || (char1 == "(" && char2 == ")")) {
		// chop of extraneous characters
		return value.substr(1, value.length-2);
	}
	
	return value;
}

// number extraction
function pullNumber(text) {
	//<abszh>
	//convert persian and arabic numbers to latin digits
	var ntext='';
	for (var i=0; i<text.length; i++) {
		if ((text.charCodeAt(i)>=0x06F0) && (text.charCodeAt(i)<=0x06F9)) { 
			ntext+=String.fromCharCode(text.charCodeAt(i)-0x06F0+48);
		} else if ((text.charCodeAt(i)>=0x0660) && (text.charCodeAt(i)<=0x0669)) {
			ntext+=String.fromCharCode(text.charCodeAt(i)-0x0660+48);
		} else {
			ntext+=text[i];
		}
	}
	text=ntext;
	//</abszh>


	var pullRe = /[0-9]+/;
	var m = pullRe.exec(text);
	if(m) {
		return m[0];
	}
}

// ISBN extraction
function pullISBN(text) {
	var pullRe = /[0-9X\-]+/;
	var m = pullRe.exec(text);
	if(m) {
		return m[0];
	}
}

// corporate author extraction
function corpAuthor(author) {
	return {lastName:author, fieldMode:true};
}

// regular author extraction
function author(author, type, useComma) {
	return Zotero.Utilities.cleanAuthor(author, type, useComma);
}

/*
 * END CLEANING FUNCTIONS
 */

var record = function() {
	this.directory = new Object();
	this.leader = "";
	this.content = "";
	
	// defaults
	this.indicatorLength = 2;
	this.subfieldCodeLength = 2;
}

// import a binary MARC record into this record
record.prototype.importBinary = function(record) {
	// get directory and leader
	var directory = record.substr(0, record.indexOf(fieldTerminator));
	this.leader = directory.substr(0, 24);
	var directory = directory.substr(24);
	
	// get various data
	this.indicatorLength = parseInt(this.leader[10], 10);
	this.subfieldCodeLength = parseInt(this.leader[11], 10);
	var baseAddress = parseInt(this.leader.substr(12, 5), 10);
	
	// get record data
	var contentTmp = record.substr(baseAddress);
	
	// MARC wants one-byte characters, so when we have multi-byte UTF-8
	// sequences, add null characters so that the directory shows up right. we
	// can strip the nulls later.
	this.content = "";
	for(i=0; i<contentTmp.length; i++) {
		this.content += contentTmp[i];
		if(contentTmp.charCodeAt(i) > 0x00FFFF) {
			this.content += "\x00\x00\x00";
		} else if(contentTmp.charCodeAt(i) > 0x0007FF) {
			this.content += "\x00\x00";
		} else if(contentTmp.charCodeAt(i) > 0x00007F) {
			this.content += "\x00";
		}
	}
	
	// read directory
	for(var i=0; i<directory.length; i+=12) {
		var tag = parseInt(directory.substr(i, 3), 10);
		var fieldLength = parseInt(directory.substr(i+3, 4), 10);
		var fieldPosition = parseInt(directory.substr(i+7, 5), 10);
		
		if(!this.directory[tag]) {
			this.directory[tag] = new Array();
		}
		this.directory[tag].push([fieldPosition, fieldLength]);
	}
}

// add a field to this record
record.prototype.addField = function(field, indicator, value) {
	field = parseInt(field, 10);
	// make sure indicator is the right length
	if(indicator.length > this.indicatorLength) {
		indicator = indicator.substr(0, this.indicatorLength);
	} else if(indicator.length != this.indicatorLength) {
		indicator = Zotero.Utilities.lpad(indicator, " ", this.indicatorLength);
	}
	
	// add terminator
	value = indicator+value+fieldTerminator;
	
	// add field to directory
	if(!this.directory[field]) {
		this.directory[field] = new Array();
	}
	this.directory[field].push([this.content.length, value.length]);
	
	// add field to record
	this.content += value;
}

// get all fields with a certain field number
record.prototype.getField = function(field) {
	field = parseInt(field, 10);
	var fields = new Array();
	Zotero.debug("directory="+this.directory);  //abszh
	// make sure fields exist
	if(!this.directory[field]) {
		return fields;
	}
	
	// get fields
	for(var i in this.directory[field]) {
		var location = this.directory[field][i];
		
		// add to array, replacing null characters
		fields.push([this.content.substr(location[0], this.indicatorLength),
		             this.content.substr(location[0]+this.indicatorLength,
		               location[1]-this.indicatorLength-1).replace(/\x00/g, "")]);
	}
	
	Zotero.debug("fields is"+fields); //abszh
	return fields;
}

// get subfields from a field
record.prototype.getFieldSubfields = function(tag) { // returns a two-dimensional array of values
	var fields = this.getField(tag);
	var returnFields = new Array();
	
	for(var i in fields) {
		returnFields[i] = new Object();
		
		var subfields = fields[i][1].split(subfieldDelimiter);
		if (subfields.length == 1) {
			returnFields[i]["?"] = fields[i][1];
		} else {
			for(var j in subfields) {
				if(subfields[j]) {
					var subfieldIndex = subfields[j].substr(0, this.subfieldCodeLength-1);
					if(!returnFields[i][subfieldIndex]) {
						returnFields[i][subfieldIndex] = subfields[j].substr(this.subfieldCodeLength-1);
					}
				}
			}
		}
	}
	
	//<abszh>
	//omit \u200d character. many IRANMARC records from "nlai.ir" contain this useless character
	//failing to remove these extra characters results in incorrectly seperated characters in imported words
	for (var j in returnFields) {
		for (var k in returnFields[j]) {
			Zotero.debug("returnFileds"+j+" "+k+" = "+returnFields[j][k]);
			returnFields[j][k]=returnFields[j][k].replace(/\u200d/g,'');
		}
	}
	//</abszh>
	
	return returnFields;
}

// add field to DB
record.prototype._associateDBField = function(item, fieldNo, part, fieldName, execMe, arg1, arg2) {
	var field = this.getFieldSubfields(fieldNo);
	
	Zotero.debug('MARC: found '+field.length+' matches for '+fieldNo+part);
	if(field) {
		for(var i in field) {
			var value = false;
			for(var j=0; j<part.length; j++) {
				var myPart = part[j];
				if(field[i][myPart]) {
					if(value) {
						value += " "+field[i][myPart];
					} else {
						value = field[i][myPart];
					}
				}
			}
			if(value) {
				value = clean(value);
				
				if(execMe) {
					value = execMe(value, arg1, arg2);
				}
				
				if(fieldName == "creator") {
					item.creators.push(value);
				} else {
					item[fieldName] = value;
					return;
				}
			}
		}
	}
}

// add field to DB as tags
record.prototype._associateTags = function(item, fieldNo, part) {
	var field = this.getFieldSubfields(fieldNo);
	
	for(var i in field) {
		for(var j=0; j<part.length; j++) {
			var myPart = part[j];
			if(field[i][myPart]) {
				item.tags.push(clean(field[i][myPart]));
			}
		}
	}
}

//<abszh>
//In "nlai.ir" records sometimes author name contains extra dashes, persian commas 
//or year of birth and death of the author
//e.g. jamalzadeh 1270-1376. These extra characters and numbers should be removed to get correct author name
function abszhClean(str) {
	str=str.replace(/،/g,'');					//remove persian comma
	str=str.replace(/[\u0660-\u0669]/g,'');		//remove arabic numbers
	str=str.replace(/[\u06F0-\u06F9]/g,'');		//remove persian numbers
	str=str.replace(/[0-9]/g,'');				//remove english numbers
	str=str.replace(/-/g,'');					//remove dash
	return str;
}
//</abszh>


// this function loads a MARC record into our database
record.prototype.translate = function(item) {
	// get item type
	if(this.leader) {
		var marcType = this.leader[6];
		if(marcType == "g") {
			item.itemType = "film";
		} else if(marcType == "e" || marcType == "f") {
			item.itemType = "map";
		} else if(marcType == "k") {
			item.itemType = "artwork";
		} else if(marcType == "t" || marcType == "b") {
			// 20091210: in unimarc, the code for manuscript is b, unused in marc21.
			item.itemType = "manuscript";
		} else {
			item.itemType = "book";
		}
	} else {
		item.itemType = "book";
	}

	// Starting from there, we try to distinguish between unimarc and other marc flavours.
	// In unimarc, the title is in the 200 field and this field isn't used in marc-21 (at least)
	// In marc-21, the title is in the 245 field and this field isn't used in unimarc
	// So if we have a 200 and no 245, we can think we are with an unimarc record. 
	// Otherwise, we use the original association.
	if ( (this.getFieldSubfields("200")[0]) && (!(this.getFieldSubfields("245")[0])) )
	{
		// If we've got a 328 field, we're on a thesis
		if (this.getFieldSubfields("328")[0])
		{
			item.itemType = "thesis";
		}
		
		// Extract ISBNs
		this._associateDBField(item, "010", "a", "ISBN", pullISBN);
		// Extract ISSNs
		this._associateDBField(item, "011", "a", "ISSN", pullISBN);
		
		// Extract creators (700, 701 & 702)
		for (var i = 700; i < 703; i++)
		{
			Zotero.debug("I am in for 700 to 703"); //abszh
			var authorTab = this.getFieldSubfields(i);
			for (var j in authorTab) 
			{
				var aut = authorTab[j];
				var authorText = "";
				if (aut.b) {
					authorText = abszhClean(aut['a']) + ", " + abszhClean(aut['b']);
				} /*<abszh>*/ else if (aut.a)	{ 
					authorText = abszhClean((aut['a']).replace(/،/g,','));
				} else {
					authorText=abszhClean((aut['9']).replace(/،/g,','));
				} /*in some "nlai.ir" records author name can be found in '9' subfield </abszh> */
				item.creators.push(Zotero.Utilities.cleanAuthor(authorText, "author", true));
			}
		}
		
		// Extract corporate creators (710, 711 & 712)
		for (var i = 710; i < 713; i++)
		{
			var authorTab = this.getFieldSubfields(i);
			for (var j in authorTab)
			{
				if (authorTab[j]['a']) {
					item.creators.push({lastName:authorTab[j]['a'], creatorType:"contributor", fieldMode:true});
				} /*<abszh>*/ else if (authorTab[j]['9']) { 
					item.creators.push({lastName:authorTab[j]['9'], creatorType:"contributor", fieldMode:true});
				} /*</abszh>*/
			}
		}
		
		//<abszh>
		//if 700 to 703 and 710 to 713 fields are empty use subfield f of field 200 as author name
		if (item.creators.length==0)
		{
			var authorTab=this.getFieldSubfields("200"); //returns an array. so we will use authorTab[0]
			if (authorTab[0]['f']) 
			{
				var authorText="";
				Zotero.debug("abszh"+authorTab[0]['f']);
				authorText=abszhClean((authorTab[0]['f']).replace(/،/g,','));
				item.creators.push(Zotero.Utilities.cleanAuthor(authorText, "author", true));
			}
		}
		//</abszh>
		// Extract language. In the 101$a there's a 3 chars code, would be better to
		// have a translation somewhere
		this._associateDBField(item, "101", "a", "language");
		
		// Extract abstractNote
		this._associateDBField(item, "328", "a", "abstractNote");
		this._associateDBField(item, "330", "a", "abstractNote");
		
		// Extract tags
		// TODO : Ajouter les autres champs en 6xx avec les autorit�s construites. 
		// n�cessite de reconstruire les autorit�s
		this._associateTags(item, "610", "a");
		
		// Extract scale (for maps)
		this._associateDBField(item, "206", "a", "scale");
		
		// Extract title
		this._associateDBField(item, "200", "ae", "title");
		
		// Extract edition
		this._associateDBField(item, "205", "a", "edition");
		
		// Extract place info
		this._associateDBField(item, "210", "a", "place");
		
		// Extract publisher/distributor
		if(item.itemType == "film")
		{
			this._associateDBField(item, "210", "c", "distributor");
		}
		else
		{
			this._associateDBField(item, "210", "c", "publisher");
		}
		
		// Extract year
		this._associateDBField(item, "210", "d", "date", pullNumber);
		// Extract pages. Not working well because 215$a often contains pages + volume informations : 1 vol ()
		
		
		//<abszh>
		//in "nlai.ir" marc records, field 215 contains number of pages (and/or) number of volumes
		//seperated by a '،' (persian comma)
		//in the following try block if just one field is found it is assigned to numPages
		//in cases where both number of pages and number of volumes are expressed it is hard to 
		//seperate two values and the field is ignored
		try {
			var pv1=this.getFieldSubfields("215")[0]['a'];
			if (pv1) {
				pv1=pv1.replace(/،/g,',');					//convert persian camma
				pv2=pv1.split(",");							
				//if pv1="ab,cd,ef" then pv2=["ab","cd","ef"] and pv2.length will be 3
				if (pv2.length==1) item["numPages"]=pullNumber(pv2[0]);
			}
		} catch (e) {
			Zotero.debug("the record does not have a 215 field");
		}
		//</abszh>
		
		
		//this._associateDBField(item, "215", "a", "numPages", pullNumber);

		
		// Extract series
		this._associateDBField(item, "225", "a", "series");
		// Extract series number
		this._associateDBField(item, "225", "v", "seriesNumber");
		
		// Extract call number
		this._associateDBField(item, "686", "ab", "callNumber");
		this._associateDBField(item, "676", "a", "callNumber");
		this._associateDBField(item, "675", "a", "callNumber");
		this._associateDBField(item, "680", "ab", "callNumber");
	}
	else
	{
		// Extract ISBNs
		this._associateDBField(item, "020", "a", "ISBN", pullISBN);
		// Extract ISSNs
		this._associateDBField(item, "022", "a", "ISSN", pullISBN);
		// Extract creators
		this._associateDBField(item, "100", "a", "creator", author, "author", true);
		this._associateDBField(item, "110", "a", "creator", corpAuthor, "author");
		this._associateDBField(item, "111", "a", "creator", corpAuthor, "author");
		this._associateDBField(item, "700", "a", "creator", author, "contributor", true);
		this._associateDBField(item, "710", "a", "creator", corpAuthor, "contributor");
		this._associateDBField(item, "711", "a", "creator", corpAuthor, "contributor");
		if(item.itemType == "book" && !item.creators.length) {
			// some LOC entries have no listed author, but have the author in the person subject field as the first entry
			var field = this.getFieldSubfields("600");
			if(field[0]) {
				item.creators.push(Zotero.Utilities.cleanAuthor(field[0]["a"], "author", true));	
			}
		}
		
		// Extract tags
		// personal
		this._associateTags(item, "600", "aqtxyz");
		// corporate
		this._associateTags(item, "611", "abtxyz");
		// meeting
		this._associateTags(item, "630", "acetxyz");
		// uniform title
		this._associateTags(item, "648", "atxyz");
		// chronological
		this._associateTags(item, "650", "axyz");
		// topical
		this._associateTags(item, "651", "abcxyz");
		// geographic
		this._associateTags(item, "653", "axyz");
		// uncontrolled
		this._associateTags(item, "653", "a");
		// faceted topical term (whatever that means)
		this._associateTags(item, "654", "abcyz");
		// genre/form
		this._associateTags(item, "655", "abcxyz");
		// occupation
		this._associateTags(item, "656", "axyz");
		// function
		this._associateTags(item, "657", "axyz");
		// curriculum objective
		this._associateTags(item, "658", "ab");
		// hierarchical geographic place name
		this._associateTags(item, "662", "abcdfgh");
		
		// Extract title
		this._associateDBField(item, "245", "ab", "title");
		// Extract edition
		this._associateDBField(item, "250", "a", "edition");
		// Extract place info
		this._associateDBField(item, "260", "a", "place");
		
		// Extract publisher/distributor
		if(item.itemType == "film") {
			this._associateDBField(item, "260", "b", "distributor");
		} else {
			this._associateDBField(item, "260", "b", "publisher");
		}
		
		// Extract year
		this._associateDBField(item, "260", "c", "date", pullNumber);
		// Extract pages
		this._associateDBField(item, "300", "a", "numPages", pullNumber);
		// Extract series
		this._associateDBField(item, "440", "a", "series");
		// Extract series number
		this._associateDBField(item, "440", "v", "seriesNumber");
		// Extract call number
		this._associateDBField(item, "084", "ab", "callNumber");
		this._associateDBField(item, "082", "a", "callNumber");
		this._associateDBField(item, "080", "ab", "callNumber");
		this._associateDBField(item, "070", "ab", "callNumber");
		this._associateDBField(item, "060", "ab", "callNumber");
		this._associateDBField(item, "050", "ab", "callNumber");
		this._associateDBField(item, "090", "a", "callNumber");
		this._associateDBField(item, "099", "a", "callNumber");
		
		//German
		if (!item.place) this._associateDBField(item, "410", "a", "place");
		if (!item.publisher) this._associateDBField(item, "412", "a", "publisher");
		if (!item.title) this._associateDBField(item, "331", "a", "title");
		if (!item.title) this._associateDBField(item, "1300", "a", "title");
		if (!item.date) this._associateDBField(item, "425", "a", "date", pullNumber);
		if (!item.date) this._associateDBField(item, "595", "a", "date", pullNumber);
		if (this.getFieldSubfields("104")[0]) this._associateDBField(item, "104", "a", "creator", author, "author", true);
		if (this.getFieldSubfields("800")[0]) this._associateDBField(item, "800", "a", "creator", author, "author", true);
		
		//Spanish
		if (!item.title) this._associateDBField(item, "200", "a", "title");
		if (!item.place) this._associateDBField(item, "210", "a", "place");
		if (!item.publisher) this._associateDBField(item, "210", "c", "publisher");
		if (!item.date) this._associateDBField(item, "210", "d", "date");
		if (!item.creators) {
			for (var i = 700; i < 703; i++) {
				if (this.getFieldSubfields(i)[0]) {
					Zotero.debug(i + " is AOK");
					Zotero.debug(this.getFieldSubfields(i.toString()));
					var aut = this.getFieldSubfields(i)[0];
					if (aut.b) {
						aut = aut['b'].replace(/,\W+/g, "") + " " + aut['a'].replace(/,\s/g, "");
					} else {
						aut = aut['a'].split(", ").join(" ");
					}
					item.creators.push(Zotero.Utilities.cleanAuthor(aut, "author"));
				}
			}
		}
		if(item.title) {
			item.title = Zotero.Utilities.capitalizeTitle(item.title);
		}
		if (this.getFieldSubfields("335")[0]) {
			item.title = item.title + ": " + this.getFieldSubfields("335")[0]['a'];
		}
	}
}

function doImport() {
	var text;
	var holdOver = "";	// part of the text held over from the last loop
	
	while(text = Zotero.read(4096)) {	// read in 4096 byte increments
		var records = text.split("\x1D");
		
		if(records.length > 1) {
			records[0] = holdOver + records[0];
			holdOver = records.pop(); // skip last record, since it's not done
			
			for(var i in records) {
				var newItem = new Zotero.Item();
				
				// create new record
				var rec = new record();	
				rec.importBinary(records[i]);
				rec.translate(newItem);
				
				newItem.complete();
			}
		} else {
			holdOver += text;
		}
	}
}