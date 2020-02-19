// var DeleteAllButton = document.getElementById('deleteAllProduct').value;

function validate(){
    var result = window.confirm("Do you want delete all products");
    if(result == true){
        return true;
    }else{
        return false;
    }
}

// Dropdown Hover Effect
$(document).ready(function() {
	$(".dropdown, .btn-group").hover(function() {
		var dropdownMenu = $(this).children(".dropdown-menu");
		if (dropdownMenu.is(":visible")) {
			dropdownMenu.parent().toggleClass("open");
		}
	});
});

// Carousel
$(".owl-carousel").owlCarousel({
	loop: true,
	margin: 10,
	autoplay: true,
    autoplayTimeout: 2000,
    animateOut: 'fadeOut',
	responsive: {
		0: {
			items: 1
		},
		600: {
			items: 1
		},
		1000: {
			items: 1
		}
	}
});

document.addEventListener('DOMContentLoaded', function () {
	var elems = document.querySelectorAll('.sidenav');
	var instances = M.Sidenav.init(elems, {});
});

document.addEventListener('DOMContentLoaded', function () {
	var elems = document.querySelectorAll('.fixed-action-btn');
	var instances = M.FloatingActionButton.init(elems, {});
});