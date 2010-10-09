{
	"translatorID":"d2c86970-04f7-4ba5-9de6-bec897930eb5",
	"translatorType":3,
	"label":"MARC2",
	"creator":"Florian Ziche",
	"target":"marc2",
	"minVersion":"2.0",
	"maxVersion":"",
	"priority":100,
	"inRepository":false,
	"lastUpdated":"2010-09-04 22:45:00"
}

/**
 * @fileOverview Common functionality for handling MARC records.
 * @author Florian Ziche
 * @version 0.1
 */

/**
 * @namespace Namespace containing the module's public members. 
 */
var Marc = new Object();

/**
 * @namespace Lists the currently known MARC types and their human-readable names.
 */
Marc.Types = {
	"marc21" : "MARC-21",
	"unimarc" : "Unimarc"
};

/**
 * @namespace Delimiter strings used in binary MARC files.
 */
Marc.Delimiters = {
	FIELD_TERMINATOR : "\x1E",
	RECORD_TERMINATOR : "\x1D",
	SUBFIELD_DELIMITER : "\x1F",
	SUBFIELD_SPLITTER : /[\x1F\x1E]+/
};
		
/**
 *  @namespace Initialization helpers.
 **/
Marc.Config = {
	setTypeOptions : function() {
		for(var type in Marc.Types) {
			Zotero.addOption(Marc.Types[type], false);
		}
	},

	getTypeOption : function() {
		for(var type in Marc.Types) {
			if(Zotero.getOption(Marc.Types[type])) {
				return type;
			}
		}
		return undefined;
	}
};

/**
 * Constructs a Marc.Tag.
 * @class Encapsulates information abaout a MARC field tag (e.g. "245")
 */
Marc.Tag = function(tag, flags) {
	this.tag = tag;
	this.flags = flags;
};

/** Flags describing tags characteristics. */
Marc.Tag.Flags  = {
	MANDATORY: 1,
	NOTREPEATABLE: 2
},


Marc.Tag.prototype = {
	constructor : Marc.Tag,
	/**
	 * @returns {String} the object's tag member (e.g. "245")
	 */
	toString : function() {
		return this.tag;
	}
};


/**
 *  @namespace Marc-21 constants and utilities.
 **/
Marc.Marc21 = {
	/**
	 * Returns a valid Zotero creatorType for a Marc-21 relator code.
	 * @param {String} relatorCode the three-letter Marc-21 relator code
	 * @see <a href="http://www.loc.gov/marc/relators/relaterm.html">Marc-21 relators</a>
	 */
	getCreatorType : function(relatorCode) {
		switch(relatorCode) {
		case "acp":	//Art copyist
		case "anm":	//Animator
		case "arc":	//Architect
		case "art":	//Artist
		case "bdd":	//Binding designer
		case "bjd":	//Bookjacket designer
		case "bkd":	//Book designer
		case "bnd":	//Binder
		case "bpd":	//Bookplate designer
		case "chr":	//Choreographer
		case "cll":	//Calligrapher
		case "clr":	//Colorist
		case "clt":	//Collotyper
		case "cmt":	//Compositor
		case "cov":	//Cover designer
		case "cst":	//Costume designer
		case "dln":	//Delineator
		case "drm":	//Draftsman
		case "dsr":	//Designer
		case "egr":	//Engraver
		case "elt":	//Electrotyper
		case "etr":	//Etcher
		case "fac":	//Facsimilist
		case "ill":	//Illustrator
		case "ilu":	//Illuminator
		case "lgd":	//Lighting designer
		case "lsa":	//Landscape architect
		case "ltg":	//Lithographer
		case "mcp":	//Music copyist
		case "mrb":	//Marbler
		case "mte":	//Metal-engraver
		case "pht":	//Photographer
		case "prm":	//Printmaker
		case "rbr":	//Rubricator
		case "scl":	//Sculptor
		case "scr":	//Scribe
		case "sds":	//Sound designer
		case "std":	//Set designer
		case "tyd":	//Type designer
		case "tyg":	//Typographer
		case "vdg":	//Videographer
		case "wdc":	//Woodcutter
		case "wde":	//Wood-engraver
			return "artist";
		case "act":	//Actor
		case "cnd":	//Conductor
		case "dnc":	//Dancer
		case "itr":	//Instrumentalist
		case "mus":	//Musician
		case "ppt":	//Puppeteer
		case "prf":	//Performer
		case "sng":	//Singer
		case "spk":	//Speaker
		case "stl":	//Storyteller
		case "voc":	//Vocalist
			return "performer";
		case "adp":	//Adapter
		case "aft":	//Author of afterword, colophon, etc.
		case "anl":	//Analyst
		case "arr":	//Arranger
		case "aui":	//Author of introduction
		case "blw":	//Blurb writer
		case "clb":	//Collaborator
		case "cng":	//Cinematographer
		case "con":	//Conservator
		case "ctb":	//Contributor
		case "ctr":	//Contractor
		case "dtc":	//Data contributor
		case "dtm":	//Data manager
		case "gis":	//Geographic information specialist
		case "nrt":	//Narrator
		case "red":	//Redactor
		case "res":	//Researcher
		case "rev":	//Reviewer
		case "rpt":	//Reporter
		case "rsg":	//Restager
		case "rth":	//Research team head
		case "rtm":	//Research team member
		case "srv":	//Surveyor
		case "tch":	//Teacher
		case "wam":	//Writer of accompanying material
			return "contributor";
		case "ann":	//Annotator
		case "cmm":	//Commentator
		case "cwt":	//Commentator for written text
			return "commenter";
		case "ant":	//Bibliographic antecedent //reviewedAuthor?
		case "app":	//Applicant
		case "asg":	//Assignee
		case "asn":	//Associated name
		case "auc":	//Auctioneer
		case "bsl":	//Bookseller
		case "cli":	//Client
		case "cns":	//Censor
		case "coe":	//Contestant -appellee
		case "col":	//Collector
		case "cos":	//Contestant
		case "cot":	//Contestant -appellant
		case "cpc":	//Copyright claimant
		case "cpe":	//Complainant-appellee
		case "cph":	//Copyright holder
		case "cpl":	//Complainant
		case "cpt":	//Complainant-appellant
		case "crr":	//Corrector
		case "cte":	//Contestee-appellee
		case "cts":	//Contestee
		case "ctt":	//Contestee-appellant
		case "dfd":	//Defendant
		case "dfe":	//Defendant-appellee
		case "dft":	//Defendant-appellant
		case "dgg":	//Degree grantor
		case "dnr":	//Donor
		case "dpb":	//Distribution place
		case "dpc":	//Depicted
		case "dpt":	//Depositor
		case "dst":	//Distributor
		case "dte":	//Dedicatee
		case "dto":	//Dedicator
		case "evp":	//Event place
		case "fmo":	//Former owner
		case "fpy":	//First party
		case "frg":	//Forger
		case "hnr":	//Honoree
		case "ins":	//Inscriber
		case "lbr":	//Laboratory
		case "ldr":	//Laboratory director
		case "led":	//Lead
		case "lee":	//Libelee-appellee
		case "lel":	//Libelee
		case "len":	//Lender
		case "let":	//Libelee-appellant
		case "lie":	//Libelant-appellee
		case "lil":	//Libelant
		case "lit":	//Libelant-appellant
		case "lse":	//Licensee
		case "lso":	//Licensor
		case "mfp":	//Manufacture place
		case "mfr":	//Manufacturer
		case "mdc":	//Metadata contact
		case "mon":	//Monitor
		case "opn":	//Opponent
		case "org":	//Originator
		case "orm":	//Organizer of meeting
		case "oth":	//Other
		case "own":	//Owner
		case "pat":	//Patron
		case "pbl":	//Publisher
		case "pma":	//Permitting agency
		case "prc":	//Process contact
		case "prp":	//Production place
		case "pte":	//Plaintiff -appellee
		case "ptf":	//Plaintiff
		case "ptt":	//Plaintiff-appellant
		case "pup":	//Publication place
		case "rps":	//Repository
		case "rpy":	//Responsible party
		case "rse":	//Respondent-appellee
		case "rsp":	//Respondent
		case "rst":	//Respondent-appellant
		case "sgn":	//Signer
		case "spy":	//Second party
		case "stn":	//Standards body
		case "uvp":	//University place
		case "wit":	//Witness
			return "contributor"; //undefined; ?
		case "aqt":	//Author in quotations or text abstracts
		case "ard":	//Artistic director
		case "cur":	//Curator
		case "pdr":	//Project director
		case "tcd":	//Technical director
			return "director";
		case "att":	//Attributed name
		case "aut":	//Author
		case "dis":	//Dissertant
		case "dub":	//Dubious author
			return "author";
		case "aud":	//Author of dialog
		case "aus":	//Author of screenplay
		case "sce":	//Scenarist
			return "scriptwriter";
		case "bkp":	//Book producer
			return "producer";
		case "ccp":	//Conceptor
		case "inv":	//Inventor
		case "pth":	//Patent holder
			return "inventor";
		case "cmp":	//Composer
			return "composer";
		case "com":	//Compiler
		case "edt":	//Editor
		case "flm":	//Film editor
			return "editor";
		case "cre":	//Creator
		case "drt":	//Director
		case "fld":	//Field director
		case "msd":	//Musical director
		case "ths":	//Thesis advisor
			return "director";
		case "crp":	//Correspondent
		case "rcp":	//Recipient
			return "recipient";
		case "csl":	//Consultant
		case "csp":	//Consultant to a project
		case "exp":	//Expert
		case "sad":	//Scientific advisor
			return "counsel";
		case "ctg":	//Cartographer
			return "cartographer";
		case "elg":	//Electrician
		case "eng":	//Engineer
		case "mrk":	//Markup editor
		case "pfr":	//Proofreader
		case "plt":	//Platemaker
		case "pop":	//Printer of plates
		case "ppm":	//Papermaker
		case "prd":	//Production personnel
		case "pmn":	//Production manager
		case "prt":	//Printer
		case "rce":	//Recording engineer
		case "ren":	//Renderer
		case "sec":	//Secretary
		case "stm":	//Stage manager
		case "str":	//Stereotyper
		case "trc":	//Transcriber
			return "castMember";
		case "fnd":	//Funder
		case "sht":	//Supporting host
			return "cosponsor";
		case "hst":	//Host
		case "mod":	//Moderator
			return "presenter";
		case "ive":	//Interviewee
			return "interviewee";
		case "ivr":	//Interviewer
			return "interviewer";
		case "lbt":	//Librettist
		case "lyr":	//Lyricist
			return "wordsBy";
		case "pbd":	//Publishing director
			return "seriesEditor";
		case "prg":	//Programmer
			return "programmer";
		case "pro":	//Producer
			return "producer";
		case "pta":	//Patent applicant
			return "attorneyAgent";
		case "spn":	//Sponsor
			return "sponsor";
		case "trl":	//Translator
			return "translator";
		default:
			return "contributor";
		}
	}
};

/**
 * @namespace Mapping of human-readable names to Marc-21 tags. The type of each property
 * is an object with a "tag" property containing the three-digit Marc-21 tag. 
 */
