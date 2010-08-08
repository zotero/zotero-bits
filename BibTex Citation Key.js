{
	"translatorID":"04623cf0-313c-11df-9aae-0800200c9a66",
	"translatorType":2,
	"label":"BibTex Citation Key",
	"creator":"Scott Campbell, Avram Lyon",
	"target":"html",
	"minVersion":"2.0",
	"maxVersion":"",
	"priority":200,
	"inRepository":false,
	"lastUpdated":"2010-04-30 23:15:00"
}

Zotero.configure("dataMode", "text/html");
// How can we get Zotero to send this as formatted text?
Zotero.addOption("exportCharset", "UTF-8");

var numberRe = /^[0-9]+/;
var keyRe = /[a-zA-Z0-9\-]/;
// this is a list of words that should not appear as part of the citation key
var citeKeyTitleBannedRe = /(\s+|\b)(a|an|from|does|how|it\'s|its|on|some|the|this|why)(\s+|\b)/g;
var citeKeyConversionsRe = /%([a-zA-Z])/;
var citeKeyCleanRe = /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g;
//%a = first author surname
//%y = year
//%t = first word of title
var citeKeyFormat = "%a_%t_%y";

var citeKeyConversions = {
    "a":function (flags, item) {
        if(item.creators && item.creators[0] && item.creators[0].lastName) {
            return item.creators[0].lastName.toLowerCase().replace(/ /g,"_").replace(/,/g,"");
        }
        return "";
    },
    "t":function (flags, item) {
        if (item["title"]) {
            return item["title"].toLowerCase().replace(citeKeyTitleBannedRe, "").split(" ")[0];
        }
        return "";
    },
    "y":function (flags, item) {
        if(item.date) {
            var date = Zotero.Utilities.strToDate(item.date);
            if(date.year && numberRe.test(date.year)) {
                return date.year;
            }
        }
        return "????";
    }
}


function buildCiteKey (item,citekeys) {
    var basekey = "";
    var counter = 0;
    citeKeyFormatRemaining = citeKeyFormat;
    while (citeKeyConversionsRe.test(citeKeyFormatRemaining)) {
        if (counter > 100) {
            Zotero.debug("Pathological BibTeX format: " + citeKeyFormat);
            break;
        }
        var m = citeKeyFormatRemaining.match(citeKeyConversionsRe);
        if (m.index > 0) {
            //add data before the conversion match to basekey
            basekey = basekey + citeKeyFormatRemaining.substr(0, m.index);
        }
        var flags = ""; // for now
        var f = citeKeyConversions[m[1]];
        if (typeof(f) == "function") {
            var value = f(flags, item);
            Zotero.debug("Got value " + value + " for %" + m[1]);
            //add conversion to basekey
            basekey = basekey + value;
        }
        citeKeyFormatRemaining = citeKeyFormatRemaining.substr(m.index + m.length);
        counter++;
    }
    if (citeKeyFormatRemaining.length > 0) {
        basekey = basekey + citeKeyFormatRemaining;
    }

    // for now, remove any characters not explicitly known to be allowed;
    // we might want to allow UTF-8 citation keys in the future, depending
    // on implementation support.
    //
    // no matter what, we want to make sure we exclude
    // " # % ' ( ) , = { } ~ and backslash

    basekey = basekey.replace(citeKeyCleanRe, "");
    var citekey = basekey;
    var i = 0;
    while(citekeys[citekey]) {
        i++;
        citekey = basekey + "-" + i;
    }
    citekeys[citekey] = true;
    return citekey;
}

function doExport() {
	var item, citekey;
	var citekeys = {};
	while(item = Zotero.nextItem()) {
		citekey = buildCiteKey(item,citekeys);
                
		Zotero.write("\\cite{" + citekey + "}");
	}
}
