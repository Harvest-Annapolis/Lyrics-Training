var onYouTubeIframeAPIReady;
var onPlayerReady;
$(function () {
    // Song list variables
    var song_selected = "";

    // Slide control variables
    var started = false;
    var slides = "";
    var next_slide = 0;
    var song_running = true;

    // flow variables
    var lock_modal = false;
    var queue_modal = function(){};

    // output time tracking
    var times = []
    var target_runs = 3
    var current_run = 1
    
    
    
    
    //START
    get_song_data(getParameterByName("id")).then(function() {        
        song_selected.slides.forEach(function(val, i) { times.push([]) });
    });
    
    
    

    
    // advance slide controls
    $(document).on("keydown touchstart", function (e) {
        if (song_running)
        {
            if (e.originalEvent.keyCode == 32 || e.originalEvent.keyCode == 39 || e.originalEvent.touches != undefined) {
                e.preventDefault();
                if (!started) {
                    launch_training(song_selected);
                }
                else {
                    advance_slide();
                }
            }       
        }
    });

    // Initializes the song and stuff
    function launch_training(song_json) {
        started = true;
        $("#current_lyric").html("");

        slides = song_json.slides;
        
        if(!canplay) {
            prepYouTubeVideo(song_json.youtube_url);
        }
        else {
            toplay.playVideo();
        }
    }

    // Progresses slides after load
    function advance_slide() {
        times[next_slide].push(toplay.getCurrentTime() * 1000)
        
        if ((next_slide + 1) < slides.length) {
            $("#next_lyric").html("Next<br />=======================<br />" + slides[next_slide + 1].lyrics);
        }
        else {
            $("#next_lyric").html("DONE");
            
            if(target_runs == current_run){
                var disphtml = "<div id='results'>";
                times.forEach(function(val, i) {
                   disphtml += "<div><div>" + slides[i].lyrics + "</div><div class='resultInputs'>" + val.map(function(val2, i2) {
                       return "<input style='width:30%' type='text' value='" + val2.toFixed(3) + "' />";
                   }) + "</div></div><br />"; 
                });
                disphtml += "</div>"
                my_modal(disphtml)
                
                queue_modal = function () { setTimeout(save_to_db, 700); };
            }
            else {
                my_modal("<div>Round " + current_run + " is Done!  Only " + (target_runs - current_run) + " to go!  Close the modal and start the next round!</div>")
                
                current_run += 1;
                
                toplay.pauseVideo();
                toplay.seekTo(0);
                
                queue_modal = function () { setTimeout(reset, 700); };
            }
            
        }
        $("#current_lyric").html(slides[next_slide].lyrics);
        next_slide++;        
    }

    function reset() {
        $("#current_lyric").html("Rules:<br />Press space or right to advance lyrics<br />Try to keep time<br />Press space or right to start");
        $("#next_lyric").html("");

        next_slide = 0;
        started = false;
    }



    // modal control
    function my_modal(text) {
        $(".modal_text").html(text);
        $("#my_modal").modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    function close_modal() {
        if (!lock_modal) {
            $('#my_modal').modal('hide')
        }
        else {
            alert("The modal cannot be dismissed right now.")
        }

        queue_modal();
        queue_modal = function () { };
    }
    $(".x_button,.close_button").on("click", function () {
        close_modal();
    });


    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100)
            , seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60);

        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return minutes + ":" + seconds + "." + milliseconds;
    }    
    
    
    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    
    
    

    //*********************************************************************************************
    //
    //  YouTube functions.  
    //
    //*********************************************************************************************
    
    // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      var youtube_ready = false;
      var canplay = false;
      var toplay = null;
    
      onYouTubeIframeAPIReady = function() {
          youtube_ready = true;
      }
    
      function prepYouTubeVideo(url) {     
        while(!youtube_ready){}
          
        $("#video_player").html("<div id='player'></div>");
        canplay = false;
        toplay = null;
                    
        player = new YT.Player('player', {
          height: $("#video_player").css("height").split("px")[0].split(".")[0],
          width: $("#video_player").css("width").split("px")[0].split(".")[0],
          videoId: url.split("v=")[1].split("&")[0],
          events: {
            'onReady': onPlayerReady
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      onPlayerReady = function(event) {
          canplay = true;
          toplay = event.target;
          startYouTubePlay();
      }      

      function startYouTubePlay() {
         $("#next_lyric").html("Next<br />=======================<br />" + slides[0].lyrics);
         toplay.playVideo();

         if (handicapped_on && !autoplay_on) {
             clearInterval(handicapped_interval);
             handicapped_interval = setInterval(render_handicapped, 100);
         }
      }


    //*********************************************************************************************
    //
    //  Database functions.  Reimplement before any commercial rollout
    //
    //*********************************************************************************************

    //Fetch the song from the database
    function get_song_data(song_id){
        return firebase.database().ref('/submissions/' + song_id).once("value").then(function (snapshot) {
            song_selected = snapshot.val();
        })
    }
    
    function save_to_db() {
        //change times ss
        $(".resultInputs").each(function(i,val) { 
            song_selected.slides[i].target_time = parseInt($(val).children().map(function(i2,val2){ return parseInt($(val2).val()) }).toArray().reduce(function(a, b){ return a + b; })/3); 
        });
        console.log(song_selected);
        var db_writer = firebase.database().ref('/submissions/' + song_selected.Id);
        db_writer.once('value').then(function (snapshot) {
            db_writer.set(song_selected);
            window.location.href = window.location.href.split("trainer")[0];
        });
    }
});