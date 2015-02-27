var invoice_active = false;
var invoice_different_language = false;

// Load when document finished loading
$(document).ready(function (){
	klarna_invoiceReady();
});
	
function klarna_invoiceReady ()
{
	var foundBox = false;
	var currentMinHeight_invoice = $('#klarna_box_invoice').height();
	
	if (global_countryCode == "de" || global_countryCode == "nl")
	{
		if(typeof select_bday != "undefined") {
			$('#selectBox_bday').val(select_bday);
		}

		if(typeof select_bmonth != "undefined") {
			$('#selectBox_bmonth').val(select_bmonth);
		}

		if(typeof select_byear != "undefined") {
			// Years box
			var date = new Date();
			for (i = date.getFullYear(); i >= 1900; i--)
			{
				$('<option/>').val(i).text(i).appendTo('#selectBox_year')
			}
			$('#selectBox_year').val(select_byear);
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

	if(typeof invoice_ITId != "undefined") {
		$('input[name='+invoice_ITId+']').change(function (){
			var val = $(this).val();
			
			if (val == "private")
			{
				$('#invoice_perOrg_title').text(lang_personNum);
				$('#invoice_box_private').show();
				$('#invoice_box_company').hide();
			}
			else if (val == "company")
			{
				$('#invoice_perOrg_title').text(lang_orgNum);
				$('#invoice_box_company').show();
				$('#invoice_box_private').hide();
			}
		}).trigger('change')
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
