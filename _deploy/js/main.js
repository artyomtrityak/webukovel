$(function(){
  'use strict';

  //-------------------------------------------------
  //  Browser detection
  //-------------------------------------------------
  if (navigator.userAgent.search(/firefox/i) !== -1) {
    document.body.classList.add('firefox');
  }


  //-------------------------------------------------
  //  Google map
  //-------------------------------------------------
  var $map = $('#map');

  function initialize() {
    var mapOptions = {
      zoom: 18,
      center: new google.maps.LatLng(48.359400, 24.409100),
      disableDefaultUI: true,
      scrollwheel: false
    };
    var map = new google.maps.Map($map[0], mapOptions);

    new google.maps.Marker({
      position: new google.maps.LatLng(48.359550, 24.408221),
      map: map,
      title: 'Развлекательный центр «Бука»',
      icon: './img/icon-marker.png'
    });
  }

  if ($map.length !== 0) {
    google.maps.event.addDomListener(window, 'load', initialize);
  }


  //-------------------------------------------------
  //  page scrolling
  //-------------------------------------------------
  var scrollTime = 500,
      scrollOffset = $('.fixed-nav').outerHeight(),
      $nav = $('.nav');

  $('.fixed-socials').on('click', '.fixed-socials__arrow', function(event) {
    var totalHeight;
    if (this.className.search(/down/i) === -1) {
      $('html, body').animate({scrollTop: 0}, scrollTime);
    } else {
      totalHeight = getDocHeight();
      $('html, body').animate({scrollTop: totalHeight}, scrollTime);
    }
  });

  $nav.on('click', '.nav__link', function(event) {
    event.preventDefault();
    var offsetTop = $(this.hash).offset().top - scrollOffset + 1;
    $('html, body').animate({scrollTop: offsetTop}, scrollTime);
  });

  // ScrollSpy
  $('body').scrollspy({
    target: '.fixed-nav',
    offset: scrollOffset
  });

  function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
  }


  //-------------------------------------------------
  //  jQuery.countdown
  //-------------------------------------------------
  $('#timer').countdown('2015/02/28', function(event) {
    var days = event.strftime('%D'),
        hours = event.strftime('%H'),
        minutes = event.strftime('%M'),
        seconds = event.strftime('%S'),
        resultStr = '';

    resultStr += '<span>' + days[0] + '</span>' + '<span>' + days[1] + '</span>' + '<b>:</b>';
    resultStr += '<span>' + hours[0] + '</span>' + '<span>' + hours[1] + '</span>' + '<b>:</b>';
    resultStr += '<span>' + minutes[0] + '</span>' + '<span>' + minutes[1] + '</span>' + '<b>:</b>';
    resultStr += '<span>' + seconds[0] + '</span>' + '<span>' + seconds[1] + '</span>';

    $(this).html(resultStr);
  });

});
