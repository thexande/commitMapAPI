$(document).ready(function(){
  var body = $('body')
  $(document).mousemove(function(e){

     TweenLite.to(body, .5,
            {
                backgroundPosition: ""+ parseInt(event.pageX/8) + "px "+parseInt(event.pageY/'12')+"px, "+parseInt(event.pageX/'15')+"px "+parseInt(event.pageY/'15')+"px, "+parseInt(event.pageX/'30')+"px "+parseInt(event.pageY/'30')+"px"
            })

  });
});
