//hover init
hover_init = function() {
	var t;
	$(".size_hover").hover(function(){
		var self = $(this);
		t = setTimeout(function(){
		self.find(".size_popin").show().bgiframe();
		}, 300); 
	},function(){
		$(this).find(".size_popin").hide();
		clearTimeout(t);
	});
}