Marc.Marc21.Tags = {
	CONTROL_NUMBER : new Marc.Tag("001"),
	CONTROL_NUMBER_IDENTIFIER : new Marc.Tag("003"),
	DATE_AND_TIME_OF_LATEST_TRANSACTION : new Marc.Tag("005"),
	FIXED_LENGTH_DATA_ELEMENTS_ADDITIONAL_MATERIAL_CHARACTERISTICS : new Marc.Tag("006"),
	PHYSICAL_DESCRIPTION_FIXED_FIELD : new Marc.Tag("007"),
	FIXED_LENGTH_DATA_ELEMENTS : new Marc.Tag("008"),
	LIBRARY_OF_CONGRESS_CONTROL_NUMBER : new Marc.Tag("010"),
	PATENT_CONTROL_INFORMATION : new Marc.Tag("013"),
	NATIONAL_BIBLIOGRAPHY_NUMBER : new Marc.Tag("015"),
	NATIONAL_BIBLIOGRAPHIC_AGENCY_CONTROL_NUMBER : new Marc.Tag("016"),
	COPYRIGHT_OR_LEGAL_DEPOSIT_NUMBER : new Marc.Tag("017"),
	COPYRIGHT_ARTICLE_FEE_CODE : new Marc.Tag("018"),
	ISBN : new Marc.Tag("020"),
	ISSN : new Marc.Tag("022"),
	OTHER_STANDARD_IDENTIFIER : new Marc.Tag("024"),
	OVERSEAS_ACQUISITION_NUMBER : new Marc.Tag("025"),
	STANDARD_TECHNICAL_REPORT_NUMBER : new Marc.Tag("027"),
	PUBLISHER_NUMBER : new Marc.Tag("028"),
	CODEN_DESIGNATION : new Marc.Tag("030"),
	MUSICAL_INCIPITS_INFORMATION : new Marc.Tag("031"),
	POSTAL_REGISTRATION_NUMBER : new Marc.Tag("032"),
	DATE_TIME_AND_PLACE_OF_AN_EVENT : new Marc.Tag("033"),
	CODED_CARTOGRAPHIC_MATHEMATICAL_DATA : new Marc.Tag("034"),
	SYSTEM_CONTROL_NUMBER : new Marc.Tag("035"),
	ORIGINAL_STUDY_NUMBER_FOR_COMPUTER_DATA_FILES : new Marc.Tag("036"),
	SOURCE_OF_ACQUISITION : new Marc.Tag("037"),
	RECORD_CONTENT_LICENSOR : new Marc.Tag("038"),
	CATALOGING_SOURCE : new Marc.Tag("040"),
	LANGUAGE_CODE : new Marc.Tag("041"),
	AUTHENTICATION_CODE : new Marc.Tag("042"),
	GEOGRAPHIC_AREA_CODE : new Marc.Tag("043"),
	COUNTRY_OF_PUBLISHING_PRODUCING_ENTITY_CODE : new Marc.Tag("044"),
	TIME_PERIOD_OF_CONTENT : new Marc.Tag("045"),
	SPECIAL_CODED_DATES : new Marc.Tag("046"),
	FORM_OF_MUSICAL_COMPOSITION_CODE : new Marc.Tag("047"),
	NUMBER_OF_MUSICAL_INSTRUMENTS_OR_VOICES_CODE : new Marc.Tag("048"),
	LIBRARY_OF_CONGRESS_CALL_NUMBER : new Marc.Tag("050"),
	LIBRARY_OF_CONGRESS_COPY_ISSUE_OFFPRINT_STATEMENT : new Marc.Tag("051"),
	GEOGRAPHIC_CLASSIFICATION : new Marc.Tag("052"),
	CLASSIFICATION_NUMBERS_ASSIGNED_IN_CANADA : new Marc.Tag("055"),
	NATIONAL_LIBRARY_OF_MEDICINE_CALL_NUMBER : new Marc.Tag("060"),
	NATIONAL_LIBRARY_OF_MEDICINE_COPY_STATEMENT : new Marc.Tag("061"),
	CHARACTER_SETS_PRESENT : new Marc.Tag("066"),
	NATIONAL_AGRICULTURAL_LIBRARY_CALL_NUMBER : new Marc.Tag("070"),
	NATIONAL_AGRICULTURAL_LIBRARY_COPY_STATEMENT : new Marc.Tag("071"),
	SUBJECT_CATEGORY_CODE : new Marc.Tag("072"),
	GPO_ITEM_NUMBER : new Marc.Tag("074"),
	UNIVERSAL_DECIMAL_CLASSIFICATION_NUMBER : new Marc.Tag("080"),
	DEWEY_DECIMAL_CLASSIFICATION_NUMBER : new Marc.Tag("082"),
	ADDITIONAL_DEWEY_DECIMAL_CLASSIFICATION_NUMBER : new Marc.Tag("083"),
	OTHER_CLASSIFICATION_NUMBER : new Marc.Tag("084"),
	SYNTHESIZED_CLASSIFICATION_NUMBER_COMPONENTS : new Marc.Tag("085"),
	GOVERNMENT_DOCUMENT_CLASSIFICATION_NUMBER : new Marc.Tag("086"),
	REPORT_NUMBER : new Marc.Tag("088"),

	MAIN_ENTRY_PERSONAL_NAME : new Marc.Tag("100"),
	MAIN_ENTRY_CORPORATE_NAME : new Marc.Tag("110"),
	MAIN_ENTRY_MEETING_NAME : new Marc.Tag("111"),
	MAIN_ENTRY_UNIFORM_TITLE : new Marc.Tag("130"),

	ABBREVIATED_TITLE : new Marc.Tag("210"),
	KEY_TITLE : new Marc.Tag("222"),
	UNIFORM_TITLE : new Marc.Tag("240"),
	TRANSLATION_OF_TITLE_BY_CATALOGING_AGENCY : new Marc.Tag("242"),
	COLLECTIVE_UNIFORM_TITLE : new Marc.Tag("243"),
	TITLE_STATEMENT : new Marc.Tag("245"),
	VARYING_FORM_OF_TITLE : new Marc.Tag("246"),
	FORMER_TITLE : new Marc.Tag("247"),
	EDITION_STATEMENT : new Marc.Tag("250"),
	MUSICAL_PRESENTATION_STATEMENT : new Marc.Tag("254"),
	CARTOGRAPHIC_MATHEMATICAL_DATA : new Marc.Tag("255"),
	COMPUTER_FILE_CHARACTERISTICS : new Marc.Tag("256"),
	COUNTRY_OF_PRODUCING_ENTITY : new Marc.Tag("257"),
	PHILATELIC_ISSUE_DATA : new Marc.Tag("258"),
	PUBLICATION_DISTRIBUTION_ETC_IMPRINT : new Marc.Tag("260"),
	PROJECTED_PUBLICATION_DATE : new Marc.Tag("263"),
	ADDRESS : new Marc.Tag("270"),

	PHYSICAL_DESCRIPTION : new Marc.Tag("300"),
	PLAYING_TIME : new Marc.Tag("306"),
	HOURS_ETC : new Marc.Tag("307"),
	CURRENT_PUBLICATION_FREQUENCY : new Marc.Tag("310"),
	FORMER_PUBLICATION_FREQUENCY : new Marc.Tag("321"),
	CONTENT_TYPE : new Marc.Tag("336"),
	MEDIA_TYPE : new Marc.Tag("337"),
	CARRIER_TYPE : new Marc.Tag("338"),
	PHYSICAL_MEDIUM : new Marc.Tag("340"),
	GEOSPATIAL_REFERENCE_DATA : new Marc.Tag("342"),
	PLANAR_COORDINATE_DATA : new Marc.Tag("343"),
	ORGANIZATION_AND_ARRANGEMENT_OF_MATERIALS : new Marc.Tag("351"),
	DIGITAL_GRAPHIC_REPRESENTATION : new Marc.Tag("352"),
	SECURITY_CLASSIFICATION_CONTROL : new Marc.Tag("355"),
	ORIGINATOR_DISSEMINATION_CONTROL : new Marc.Tag("357"),
	DATES_OF_PUBLICATION_AND_OR_SEQUENTIAL_DESIGNATION : new Marc.Tag("362"),
	NORMALIZED_DATE_AND_SEQUENTIAL_DESIGNATION : new Marc.Tag("363"),
	TRADE_PRICE : new Marc.Tag("365"),
	TRADE_AVAILABILITY_INFORMATION : new Marc.Tag("366"),
	FORM_OF_WORK : new Marc.Tag("380"),
	OTHER_DISTINGUISHING_CHARACTERISTICS_OF_WORK_OR_EXPRESSION : new Marc.Tag("381"),
	MEDIUM_OF_PERFORMANCE : new Marc.Tag("382"),
	NUMERIC_DESIGNATION_OF_MUSICAL_WORK : new Marc.Tag("383"),
	KEY : new Marc.Tag("384"),

	SERIES_STATEMENT : new Marc.Tag("490"),

	GENERAL_NOTE : new Marc.Tag("500"),
	WITH_NOTE : new Marc.Tag("501"),
	DISSERTATION_NOTE : new Marc.Tag("502"),
	BIBLIOGRAPHY_ETC_NOTE : new Marc.Tag("504"),
	FORMATTED_CONTENTS_NOTE : new Marc.Tag("505"),
	RESTRICTIONS_ON_ACCESS_NOTE : new Marc.Tag("506"),
	SCALE_NOTE_FOR_GRAPHIC_MATERIAL : new Marc.Tag("507"),
	CREATION_PRODUCTION_CREDITS_NOTE : new Marc.Tag("508"),
	CITATION_REFERENCES_NOTE : new Marc.Tag("510"),
	PARTICIPANT_OR_PERFORMER_NOTE : new Marc.Tag("511"),
	TYPE_OF_REPORT_AND_PERIOD_COVERED_NOTE : new Marc.Tag("513"),
	DATA_QUALITY_NOTE : new Marc.Tag("514"),
	NUMBERING_PECULIARITIES_NOTE : new Marc.Tag("515"),
	TYPE_OF_COMPUTER_FILE_OR_DATA_NOTE : new Marc.Tag("516"),
	DATE_TIME_AND_PLACE_OF_AN_EVENT_NOTE : new Marc.Tag("518"),
	SUMMARY_ETC : new Marc.Tag("520"),
	TARGET_AUDIENCE_NOTE : new Marc.Tag("521"),
	GEOGRAPHIC_COVERAGE_NOTE : new Marc.Tag("522"),
	PREFERRED_CITATION_OF_DESCRIBED_MATERIALS_NOTE : new Marc.Tag("524"),
	SUPPLEMENT_NOTE : new Marc.Tag("525"),
	STUDY_PROGRAM_INFORMATION_NOTE : new Marc.Tag("526"),
	ADDITIONAL_PHYSICAL_FORM_AVAILABLE_NOTE : new Marc.Tag("530"),
	REPRODUCTION_NOTE : new Marc.Tag("533"),
	ORIGINAL_VERSION_NOTE : new Marc.Tag("534"),
	LOCATION_OF_ORIGINALS_DUPLICATES_NOTE : new Marc.Tag("535"),
	FUNDING_INFORMATION_NOTE : new Marc.Tag("536"),
	SYSTEM_DETAILS_NOTE : new Marc.Tag("538"),
	TERMS_GOVERNING_USE_AND_REPRODUCTION_NOTE : new Marc.Tag("540"),
	IMMEDIATE_SOURCE_OF_ACQUISITION_NOTE : new Marc.Tag("541"),
	INFORMATION_RELATING_TO_COPYRIGHT_STATUS : new Marc.Tag("542"),
	LOCATION_OF_OTHER_ARCHIVAL_MATERIALS_NOTE : new Marc.Tag("544"),
	BIOGRAPHICAL_OR_HISTORICAL_DATA : new Marc.Tag("545"),
	LANGUAGE_NOTE : new Marc.Tag("546"),
	FORMER_TITLE_COMPLEXITY_NOTE : new Marc.Tag("547"),
	ISSUING_BODY_NOTE : new Marc.Tag("550"),
	ENTITY_AND_ATTRIBUTE_INFORMATION_NOTE : new Marc.Tag("552"),
	CUMULATIVE_INDEX_FINDING_AIDS_NOTE : new Marc.Tag("555"),
	INFORMATION_ABOUT_DOCUMENTATION_NOTE : new Marc.Tag("556"),
	OWNERSHIP_AND_CUSTODIAL_HISTORY : new Marc.Tag("561"),
	COPY_AND_VERSION_IDENTIFICATION_NOTE : new Marc.Tag("562"),
	BINDING_INFORMATION : new Marc.Tag("563"),
	CASE_FILE_CHARACTERISTICS_NOTE : new Marc.Tag("565"),
	METHODOLOGY_NOTE : new Marc.Tag("567"),
	LINKING_ENTRY_COMPLEXITY_NOTE : new Marc.Tag("580"),
	PUBLICATIONS_ABOUT_DESCRIBED_MATERIALS_NOTE : new Marc.Tag("581"),
	ACTION_NOTE : new Marc.Tag("583"),
	ACCUMULATION_AND_FREQUENCY_OF_USE_NOTE : new Marc.Tag("584"),
	EXHIBITIONS_NOTE : new Marc.Tag("585"),
	AWARDS_NOTE : new Marc.Tag("586"),
	SOURCE_OF_DESCRIPTION_NOTE : new Marc.Tag("588"),

	SUBJECT_ADDED_ENTRY_CORPORATE_NAME : new Marc.Tag("610"),
	SUBJECT_ADDED_ENTRY_MEETING_NAME : new Marc.Tag("611"),
	SUBJECT_ADDED_ENTRY_UNIFORM_TITLE : new Marc.Tag("630"),
	SUBJECT_ADDED_ENTRY_CHRONOLOGICAL_TERM : new Marc.Tag("648"),
	SUBJECT_ADDED_ENTRY_TOPICAL_TERM : new Marc.Tag("650"),
	SUBJECT_ADDED_ENTRY_GEOGRAPHIC_NAME : new Marc.Tag("651"),
	INDEX_TERM_UNCONTROLLED : new Marc.Tag("653"),
	SUBJECT_ADDED_ENTRY_FACETED_TOPICAL_TERMS : new Marc.Tag("654"),
	INDEX_TERM_GENRE_FORM : new Marc.Tag("655"),
	INDEX_TERM_OCCUPATION : new Marc.Tag("656"),
	INDEX_TERM_FUNCTION : new Marc.Tag("657"),
	INDEX_TERM_CURRICULUM_OBJECTIVE : new Marc.Tag("658"),
	SUBJECT_ADDED_ENTRY_HIERARCHICAL_PLACE_NAME : new Marc.Tag("662"),

	ADDED_ENTRY_PERSONAL_NAME : new Marc.Tag("700"),
	ADDED_ENTRY_CORPORATE_NAME : new Marc.Tag("710"),
	ADDED_ENTRY_MEETING_NAME : new Marc.Tag("711"),
	ADDED_ENTRY_UNCONTROLLED_NAME : new Marc.Tag("720"),
	ADDED_ENTRY_UNIFORM_TITLE : new Marc.Tag("730"),
	ADDED_ENTRY_UNCONTROLLED_RELATED_ANALYTICAL_TITLE : new Marc.Tag("740"),
	ADDED_ENTRY_GEOGRAPHIC_NAME : new Marc.Tag("751"),
	ADDED_ENTRY_HIERARCHICAL_PLACE_NAME : new Marc.Tag("752"),
	SYSTEM_DETAILS_ACCESS_TO_COMPUTER_FILES : new Marc.Tag("753"),
	ADDED_ENTRY_TAXONOMIC_IDENTIFICATION : new Marc.Tag("754"),
	MAIN_SERIES_ENTRY : new Marc.Tag("760"),
	SUBSERIES_ENTRY : new Marc.Tag("762"),
	ORIGINAL_LANGUAGE_ENTRY : new Marc.Tag("765"),
	TRANSLATION_ENTRY : new Marc.Tag("767"),
	SUPPLEMENT_SPECIAL_ISSUE_ENTRY : new Marc.Tag("770"),
	SUPPLEMENT_PARENT_ENTRY : new Marc.Tag("772"),
	HOST_ITEM_ENTRY : new Marc.Tag("773"),
	CONSTITUENT_UNIT_ENTRY : new Marc.Tag("774"),
	OTHER_EDITION_ENTRY : new Marc.Tag("775"),
	ADDITIONAL_PHYSICAL_FORM_ENTRY : new Marc.Tag("776"),
	ISSUED_WITH_ENTRY : new Marc.Tag("777"),
	PRECEDING_ENTRY : new Marc.Tag("780"),
	SUCCEEDING_ENTRY : new Marc.Tag("785"),
	DATA_SOURCE_ENTRY : new Marc.Tag("786"),
	OTHER_RELATIONSHIP_ENTRY : new Marc.Tag("787"),

	SERIES_ADDED_ENTRY_PERSONAL_NAME : new Marc.Tag("800"),
	SERIES_ADDED_ENTRY_CORPORATE_NAME : new Marc.Tag("810"),
	SERIES_ADDED_ENTRY_MEETING_NAME : new Marc.Tag("811"),
	SERIES_ADDED_ENTRY_UNIFORM_TITLE : new Marc.Tag("830"),
	HOLDING_INSTITUTION : new Marc.Tag("850"),
	LOCATION : new Marc.Tag("852"),
	ELECTRONIC_LOCATION_AND_ACCESS : new Marc.Tag("856"),
	ALTERNATE_GRAPHIC_REPRESENTATION : new Marc.Tag("880"),
	REPLACEMENT_RECORD_INFORMATION : new Marc.Tag("882"),
	FOREIGN_MARC_INFORMATION_FIELD : new Marc.Tag("886"),
	NON_MARC_INFORMATION_FIELD : new Marc.Tag("887")
};

