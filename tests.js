load("isbn.js");

var test = 0;

function assertEqual(a, b) {
	if (a === b) {
		//print("\t" + a + "\n\t" + b);
		print("Pass (" + (test++) + ")");
		return true;
	} else {
		print("\t" + a + "\n\t" + b);
		print("[31mFail (" + (test++) + ")[0m");
		return false;
	}
}

function assertTrue(a) {
	if (a) {
		//print("\t" + a + "\n\t" + b);
		print("Pass (" + (test++) + ")");
		return true;
	} else {
		print("\t" + a);
		print("[31mFail (" + (test++) + ")[0m");
		return false;
	}
}

// Assertions

print("[1mISBN-10[0m");
assertEqual(idCheck("0-306-40615-2").isbn10, "0-306-40615-2");
assertEqual(idCheck("0202306070 (cloth alk. paper) 0202306089 (pbk. alk. paper)").isbn10, "0202306070");

print("[1mISBN-13[0m");
assertTrue(idCheck("9785776118555").isbn13);

print("[1mISSN[0m");
assertEqual(idCheck("0378-5955").issn, "0378-5955");
assertTrue(idCheck("0378-5955").issn);
