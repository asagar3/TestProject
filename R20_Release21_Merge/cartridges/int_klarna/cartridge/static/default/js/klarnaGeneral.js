if(typeof $ != 'undefined') {
	$ = jQuery;
}

var klarnaGeneralLoaded = true;
var red_baloon_busy = false;
var blue_baloon_busy = false;
var address_busy = false;
var baloons_moved = false;
var flagChange_active = false;
var changeLanguage_busy = false;
var openBox_busy = false;
var showing_companyNotAlowed_box = false;

var klarna_js_loaded = true;
var klarnaGeneralReady;

//Load when document finished loading
$(document).ready(function (){

	// Wait for demandware onready callbacks to fiddle about with stuff
	setTimeout("doDocumentIsReady()", 0)

	moveBaloons()

	/*
	 * Use demandwares builtin payment method chooser to avoid
	 * hairy integration
	 *
	var box 	= $('input[type=radio][name=payment]:checked');
	var choice 	= $(box).val();

	if (choice != "klarna_invoice")
	{
		$('#klarna_box_invoice_top_right').css({"display": "none"});
		$('#klarna_box_invoice').animate({"min-height": "55px", "height": "55px"}, 200);
		$('#klarna_box_invoice').find('.klarna_box_bottom').css({"display": "none"});
	}
	else {
		$('#klarna_box_invoice').find('.klarna_box_bottom').fadeIn('fast');
	}

	if (choice != "klarna_partPayment")
	{
		$('#klarna_box_part_top_right').css({"display": "none"});
		$('#klarna_box_part').animate({"min-height": "55px", "height": "55px"}, 200);
		$('#klarna_box_part').find('.klarna_box_bottom').css({"display": "none"});
	}
	else {
		$('#klarna_box_part').find('.klarna_box_bottom').fadeIn('fast');
	}

	if (choice != "klarna_SpecCamp")
	{
		$('#klarna_box_spec_top_right').css({"display": "none"});
		$('#klarna_box_spec').animate({"min-height": "55px", "height": "55px"}, 200);
		$('#klarna_box_spec').find('.klarna_box_bottom').css({"display": "none"});
	}
	else {
		$('#klarna_box_spec').find('.klarna_box_bottom').fadeIn('fast');
	}*/

	klarnaGeneralReady = true;
});

function moveBaloons () {
	var baloon = $('#klarna_baloon').clone();
	$(document).find('#klarna_baloon').each(function () {
		$(this).remove();
	});

	var baloon2 = $('#klarna_red_baloon').clone();
	$(document).find('#klarna_red_baloon').each(function () {
		$(this).remove();
	});

	var baloon3 = $('#klarna_blue_baloon').clone();
	$(document).find('#klarna_blue_baloon').each(function () {
		$(this).remove();
	});

	$('body').append(baloon);
	$('body').append(baloon2);
	$('body').append(baloon3);

	baloons_moved = true;
}

function doPClassesIsReady (method)
{
	var choosen = $(method).find('li#click img').clone();

	// P-Classes box actions
	$(method).find('.klarna_box ol li').mouseover(function (){
		if ($(this).attr("id") != "click")
			$(this).attr("id", "over");
	}).mouseout(function (){
		if ($(this).attr("id") != "click")
			$(this).attr("id", "");
	}).click(function (){
		resetListBox($(this).parent("ol"));
		$(this).attr("id", "click");
		$(this).find('div').append(choosen);

		var value = $(this).find('span').html();
		var name = $(this).parent("ol").attr("id");

		$("input:hidden[name="+name+"]").attr("value", value);
	});
}