/**
 * @namespace Unimarc constants and utilities. 
 **/
Marc.Unimarc = {
	/** Mapping of Zotero creatorTypes to their best Unimarc relator code matches.
	 * @see <a href="http://archive.ifla.org/VI/3/p1996-1/appx-c.htm">UNIMARC relator codes</a> 
	 * */
	creatorTypes : {
		"author" : "070",			//author
		"contributor" : "205",		//contributor
		"editor" : "340",			//editor
		"translator" : "730",		//translator
		"seriesEditor" : "651",		//publishing director
		"interviewee" : "460",		//interviewee
		"interviewer" : "470",		//interviewer
		"director" : "300",			//director
		"scriptwriter" : "690",		//scenarist
		"producer" : "630",			//producer
		"castMember" : "590",		//performer
		"sponsor" : "723",			//sponsor
		"counsel" : "255",			//consultant
		"inventor" : "584",			//patent inventor
		"attorneyAgent" : "582",	//patent applicant
		"recipient" : "660",		//recipient of letters
		"performer" : "590",		//performer
		"composer" : "230",			//composer
		"wordsBy" : "520",			//lyricist
		"cartographer" : "180",		//cartographer
		"programmer" : "635",		//programmer
		"artist" : "040",			//artist
		"commenter" : "210",		//commentator
		"presenter" : "570",		//other
		"guest" : "460",			//interviewee
		"podcaster" : "070",		//author
		"reviewedAuthor" : "100",	//bibliographic antecedent
		"cosponsor" : "400",		//funder
		"bookAuthor" : "070"		//author
	},
	
	/**
	 *  Return the best Unimarc relator code match for a Zotero creatorType.
	 *  @param {String} creatorType a Zotero creatorType
	 */
	getRelatorCode : function(creatorType) {
		var code = this.creatorTypes[creatorType];
		return code || "070";
	},
		
	/**
	 * Returns a valid Zotero creatorType for a Unimarc relator code.
	 * @param {String} relatorCode a three-digit Unimarc relator code
	 * @see <a href="http://archive.ifla.org/VI/3/p1996-1/appx-c.htm">UNIMARC relator codes</a> 
	 */
	getCreatorType : function(relatorCode) {
		switch(relatorCode) {
		case "005":
		case "250":
		case "275":
		case "590":	//performer
		case "755":	//vocalist
			return "performer";
		case "040":
		case "130":	//book designer
		case "740":	//type designer
		case "750":	//typographer
		case "350":	//engraver
		case "360":	//etcher
		case "430":	//illuminator
		case "440":	//illustrator
		case "510":	//lithographer
		case "530":	//metal engraver
		case "600":	//photographer
		case "705":	//sculptor
		case "760":	//wood engraver
			return "artist";
		case "070":
		case "305":
		case "330":
		case undefined:
			return "author";
		case "020":
		case "210":
		case "212":
			return "commenter";
		case "180":
			return "cartographer";
		case "220":
		case "340":
			return "editor";
		case "651":	//publishing director
			return seriesEditor;
		case "230":
			return "composer";
		case "245":
			return "inventor";
		case "255":
		case "695":	//scientific advisor
		case "727":	//thesis advisor
			return "counsel";
		case "300":
			return "director";
		case "400":	//funder
		case "723":	//sponsor
			return "sponsor";
		case "460":
			return "interviewee";
		case "470":
			return "interviewer";
		case "480":	//librettist
		case "520":    //lyricist
			return "wordsBy";
		case "605":
			return "presenter";
		case "630":
			return "producer";
		case "635":
			return "programmer";
		case "660":
			return "recipient";
		case "090":	//author of dialog
		case "690":	//scenarist
			return "scriptwriter";
		case "730":
			return "translator";
		//Ignore (no matching Zotero creatorType):
		case "320":	//donor
		case "610":	//printer
		case "650":	//publisher
			return undefined;
		//Default
		case "205":
		default:
			return "contributor";
		}
	},
	
};

/**
 * @namespace Mapping of human-readable names to Unimarc tags. The type of each property
 * is an object with a "tag" property containing the three-digit Unimarc tag and
 * a "flag" property containg a bitwise or of relevant flags from {@link Marc.Tag.Flags}. 
 */
