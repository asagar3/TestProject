var debugDW = {
	// debug initializations called from jQuery(document).ready at the end
	// of the file
	init: function() {
		// Check if SFT is active and add build info link
		if (jQuery('#dw-sf-control-menu ul') != null) {
			jQuery('#dw-sf-control-menu ul').append('<li class="x-menu-list-item " id="buil_listitem"><a href="#" class="x-menu-item" id="build-anchor" onclick="debugDW.showBuildInfo()"><img class="x-menu-item-icon dw-sf-control-menu-log" src="/on/demandware.static/Sites-Site/-/-/internal/images/s.gif">Build Information</a></li>');
		}
	},
	showBuildInfo: function() {
		 jQuery('#build_information').show();
	}

};

// debug namespace initialization on dom ready
jQuery(document).ready(function() {
	debugDW.init();
});