function doDocumentIsReady ()
{
	var foundBox = false;
	var currentMinHeight_invoice = $('#klarna_box_invoice').height();
	var currentMinHeight_part 	= $('#klarna_box_part').height();
	var currentMinHeight_spec 	= $('#klarna_box_spec').height();

	/* Stripped from all fancy animations that breaked DW
	 * for now only interested in the baloon hiding */
	$(document).bind('triggerChoosePaymentOption', function (e, choice){
		$('#klarna_blue_baloon').fadeOut();
		$('#klarna_red_baloon').fadeOut();

		if (openBox_busy == false)
		{
			openBox_busy = true;

			if (choice == "KLARNA")
			{
				$('.klarna_box_bottom_content_loader').fadeOut();

				if (showing_companyNotAlowed_box)
				{
					hideRedBaloon();
				}

				if (invoice_different_language)
					$('.klarna_box_bottom_languageInfo').fadeIn('fast');

				invoice_active = true;
				openBox_busy = false;
			}
			else if (choice == "KLARNA_PARTPAYMENT")
			{
				$('.klarna_box_bottom_content_loader').fadeOut();

				if (showing_companyNotAlowed_box)
				{
					hideRedBaloon();
				}

				if (part_different_language)
					$('.klarna_box_bottom_languageInfo').fadeIn('fast');

				part_active = true;
				openBox_busy = false;
			}
			else if (choice == "KLARNA_SPECIAL")
			{
				$('.klarna_box_bottom_content_loader').fadeOut();

				if (showing_companyNotAlowed_box)
				{
					hideRedBaloon();
				}

				if (spec_different_language)
					$('.klarna_box_bottom_languageInfo').fadeIn('fast');

				spec_active = true;
				openBox_busy = false;
			}
			else {
				invoice_active = false;
				part_active = false;
				spec_active = false;
				openBox_busy = false;
			}
		}
	});


	$(document).find('input[type=radio][name=payment]').each(function () {
		var value = $(this).val();

		$(this).parent().parent().click(function (){
			$(this).trigger("triggerChoosePaymentOption", [ value ]);
		});

		$(this).bind("keyup blur focus change", function (){
			$(this).trigger("triggerChoosePaymentOption", [ value ]);
		});
	});

	if (global_countryCode == "de" || global_countryCode == "nl")
	{
		if (gender == 'm' || gender == '1')
		{
			$('.Klarna_radio[value=0]').attr('checked', 'checked');
		}
		else if (gender == 'f' || gender == '0')
		{
			$('.Klarna_radio[value=1]').attr('checked', 'checked');
		}
	}
	
	// Input field on focus
	$('.klarna_box').find('input').focus(function () {
	//@TODO $('.klarna_box').find('input').focusin(function () {
		setBaloonInPosition($(this), false);
	}).blur(function() {
	//@TODO }).focusout(function () {
		hideBaloon();
	});

	// Chosing the active language
	$('.box_active_language').click(function () {
		if (flagChange_active == false)
		{
			flagChange_active = true;

			$(this).parent().find('.klarna_box_top_flag_list').slideToggle('fast', function () {
				if ($(this).is(':visible'))
				{
					$(this).parent('.klarna_box_top_flag').animate({opacity: 1.0}, 'fast');
				}
				else {
					$(this).parent('.klarna_box_top_flag').animate({opacity: 0.4}, 'fast');
				}

				flagChange_active = false;
			});
		}
	});
	
	$('.klarna_box_top_flag_list img').click(function (){
		if (changeLanguage_busy == false)
		{
			changeLanguage_busy = true;

			var newIso = $(this).attr("alt");

			$('#box_active_language').attr("src", $(this).attr("src"));

			var box = $(this).parents('.klarna_box_container');
			var params;
			var values;
			var type;

			if (box.find('.klarna_box').attr("id") == "klarna_box_invoice")
			{
				//params = paramValues_invoice;
				//values = paramNames_invoice;
				type = "invoice";
			}
			else if (box.find('.klarna_box').attr("id") == "klarna_box_part")
			{
				//params = paramValues_part;
				//values = paramNames_part;
				type = "part";
			}
			else if (box.find('.klarna_box').attr("id") == "klarna_box_spec")
			{
				//params = paramValues_spec;
				//values = paramNames_spec;
				type = "spec";
			}
			else {
				return ;
			}

			changeLanguage(box, params, values, newIso, global_countryCode, type);
		}
	});

	prepareRedBaloon();

	$('#klarna_red_baloon').mouseover(function (){
		showRedBaloonShowAgain();
	});

	$('#klarna_red_baloon').bind("mouseout blur", function (){
		showRedBaloonHidden();
	});

	$('.klarna_box_bottom_languageInfo').mousemove(function (e) {
		showBlueBaloon(e.pageX, e.pageY, $(this).find('img').attr("alt"));
	});

	$('.klarna_box_bottom_languageInfo').mouseout(function () {
		hideBlueBaloon();
	});

	// Hi-Ho
	dw_extra_ready();
}