Marc.Unimarc.Tags = {
	RECORD_IDENTIFIER : new Marc.Tag("001", Marc.Tag.Flags.MANDATORY | Marc.Tag.Flags.NOTREPEATABLE),
	VERSION_IDENTIFIER : new Marc.Tag("005", Marc.Tag.Flags.NOTREPEATABLE),
	ISBN : new Marc.Tag("010", 0),
	ISSN : new Marc.Tag("011", 0),
	FINGERPRINT_IDENTIFIER : new Marc.Tag("012", 0),
	ISMN : new Marc.Tag("013", 0),
	ARTICLE_IDENTIFIER : new Marc.Tag("014", 0),
	ISRN : new Marc.Tag("015", 0),
	ISRC : new Marc.Tag("016", 0),
	NATIONAL_BIBLIOGRAPHY_NUMBER : new Marc.Tag("020", 0),
	LEGAL_DEPOSIT_NUMBER : new Marc.Tag("021", 0),
	GOVERNMENT_PUBLICATION_NUMBER : new Marc.Tag("022", 0),
	OTHER_SYSTEM_CONTROL_NUMBERS : new Marc.Tag("035", 0),
	CODEN : new Marc.Tag("040", 0),
	PUBLISHERS_NUMBERS_FOR_MUSIC : new Marc.Tag("071", 0),
	
	GENERAL_PROCESSING_DATA: new Marc.Tag("100", Marc.Tag.Flags.MANDATORY | Marc.Tag.Flags.NOTREPEATABLE),
	LANGUAGE_OF_THE_ITEM: new Marc.Tag("101", Marc.Tag.Flags.NOTREPEATABLE),
	COUNTRY_OF_PUBLICATION_OR_PRODUCTION: new Marc.Tag("102", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_TEXTUAL_MATERIALS_MONOGRAPHIC: new Marc.Tag("105", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_TEXTUAL_MATERIALS_PHYSICAL_ATTRIBUTES: new Marc.Tag("106", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_SERIALS: new Marc.Tag("110", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_VISUAL_PROJECTIONS_VIDEORECORDINGS_AND_MOTION_PICTURES: new Marc.Tag("115", 0),
	CODED_GRAPHICS: new Marc.Tag("116", 0),
	CODED_THREE_DIMENSIONAL_ARTIFACTS_AND_REALIA: new Marc.Tag("117", 0),
	CODED_CARTOGRAPHIC_MATERIALS_GENERAL: new Marc.Tag("120", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_CARTOGRAPHIC_MATERIALS_PHYSICAL_ATTRIBUTES: new Marc.Tag("121", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_TIME_PERIOD_OF_ITEM_CONTENT: new Marc.Tag("122", 0),
	CODED_CARTOGRAPHIC_MATERIALS_SCALE_AND_CO_ORDINATES: new Marc.Tag("123", 0),
	CODED_CARTOGRAPHIC_MATERIALS_SPECIFIC_MATERIAL_DESIGNATION: new Marc.Tag("124", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_SOUND_RECORDINGS_AND_PRINTED_MUSIC: new Marc.Tag("125", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_SOUND_RECORDINGS_PHYSICAL_ATTRIBUTES: new Marc.Tag("126", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_DURATION_OF_SOUND_RECORDINGS_AND_PRINTED_MUSIC: new Marc.Tag("127", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_MUSICAL_PERFORMANCES_AND_SCORES: new Marc.Tag("128", 0),
	CODED_MICROFORMS: new Marc.Tag("130", 0),
	CODED_CARTOGRAPHIC_MATERIALS_GEODETIC_GRID_AND_VERTICAL_MEASUREMENT: new Marc.Tag("131", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_ELECTRONIC_RESOURCES: new Marc.Tag("135", 0),
	CODED_ANTIQUARIAN_GENERAL: new Marc.Tag("140", Marc.Tag.Flags.NOTREPEATABLE),
	CODED_ANTIQUARIAN_COPY_SPECIFIC_ATTRIBUTES	: new Marc.Tag("141", 0),
	
	TITLE_AND_STATEMENT_OF_RESPONSIBILITY: new Marc.Tag("200", Marc.Tag.Flags.MANDATORY | Marc.Tag.Flags.NOTREPEATABLE),
	EDITION_STATEMENT: new Marc.Tag("205", 0),
	MATERIAL_SPECIFIC_AREA_CARTOGRAPHIC_MATERIALS_MATHEMATICAL_DATA: new Marc.Tag("206", 0),
	MATERIAL_SPECIFIC_AREA_SERIALS_NUMBERING: new Marc.Tag("207", Marc.Tag.Flags.NOTREPEATABLE),
	MATERIAL_SPECIFIC_AREA_PRINTED_MUSIC: new Marc.Tag("208", Marc.Tag.Flags.NOTREPEATABLE),
	PUBLICATION_DISTRIBUTION_ETC: new Marc.Tag("210", Marc.Tag.Flags.NOTREPEATABLE),
	PROJECTED_PUBLICATION_DATE: new Marc.Tag("211", Marc.Tag.Flags.NOTREPEATABLE),
	PHYSICAL_DESCRIPTION: new Marc.Tag("215", 0),
	SERIES: new Marc.Tag("225", 0),
	MATERIAL_SPECIFIC_AREA_ELECTRONIC_RESOURCE_CHARACTERISTICS : new Marc.Tag("230", 0),
	
	GENERAL_NOTE: new Marc.Tag("300", 0),
	NOTES_PERTAINING_TO_IDENTIFICATION_NUMBERS: new Marc.Tag("301", 0),
	NOTES_PERTAINING_TO_CODED_INFORMATION: new Marc.Tag("302", 0),
	GENERAL_NOTES_PERTAINING_TO_DESCRIPTIVE_INFORMATION: new Marc.Tag("303", 0),
	NOTES_PERTAINING_TO_TITLE_AND_STATEMENT_OF_RESPONSIBILITY: new Marc.Tag("304", 0),
	NOTES_PERTAINING_TO_EDITION_AND_BIBLIOGRAPHIC_HISTORY: new Marc.Tag("305", 0),
	NOTES_PERTAINING_TO_PUBLICATION_DISTRIBUTION_ETC: new Marc.Tag("306", 0),
	NOTES_PERTAINING_TO_PHYSICAL_DESCRIPTION: new Marc.Tag("307", 0),
	NOTES_PERTAINING_TO_SERIES: new Marc.Tag("308", 0),
	NOTES_PERTAINING_TO_BINDING_AND_AVAILABILITY: new Marc.Tag("310", 0),
	NOTES_PERTAINING_TO_LINKING_FIELDS: new Marc.Tag("311", 0),
	NOTES_PERTAINING_TO_RELATED_TITLES: new Marc.Tag("312", 0),
	NOTES_PERTAINING_TO_SUBJECT_ACCESS: new Marc.Tag("313", 0),
	NOTES_PERTAINING_TO_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("314", 0),
	NOTES_PERTAINING_TO_MATERIAL_OR_TYPE_OF_PUBLICATION_SPECIFIC_INFORMATION: new Marc.Tag("315", 0),
	NOTE_RELATING_TO_THE_COPY_IN_HAND: new Marc.Tag("316", 0),
	PROVENANCE_NOTE: new Marc.Tag("317", 0),
	ACTION_NOTE: new Marc.Tag("318", 0),
	INTERNAL_BIBLIOGRAPHIES_INDEXES_NOTE: new Marc.Tag("320", 0),
	EXTERNAL_INDEXES_ABSTRACTS_REFERENCES_NOTE: new Marc.Tag("321", 0),
	CREDITS_NOTE_PROJECTED_AND_VIDEO_MATERIAL_AND_SOUND_RECORDINGS: new Marc.Tag("322", Marc.Tag.Flags.NOTREPEATABLE),
	CAST_NOTE_PROJECTED_AND_VIDEO_MATERIAL_AND_SOUND_RECORDINGS: new Marc.Tag("323", 0),
	FACSIMILE_NOTE: new Marc.Tag("324", Marc.Tag.Flags.NOTREPEATABLE),
	REPRODUCTION_NOTE: new Marc.Tag("325", 0),
	FREQUENCY_STATEMENT_NOTE_SERIALS: new Marc.Tag("326", 0),
	CONTENTS_NOTE: new Marc.Tag("327", Marc.Tag.Flags.NOTREPEATABLE),
	DISSERTATION_THESIS_NOTE: new Marc.Tag("328", 0),
	SUMMARY_OR_ABSTRACT: new Marc.Tag("330", 0),
	PREFERRED_CITATION_OF_DESCRIBED_MATERIALS: new Marc.Tag("332", 0),
	USERS_INTENDED_AUDIENCE_NOTE: new Marc.Tag("333", 0),
	TYPE_OF_ELECTRONIC_RESOURCE_NOTE: new Marc.Tag("336", 0),
	SYSTEM_REQUIREMENTS_NOTE_ELECTRONIC_RESOURCES: new Marc.Tag("337", 0),
	ACQUISITION_INFORMATION_NOTE: new Marc.Tag("345", Marc.Tag.Flags.NOTREPEATABLE),

	SERIES_LINK: new Marc.Tag("410", 0),
	SUBSERIES: new Marc.Tag("411", 0),
	SUPPLEMENT: new Marc.Tag("421", 0),
	PARENT_OF_SUPPLEMENT: new Marc.Tag("422", 0),
	ISSUED_WITH: new Marc.Tag("423", 0),
	CONTINUES: new Marc.Tag("430", 0),
	FORMED_BY_MERGER_OF_AND: new Marc.Tag("436", 0),
	CONTINUED_BY: new Marc.Tag("440", 0),
	SPLIT_INTO_AND: new Marc.Tag("446", 0),
	MERGED_WITH_AND_TO_FORM: new Marc.Tag("447", 0),
	CHANGED_BACK_TO: new Marc.Tag("448", 0),
	OTHER_EDITION_IN_THE_SAME_MEDIUM: new Marc.Tag("451", 0),
	OTHER_EDITION_IN_ANOTHER_MEDIUM: new Marc.Tag("452", 0),
	TRANSLATED_AS: new Marc.Tag("453", 0),
	TRANSLATION_OF: new Marc.Tag("454", 0),
	REPRODUCTION_OF: new Marc.Tag("455", 0),
	REPRODUCED_AS: new Marc.Tag("456", 0),
	SET: new Marc.Tag("461", 0),
	SUBSET: new Marc.Tag("462", 0),
	PIECE: new Marc.Tag("463", 0),
	PIECE_ANALYTIC: new Marc.Tag("464", 0),
	ITEM_REVIEWED: new Marc.Tag("470", 0),
	ALSO_BOUND_IN_THIS_VOLUME: new Marc.Tag("481", 0),
	BOUND_WITH: new Marc.Tag("482", 0),
	OTHER_RELATED_WORK : new Marc.Tag("488", 0),

	UNIFORM_TITLE: new Marc.Tag("500", 0),
	COLLECTIVE_UNIFORM_TITLE: new Marc.Tag("501", 0),
	UNIFORM_CONVENTIONAL_HEADING: new Marc.Tag("503", 0),
	PARALLEL_TITLE_PROPER: new Marc.Tag("510", 0),
	COVER_TITLE: new Marc.Tag("512", 0),
	ADDED_TITLE_PAGE_TITLE: new Marc.Tag("513", 0),
	CAPTION_TITLE: new Marc.Tag("514", 0),
	RUNNING_TITLE: new Marc.Tag("515", 0),
	SPINE_TITLE: new Marc.Tag("516", 0),
	OTHER_VARIANT_TITLES: new Marc.Tag("517", 0),
	TITLE_IN_STANDARD_MODERN_SPELLING: new Marc.Tag("518", 0),
	FORMER_TITLE_SERIALS: new Marc.Tag("520", 0),
	KEY_TITLE_SERIALS: new Marc.Tag("530", 0),
	ABBREVIATED_TITLE_SERIALS: new Marc.Tag("531", 0),
	EXPANDED_TITLE: new Marc.Tag("532", 0),
	ADDITIONAL_TITLE_SUPPLIED_BY_CATALOGUER: new Marc.Tag("540", 0),
	TRANSLATED_TITLE_SUPPLIED_BY_CATALOGUER: new Marc.Tag("541", 0),
	SECTION_TITLE : new Marc.Tag("545", 0),
	
	PERSONAL_NAME_USED_AS_SUBJECT: new Marc.Tag("600", 0),
	CORPORATE_BODY_NAME_USED_AS_SUBJECT: new Marc.Tag("601", 0),
	FAMILY_NAME_USED_AS_SUBJECT: new Marc.Tag("602", 0),
	NAME_AND_TITLE_USED_AS_SUBJECT: new Marc.Tag("604", 0),
	TITLE_USED_AS_SUBJECT: new Marc.Tag("605", 0),
	TOPICAL_NAME_USED_AS_SUBJECT: new Marc.Tag("606", 0),
	GEOGRAPHICAL_NAME_USED_AS_SUBJECT: new Marc.Tag("607", 0),
	FORM_GENRE_OR_PHYSICAL_CHARACTERISTICS_HEADING: new Marc.Tag("608", 0),
	UNCONTROLLED_SUBJECT_TERMS: new Marc.Tag("610", 0),
	SUBJECT_CATEGORY_PROVISIONAL: new Marc.Tag("615", 0),
	PLACE_ACCESS: new Marc.Tag("620", 0),
	TECHNICAL_DETAILS_ACCESS_ELECTRONIC_RESOURCES_OBSOLETE: new Marc.Tag("626", 0),
	GEOGRAPHIC_AREA_CODE_GAC: new Marc.Tag("660", 0),
	TIME_PERIOD_CODE: new Marc.Tag("661", 0),
	PRECIS: new Marc.Tag("670", 0),
	UNIVERSAL_DECIMAL_CLASSIFICATION_UD: new Marc.Tag("675", 0),
	DEWEY_DECIMAL_CLASSIFICATION_DD: new Marc.Tag("676", 0),
	LIBRARY_OF_CONGRESS_CLASSIFICATION: new Marc.Tag("680", 0),
	OTHER_CLASS_NUMBERS : new Marc.Tag("686", 0),

	PERSONAL_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("700", Marc.Tag.Flags.NOTREPEATABLE),
	PERSONAL_NAME_ALTERNATIVE_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("701", 0),
	PERSONAL_NAME_SECONDARY_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("702", 0),
	CORPORATE_BODY_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("710", Marc.Tag.Flags.NOTREPEATABLE),
	CORPORATE_BODY_NAME_ALTERNATIVE_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("711", 0),
	CORPORATE_BODY_NAME_SECONDARY_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("712", 0),
	FAMILY_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("720", Marc.Tag.Flags.NOTREPEATABLE),
	FAMILY_NAME_ALTERNATIVE_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("721", 0),
	FAMILY_NAME_SECONDARY_INTELLECTUAL_RESPONSIBILITY: new Marc.Tag("722", 0),
	NAME_INTELLECTUAL_RESPONSIBILITY : new Marc.Tag("730", 0),

	ORIGINATING_SOURCE: new Marc.Tag("801", Marc.Tag.Flags.MANDATORY),
	ISSN_CENTRE: new Marc.Tag("802", Marc.Tag.Flags.NOTREPEATABLE),
	GENERAL_CATALOGUERS_NOTE: new Marc.Tag("830", 0),
	ELECTRONIC_LOCATION_AND_ACCESS: new Marc.Tag("856", 0),
	DATA_NOT_CONVERTED_FROM_SOURCE_FORMAT : new Marc.Tag("886", 0)
};

/** Check whether a given record is Unimarc. */
Marc.Unimarc.isUnimarc = function(record) {
	return record
		&& record.hasField(Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY)
		&& !record.hasField(Marc.Marc21.Tags.TITLE_STATEMENT);
};


/**
 * Constructs an emprty MARC record. 
 * @class Represents a MARC record.
 **/
Marc.Record = function() {
	this._fields = new Array();
	this._leader = null;
};

Marc.Record.prototype = {
	constructor : Marc.Record,
	/** Serialize the record. 
	 * @param {Object} [options] an object controlling the details of the serialization:
	 * @param {String} [options.fieldDelimiter="\\n"] will be inserted after each field
	 * @param {String} [options.tagDelimiter=""] will be inserted after each tag
	 * @param {boolean} [options.suppressLeader=false] causes the leader not to be included
	 * @param {String} [options.blankIndicator="#"] represents an absent indicator
	 * @param {String} [options.indicatorDelimiter=""] will be inserted after each indicator
	 * @param {String} [options.subfieldCharacter="$"] represents a subfield delimiter
	 * @param {String} [options.subfieldDelimiter=""] will be inserted after each subfield tag (e.g. $a)
	 */
	serialize : function(options) {
		var result = "";
		if(!options) {
			options = {};
		}
		if(!options.fieldDelimiter) {
			options.fieldDelimiter = "\n";
		}
		if(!options.blankIndicator) {
			options.blankIndicator = '#';
		}
		if(!options.subfieldCharacter) {
			options.subfieldCharacter = '$';
		}
		if(!options.tagDelimiter) {
			options.tagDelimiter = "";
		}
		if(!options.indicatorDelimiter) {
			options.indicatorDelimiter = "";
		}
		if(!options.subfieldDelimiter) {
			options.subfieldDelimiter = "";
		}
		if(this._leader && !options.suppressLeader) {
			result += this._leader.serialize(options) + options.fieldDelimiter;
		}
		this._fields.forEach(function(field){
			result += field.serialize(options) + options.fieldDelimiter;
		});
		return result;
	},
	
	/**
	 * @returns {Marc.Record.Field} the field at the given position
	 */
	getField : function(idx) {
		return this._fields[idx];
	},

	/**
	 * @param {String|String[]|Object|Object[]|RegExp} tag specifies tags
	 * @returns {boolean} true if at least one field matches the supplied tag
	 */
	hasField : function(tag) {
		var pattern = this._buildFieldsPattern(tag);
		for(var j in this._fields) {
			var field = this._fields[j];
			if(!pattern || (pattern.test(field.getTag()))) {
				return true;
			}
		}
		return false;
	},
	
	_buildFieldsPattern : function(tag) {
		var pattern;
		if(tag) {
			if(tag.length && "string" != typeof tag) {
				Zotero.debug(tag);
				var expr = new Array();
				for(var j in tag) {
					if(tag[j].tag) {
						expr.push(tag[j].tag);
					}
					else {
						expr.push(tag[j]);
					}
				}
				pattern = new RegExp(expr.join("|"));
			}
			else if(tag.tag) {
				pattern = new RegExp(tag.tag);
			}
			else if("string" == typeof tag) {
				pattern = new RegExp(tag);
			}
			else if(tag instanceof RegExp) {
				pattern = tag;
			}
		}
		return pattern;
	},
		
	/* Return an array of fields specified by the tags argument.
	 * tags can be a string, a string array, a tag object ({tag: "XXX"}),
	 * an array of tag objects or a RegExp matching different tags (/7\d\d/).
	 */ 
	getFields : function(tag) {
		var pattern = this._buildFieldsPattern(tag);

		var result = new Array();
		for(var j in this._fields) {
			var field = this._fields[j];
			if(!pattern || (pattern.test(field.getTag()))) {
				result.push(field);
			}
		}
		return result;
	},
	
	/* Delete fields matching the tags argument (see getFields). */
	deleteFields : function(tag) {
		var pattern = this._buildFieldsPattern(tag);
		if(pattern) {
			for(var j in this._fields) {
				var field = this._fields[j];
				if(pattern.test(field.getTag())) {
					delete this._fields[j];
				}
			}
		}
	},
	
	/* Find fields matching tag (see getFields) where condition returns
	 * true for at least one of the subfields in subfieldIndexes. condition
	 * is called with the field and subfield as arguments.
	 */
	findFields : function(tag, condition, subfieldIndexes) {
		var result = new Array();
		//field loop
		getFields(tag).forEach(function(field){
			//Subfield loop
			if(subfieldIndexes) {
				var subfields = field.getSubfields(subfieldIndexes);
				for(var j in subfields) {
					var subfield = subfields[j];
					//Subfield level filtering
					if(condition) {
						if(condition(field, subfield)) {
							results.push(field);
							break;
						}
					}
					//Unconditional subfield matching
					else {
						results.push(field);
						break;
					}
				};
			}
			//Field level filtering
			else if(condition) {
				if(condition(field)) {
					results.push(field);
				}
			}
			//Unconditional field matching
			else {
				results.push(field);
			}
		});
		return result;
	},
	
	/**
	 * @returns {Marc.Record.Field} the field corresponding to the tag specification, if
	 * there exists exactly one such field
	 */
	getSingleField : function(tag) {
		var fields = this.getFields(tag);
		if(fields.length == 1) {
			return fields[0];
		}
		return undefined;
	},
	
	/**
	 * @returns {Marc.Record.Leader} the leader of this record. If no leader data have been
	 * set, a default leader will be returned.
	 */
	getLeader : function() {
		if(!this._leader) {
			this._leader = this._createLeader();
		}
		return this._leader;
	},
	
	/**
	 * Construct this record's leader from the given data.
	 * @param {String} data the raw record leader data
	 */
	setLeader : function(data) {
		if(data) {
			this._leader = new Marc.Record.Leader(data);
			return this._leader;
		}
	},

	_addField : function(field) {
		this._fields.push(field);
		return field;
	},

	/**
	 * Creates a field with the given tag and indicatorn and adds it to this record.
	 * @param {String} the field's tag
	 * @param {String} [indicator] the field indicator
	 * @returns {Marc.Record.Field} the added field
	 */
	addField : function(tag, indicator) {
		return this._addField(new Marc.Record.Field(this, tag, indicator));
	},

	/**
	 * Make sure all mandatory fields exist. Create dummies if necessary. 
	 */
	ensureMandatoryFields : function(item) {
		this.getLeader();
	},
	
	_createLeader : function() {
		this._leader = new Marc.Record.Leader();
	},
	
	_sortFields : function() {
		this._fields = this._fields.sort(function(a, b) {
			if (a.getTag() < b.getTag()) {
				return -1;
			} 
			else if(a.getTag() > b.getTag()) {
				return 1;
			}
			else {
				return 0;
			}
		});
	},

	/** Get a processed value. 
	 * @param {Object} [processing] An object with the following members : 
	 * @param {Function} [processSubfield] function(value), called on each added subfield.
	 * Returns the string to be added to the assembled value (default is to use subfield.getContent()).
	 * @param {Function} [processField] function(value), called on the assembled value for each processed field
	 * Returns the string to be added to the assembled value.
	 * @param {Function} [processAll] function(value, ar1, arg2), called on the assembled value for all fields
	 * Returns the final value.
 	 * processAll: function(value, arg1, arg2)
 	 * @param [arg1] argument to processAll
 	 * @param [arg2] argument to processAll
 	 * @param {String} [subfieldJoin] string used to join all matching subfield values for a single field
 	 * @param {String} [fieldJoin] string used to join the resulting strings from processing all matching fields
	 * */
	getValue : function(tag, subfieldIndexes, processing) {
		if(!subfieldIndexes) {
			subfieldIndexes = "";
		}
		if(!processing) {
			processing = {};
		}
		//Get relevant fields
		var fields = this.getFields(tag);
		var fieldResults = new Array();
		for(var j in fields) {
			var field = fields[j];
			var fieldResult = field.getValue(subfieldIndexes, processing);
			if(fieldResult && fieldResult.length) {
				if(!processing.suppressDuplicates || !Zotero.Utilities.inArray(fieldResult, fieldResults)) {
					fieldResults.push(fieldResult);
				}
			}
		}
		if(fieldResults.length > 0) {
			var value = fieldResults.join(processing.fieldJoin || " ");
			if(processing.processAll) {
				value = processing.processAll(value, processing.arg1, processing.arg2);
			}
			return value;
		}
		return "";
	},
	
	/**
	 * Dump this record to the console.
	 */
	dump : function() {
		this._sortFields();
		var str = "MARC record:";
		str += "\n" + this._leader.debugString();
		for(var j in this._fields) {
			str += "\n" + this._fields[j].debugString();
		}
		Zotero.debug(str);
	}
};

/** Constructs a record leader. 
 * @class Represents a record leader (or label).
 * @param {String} [data] the raw label data. If missing, the leader will have default values. 
 * */
Marc.Record.Leader = function(data) {
	this._data = data || this._getDefaultData();
};

Marc.Record.Leader.prototype = {
	constructor: Marc.Record.Leader,
	/** Default data. */
	_getDefaultData : function() {
		var data = Zotero.Utilities.lpad("", " ", 24);
		data[6] = 'a';
		data[7] = 'm';
		data[10] = '2';
		data[11] = '2';
		data[20] = '4';
		data[21] = '5';
		data[22] = '0';
	},
	
	/**
	 *  Serialize the leader. See Record.serialize for available options.
	 *  @returns {String}
	 */
	serialize : function(options) {
		var result = "";
		if(!options.suppressLeader) {
			result += "000" 
				+ options.tagDelimiter
				+ this._data;
		}
		return result;
	},
	
	/**
	 * @returns {String} a string representation fitting for console output
	 */
	debugString : function() {
		return "000:\n\t" + this._data
			+ "\n\trecord length: " + this.getRecordLength()
			+ "\n\trecord status: " + this.getRecordStatus()
			+ "\n\trecord type: " + this.getRecordType()
			+ "\n\timplementation codes: " + this.getImplementationCodes()
			+ "\n\tindicator length: " + this.getIndicatorLength()
			+ "\n\tsubfield delimiter length: " + this.getSubfieldDelimiterLength()
			+ "\n\tbase address: " + this.getBaseAddress()
			+ "\n\tdir length length: " + this.getDirectoryLengthLength()
			+ "\n\tdir start address length: " + this.getDirectoryStartLength()
			+ "\n\tdir impl data length: " + this.getDirectoryImplLength();
	},
	/**
	 * @return {Integer}
	 */
	getRecordLength : function() {
		return parseInt(this._data.substr(0, 5), 10);
	},
	/**
	 * @return {String} the record status
	 */
	getRecordStatus : function() {
		return this._data.substr(5, 1);
	},
	/**
	 * @return {String} the record type
	 */
	getRecordType : function() {
		return this._data.substr(6, 1);
	},
	/**
	 * @return {String} the implementation specific codes at positions 7-9
	 */
	getImplementationCodes : function() {
		return this._data.substr(7, 3);
	},
	/**
	 * @return {Integer}
	 */
	getIndicatorLength : function() {
		return parseInt(this._data.substr(10, 1), 10);
	},
	/**
	 * @return {Integer}
	 */
	getSubfieldDelimiterLength : function() {
		return parseInt(this._data.substr(11, 1), 10);
	},
	/**
	 * @return {Integer}
	 */
	getBaseAddress : function() {
		return parseInt(this._data.substr(12, 5), 10);
	},
	/**
	 * @return {Integer}
	 */
	getDirectoryLengthLength : function() {
		return parseInt(this._data.substr(20, 1), 10);
	},
	/**
	 * @return {Integer}
	 */
	getDirectoryStartLength : function() {
		return parseInt(this._data.substr(21, 1), 10);
	},
	/**
	 * @return {Integer}
	 */
	getDirectoryImplLength : function() {
		return parseInt(this._data.substr(22, 1), 10);
	},
	/**
	 * @return {String} an arbitrary substring of the leader's data
	 */
	getDataSubstr : function(start, len) {
		return this._data.substr(start, len);
	}

};


/**
 *  Constructs an empty Unimarc record. Currently used by exports only.
 *  @class An Unimarc record. 
 *  @augments Marc.Record
 *  */
Marc.UnimarcRecord = function() {
};

Marc.UnimarcRecord.prototype = new Marc.Record();
Marc.UnimarcRecord.prototype.constructor = Marc.UnimarcRecord;
Marc.UnimarcRecord.prototype.ensureMandatoryFields = function(item) {
	Marc.Record.prototype.ensureMandatoryFields.call(this);
	for(var t in Marc.Unimarc.Tags) {
		var tag = Marc.Unimarc.Tags[t];
		if(tag.flags & Marc.Tag.Flags.MANDATORY) {
			if(!this.hasField(tag.tag)) {
				this._createMandatoryField(item, tag.tag);
			}
		}
	}
};
		
Marc.UnimarcRecord.prototype._createMandatoryField = function(item, tag) {
	switch(tag) {
	case Marc.Unimarc.Tags.RECORD_IDENTIFIER.tag:
		this._createRecordIdentifier(item);
		break;
	case Marc.Unimarc.Tags.GENERAL_PROCESSING_DATA.tag:
		this._createGeneralProcessingData(item);
		break;
	case Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY.tag:
		this._createTitle(item);
		break;
	case Marc.Unimarc.Tags.ORIGINATING_SOURCE.tag:
		this._createOriginatingSource(item);
	}
};
		
Marc.UnimarcRecord.prototype._createRecordIdentifier = function(item) {
	this.addField(Marc.Unimarc.Tags.RECORD_IDENTIFIER)
		.addSingleContent("ZoteroItem");
};
		
Marc.UnimarcRecord.prototype._createGeneralProcessingData = function(item) {
	var data = Zotero.Utilities.lpad("", "#", 36);
	this.addField(Marc.Unimarc.Tags.GENERAL_PROCESSING_DATA)
		.addSubfield("a", data);
};
		
Marc.UnimarcRecord.prototype._createTitle = function(item) {
	this.addField(Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY)
		.addSubfield("a", "[No title]");
};
		
Marc.UnimarcRecord.prototype._createOriginatingSource = function(item) {
	this.addField(Marc.Unimarc.Tags.ORIGINATING_SOURCE, " 0")
		.addSubfield("b", "Zotero");
};


/**
 * @namespace Record utilities.
 **/
Marc.Records = {
	/**
	 * @param {String} [type="generic"] the MARC type ("marc21", "unimarc", "generic")
	 * @returns {Marc.Record} an empty record of the given type
	 */
	newRecord : function(type) {
		switch(type) {
		case "unimarc":
			return new Marc.UnimarcRecord();
		case "marc21":
		case "generic":
		default:
			return new Marc.Record();
		}
	}
};


/* Fields */

/**
 * Constructs a MARC field.
 * @class A MARC field.
 * @param {Marc.Record} record the containing record
 * @param {String} tag the field's tag
 * @param {String} [indicator] the field's indicator
 */
Marc.Record.Field = function(record, tag, indicator) {
	this._record = record; 
	this._tag = tag.tag || tag;
	if(this._tag.length > 3) {
		this._tag = this._tag.substr(0, 3);
	}
	else if(this._tag.length < 3) {
		this._tag = Zotero.Utilities.lpad(this._tag, "0", 3);
	}
	this._indicator = indicator || "  ";
	if(this._tag.substr(0, 2) == "00") {
		delete this._indicator;
	}
	else {
		var indicatorLength = this._record.getLeader().getIndicatorLength();
		if(this._indicator.length > indicatorLength) {
			this._indicator = this._indicator.substr(0, indicatorLength);
		}
		else if(this._indicator.length < indicatorLength) {
			this._indicator = Zotero.Utilities.lpad(this._indicator, " ", indicatorLength);
		}
	}
	this._subfields = new Array();
	this._embeddedFields = new Array();
};

Marc.Record.Field.prototype = {
	constructor : Marc.Record.Field,
	/**
	 *  Serialize the field. See {@link Marc.Record#serialize} for available options.
	 */
	serialize : function(options) {
		var result = this.getTag() + options.tagDelimiter;
		if(this._indicator) {
			result += this._indicator.replace(/ /g, options.blankIndicator)
				+ options.indicatorDelimiter;
		}
		this._subfields.forEach(function(subfield){
			result += subfield.serialize(options);
		});
		this._embeddedFields.forEach(function(embeddedField){
			result += options.subfieldCharacter + "1"
				+ embeddedField.serialize(options);
		});
		return result;
	},

	/**
	 * @returns {String} a suitable string for console debugging. Do not
	 * cass Zotero.debug() on a field instance (inifinite loop).
	 */
	debugString : function() {
		var str = this.getTag();
		if(this._indicator) {
			str += " [" + this._indicator + "]";
		}
		str += ":";
		for(var j in this._subfields) {
			str += "\n" + this._subfields[j].debugString();
		}
		if(this._embeddedFields.length > 0) {
			str += "Embedded fields:";
			for(var j in this._embeddedFields) {
				str += "\n" + this._embeddedFields[j].debugString();
			}
		}
		return str;
	}, 

	/**
	 * @returns {String} the three-digit tag of this field.
	 */
	getTag : function() {
		return this._tag;
	},
	
	/**
	 * @returns {String} the two-character indicator of this field, or
	 * nothing in the case of control fields (00X)
	 */
	getIndicator : function() {
		return this._indicator;
	},

	/**
	 * @returns {Marc.Record.Subfield} the subfield at the given index
	 */
	getSubfield : function(idx) {
		return this._subfields[idx];
	},

	/**
	 * @returns {Marc.Record.Subfield[]} an array of subfields specified by the tags argument.
	 * @param {String|String[]} [tag] a matching condition for the subfields to be returned.
	 * Can be a string of subfield tags ("a", "aef") or an array of strings (["a", "e", "f"]).
	 * If the argument is missing, all subfields will be terurned.
	 */ 
	getSubfields : function(tag) {
		var result = new Array();
		if(tag && tag.length && "string" != typeof tag) {
			tag = tag.join("");
		}
		for(var j in this._subfields) {
			var subfield = this._subfields[j];
			if(!tag || (tag.indexOf(subfield.getTag()) >= 0)) {
				result.push(subfield);
			}
		}
		return result;
	},
	
	/** Assemble subfield values to a single string.
	 * @returns {String} the assembled value from all matching subfields
	 * @param {String} subfieldIndexes a subfield selector. See {@link #getSubfields}
	 * @param {Object} [processing] controls the assembly of subfield values into
	 * a single string. See {#link Marc.Record#getValue}.
	 */
	getValue : function(tag, processing) {
		if(!processing) {
			processing = {};
		}
		var results = new Array();
		var subfields = this.getSubfields(tag);
		for(var j in subfields) {
			var subfield = subfields[j];
			if(processing.processSubfield) {
				subfield = processing.processSubfield(subfield);
			}
			else {
				subfield = subfield.getContent();
			}
			if(!processing.suppressDuplicates || !Zotero.Utilities.inArray(subfield, results)) {
				results.push(subfield);
			}
		}
		if(results.length > 0) {
			var value = results.join(processing.subfieldJoin || " ");
			if(processing.processField) {
				value = processing.processField(value);
			}
			return value;
		}
		else {
			return "";
		}
	},
	
	/** Check whether at least one subfield matched the tag condition.
	 * @param {String} tag a subfield selector. See {@link #getSubfields}
	 */
	hasSubfield : function(tag) {
		if(tag && tag.length && "string" != typeof tag) {
			tag = tag.join("");
		}
		for(var j in this._subfields) {
			var subfield = this._subfields[j];
			if(!tag || (tag.indexOf(subfield.getTag()) >= 0)) {
				return true;
			}
		}
	},
	
	/**
	 * Get the embedded fields of this field.
	 * @returns {Marc.Record.Field[]} array of embedded fields
	 */
	getEmbeddedFields : function() {
		return this._embeddedFields;
	},

	/**
	 * Initialize this field from raw field data.
	 * @param {String} data the raw field data including the indicator but without the tag
	 * @returns {Marc.Record.Field} this field
	 */
	parse : function(data) {
		//Control field?
		if(this._tag.substr(0, 2) != "00") {
			//Indicator
			var indicatorLength = this._record.getLeader().getIndicatorLength();
			if(data[0] != Marc.Delimiters.SUBFIELD_DELIMITER) {
				this._indicator = data.substr(0, indicatorLength);
				data = data.substr(indicatorLength);
			}
			else {
				this._indicator = Zotero.Utilities.lpad("", " ", 2);
			}
			//Subfields
			var subfields = data.split(Marc.Delimiters.SUBFIELD_SPLITTER);
			for(var j in subfields) {
				var subfield = subfields[j];
				if(subfield && subfield.length) {
					var subfieldIndex = subfield.substr(0, 1);
					var subfieldData = subfield.substr(1);
					//Embedded field?
					if(subfieldIndex == "1") {
						var subtag = subfieldData.substr(1, 3);
						subfieldData = subfieldData.substr(4);
						var embeddedField = new Marc.Record.Field(subtag).parse(subfieldData);
						this.embeddedFields.push(embeddedField);
					}
					//Subfield
					else {
						this.addSubfield(subfieldIndex, subfieldData);
					}
				}
			}
		}
		else {
			delete this._indicator;
			this.addSingleContent(data.replace(Marc.Delimiters.FIELD_TERMINATOR, ""));
		}
		return this;
	},

	_addSubfield : function(subfield) {
		this._subfields.push(subfield);
		return subfield;
	},

	/**
	 * Add a subfield to this field.
	 * @param {String} tag the subfield tag (e.g. "a")
	 * @param {String} content the content of the new subfield (e.g. "Doe, John")
	 * @returns {Marc.Record.Field} this field (not the subfield! see example)
	 * @example
	 * record.addField(Marc.Marc21.Tags.TITLE_STATEMENT)
	 * 	.addSubfield("a", "Zotero:")
	 *  .addSubfields("b", "an Introduction");
	 */
	addSubfield : function(tag, content) {
		if(content) {
			this._addSubfield(new Marc.Record.Subfield(tag, content));
		}
		return this;
	},
	
	/**
	 * Add content to a control field (00X) that won't have any subfields.
	 * @param {String} content the field content
	 * @returns {Marc.Record.Field} this field
	 * @throws an execption if applied to a field that is not a 00X
	 * */
	addSingleContent : function(content) {
		if(this.getTag().substr(0, 2) == "00") {
			this._subfields = new Array();
			return this.addSubfield("?", content);
		}
		else {
			throw "Single content is allowed for 00X fields only";
		}
		return this;
	},
	
	/**
	 * Get the content of a control field (00X) that does not have any subfields.
	 * @returns {String} content the field content
	 * @throws an execption if applied to a field that is not a 00X
	 * */
	getSingleContent : function() {
		if(this.getTag().substr(0, 2) == "00") {
			return getSubfields("?").join("");
		}
		else {
			throw "Single content is allowed for 00X fields only";
		}
	}
};

/* Subfields */

/**
 * Constructs a new subfield.
 * @class Represents a single subfield.
 */
Marc.Record.Subfield = function(tag, content) {
	this._tag = tag;
	this._content = content;
};

Marc.Record.Subfield.prototype = {
	constructor : Marc.Record.Subfield,
	/**
	 *  Serialize the subfield. See {@linc Marc.Record#serialize} for available options.
	 *  @returns {String}
	 */
	serialize : function(options) {
		var result = "";
		if(this.getTag() != "?") {
			result += options.subfieldCharacter + this.getTag() + options.subfieldDelimiter;
		}
		result += this.getContent();
		return result;
	},
	
	/**
	 * Get the subfield tag, e.g. "a"
	 * @returns {String} the subfield tag
	 */
	getTag : function() {
		return this._tag;
	},

	/**
	 * Get the subfield content, e.g. "Doe, John"
	 * @returns {String} the subfield tag
	 */
	getContent : function() {
		return this._content;
	},

	/**
	 * Get a suitable string for console output
	 * @returns {String}
	 */
	debugString : function() {
		if(this._index && this._index != '?') {
			return "\t$" + this._index + ": " + this._content;
		}
		else {
			return "\t" + this._content;
		}	
	}
};

	
/**
 *  Constructs an export converter base class.
 *  @class ExportConverter instances build Marc records from Zotero items.
 *  This is an abstract base class; derived classes must take actions 
 *  for a specific Marc format.
 */
Marc.ExportConverter = function() {
};

/**
 *  Takes a Zotero item and creates a MARC record. Must be overridden by subclasses.
 *  @param {Zotero.Item} item the Zotero item
 *  @returns {Marc.Record} the record, filled with data from item 
 **/
Marc.ExportConverter.prototype.convert = function(item) {
	var record = Marc.Records.newRecord();
	return record;
};


/**
 * Constructs a UnimarcExportConverter.
 * @class An ExportConverter rendering Unimarc records.
 * @augments Marc.ExportConverter
 *  */
Marc.UnimarcExportConverter = function() {
};
Marc.UnimarcExportConverter.prototype = new Marc.ExportConverter;
Marc.UnimarcExportConverter.prototype.constructor = Marc.UnimarcExportConverter;

Marc.UnimarcExportConverter.prototype._convertCreators = function(record, item) {
	for(var j in item.creators) {
		var creator =  item.creators[j];
		var field = false;
		if(creator.creatorType == "author" && !record.hasField(Marc.Unimarc.Tags.PERSONAL_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY)) {
			field = record.addField(Marc.Unimarc.Tags.PERSONAL_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY);
		}
		else {
			field = record.addField(Marc.Unimarc.Tags.PERSONAL_NAME_ALTERNATIVE_INTELLECTUAL_RESPONSIBILITY);
		}
		if(field) {
			field.addSubfield("a", creator.lastName)
				.addSubfield("b", creator.firstName)
				.addSubfield("4", Marc.Unimarc.getRelatorCode(creator.creatorType));
		}
	}
};
		
Marc.UnimarcExportConverter.prototype._convertTitle = function(record, item) {
	var title = item.title;
	var shortTitle = item.shortTitle;
	if(shortTitle 
		&& shortTitle.length > 0
		&& shortTitle.length < title.length
		&& shortTitle == title.substr(0, shortTitle.length)) {
		record.addField(Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY)
			.addSubfield("a", shortTitle)
			.addSubfield("e", title.substr(shortTitle.length));
	}
	else {
		record.addField(Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY)
			.addSubfield("a", title);
	}
};
		
Marc.UnimarcExportConverter.prototype._convertEdition = function(record, item) {
	if(item.edition) {
		record.addField(Marc.Unimarc.Tags.EDITION_STATEMENT)
			.addSubfield("a", item.edition);
	}
	if(item.place || item.publisher || item.date) {
		record.addField(Marc.Unimarc.Tags.PUBLICATION_DISTRIBUTION_ETC)
			.addSubfield("a", item.place)
			.addSubfield("c", item.publisher)
			.addSubfield("d", item.date);
	}	
};

/**
 * Overrides {@link Marc.ExportConverter#convert}. Creates a
 * {@link Marc.UnimarcRecord} and filles it with item data.
 */
Marc.UnimarcExportConverter.prototype.convert = function(item) {
	var record = Marc.Records.newRecord("unimarc");
	//Creators
	this._convertCreators(record, item);
	//Title
	this._convertTitle(record, item);
	//Edition
	this._convertEdition(record, item);

	//Ensure mandatory fields, creates dummies if necessary
	record.ensureMandatoryFields(item);
	return record;
}; 


/** Constructs an ImportConverter.
 * @class ImportConverters create Zotero items from a given Marc record.
 * This is an abstract base class; derived classes must take actions 
 *  for a specific Marc format.
 **/
Marc.ImportConverter = function() {
};

/**
 *  Takes a MARC record and return a Zotero item.
 *  Creates an empty item and calls the _getXXX methods of this class.
 *  Subclasses do not necessarily need to override this method, it may suffice
 *  to override the _getXXX member functions.
 *  @param {Marc.Record} the Marc record to be converted
 *  @returns {Zotero.Item} an item filled with the record's data
 **/
Marc.ImportConverter.prototype.convert = function(record) {
	var item = new Zotero.Item();
	this._getItemType(record, item);
	this._getISBN(record, item);
	this._getISSN(record, item);
	this._getCreators(record, item);
	this._getTitle(record, item);
	this._getLanguage(record, item);
	this._getAbstract(record, item);
	this._getEdition(record, item);
	this._getMaterialDescription(record, item);
	this._getSeries(record, item);
	this._getTags(record, item);
	this._getCallNumber(record, item);
	this._getExtra(record, item);
	this._getNotes(record, item);
	this._getAttachments(record, item);
	return item;
};

/** Add tag, if not present yet in the item.
 * @param {Zotero.Item} item the target item
 * @param {String} tag a tag to be added
 * @public
 */
Marc.ImportConverter.prototype._addTag = function(item, tag) {
	for(var t in item.tags) {
		if(item.tags[t] == tag) {
			return;
		}
	}
	item.tags.push(tag);
};


/**
 *  Add extra text.
 * */
Marc.ImportConverter.prototype._addExtra = function(noteText, extra) {
	if(extra) {
		if(!/\.\?$/.exec(noteText)) {
			noteText += ". ";
		}
		else {
			noteText += " ";
		}
		noteText += Zotero.Utilities.trim(extra);
	}
	return noteText;
}




/** 
 * Get item type from a record. the default implementation will evaluate the
 * leader's record type flag. Derived classes may use finer methods.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getItemType = function(record, item) {
	var leader = record.getLeader();
	if(leader) {
		switch(leader.getRecordType()) {
		case "g":
			item.itemType = "film";
			break;
		case "e":
		case "f":
			item.itemType = "map";
			break;
		case "i":
		case "j":
			item.itemType = "audioRecording";
			break;
		case "k":
		case "r":
			item.itemType = "artwork";
			break;
		case "t":
			item.itemType = "manuscript";
			break;
		default:
			item.itemType = "book";
		}
	} 
	else {
		item.itemType = "book";
	}
};

/** 
 * Get the ISBN from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getISBN = function(record, item) {
};

/** 
 * Get the ISSN from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getISSN = function(record, item) {
};

/** 
 * Get the creators from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getCreators = function(record, item) {
};

/** 
 * Get the title from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getTitle = function(record, item) {
};

/** 
 * Get the language from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getLanguage = function(record, item) {
};

/** 
 * Get an abstract from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getAbstract = function(record, item) {
};

/** 
 * Get the edition details (edition statement, place, publisher, date) from a record. 
 * The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getEdition = function(record, item) {
};

/** 
 * Get tags from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getTags = function(record, item) {
};

/** 
 * Get the material description (e.g. number of pages) from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getMaterialDescription = function(record, item) {
};

/** 
 * Get series information (series name, number) from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getSeries = function(record, item) {
};

/** 
 * Get extra information from a record into the item's extra field. 
 * The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getExtra = function(record, item) {
};

/** 
 * Generate notes from a record. The default implementation will create a note
 * containing the serialized MARC record.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getNotes = function(record, item) {
	var marcCode = record.serialize({fieldDelimiter: "</br>"});
	item.notes.push({title: "MARC code", note: "<pre>" + marcCode + "</pre>"});
};

/** 
 * Get the call number(s) from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getCallNumber = function(record, item) {
};

/** 
 * Generate attachments from a record. The default implementation will do nothing.
 * @param {Marc.Record} record the source record 
 * @param {Zotero.Item} the target item 
 **/
Marc.ImportConverter.prototype._getAttachments = function(record, item) {
};


/**
 * Constructs a Marc21 import converter.
 * @class ImportConverter implementation for records in Marc-21 format.
 * @augments Marc.ImportConverter 
 * */
Marc.Marc21ImportConverter = function() {
};
Marc.Marc21ImportConverter.prototype = new Marc.ImportConverter;
Marc.Marc21ImportConverter.prototype.constructor = Marc.Marc21ImportConverter;


/**
 * General purpose cleaning. Trims heading and trailing .,/;; and whitespace.
 * Collapses double whitespace.
 */
Marc.Marc21ImportConverter.prototype._clean = function(value) {
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
};

/** Number extraction */
Marc.Marc21ImportConverter.prototype._pullNumber = function(text) {
	var pullRe = /[0-9]+/;
	var m = pullRe.exec(text);
	if(m) {
		return m[0];
	}
};

/** ISBN/ISSN extraction. */
Marc.Marc21ImportConverter.prototype._pullISBN = function(text) {
	var pullRe = /[0-9X\-]+/;
	var m = pullRe.exec(text);
	if(m) {
		return m[0];
	}
};


Marc.Marc21ImportConverter.prototype._getISBN = function(record, item) {
	var value = record.getValue(Marc.Marc21.Tags.ISBN, "a");
	if(value) {
		item.ISBN = this._pullISBN(value);
	}
};

Marc.Marc21ImportConverter.prototype._getISSN = function(record, item) {
	var value = record.getValue(Marc.Marc21.Tags.ISSN, "a");
	if(value) {
		item.ISSN = this._pullISBN(value);
	}
};

Marc.Marc21ImportConverter.prototype._getCreator = function(field, item) {
	//Get names
	var firstName;
	var lastName;
	switch(field.getTag()) {
	case Marc.Marc21.Tags.MAIN_ENTRY_PERSONAL_NAME.tag:
	case Marc.Marc21.Tags.ADDED_ENTRY_PERSONAL_NAME.tag:
		switch(field.getIndicator()[0]) {
		case "0":
			firstName = this._clean(field.getValue("ac", {subfieldJoin: ""}));
			break;
		case "1":
			var value = field.getValue("a");
			value = Zotero.Utilities.cleanAuthor(value, "author", true);
			firstName = value.firstName;
			lastName = value.lastName;
			break;
		case "3":
		default:
			lastName = this._clean(field.getValue("a"));
		}
		break;
	case Marc.Marc21.Tags.MAIN_ENTRY_CORPORATE_NAME.tag:
	case Marc.Marc21.Tags.MAIN_ENTRY_MEETING_NAME.tag:
	case Marc.Marc21.Tags.ADDED_ENTRY_CORPORATE_NAME.tag:
	case Marc.Marc21.Tags.ADDED_ENTRY_MEETING_NAME.tag:
	default:
		lastName = this._clean(field.getValue("a"));
	}
	
	//Loop through relators
	var relators = field.getSubfields("e");
	if(relators.length) {
		relators.forEach(function(subfield) {
			var relatorCode = subfield.getContent();
			var creatorType = Marc.Marc21.getCreatorType(relatorCode);
			if(creatorType) {
				item.creators.push({firstName: firstName, lastName: lastName, creatorType: creatorType});
			}
		});
	}
	else {
		item.creators.push({firstName: firstName, lastName: lastName, creatorType: "author"});
	}
};

Marc.Marc21ImportConverter.prototype._getCreators = function(record, item) {
	record.getFields([
	                  Marc.Marc21.Tags.MAIN_ENTRY_PERSONAL_NAME,
	                  Marc.Marc21.Tags.MAIN_ENTRY_CORPORATE_NAME,
	                  Marc.Marc21.Tags.MAIN_ENTRY_MEETING_NAME,
	                  Marc.Marc21.Tags.ADDED_ENTRY_PERSONAL_NAME,
	                  Marc.Marc21.Tags.ADDED_ENTRY_CORPORATE_NAME,
	                  Marc.Marc21.Tags.ADDED_ENTRY_MEETING_NAME
	                 ]).forEach(function(field) {
		this._getCreator(field, item); 
	}, this);
};

Marc.Marc21ImportConverter.prototype._getTitle = function(record, item) {
	var value = record.getValue(Marc.Marc21.Tags.TITLE_STATEMENT, "ab",
	                 {fieldJoin: " / ", subfieldJoin: ""});
	if(value) {
		item.title = this._clean(value);
	}
};

Marc.Marc21ImportConverter.prototype._getEdition = function(record, item) {
	//Extract edition
	var value = record.getValue(Marc.Marc21.Tags.EDITION_STATEMENT, "ab");
	if(value) {
		item.edition = this._clean(value);
	}

	// Extract place info
	value = record.getValue(Marc.Marc21.Tags.PUBLICATION_DISTRIBUTION_ETC_IMPRINT, "a",
			{fieldJoin: " / "});
	if(value) {
		item.place = this._clean(value);
	}
	
	// Extract publisher/distributor
	value = record.getValue(Marc.Marc21.Tags.PUBLICATION_DISTRIBUTION_ETC_IMPRINT, "b",
			{fieldJoin: " / "});
	if(value) {
		if(item.itemType == "film") {
			item.distributor = this._clean(value);
		} 
		else {
			item.publisher = this._clean(value);
		}
	}

	// Extract date
	value = record.getValue(Marc.Marc21.Tags.PUBLICATION_DISTRIBUTION_ETC_IMPRINT, "c",
			{fieldJoin: " / "});
	if(value) {
		item.date = this._pullNumber(value);
	}

};


/**
 * Constructs a Unimarc import converter.
 * @class ImportConverter implementation for records in Unimarc format.
 * @augments Marc.ImportConverter 
 * */
Marc.UnimarcImportConverter = function() {
};
Marc.UnimarcImportConverter.prototype = new Marc.ImportConverter;
Marc.UnimarcImportConverter.prototype.constructor = Marc.UnimarcImportConverter;

/**
 * Set the item's itemType. Extends the base class implementation by adding
 * support for manusripts (record type 'b') and thesis. 
 **/
Marc.UnimarcImportConverter.prototype._getItemType = function(record, item) {
	Marc.ImportConverter.prototype._getItemType.call(this, record, item);
	var leader = record.getLeader();
	if(leader) {
		switch(leader.getRecordType()) {
		case "b":
			item.itemType = "manuscript";
		}
//		//Bibliograhical level (TODO: any good?)
//		switch(leader.getImplementationCodes()[0]) {
//		case "a": 	//analytic
//			if(itemType == "book") {
//				item.itemType = "article";
//			}
//		}
	}
	
	//Thesis?
	if(record.hasField(Marc.Unimarc.Tags.DISSERTATION_THESIS_NOTE)) {
		item.itemType = "thesis";
	}
}

Marc.UnimarcImportConverter.prototype._getISBN = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.ISBN, "a");
	if(value) {
		item.ISBN = value;
	}
};

Marc.UnimarcImportConverter.prototype._getISSN = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.ISSN, "a");
	if(value) {
		item.ISSN = value;
	}
};

Marc.UnimarcImportConverter.prototype._getCreators = function(record, item) {
	//Clear creators
	item.creators = new Array();
	// Extract creators (700, 701 & 702)
	[Marc.Unimarc.Tags.PERSONAL_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY,
	 Marc.Unimarc.Tags.PERSONAL_NAME_ALTERNATIVE_INTELLECTUAL_RESPONSIBILITY,
	 Marc.Unimarc.Tags.PERSONAL_NAME_SECONDARY_INTELLECTUAL_RESPONSIBILITY].forEach(function(tag) {
		 var authorFields = record.getFields(tag);
		 for (var j in authorFields) {
			 var authorField = authorFields[j];
			 var type = Marc.Unimarc.getCreatorType(authorField.getValue("4"));
			 if(type) {
				 var authorText = authorField.getValue("ab", {subfieldJoin: ", "});
				 item.creators.push(Zotero.Utilities.cleanAuthor(authorText, type, true));
			 }
		 }
	 });
	// Extract corporate creators (710, 711 & 712)
	[Marc.Unimarc.Tags.CORPORATE_BODY_NAME_PRIMARY_INTELLECTUAL_RESPONSIBILITY,
	 Marc.Unimarc.Tags.CORPORATE_BODY_NAME_ALTERNATIVE_INTELLECTUAL_RESPONSIBILITY,
	 Marc.Unimarc.Tags.CORPORATE_BODY_NAME_SECONDARY_INTELLECTUAL_RESPONSIBILITY].forEach(function(tag) {
		var authorFields = record.getFields(tag);
		for (var j in authorFields) {
			var authorField = authorFields[j];
			var type = Marc.Unimarc.getCreatorType(authorField.getValue("4"));
			Zotero.debug("getCreatorType " + authorField.getValue("4") + ": " + type);
			if(type) {
				var authorText = authorField.getValue("a");
				item.creators.push({
					lastName: authorText, 
					creatorType: type, 
					fieldMode: true});
			}
		}
	});
};

Marc.UnimarcImportConverter.prototype._getTitle = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY, "ae",
		{
			subfieldJoin: " : ", 
			fieldJoin: " / ", 
			processSubfield : function(subfield) {
				if(!item.shortTitle) {
					item.shortTitle = subfield.getContent();
				}
				return subfield.getContent();
			}
		});
	if(value) {
		item.title = value;
	}
};

Marc.UnimarcImportConverter.prototype._getLanguage = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.LANGUAGE_OF_THE_ITEM, "a");
	if(value) {
		item.language = value;
	}
	//Original language?
	value = record.getValue(Marc.Unimarc.Tags.LANGUAGE_OF_THE_ITEM, "c");
	if(value) {
		item.notes.push({note: "Original language: " + value});
	}
};

Marc.UnimarcImportConverter.prototype._getCountry = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.COUNTRY_OF_PUBLICATION_OR_PRODUCTION, "a");
	if(value) {
		item.country = value;
	}
};

Marc.UnimarcImportConverter.prototype._getCallNumber = function(record, item) {
	var text = new Array();
	var value = record.getValue(Marc.Unimarc.Tags.DEWEY_DECIMAL_CLASSIFICATION_DD, "a");
	if(value) {
		text.push("Dewey: " + value);
	}
	var value = record.getValue(Marc.Unimarc.Tags.UNIVERSAL_DECIMAL_CLASSIFICATION_UD, "a");
	if(value) {
		text.push("UDC: " + value);
	}
	var value = record.getValue(Marc.Unimarc.Tags.LIBRARY_OF_CONGRESS_CLASSIFICATION, "a");
	if(value) {
		text.push("LCC: " + value);
	}
	var value = record.getValue(Marc.Unimarc.Tags.UNIVERSAL_DECIMAL_CLASSIFICATION_UD, "a");
	if(value) {
		text.push(value);
	}
	if(text.length) {
		item.callNumber = text.join(";");
	}
};

Marc.UnimarcImportConverter.prototype._getAbstract = function(record, item) {
	var value = record.getValue([Marc.Unimarc.Tags.DISSERTATION_THESIS_NOTE,
	                             Marc.Unimarc.Tags.SUMMARY_OR_ABSTRACT], 
	                             "a",
	                             {fieldJoin: "\n"});
	if(value) {
		item.abstractNote = value;
	}
};

Marc.UnimarcImportConverter.prototype._getEdition = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.EDITION_STATEMENT, "ab",
			{subfieldJoin: ", ", fieldJoin: " / "});
	if(value) {
		item.edition = value;
	}
	value = record.getValue(Marc.Unimarc.Tags.PUBLICATION_DISTRIBUTION_ETC, "a",
			{fieldJoin: " / ", subfieldJoin: ", "});
	if(value) {
		item.place = value;
	}
	value = record.getValue(Marc.Unimarc.Tags.PUBLICATION_DISTRIBUTION_ETC, "c",
			{fieldJoin: " / ", subfieldJoin: ", "});
	if(value) {
		if(item.itemType == "film") {
			item.distributor = value;
		}
		else {
			item.publisher = value;
		}
	}
	value = record.getValue(Marc.Unimarc.Tags.PUBLICATION_DISTRIBUTION_ETC, "d",
			{fieldJoin: " / ", subfieldJoin: ", ", suppressDuplicates: true});
	if(value) {
		item.date = value;
	}
};

