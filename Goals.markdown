 *Goals for Zotero development*

_New Translators_
 * Write IMDB translator, perhaps using http://amazon.libcat.org/cgi-bin/imdb2marc.pl
 * Write Mendeley.com translator

_Broken Translators_
 * MetaPress (SpringerLink) 
 * Ingenta (need for Brill)

_In-Progress Translators_
 * Wiley (need multiple-item save)
 * Ab Imperio
 * Gasyrlar Avazy
 * Primo
 * Add BIOSIS and other databases to ISI (http://forums.zotero.org/discussion/16772)
 * Explore EZProxy+JSTOR issues (http://forums.zotero.org/discussion/15987/)

_Other Zotero Features_
 * RTF scan fixes, see http://forums.zotero.org/discussion/16751. Gnotero integration would provide something akin to Papers2's Magic Manuscripts
   * "inability to read names with accent marks" http://forums.zotero.org/discussion/17040
   * "Author suppression doesn't work well--a symbol is probably required (like the one used in Bookends) in order to force suppression e.g. {-Author, 1995, 45}" (Ibid.)
 * Identifiers

_Scholarly Process_
 * Start using XML-TILE or other textual annotation system, and find a way to integrate with Zotero
 * Integrate OCR, or integrate Archive.org OCR more tightly
   * Papers2 uses Tesseract-- I've been looking at it too, but we'd need training data
 * Image capture-- scanning, folder watching, etc.

_Data Model_
 * Write an RDF triple store for the Firefox/XULRunner environment, and allow it to integrate with Zotero
   * Possibly use file attachments on items to store the RDF.
   * This is intended to also serve as an Agent/Creator system, to allow metadata, statements of equivalency, etc., between author names
 * Add language tagging of items, and support for item-language-dependent styles (language of citation is language of source)
 * Add support for controlled vocabularies to Zotero, probably as assertions of equivalence between item data and URIs
 * Allow inter-item relationships to be classified (isReviewOf, refutes, cites) [they may have to be made directional to do this]