function prepareRedBaloon () {
	if ($('#klarna_red_baloon_content div').html() != "")
	{
		var field;

		// Demandware hack, display baloon at active payment method radio button
		field = $(document).find('#paymentmethods input:checked')

		showRedBaloon(field);
		setTimeout('showRedBaloonHidden()', 3000);
	}
}

function getAddress (box, companyAllowed, field, typefield)
{
	var pno_value = $(box).val();

	// Set the PNO to the other fields
	$(document).find('.Klarna_pnoInputField').each(function () {
		$(this).val(pno_value);
	});

	// Do check
	if (pno_value != "")
	{
		$(document).find('.klarna_box_bottom_content_loader').each(function () {
			if (!$(this).is(":visible"))
				$(this).fadeIn('fast');
		});

		if (!validateSocialSecurity(pno_value))
		{
			$(document).find('.klarna_box_bottom_content_loader').each(function () {
				$(this).fadeOut('fast');
			});

			if ($('.klarna_box_bottom_address').is(":visible"))
				$('.klarna_box_bottom_address').slideUp('fast');
		}
		else
		{
			if (!address_busy)
			{
				address_busy = true;
				// Get the new klarna_box
				$.ajax({
					type: "GET",
					url: klarna_get_addresses_url,
					data: {"ssn": pno_value},
					success: function(xml){
						$(xml).filter('getAddress').each(function() {
							var selectBox = ($('address', this).length > 1);

							var inputInvoice;
							var inputPart;
							var inputSpec;

							var string = "";

							$(this).find('address').each(function () {
								var isCompany = ($('companyName', this).length > 0);

								if (!selectBox)
								{
									var inputValue = (isCompany ? $(this).find('companyName').text() : $(this).find('first_name').text() + " " + $(this).find('last_name').text());
									inputValue += "|"+$(this).find('street').text();
									inputValue += "|"+$(this).find('zip').text()+"|"+$(this).find('city').text();
									inputValue += "|"+$(this).find('countryCode').text();

									if (typeof shipmentAddressInput_invoice != "undefined")
										inputInvoice = '<input type="hidden" name="'+shipmentAddressInput_invoice+'" value="'+inputValue+'" />';

									if (typeof shipmentAddressInput_part != "undefined")
										inputPart = '<input type="hidden" name="'+shipmentAddressInput_part+'" value="'+inputValue+'" />';

									if (typeof shipmentAddressInput_spec != "undefined")
										inputSpec = '<input type="hidden" name="'+shipmentAddressInput_spec+'" value="'+inputValue+'" />';

									string += "<p>"+(isCompany ? $(this).find('companyName').text() : $(this).find('first_name').text() + " " + $(xml).find('last_name').text())+"</p>";
									string += "<p>"+$(this).find('street').text()+"</p>";
									string += "<p>"+$(this).find('zip').text()+" "+$(this).find('city').text()+"</p>";
									string += "<p>"+$(this).find('countryCode').text()+"</p>";

									inputInvoice += string;
									inputPart += string;
									inputSpec += string;
								}
								else {
									var inputValue = (isCompany ? $(this).find('companyName').text() : $(this).find('first_name').text() + " " + $(this).find('last_name').text());
									inputValue += "|"+$(this).find('street').text();
									inputValue += "|"+$(this).find('zip').text()+"|"+$(this).find('city').text();
									inputValue += "|"+$(this).find('countryCode').text();

									string += '<option value="'+inputValue+'">';
									string += (isCompany ? $(this).find('companyName').text() : $(this).find('first_name').text() + " " + $(xml).find('last_name').text());
									string += ", "+$(this).find('street').text();
									string += ", "+$(this).find('zip').text()+" "+$(this).find('city').text();
									string += ", "+$(this).find('countryCode').text();
									string += '</option>';
								}

								if (isCompany)
								{
									$(typefield).val("company");
									$('.refferenceDiv').slideDown('fast');

									if (!selectBox)
									{
										$('.klarna_box_bottom').animate({"min-height": "300px"},'fast');
									}

									if (companyAllowed == false && typeof lang_companyNotAllowed != "undefined")
									{
										showRedBaloon($(box));
										$('#klarna_red_baloon_content div').html(lang_companyNotAllowed);
										showing_companyNotAlowed_box = true;
									}
									else {
										hideRedBaloon();
									}
								}
								else
								{
									$(typefield).val("private");
									$(document).find('.refferenceDiv').slideUp('fast');

									$('.klarna_box_bottom').animate({"min-height": "250px"},'fast');

									if (showing_companyNotAlowed_box)
										hideRedBaloon();
								}
							});

							if (selectBox)
								string += "</select>";

							var selectInvoice;
							var selectPart;
							var selectSpec;

							if (selectBox)
							{
								if (typeof shipmentAddressInput_invoice != "undefined")
									selectInvoice = '<select name="'+shipmentAddressInput_invoice+'">'+string;

								if (typeof shipmentAddressInput_part != "undefined")
									selectPart = '<select name="'+shipmentAddressInput_part+'">'+string;

								if (typeof shipmentAddressInput_spec != "undefined")
									selectSpec = '<select name="'+shipmentAddressInput_spec+'">'+string;
							}

							$('#klarna_box_invoice').find('.klarna_box_bottom_address_content').html((selectBox ? selectInvoice : inputInvoice));

							$('#klarna_box_part').find('.klarna_box_bottom_address_content').html((selectBox ? selectPart : inputPart));

							$('#klarna_box_spec').find('.klarna_box_bottom_address_content').html((selectBox ? selectSpec : inputSpec));

							$('.klarna_box_bottom_address').slideDown('fast');
							$('.klarna_box_bottom_content_loader').fadeOut('fast', function () {
								address_busy = false;
							});
						});
						address_busy = false;
					}
				});
			}
		}
	}
	else {
		$(document).find('.refferenceDiv').each(function (){
			if ($(this).is(":visible"))
			{
				$(this).slideUp('fast');
			}
			else {
				$(this).css({"display":"none"});
			}
		});

		$('.klarna_box_bottom_content_loader').fadeOut('fast');

		$(document).find('.klarna_box_bottom_address').each(function () {
			if ($(this).is(":visible"))
			{
				$(this).slideUp('fast');
			}
			else {
				$(this).css({"display":"none"});
			}
		});
	}
}

