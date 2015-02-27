var part_active = false;
var part_different_language = false;

// Load when document finished loading
$(document).ready(function (){
	klarna_partReady();
});
	
function klarna_partReady ()
{
	var foundBox = false;
	var currentMinHeight_part = $('#klarna_box_part').height();
	
	if (global_countryCode == "de" || global_countryCode == "nl")
	{
		if(typeof select_part_bday != "undefined") {
			$('#selectBox_part_bday').val(select_part_bday);
		}

		if(typeof select_bmonth != "undefined") {
			$('#selectBox_part_bmonth').val(select_part_bmonth);
		}

		if(typeof select_part_byear != "undefined") {
			// Years box
			var date = new Date();
			for (i = date.getFullYear(); i >= 1900; i--)
			{
				$('<option/>').val(i).text(i).appendTo('#selectBox_part_year')
			}
			$('#selectBox_part_year').val(select_part_byear);
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