Marc.UnimarcImportConverter.prototype._getMaterialDescription = function(record, item) {
	var value = record.getValue(Marc.Unimarc.Tags.PHYSICAL_DESCRIPTION, "a");
	if(value) {
		var pages = /[^\d]*(\d+)\s+p\..*/.exec(value);
		if(pages) {
			item.numPages = pages[1];
		}
		var vols= /[^\d]*(\d+)\s+vol\..*/.exec(value);
		if(vols) {
			item.numberOfVolumes = vols[1];
		}
	}
};

Marc.UnimarcImportConverter.prototype._getSeries = function(record, item) {
	var seriesText = false;
	//Get series tag 225
	var seriesFields = record.getFields(Marc.Unimarc.Tags.SERIES);
	if(seriesFields.length > 1) {
		//Multiple series fields: no seriesNumber, inline volume numbers
		item.series = record.getValue(Marc.Unimarc.Tags.SERIES,
			"av", {fieldJoin: "; ", subfieldJoin: ", "});
	}
	//Single series field
	else {
		item.series = record.getValue(Marc.Unimarc.Tags.SERIES,
			"a", {subfieldJoin: ", "});
		var value = record.getValue(Marc.Unimarc.Tags.SERIES,
			"v", {subfieldJoin: ", "});
		if(value) {
			item.seriesNumber = value;
		}
	}
	//Try 410 (collection link)
	if(!item.series) {
		var seriesFields = record.getFields(Marc.Unimarc.Tags.SERIES_LINK);
		if(seriesFields.length > 1) {
			//Multiple series fields: no seriesNumber, inline volume numbers
			item.series = record.getValue(Marc.Unimarc.Tags.SERIES_LINK,
				"tv", {fieldJoin: "; ", subfieldJoin: ", "});
		}
		//Single series field
		else {
			item.series = record.getValue(Marc.Unimarc.Tags.SERIES_LINK,
				"t", {subfieldJoin: ", "});
			var value = record.getValue(Marc.Unimarc.Tags.SERIES_LINK,
				"v", {subfieldJoin: ", "});
			if(value) {
				item.seriesNumber = value;
			}
		}
	}
	//Try 461 (set link)
	if(!item.series) {
		var seriesFields = record.getFields(Marc.Unimarc.Tags.SET);
		if(seriesFields.length > 1) {
			//Multiple series fields: no seriesNumber, inline volume numbers
			item.series = record.getValue(Marc.Unimarc.Tags.SET,
				"tv", {fieldJoin: "; ", subfieldJoin: ", "});
		}
		//Single series field
		else {
			item.series = record.getValue(Marc.Unimarc.Tags.SET,
				"t", {subfieldJoin: ", "});
			var value = record.getValue(Marc.Unimarc.Tags.SET,
				"v", {subfieldJoin: ", "});
			if(value) {
				item.seriesNumber = value;
			}
		}
	}
};