function showBlueBaloon (x, y, text)
{
	$('#klarna_blue_baloon_content div').html(text);

	var top = (y - $('#klarna_blue_baloon').height())-5;
	var left = (x - ($('#klarna_blue_baloon').width()/2)+5);

	$('#klarna_blue_baloon').animate({"left": left, "top": top}, 10);

	if (!$('#klarna_blue_baloon').is(':visible') && !blue_baloon_busy)
	{
		blue_baloon_busy = true;
		$('#klarna_blue_baloon').fadeIn('fast', function () {
			blue_baloon_busy = false;
		});
	}
}

function hideBlueBaloon ()
{
	if ($('#klarna_blue_baloon').is(':visible') && !blue_baloon_busy)
	{
		$('#klarna_blue_baloon').fadeOut('fast', function () {
			blue_baloon_busy = false;
		});
	}
}

function showRedBaloon (theField)
{
	if (red_baloon_busy || typeof theField == 'undefined')
		return;

	red_baloon_busy = true;

	if (theField == null)
		field = $('#klarna_logo');
	else
		field = $(theField);

	var position = field.offset();

	var top = (position.top - $('#klarna_red_baloon').height()) + ($('#klarna_red_baloon').height() / 6);
	if (top < 0) top = 10;
	position.top = top;

	var left = (position.left + field.width()) - ($('#klarna_red_baloon').width() / 2);

	position.left = left;

	$('#klarna_red_baloon').css(position);

	$('#klarna_red_baloon').fadeIn('slow', function () { 
		red_baloon_busy = false;

		setTimeout('showRedBaloonHidden()', 3000);
	});
}

function showRedBaloonHidden ()
{
	if (red_baloon_busy)
		return;

	red_baloon_busy = true;

	$('#klarna_red_baloon').animate({ "opacity": 0.2}, 500, function () {
		red_baloon_busy = false;
	});
}

