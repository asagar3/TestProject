var spec_active = false;
var spec_different_language = false;

// Load when document finished loading
$(document).ready(function (){
	klarna_specReady();
});
	
function klarna_specReady ()
{
	var foundBox = false;
	var currentMinHeight_spec = $('#klarna_box_spec').height();
	
	if (global_countryCode == "de" || global_countryCode == "nl")
	{
		if(typeof select_spec_bday != "undefined") {
			$('#selectBox_spec_bday').val(select_spec_bday);
		}

		if(typeof select_bmonth != "undefined") {
			$('#selectBox_spec_bmonth').val(select_spec_bmonth);
		}

		if(typeof select_spec_byear != "undefined") {
			// Years box
			var date = new Date();
			for (i = date.getFullYear(); i >= 1900; i--)
			{
				$('<option/>').val(i).text(i).appendTo('#selectBox_spec_year')
			}
			$('#selectBox_spec_year').val(select_spec_byear);
		}
	}
	
	// Chosing the active language
	$('#box_active_language').click(function () {
		$('.klarna_box_top_flag_list').slideToggle('fast', function () {
			if ($(this).is(':visible'))
			{
				$('.klarna_box_top_flag').animate({opacity: 1.0}, 'fast');
			}
			else {
				$('.klarna_box_top_flag').animate({opacity: 0.4}, 'fast');
			}
		});
	});

	$('.klarna_box_bottom_languageInfo').mousemove(function (e) {
		showBlueBaloon(e.pageX, e.pageY, $(this).find('img').attr("alt"));
	});
	
	$('.klarna_box_bottom_languageInfo').mouseout(function () {
		hideBlueBaloon();
	});

	if ($('#getAddressUpdater').val() != "" && global_countryCode == "se")
	{
		getAddress();
	}
}

function resetListBox ($listBox)
{
	$listBox.find('li').each(function (){
		if ($(this).attr("id") == "click")
		{
			$(this).attr("id", "");
		}
		
		$(this).find('div').find('img').remove();
	});
}