Marc.UnimarcImportConverter.prototype._getTags = function(record, item) {

	record.getFields([Marc.Unimarc.Tags.PERSONAL_NAME_USED_AS_SUBJECT, 
	                  Marc.Unimarc.Tags.CORPORATE_BODY_NAME_USED_AS_SUBJECT,
	                  Marc.Unimarc.Tags.FAMILY_NAME_USED_AS_SUBJECT,
	                  Marc.Unimarc.Tags.NAME_AND_TITLE_USED_AS_SUBJECT,
	                  Marc.Unimarc.Tags.TITLE_USED_AS_SUBJECT,
	                  Marc.Unimarc.Tags.TOPICAL_NAME_USED_AS_SUBJECT,
	                  Marc.Unimarc.Tags.GEOGRAPHICAL_NAME_USED_AS_SUBJECT,
	                  Marc.Unimarc.Tags.FORM_GENRE_OR_PHYSICAL_CHARACTERISTICS_HEADING,
	                  Marc.Unimarc.Tags.UNCONTROLLED_SUBJECT_TERMS]).forEach(function(field) {
         var tagText = field.getValue("a", {subfieldJoin: ""});
         switch(field.getTag()) {
         case Marc.Unimarc.Tags.PERSONAL_NAME_USED_AS_SUBJECT.tag:
         case Marc.Unimarc.Tags.FAMILY_NAME_USED_AS_SUBJECT.tag:
         case Marc.Unimarc.Tags.NAME_AND_TITLE_USED_AS_SUBJECT.tag:
        	 var b = field.getValue("b"); //First name
        	 if(b) {
        		 tagText += ", " + b;
        	 }
        	 var f = field.getValue("f"); //Dates
        	 if(f) {
        		 tagText += " (" + f + ")";
        	 }
        	 var t = field.getValue("t"); //Title
        	 if(t) {
        		 tagText += ", " + t;
        	 }
        	 break;
         case Marc.Unimarc.Tags.TOPICAL_NAME_USED_AS_SUBJECT.tag:
        	 var value = field.getValue("x", //Subheadings
        			 {
        		 		subfieldJoin: " - ", 
        		 		processSubfield: function(subfield) {return Zotero.Utilities.trim(subfield.getContent());}
        			 }); 
        	 if(value) {
        		 tagText += " " + value;
        	 }
        	 break;
         }
         if(tagText.length > 0) {
        	 this._addTag(item, tagText);
         }
    }, this);
};

