function() {
	this.accounts = [];
	this.countries = {
		AR:"ARGENTINA",AM:"ARMENIA",AU:"AUSTRALIA",AT:"AUSTRIA",AZ:"AZERBAIJAN",BY:"BELARUS",BE:"BELGIUM",BA:"BOSNIA_AND_HERZEGOVINA",BR:"BRAZIL",BG:"BULGARIA",
		CA:"CANADA",CI:"CHILE",CH:"CHINA",HR:"CROATIA",CY:"CYPRUS",CZ:"CZECH_REPUBLIC",DK:"DENMARK",EE:"ESTONIA",FO:"FAROE_ISLANDS",FI:"FINLAND",
		FR:"FRANCE",GE:"GEORGIA",DE:"GERMANY",GI:"GIBRALTAR",GR:"GREECE",HK:"HONG_KONG",HU:"HUNGARY",IS:"ICELAND",IN:"INDIA",ID:"INDONESIA",
		IE:"IRELAND",IL:"ISRAEL",IT:"ITALY",JP:"JAPAN",JE:"JERSEY_C_I",KZ:"KAZAKHSTAN",LV:"LATVIA",LI:"LIECHTENSTEIN",LT:"LITHUANIA",LU:"LUXEMBOURG",
		MK:"MACEDONIA_THE_FORMER_YUGOSLAV_REP",MY:"MALAYSIA",MT:"MALTA",MX:"MEXICO",MT:"MONTENEGRO_REPUBLIC_OF",MA:"MOROCCO",NL:"NETHERLANDS",NZ:"NEW_ZEALAND",NO:"NORWAY",PE:"PERU",
		PH:"PHILIPPINES",PL:"POLAND",PT:"PORTUGAL",RO:"ROMANIA",RU:"RUSSIAN_FEDERATION",RS:"SERBIA_REPUBLIC_OF",SG:"SINGAPORE",SK:"SLOVAKIA",SI:"SLOVENIA",ZA:"SOUTH_AFRICA",
		KR:"KOREA_REPUBLIC_OF",ES:"SPAIN",SE:"SWEDEN",CH:"SWITZERLAND",TW:"TAIWAN",TZ:"TANZANIA_UNITED_REPUBLIC_OF",TH:"THAILAND",TN:"TUNISIA",TR:"TURKEY",UA:"UKRAINE",
		AE:"UNITED_ARAB_EMIRATES",UK:"UNITED_KINGDOM",US:"UNITED_STATES",VN:"VIET_NAM"
	}
	this.tab = sys.newTab();
	this.tab.trustCertificate("29b73d9f7501b8c0adfd5e4337a390d1ad205f48");
	// pre-load tab with centrum
	sys.log("Centrum24: loading main page");
	this.tab.load("https://www.centrum24.pl/centrum24-web/");
	// in english
	this.tab.document().findAllContaining("English")[0].click();
	this.tab.wait();

	this.login = function(nik, password) {
		sys.log("Centrum24: Logging in");
		// we should be on the home, with focus on NIK
		this.tab.type(nik);
		this.tab.document().getElementById("okBtn").click();
		this.tab.wait();

		// next page is the crazy password page
		// try to get pass input location
		var password_tr = this.tab.document().getElementById("pass1").parentNode().parentNode();

		if (password_tr.tagName() != "TR")
			throw new Error("Failed: password field is not as it should! :(");

		var password_td = password_tr.firstChild();
		var password_fields = [];
		for(var i = 0; i < 20; i++) {
			password_td = password_td.nextSibling();
			var input = password_td.firstChild();
			if (input.tagName() != "INPUT")
				throw new Error("Could not find input in password field, update script!");
			if (input.hasAttribute("disabled"))
				continue;

			input.setAttribute("value", password.charAt(i));
		}
		this.tab.document().getElementById("okBtn2").click();
		this.tab.wait();

		this.getAccounts(); // we are on the accounts page
	};

	this.getAccounts = function() {
		// scan page to get accounts list!
		var balances_table = this.tab.document().findFirst("tbody td.name");
		if (!balances_table) {
			sys.log("Could not locate table with account balances");
			sys.abort();
		}

		while(balances_table.tagName() != "TBODY") balances_table = balances_table.parentNode();

		// for each tr...
		var account_tr = balances_table.firstChild();
		if (account_tr.tagName() != "TR") {
			sys.log("Table containing accounts contained something unexpected");
			sys.abort();
		}

		this.accounts = [];
		
		while(account_tr) {
			var a = account_tr.getElementsByTagName("a")[0];
			var data = {
				href: a.attribute("href"),
				account: account_tr.getElementsByTagName("em")[0].textContent(),
				account_type: a.textContent(),
				balance: account_tr.findFirst("td.money div").textContent(),
			};
//			sys.log("Found account number ["+data.account+"] of type "+data.account_type+" with balance "+data.balance);
			this.accounts.push(data);
			account_tr = account_tr.nextSibling();
		}

		return this.accounts;
	};

	this.print = function(filename) {
		return this.tab.print(filename);
	};

	this.interact = function() {
		return this.tab.interact();
	};

	this.logout = function() {
		sys.log("Centrum24: logging out");
		this.tab.document().findAllContaining("Logout")[0].click();
		this.tab.wait();
	};

	this.scanAccountByNumber = function(n, callback) {
		for(var i = 0; i < this.accounts.length; i++) {
			if (this.accounts[i].account == n)
				return this.scanAccountHistory(i, callback);
		}
		return false;
	};

	this.scanAccountHistory = function(i, callback) {
		// i is account index in this.accounts
		// callback should return true if it had any use in the new data, or false if it didn't. In case it didn't for a whole page, process will end
		var data = this.accounts[i];
		sys.log("Centrum24: Accessing account number ["+data.account+"] with balance "+data.balance);
		this.tab.browse(data.href);
	
		var page_cnt = 1;
	
		while(true) {
			if (page_cnt > 15) break; // max 15 pages
			//sys.log("Parsing page "+page_cnt);
			page_cnt++;
	
			var page_trx_desc = [];
			var page_was_useful = false;
	
			while(true) {
				var history_data = this.tab.document().getElementById("historypage").getElementsByTagName("tbody")[0];
				var history_tr = history_data.firstChild();
				if (!history_tr) break;
	
				if (history_tr.tagName() != "TR")
					throw new Error("Page is wrong");
	
				var page_trx_index = 0;
				var do_parse = false;
	
				while(history_tr) {
					if (history_tr.getComputedStyle("display") == "none") {
						history_tr = history_tr.nextSibling();
						continue;
					}
					var data = {
						date: history_tr.findAll("td.date span")[0].textContent(),
						value_date: history_tr.findAll("td.date span")[1].textContent(),
						href: history_tr.findAllContaining("Print")[0].attribute("href"),
						desc: history_tr.getElementsByTagName("a")[0].textContent(),
						amount: history_tr.findFirst("td.amount span").textContent(),
						meta: {},
					};
					page_trx_index++;
	
					if (page_trx_desc[page_trx_index] == data.desc) {
						history_tr = history_tr.nextSibling();
						continue;
					}
					page_trx_desc[page_trx_index] = data.desc;
					do_parse = true;
					break;
				}
	
				if (do_parse) {
					this.tab.browse(data.href);
					var tx_table = this.tab.document().findFirst("table.table tbody");
	
					var tx_table_tr = tx_table.firstChild();
	
					while(tx_table_tr) {
						var td = tx_table_tr.firstChild();
						var key = td.textContent();
						var value = td.nextSibling().textContent();
						data.meta[key] = value;
						tx_table_tr = tx_table_tr.nextSibling();
					}
					data.pdf = this.tab.printBase64();
					data.account = this.accounts[i];
	
					if (callback(data)) page_was_useful = true;
					this.tab.back();
					this.tab.wait();
					continue;
				}
				break;
			}

			if (!page_was_useful) break; // nothing useful on this page => go away
	
			var prev = this.tab.document().findAllContaining("Previous");
			if (prev.length == 0) {
				//sys.log("Previous not found, considering this to be the end!");
				break;
			}
			prev[0].click();
			prev[0].setFocus();
			while(true) {
				sys.sleep(100);
				if (!prev[0].hasFocus())
					break;
			}
		}

		// return to main page
		this.tab.document().findAllContaining("Portfolio24")[0].click();
		this.tab.wait();
		this.getAccounts(); // to get the new href

		return true;
	};

	this.processSwift = function(data) {
		this.tab.document().findAllContaining("Transfer")[0].click();
		this.tab.wait();
		this.tab.document().findAllContaining("SWIFT transfer")[0].click();
		this.tab.wait();

		var fee_side = 1; // 0=OUR 1=SHA 2=BEN

		// find furst account number matching currency
		var acct_num = -1;
		for(var i = 0; i < this.accounts.length; i++) {
			if (this.accounts[i].balance.substr(-3) == data["data"]["Currency__"]) {
				acct_num = i-1;
				break;
			}
		}
		if (acct_num == -1) {
			sys.log("no account available in requested currency");
			sys.abort();
		}

		this.tab.document().getElementsByName('chargedAccountPanel:chargedAccountContainer:chargedAccountBorder:chargedAccount')[0].eval("this.value="+acct_num);

		this.tab.document().getElementsByName('recipientInputPanel:accountNumberC:accountNumberBorder:_body:country')[0].eval("this.value="+JSON.stringify(this.countries[data["meta"]["swift"].substr(4,2)])); // receiving bank country, from SWIFT
		this.tab.document().getElementsByName('recipientInputPanel:accountNumberC:accountNumberBorder:accountNumber')[0].setAttribute("value", data["meta"]["account_number"]); // account #
		this.tab.document().getElementsByName('recipientInputPanel:nameBorder:name')[0].setAttribute("value", data["meta"]["name"]); // name
		this.tab.document().getElementsByName('recipientInputPanel:streetBorder:street')[0].setAttribute("value", data["meta"]["address"]);
		this.tab.document().getElementsByName('recipientInputPanel:cityBorder:city')[0].setAttribute("value", data["meta"]["city"]);
		this.tab.document().getElementsByName('recipientInputPanel:zipCodeBorder:zipCode')[0].setAttribute("value", data["meta"]["postalcode"]);
		this.tab.document().getElementsByName('transferInput:monetaryTransferType:amountBorder:debitedAmount')[0].setAttribute("value",data["data"]["Amount"]/100);
		this.tab.document().getElementsByName('transferInput:monetaryTransferType:transferAmountBorder:creditedCurrency')[0].eval("this.value="+JSON.stringify(data["data"]["Currency__"]));
		this.tab.document().getElementsByName('transferInput:swiftTransferPanel:swiftCost')[fee_side].eval("this.checked='true'");
		this.tab.document().getElementsByName('transferInput:titleBorder:title')[0].eval("this.value="+JSON.stringify(data["data"]["Label"]+" - "+data["data"]["Money_Bank_Withdraw__"]));
		this.tab.interact(); // user needs to complete TX from there, then close the interaction window on the last screen
		var div = tab.document().findFirst("div.success");
		while(div.tagName() != "UL") div = div.nextSibling();
		div = div.firstChild(); // LI
		while(div.textContent().indexOf("Transaction identifier") == -1) div = div.nextSibling();
		div = div.firstChild(); // STRONG
		if (div.tagName() != "STRONG") {
			sys.log("Could not locate transaction identifier, script may be too old");
			sys.abort();
		}
		div = div.textContent();

		var success = { receipt: div, pdf: this.tab.printBase64() };

		return success;
	};
}