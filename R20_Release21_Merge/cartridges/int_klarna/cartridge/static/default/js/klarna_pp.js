var klarna_PPBoxOpen = false;

$(document).ready(function () {
	$('.klarna_PPBox_pull').click(function () {
		if (klarna_PPBoxOpen == true)
		{
			$('.klarna_PPBox_bottom').slideUp('fast');
			klarna_PPBoxOpen = false;
			$('#klarna_PPBox_pullUp').fadeOut('fast');
			$('#klarna_PPBox_pullDown').fadeIn('fast');
		}
		else {
			$('.klarna_PPBox_bottom').slideDown('fast');
			klarna_PPBoxOpen = true;
			$('#klarna_PPBox_pullUp').fadeIn('fast');
			$('#klarna_PPBox_pullDown').fadeOut('fast');
		}
	});
	
	$('.klarna_PPBox_top').click(function () {
		if (klarna_PPBoxOpen == true)
		{
			$('.klarna_PPBox_bottom').slideUp('fast');
			klarna_PPBoxOpen = false;
			$('#klarna_PPBox_pullUp').fadeOut('fast');
			$('#klarna_PPBox_pullDown').fadeIn('fast');
		}
		else {
			$('.klarna_PPBox_bottom').slideDown('fast');
			klarna_PPBoxOpen = true;
			$('#klarna_PPBox_pullUp').fadeIn('fast');
			$('#klarna_PPBox_pullDown').fadeOut('fast');
		}
	});
});
