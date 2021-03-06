function(password) {

		// First check passwords in the common password file if available.
		// We do this because "password" takes 129 seconds, but is the first
		// thing an attacker will try.
		if (!this.CommonPasswords && Mellt.prototype.CommonPasswords) {
			this.CommonPasswords = Mellt.prototype.CommonPasswords;
		}
		if (this.CommonPasswords) {

			var text = password.toLowerCase();
			for (var t=0; t<this.CommonPasswords.length; t++) {
				if (this.CommonPasswords[t]==text) {
					// If their password exists in the common file, then it's 
					// zero time to crack this terrible password.
					return -1;
				}
			}
			delete text;
		}

		// Figure out which character set the password is using (based on the most 
		// "complex" character in it).
		var base = '';
		var baseKey = null;
		for (var t=0; t<password.length; t++) {
			var char = password[t];
			var foundChar = false;
			for (var characterSetKey=0; characterSetKey<this.CharacterSets.length; characterSetKey++) {
				var characterSet = this.CharacterSets[characterSetKey];
				if (baseKey<=characterSetKey && characterSet.indexOf(char)>-1) {
					baseKey = characterSetKey;
					base = characterSet;
					foundChar = true;
					break;
				}
			}
			// If the character we were looking for wasn't anywhere in any of the 
			// character sets, assign the largest (last) character set as default.
			if (!foundChar) {
				base = this.CharacterSets[this.CharacterSets.length-1];
				break;
			}
		}
		delete baseKey;
		delete foundChar;

		// Starting at the first character, figure out it's position in the character set
		// and how many attempts will take to get there. For example, say your password
		// was an integer (a bank card PIN number for example):
		// 0 (or 0000 if you prefer) would be the very first password they attempted by the attacker.
		// 9999 would be the last password they attempted (assuming 4 characters).
		// Thus a password/PIN of 6529 would take 6529 attempts until the attacker found
		// the proper combination. The same logic words for alphanumeric passwords, just
		// with a larger number of possibilities for each position in the password. The 
		// key thing to note is the attacker doesn't need to test the entire range (every
		// possible combination of all characters) they just need to get to the point in
		// the list of possibilities that is your password. They can (in this example) 
		// ignore anything between 6530 and 9999. Using this logic, 'aaa' would be a worse
		// password than 'zzz', because the attacker would encounter 'aaa' first. 
		var attempts = 0;
		var charactersInBase = base.length;
		var charactersInPassword = password.length;
		for (var position=0; position<charactersInPassword; position++) {
			// We power up to the reverse position in the string. For example, if we're trying 
			// to hack the 4 character PING code in the example above:
			// First number * (number of characters possible in the charset ^ length of password)
			// ie: 6 * (10^4) = 6000
			// then add that same equation for the second number:
			// 5 * (10^3) = 500
			// then the third numbers
			// 2 * (10^2) = 20
			// and add on the last number
			// 9
			// Totals: 6000 + 500 + 20 + 9 = 6529 attempts before we encounter the correct password.
			var powerOf = charactersInPassword - position - 1;
			// Character position within the base set. We add one on because strpos is base 
			// 0, we want base 1.
			var charAtPosition = base.indexOf(password[position])+1;
			// If we're at the last character, simply add it's position in the character set
			// this would be the "9" in the pin code example above.
			if (powerOf==0) {
				attempts = attempts + charAtPosition;
			}
			// Otherwise we need to iterate through all the other characters positions to 
			// get here. For example, to find the 5 in 25 we can't just guess 2 and then 5
			// (even though Hollywood seems to insist this is possible), we need to try 0,1,
			// 2,3...15,16,17...23,24,25 (got it).
			else {
				// This means we have to try every combination of values up to this point for 
				// all previous characters. Which means we need to iterate through the entire 
				// character set, X times, where X is our position -1. Then we need to multiply 
				// that by this character's position.

				// Multiplier is the (10^4) or (10^3), etc in the pin code example above.
				var multiplier = Math.pow(charactersInBase,powerOf);
				// New attempts is the number of attempts we're adding for this position.
				var newAttempts = charAtPosition * multiplier;
				// Add that on to our existing number of attempts.
				attempts = attempts + newAttempts;
			}
		}

		// We can (worst case) try a billion passwords a second. Calculate how many days it
		// will take us to get to the password.
		var perDay = this.HashesPerSecond*60*60*24;

		// This allows us to calculate a number of days to crack. We use days because anything
		// that can be cracked in less than a day is basically useless, so there's no point in
		// having a smaller granularity (hours for example).
		var days = attempts / perDay;

		// If it's going to take more than a billion days to crack, just return a billion. This
		// helps when code outside this function isn't using bcmath. Besides, if the password 
		// can survive 2.7 million years it's probably ok.
		if (days>1000000000) {
			return 1000000000;
		}

		return Math.round(days);

	}