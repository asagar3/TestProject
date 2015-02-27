window.invokeTenCMSEvent = function(data){
switch (data.eventName) {
      case "PO" :
	    /** Panel Opened **/
    	  var s = s_gi(s_account);
    	 s.linkTrackVars ="products,events";
    	 s.linkTrackEvents = "event38";
		s.products = ";" + data.value ;
		s.events = "event38";
		s.tl(true, 'o', "Panel Opened");
		break;
      case "LS" :
    	  switch(data.element){
    	      /** More Info Button **/
    	  		case "panelButton" :
    	  			var s = s_gi(s_account);
    	  			 s.linkTrackVars ="eVar14,products,events";
    	  			s.linkTrackEvents = "prodView,event3";
    	  			s.eVar14 = "Interactive product view";
    	  			s.products = ";" + data.value ;
    	  			s.events = "prodView,event3"; 
    	  			s.tl(true, 'o', "Interactive product view");
    	  			break;
    	  }
    	  
	}   
  }