function showRedBaloonShowAgain ()
{
	if (red_baloon_busy)
		return;

	red_baloon_busy = true;

	$('#klarna_red_baloon').animate({ "opacity": 1.0}, 500, function () {
		red_baloon_busy = false;
	});
}

function hideRedBaloon ()
{
	if (red_baloon_busy)
		return;

	if ($('#klarna_red_baloon').is(':visible') && !red_baloon_busy)
	{
		$('#klarna_red_baloon').fadeOut('fast', function () {
			red_baloon_busy = false;
			showing_companyNotAlowed_box = false;
		});
	}
}

/**
 * This function is only available for swedish social security numbers
 */
function validateSocialSecurity (vPNO)
{
	if (typeof vPNO == 'undefined')
		return false;

	return vPNO.match(/^([1-9]{2})?[0-9]{6}[-\+]?[0-9]{4}$/)
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

function hideBaloon (callback)
{
	if ($('#klarna_baloon').is(":visible"))
	{
		$('#klarna_baloon').fadeOut('fast', function (){
			if( callback ) callback();

			return true;
		});
	}
	else {
		if( callback ) callback();
		return true;
	}
}

function setBaloonInPosition ($field, red_baloon)
{
	hideBaloon(function (){
		var position = $field.offset();
		var name = $field.attr('name');
		var value = $field.attr('alt');

		if (!value && !red_baloon)
		{
			return false;
		}

		if (!red_baloon)
		{
			$('#klarna_baloon_content div').html(value);

			var top = position.top - $('#klarna_baloon').height();
			if (top < 0) top = 10;
			position.top = top;

			var left = (position.left + $field.width()) - ($('#klarna_baloon').width() - 50);

			position.left = left;

			$('#klarna_baloon').css(position);

			$('#klarna_baloon').fadeIn('fast');
		}
		else {
			var top = position.top - $('#klarna_red_baloon').height();
			if (top < 0) top = 10;
			position.top = top;

			var left = (position.left + $field.width()) - ($('#klarna_red_baloon').width() - 50);

			position.left = left;

			$('#klarna_red_baloon').css(position);

			$('#klarna_red_baloon').fadeIn('fast');
		}
	});
}

function changeLanguage (replaceBox, paramNames, paramValues, newIso, country, type)
{
	var paramString	= "";
	var valueString = "";

	/*for (var i = 0; i < paramNames.length; i++)
	{
		paramString += "&params["+paramValues[i]+"]="+paramNames[i];

		var inputValue = $("input[name="+paramNames[i]+"]").val();

		if((typeof(inputValue) != "undefined"))
			valueString += "&values["+paramValues[i]+"]="+inputValue;
	}*/

	newLang = newIso.split('_')[0]

	$.ajax({
		type: "GET",
		url: klarna_languagepack_url,
		data: {'locale':newIso, 'type': type},
		success: function(response){
			if ($(response).find('.klarna_box'))
			{
				replaceBox.find('.klarna_box').remove();
				replaceBox.append($(response).find('.klarna_box'));

				if (type == "invoice")
				{
					if (newLang != global_language_invoice)
						replaceBox.find('.klarna_box_bottom_languageInfo').fadeIn('slow', function () {
							changeLanguage_busy = false;
						});
					else 
						replaceBox.find('.klarna_box_bottom_languageInfo').fadeOut('slow', function () {
							changeLanguage_busy = false;
						});

					klarna_invoiceReady();
				}

				if (type == "part")
				{
					if(newLang != global_language_part)
						replaceBox.find('.klarna_box_bottom_languageInfo').fadeIn('slow', function () {
							changeLanguage_busy = false;
						});
					else 
						replaceBox.find('.klarna_box_bottom_languageInfo').fadeOut('slow', function () {
							changeLanguage_busy = false;
						});

					klarna_partReady();
				}

				if (type == "spec")
				{
					if(newLang != global_language_spec)
						replaceBox.find('.klarna_box_bottom_languageInfo').fadeIn('slow', function () {
							changeLanguage_busy = false;
						});
					else 
						replaceBox.find('.klarna_box_bottom_languageInfo').fadeOut('slow', function () {
							changeLanguage_busy = false;
						});

					klarna_specReady();
				}
				
				doDocumentIsReady();
			}
			else {
				alert("Error, block not found. Response:\n\n"+response);
			}
		}
	});
}