Marc.UnimarcImportConverter.prototype._getExtra = function(record, item) {
	var noteText = "";
	//Material description
	var value = record.getValue(Marc.Unimarc.Tags.PHYSICAL_DESCRIPTION, "acde",
			{fieldJoin: " / ", subfieldJoin: ". "});
	if(value) {
		noteText = this._addExtra(noteText, value);
	}
	//Note
	var value = record.getValue([Marc.Unimarc.Tags.GENERAL_NOTE, 
	                             Marc.Unimarc.Tags.NOTES_PERTAINING_TO_EDITION_AND_BIBLIOGRAPHIC_HISTORY,
	                             Marc.Unimarc.Tags.INTERNAL_BIBLIOGRAPHIES_INDEXES_NOTE],
	                             "a",
	                             {fieldJoin: " / ", subfieldJoin: ". "});
	if(value) {
		noteText = this._addExtra(noteText, value);
	}
	//Original text
	var value = record.getValue(Marc.Unimarc.Tags.TRANSLATION_OF, "t",
			{fieldJoin: " / ", subfieldJoin: " : "});
	if(value) {
		noteText = this._addExtra(noteText, "Original title: " + value);
	}
        
	if(noteText) {
		if(!/\.$/.exec(noteText)) {
        	noteText += ".";
        }
		noteText = noteText.replace(/^\s*\.\s*/, "")
			.replace(/\.\.+/g, ".");
		item.extra = noteText;
	}
};

