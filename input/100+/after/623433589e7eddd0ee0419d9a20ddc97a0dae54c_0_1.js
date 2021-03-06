function Keyboard(){
  var kb = this, typeModeIcon, isVisible=false;
  var alpha, beta, charlie, delta, foxtrot, gamma, hotel=1, specialMode = false, prevMode = false;
  typeModeIcon = document.createElement('i');
  typeModeIcon.setAttribute('class', 'icon icon-leaf kbtyping');
  this.Left = [];
  this.Right = [];
  this.Center = [];
  this.position = [];
  this.parentId = null;
  this.focusBox = null;
  this.alphaSet = [];
  this.focusbox = null;
  this.fullIPADriver = function(){
    this.organize(this.ipa_full);
    document.body.appendChild(this.html);
    $(this.html).hide();
    this.setBoxListener();
    this.setButtonListeners();
    this.setHotKeys();
  }
  this.organize = function(dict){
    if(dict == null)
    {
      return false;
    }
    var location, type, lset, lettr, sectn, lst, let, indx, counter=0;
    var title1, title2, posel, kgp, tmp, closeIcon, helpIcon;
    this.html = document.createElement('div');
    this.html.setAttribute('class', 'kbwpr');
    closeIcon = document.createElement('i');
    closeIcon.setAttribute('class', 'kbclose');
    closeIcon.setAttribute('title', 'close VIPAK');
    closeIcon.innerHTML = '&times;';
    helpIcon = document.createElement('i');
    helpIcon.setAttribute('class', 'kbhelp');
    helpIcon.setAttribute('title', 'about VIPAK');
    helpIcon.innerHTML = '?';
    this.html.appendChild(helpIcon);
    this.html.appendChild(closeIcon);
    for(location in dict){
      posel = document.createElement('span');
      posel.setAttribute('id', 'kbpos'+location);
      
      for(type in dict[location]){
	
	sectn = new KeySection();
	sectn.title = type;
	sectn.elmnt = document.createElement('div');
	sectn.elmnt.setAttribute('class', 'kbsection');
	title1 = document.createElement('div');
	title1.setAttribute('class', 'label kbsectitle');
	title1.innerHTML = sectn.title;
	sectn.elmnt.appendChild(title1);
	for(indx in dict[location][type]){
	  for(lset in dict[location][type][indx]){
	    lst = new LetterSet();
	    lst.title = lset;
	    lst.elmnt = document.createElement('span');
	    lst.elmnt.setAttribute('class', 'kblset label');
	    lst.elmnt.setAttribute('id', lst.title);
	    title2 = document.createElement('span');
	    title2.setAttribute('class', 'kblsetitle badge');
	    title2.innerHTML = lst.title;
	    lst.elmnt.appendChild(title2);
	    kgp = document.createElement('span');
	    kgp.setAttribute('class', 'kbtng btn-group');
	    for(lettr in dict[location][type][indx][lset]){
	      let = new Letter();
	      let.letter = lettr;
	      let.isScript = checkCharWidth(lettr);
	      let.title = dict[location][type][indx][lset][lettr];
	      let.elmnt = document.createElement('button');
	      let.elmnt.setAttribute('class', 'kbletter btn');
	      let.elmnt.setAttribute('id', 'kbl'+let.letter);
	      let.elmnt.setAttribute('title', let.title);
	      let.elmnt.setAttribute('letter', let.letter);
	      let.elmnt.innerHTML = (let.isScript? '&nbsp;':'')+let.letter;
	      lst.letterset.push(let);
	      kgp.appendChild(let.elmnt);
	      
	    }
	    counter=counter+1;
	    lst.elmnt.appendChild(kgp);
	    this.alphaSet[lst.title] = lst.letterset;
	    sectn.keyset.push(lst);
	    sectn.elmnt.appendChild(lst.elmnt);
	  }
	  if(location=="0"){
	    this.Left.push(sectn);
	  }
	  if(location=="1"){
	    this.Right.push(sectn);
	  }
	  if(location=="2"){
	    this.Center.push(sectn);
	  }
	  posel.appendChild(sectn.elmnt);
	}
      }
      this.html.appendChild(posel);
      this.position.push(posel);
    }
  };
  this.ipa_full = {
    "0"	:
    {
      "vowels"	:
      [
	{"A" : { "??":"near-open front unrounded", "??":"near-open central", "??":"open back unrounded", "??":"open back rounded"}},
	{"E" : { "??":"mid-central (schwa)", "??":"rhotacized mid-central", "??":"close-mid central rounded", "??":"close-mid central unrounded",}},
	{"3" : { "??":"open-mid central unrounded", "??":"rhotacized open-mid central unrounded", "??":"open-mid front unrounded", "????":"nasalized open-mid front unrounded", "??":"open-mid central rounded"}},
	{"I" : { "??":"close central unrounded", "??":"near-close near-front unrounded",}},
	{"O" : { "??":"open-mid back rounded", "??":"close-mid back unrounded", "??":"close-mid front rounded", "??":"open-mid front rounded", "??":"open front rounded"}},
	{"U" : { "??":"open-mid back unrounded", "??":"near-close near-back rounded", "??":"close central rounded", "??":"close back unrounded"}},
	{"Y" : { "??":"near-close near-front rounded"}}
      ],
      "consonants"	:
      [
	{"B" : { "??":"voiced bilabial fricative", "??":"bilabial trill", "??":"voiced bilabial implosive"}},
	{"C" : { "??":"voiceless alveopalatal fricative", "??":"voiceless palatal fricative"}},
	{"D" : { "??":"voiced dental fricative", "d????":"voiced postalveolar fricative", "??":"voiced retroflex plosive", "??":"voiced alveolar implosive", "???":"voiced retroflex implosive"}},
	{"G" : { "??":"voiced velar implosive", "??":"voiced uvular plosive", "??":"voiced uvular implosive"}},
	{"H" : { "??":"voiced glottal fricative", "??":"voiceless pharyngeal fricative", "??":"voiceless palatal-velar fricative", "??":"voiceless epiglottal fricative", "??":"labial-palatal approximant"}},
	{"J" : { "??":"voiced palatal fricative", "??":"voiced palatal plosive", "??":"voiced palatal implosive", "??":"palatal lateral approximant"}},
	{"L" : { "??":"velarized alveolar lateral approximant", "??":"voiced alveolar lateral fricative", "??":"retroflex lateral approximant", "??":"voiceless alveolar lateral fricative", "??":"velar lateral approximant"}},
	{"M" : { "??":"labiodental nasal"}},
	{"N" : { "??":"velar nasal", "??":"palatal nasal", "??":"uvular nasal", "??":"retroflex nasal"}},
	{"P" : { "??":"voiceless bilabial fricative"}},
	{"R" : { "??":"voiced uvular fricative", "??":"uvular trill", "??":"alveolar approximant", "??":"alveolar tap", "??":"retroflex approximant", "??":"retroflex flap", "??":"alveolar lateral flap"}},
	{"S" : { "??":"voiceless postalveolar fricative", "??":"voiceless retroflex fricative"}},
	{"T" : { "??":"voiceless dental fricative", "??":"voiceless retroflex plosive", "t????":"voiceless postalveolar fricative", "t??s":"voiceless alveolar fricative"}},
	{"V" : { "???":"labiodental flap", "??":"labiodental approximant", "??":"voiced velar fricative"}},
	{"W" : { "??":"velar approximant", "??":"voiceless labio-velar approximant"}},
	{"X" : { "??":"voiceless uvular fricative"}},
	{"Z" : { "??":"voiced postalveolar fricative", "??":"voiced retroflex fricative", "??":"voiced alveopalatal fricative"}},
	{"?" : { "??":"glottal stop", "??":"voiced pharyngeal fricative", "??":"voiced epiglottal fricative", "??":"epiglottal plosive",}},
	{"0" : { "??":"bilabial click", "??":"dental click", "??":"retroflex click", "??":"postalveolar click", "??":"alveolar lateral click"}}
      ]
    },
    "1"	:
    {
      "diacritics"	:
      [
	{"*" : { "??":"aspirated", "??":"labialized", "??":"palatalized", "??":"velarized", "??":"pharyngealized", "???":"nasal release", "??":"lateral release", "??":"breathy-voice aspirated", "???":"syllabic or schwa", "??":"optional r", "??":"rhotacized"}},
	{"#" : { "??":"unreleased", "??":"centralized", "??":"nasalized", "??":"voiceless", "??":"voiceless", "??":"voiced", "??":"syllabic", "??":"raised", "??":"lowered", "??":"advanced (fronted)", "??":"retracted (backed)"}},
	{">" : { "??":"ejective", "??":"dental", "??":"apical", "??":"non-syllabic", "??":"breathy voiced", "??":"creaky voiced", "??":"linguolabial", "??":"advanced tongue root", "??":"retracted tongue root", "??":"laminal", "??":"more rounded", "??":"less rounded", "??":"mid-centralized"}},
	{"~" : { "??":"length mark", "??":"half-long", "??":"extra short",}},
	{"\'" : { "??":"primary stress", "??":"secondary stress",}},
	{"|":{ "|":"minor group", "???":"major group",}},
	{"["	:{ "??":"tie bar", "??":"tie bar", "???":"linking", "???":"becomes"}},
	{"\"" : { "??":"extra high", "??":"high", "??":"mid", "??":"low", "??":"extra low",}},
	{"^": { "??":"rising", "??":"falling", "???":"high rising", "???":"low rising", "???":"rising-falling"}},
	{"]" : {"??":"extra high", "??":"high", "??":"mid", "??":"low", "??":"extra low"}}, 
	{"\\" : {"????":"rising (may not work on chrome/safari)", "????":"falling (may not work on chrome/safari)", "????":"high rising (may not work on chrome/safari)", "????":"low rising (may not work on chrome/safari)", "??????":"rising-falling (may not work on chrome/safari)"}},
	{"+" : { "???" : "downstep", "???" : "upstep", "???" : "global rise", "???" : "global fall"}}
      ] 
    }
  };
  this.writeToBox = function(chr, replaceLength){
    var cStart, cEnd, str, output;
    cStart = $(this.focusBox).caret().start - replaceLength;
    cEnd = $(this.focusBox).caret().end;
    str = $(this.focusBox).attr('value');
    out = str.substring(0,cStart) + chr + str.substring(cEnd);
    $(this.focusBox).attr('value', out);
    cStart = cEnd + chr.length;
    $(this.focusBox).caret(cStart,cStart);
  };
  this.setHotKeys = function(){
    document.onkeydown = function(e){
      if(e.target == kb.focusBox){
	if(e.which == 17 && specialMode){
	  console.log('newchar');
	  delta = null;
	  foxtrot = 0;
	  hotel = 0;
	}
	if(e.which == specialCode['ESCAPE']){
	  specialMode = false;
	  delta = null;
	  foxtrot = 0;
	  hotel = 0;
	  $(typeModeIcon).remove();
	}
	if(e.ctrlKey && e.which == specialCode['SHIFT']){
	  specialMode=true;
	  delta = null;
	  foxtrot = 0;
	  hotel = 0;
	  $(kb.focusBox).after(typeModeIcon);
	}
      }
    }
    document.onkeypress = function(e){
      if(e.target == kb.focusBox){
	if(specialMode && e.which != 17 && e.which != 16 && !e.ctrlKey){
	  alpha = String.fromCharCode(e.charCode).toLocaleUpperCase();
	  foxtrot = alpha == delta ? foxtrot+1: 0;
	  if(foxtrot==0){
	    hotel=0;
	  }
	  delta = alpha;
	  beta = kb.alphaSet[alpha];
	  if(beta != undefined){
	    gamma = beta[foxtrot % beta.length].letter;
	    e.preventDefault();
	    kb.writeToBox(gamma, hotel);
	    hotel = gamma.length;
	  }
	}
      }
    };
  };
  this.setButtonListeners = function(){
    $(this.html).find('.kbletter').click(function(){
      cS = $(kb.focusBox).caret().start, cE = $(kb.focusBox).caret().end;
      str = $(kb.focusBox).attr('value');
      sub1 = str.substring(0,cS);
      sub2 = str.substring(cE);
      $(kb.focusBox).attr('value', sub1 + $(this).attr('letter') + sub2);
      $(kb.focusBox).focus();
      cS = cS+$(this).attr('letter').length;
      cE = cS;
      $(kb.focusBox).caret(cS,cS);
    });
  };
  this.setBoxListener = function(){
    $('.keyboardEnabled').focusin(function(){
	if(kb.focusBox != this || !isVisible){
	  $(kb.html).slideDown(300).center();
	  kb.focusBox = this;
	  hotel=1;
	  specialMode = false; 
	  prevMode = false;
	  $(typeModeIcon).remove();
	  isVisible = true;
	}
    });
    $('.keyboardEnabled').focusout(function(e){
      console.log(e);
    });
    $('.kbclose').click(function(){
      $(kb.html).slideUp(300);
      isVisible = false;
    });
    $(window).resize(function(){
      $(kb.html).center();
    });
  };

}