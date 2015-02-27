$(document).ready(function() {
$('#rightcolumn .faqBoxContent:first').show();
$('#rightcolumn .faqBox h5:first').addClass('open');
 $('#rightcolumn').find('.faqBox h5').click(function() {
	$('.faqBox h5').removeClass('open');
    $(this).toggleClass('open');
    $('.faqBoxContent').slideUp('slow');
    $(this).parent().next().slideToggle('800');
 });
});



















 