Marc.UnimarcImportConverter.prototype._getNotes = function(record, item) {
	Marc.ImportConverter.prototype._getNotes.call(this, record, item);
	//Note the primary statements of responsability for book without "proper" authors,
	// the secondary statements of responsability for all cases
	var subfields = "fg";
	if(item.itemType == "book") {
		for(var j in item.creators) {
			if(item.creators[j].creatorType == "author") {
				subfields = "g";
				break;
			}
		}
	}
	var value = record.getValue(Marc.Unimarc.Tags.TITLE_AND_STATEMENT_OF_RESPONSIBILITY,
				subfields,
				{fieldJoin: " / ", subfieldJoin: "; "});
	if(value) {
		item.notes.push({note: value});
	}

	//Cover title
	value = record.getValue(Marc.Unimarc.Tags.COVER_TITLE,
			"ae",
			{fieldJoin: " / ", subfieldJoin: "; "});
	if(value) {
		item.notes.push({note: "Cover title: " + value});
	}
	//Contents
	value = record.getValue(Marc.Unimarc.Tags.CONTENTS_NOTE,
			"a",
			{fieldJoin: " / ", subfieldJoin: "; "});
	if(value) {
		item.notes.push({note: "Contents: " + value});
	}
};

/**
 * @namespace Import/ExportConverters utilities. */
Marc.Converters = {
	/** Get an appropriate ExpoortConverter for a given Marc type.
	 * @returns {Marc.ExportConverter}
	 * @param {String} type the Marc type ("unimarc" or "marc21")
	 */
	getExportConverter : function(type) {
		switch(type) {
		case "unimarc":
			return new Marc.UnimarcExportConverter();
		case "marc21":
		default:
			return new Marc.ExportConverter();
		}
	},
	
	/**
	 * For given type and/or record, instantiate the appropriate import converter.
	 * @param {String|Marc.Record} recordOrType the Marc type ("unimarc" or "marc21") or a record to
	 * be converted. In the latter case, the Marc type will be auto-detected from the
	 * record's fields.
	 * @returns {Marc.ImportConverter}
	 */ 
	getImportConverter : function(recordOrType) {
		var type = "marc21";
		if(recordOrType instanceof Marc.Record) {
			Zotero.debug("Marc.Converters.getImportConverter, sniffing record");
			if(Marc.Unimarc.isUnimarc(recordOrType)) {
				Zotero.debug("Marc.Converters.getImportConverter, sniffing record detected unimarc");
				type = "unimarc";
			}
		}
		Zotero.debug("Marc.Converters.getImportConverter, type= " + type);

		switch(type) {
		case "unimarc":
			return new Marc.UnimarcImportConverter();
		case "marc21":
			return new Marc.Marc21ImportConverter();
		default:
			return new Marc.ImportConverter();
		}
	},
	
	/**
	 * Returns a constructor derived from the appropriate import converter. This
	 * allows client translators to subclass converters.
	 * @param {String|Marc.Record} recordOrType the Marc type ("unimarc" or "marc21") or a record to
	 * be converted. In the latter case, the Marc type will be auto-detected from the
	 * record's fields.
	 * @param {Object} [overrides] an object containing method overrides
	 * @example
	 * var converterClass = Marc.Converters.subclassImportConverter(myrecord, {
	 *		//Include some non-standard subfields
	 *		_getAbstract : function(record, item) {
	 *			var value = record.getValue(
	 *				[Marc.Unimarc.Tags.DISSERTATION_THESIS_NOTE,
	 *		         Marc.Unimarc.Tags.SUMMARY_OR_ABSTRACT], 
	 *				"abced",
	 *	    		{fieldJoin: "\n"});
	 *			if(value) {
	 *				item.abstractNote = value;
	 *			};
	 *		},
	 *		//Call superclass
	 *		_getTitle : function(record, item) {
	 *			Marc.UnimarcImportConverter.prototype.call(this, record, item);
	 *			item.title = "[ADDED BY SUBCLASS]" + item.title;
	 *		}
	 * });
	 * var converter = new converterClass();
	 * var item = converter.convert(myrecord);
	 */
	subclassImportConverter : function(recordOrType, overrides) {
		var superclass = this.getImportConverter(recordOrType);
		var subclass = function() {};
		subclass.prototype = superclass;
		subclass.prototype.constructor = subclass;
		if(overrides) {
			for(var j in overrides) {
				subclass.prototype[j] = overrides[j];
			}
		}
		return subclass;
	} 
};

//IO

/**
 * Constructs an Importer.
 * @class Importers are responsible for setting up a Marc.Record instance from external data,
 * e.g. binary record data or pairs of field tags and raw field data.
 */
Marc.Importer = function() {
};

Marc.Importer.prototype = {
	constructor : Marc.Importer,
	/**
	 * Fill a record from binary MARC data.
	 * @param {String} data "binary" source data in string form. Character set conversion
	 * is supposed to have happened at this point.
	 * @returns {Marc.Record} the created record
	 */
	parseBinary : function(data) {
		var record = Marc.Records.newRecord();
		// get directory and leader
		var header = data.substr(0, data.indexOf(Marc.Delimiters.FIELD_TERMINATOR));
		var leader = record.setLeader(header.substr(0, 24));
		var directory = header.substr(24);
		
		// get various data
		this.indicatorLength = leader.getIndicatorLength();
		this.subfieldCodeLength = leader.getSubfieldDelimiterLength();
		var baseAddress = leader.getBaseAddress();
		var dirEntryLength = 3 
			+ leader.getDirectoryLengthLength()
			+ leader.getDirectoryStartLength()
			+ leader.getDirectoryImplLength();
		
		// get record data
		var contentTmp = data.substr(baseAddress);
		
		// MARC wants one-byte characters, so when we have multi-byte UTF-8
		// sequences, add null characters so that the directory shows up right. we
		// can strip the nulls later.
		var content = "";
		for(i=0; i<contentTmp.length; i++) {
			content += contentTmp[i];
			if(contentTmp.charCodeAt(i) > 0x00FFFF) {
				content += "\x00\x00\x00";
			} 
			else if(contentTmp.charCodeAt(i) > 0x0007FF) {
				content += "\x00\x00";
			} 
			else if(contentTmp.charCodeAt(i) > 0x00007F) {
				content += "\x00";
			}
		}
		
		// read directory
		for(var i = 0; i < directory.length; i += dirEntryLength) {
			//Parse directory entry
			var tag = directory.substr(i, 3);
			var len = parseInt(directory.substr(i+3, leader.getDirectoryLengthLength()), 10);
			var pos = parseInt(directory.substr(i+3+leader.getDirectoryLengthLength(),
					leader.getDirectoryStartLength()),
					10);
			//Get field contents
			var data = content.substr(pos, len).replace(/\x00/g, "");
			//Add field
			record.addField(tag).parse(data);
		}
		return record;
	},
	
	/**
	 * Fill a record from preprocessed data.
	 * @param {Array} data an array of objects with the properties "tag" and "value",
	 * holding each a field tag and the corresonding raw value (including the indicator,
	 * if applicable). The record leader's tag must be either empty
	 * or have one of the following conventional values: "000", "LDR".
	 * @returns {Marc.Record} the created record.
	 */
	parseFields : function(data) {
		var record = Marc.Records.newRecord();
		data.forEach(function(field) {
			if(!field.tag || field.tag == "000" || field.tag == "LDR") {
				record.setLeader(field.value);
			}
			else {
				if(/\d{3}/.test(field.tag)) {
					//Replace common subfield delimiters
					var value = field.value.replace(/[\xa4\$]([a-z0-9])/g, 
							Marc.Delimiters.SUBFIELD_DELIMITER + "$1");
					record.addField(field.tag).parse(value);
				}
				else {
					Zotero.debug("Skipping invalid tag \"" + field.tag + "\"");
				}
			}
		}, this);
		return record;
	}
};

/**
 * @namespace Importer utilities
 */
Marc.IO = {
	_maxRecords : -1,
	/**
	 * Get an appropriate Importer instance for a giben format. Currently, this will always
	 * return new {@link Marc.Importer}.
	 * @returns {Marc.Importer}
	 */
	getImporter : function(format) {
		return new Marc.Importer();
	},
	
	/** Limit the number of records to be imported from binary sources. 
	 * @param {Integer} max the maximum number of records to be imported. -1 means no limit. */
	setMaxImportRecords : function(max) {
		this._maxRecords = max;
	},
	
	
	/**  
	 * @returns {Integer} the maximum number of records to be imported. -1 means no limit. 
	 * */
	getMaxImportRecords : function() {
		return this._maxRecords;
	}
};


/* Initialization. */
Marc.Config.setTypeOptions();

//Public API

//Debugging
Marc.IO.setMaxImportRecords(100);

/**
 * Detect binary record leader.
 * TODO: sniff charset and call Zotero.setCharacterSet() ? 
 * */
function detectImport() {
	var marcRecordRegexp = /^[0-9]{5}[a-z ]{3}$/
	var read = Zotero.read(8);
	if(marcRecordRegexp.test(read)) {
		return true;
	}
}

/**
 * Import binary MARC data
 */
function doImport() {
	var maxRecords = Marc.IO.getMaxImportRecords();
	var recordsRead = 0;
	var text;
	var holdOver = "";	// part of the text held over from the last loop
	var importer = Marc.IO.getImporter();
	
	// read in 4096 byte increments
	while(text = Zotero.read(4096)) {	
		var records = text.split(Marc.Delimiters.RECORD_TERMINATOR);
		
		if(records.length > 1) {
			records[0] = holdOver + records[0];
			holdOver = records.pop(); // skip last record, since it's not done
			
			//Record loop
			for(var i in records) {
				//Parse binary data
				var record = importer.parseBinary(records[i], record);
				if(record) {
					//Get converter
					var converter = Marc.Converters.getImportConverter(record);
					
					//Translate
					var item = converter.convert(record);
					item.complete();
					recordsRead++;
					if(maxRecords >= 0 && recordsRead >= maxRecords) {
						break;
					}
				}
			}
		} 
		else {
			holdOver += text;
		}
		if(maxRecords >= 0 && recordsRead >= maxRecords) {
			break;
		}
	}

}

/**
 * Export binary MARC format. Currently not operational (unimarc records will be
 * constructed, but no output is yet generated).
 */
function doExport() {
	Zotero.setCharacterSet("utf-8");
	//Get MARC style
	var marcType = Marc.Config.getTypeOption();
	if(!marcType) {
		throw "Choose a single export format";
	}
	Zotero.debug("Marc type: " + marcType);
	
	//Get converter (item -> record)
	var converter = Marc.Converters.get(marcType);
	
	//Item loop
	var item;
	while(item = Zotero.nextItem()) {
		Zotero.debug(item);
		var record = converter.convert(item);
		record.dump();
	}
}


