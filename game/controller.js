var onYouTubeIframeAPIReady;
var onPlayerReady;
var effMe;
$(function () {
    // Game Control variables
    var handicapped_on = false;
    var handicapped_interval = null;
    var autoplay_on = false;
    var autoplay_interval = null;
    var videoplay_on = true;

    // Song list variables
    var songs = "";
    var song_selected = "";

    // Slide control variables
    var started = false;
    var current_song = "";
    var song = $("#song")[0];
    var slides = "";
    var start_time = "";
    var next_slide = 0;
    var song_title = "";
    var song_running = false;

    // user account variables
    var user = "";
    var scores = [];

    // flow variables
    var lock_modal = true;
    var queue_modal = function(){};

    // User Stuff
    my_modal('<div class="input-group user_block"><label class="input-group-addon user_label" for="username">Username: </label><input type="text" autofocus class="form-control user_input" id="username" /></div><div class="user_button_wrapper"><input type="button" value="Log In" class="btn btn-primary user_button" /></div><div class="leaderboard_wrapper"><br />--- OR ---<br /><br /><a target="_blank" href="../leaderboard">Go to the Leaderboard</a></div>');
    setTimeout(function () { $("#username").focus(); }, 500);
    $(".modal").on("click", ".user_button", function () {
        if ($(".user_button").val() == "") {
            alert("Please specify a username.");
        }
        else {
            user = $(".user_input").val();
            load_song_and_user_info();
        }
    });    
    $(".modal").on("keydown", "#username", function (e) {
        if (e.originalEvent.keyCode == 13) {
            $(".user_button").click();
        }
    });

    // load data
    function load_song_and_user_info() {
        populate_song_list().then(function () {
            songs = song_list;
            get_scores().then(function (snapshot) {
                var scrs = snapshot.val()
                for(var val in scrs) {
                    if (val != undefined) {
                        some_song = songs.filter(function (val2, i2) { return val2.Id == val; })[0];
                        some_song.high_score = scrs[val].score;
                    }
                }
                song_select();
            });
        });
    }
    
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
            if (e.originalEvent.keyCode == 72) {
                my_modal(slides.map(function (val, i) { return val.time_hit; }).join("<br />"));
            }
        }
    });

    // Initializes the song and stuff
    function launch_training(song_json) {
        started = true;
        $("#current_lyric").html("");

        slides = song_json.slides;
        if(videoplay_on) {
            $("#video_player").css("display", "inline-flex");
            prepYouTubeVideo(song_json.youtube_url);
            
            //note, video launch from this point is handled in the youtube section.  Sorry that that's an unintuitive mess.
        }
        else {       
            $("#video_player").css("display", "none");  
            song.src = "../songs/" + song_json.song_file;
            song.addEventListener("canplaythrough", function () {
                $("#next_lyric").html("Next<br />=======================<br />" + slides[0].lyrics);
                song.play();
                start_time = new Date();

                if (handicapped_on && !autoplay_on) {
                    clearInterval(handicapped_interval);
                    handicapped_interval = setInterval(render_handicapped, 100);
                }
            }, true);
            song.load();   
        }
    }

    // Progresses slides after load
    function advance_slide() {
        
        if(videoplay_on) {
            slides[next_slide].time_hit = toplay.getCurrentTime() * 1000;
        }
        else {
            slides[next_slide].time_hit = (new Date() - start_time);
        }
        alert_score(slides[next_slide].target_time, slides[next_slide].time_hit)

        if ((next_slide + 1) < slides.length) {
            $("#next_lyric").html("Next<br />=======================<br />" + slides[next_slide + 1].lyrics);
        }
        else {
            $("#next_lyric").html("DONE");
            var summation = 0
            $(slides).each(function (i, val) {
                var gap = Math.round(Math.abs(val.target_time - val.time_hit) / 100);
                gap = gap / 10.0;
                summation += gap;
            });
            avg = Math.round((summation / slides.length) * 100) / 100.0;
            if (avg < 1) {
                if (!autoplay_on)
                {
                    my_modal("Congrats!  You had an average error of " + avg + ".  That's pretty good.  Proud of you.  :)");
                }
            }
            else {
                my_modal("Aw, come on buddy.  You had an average error of " + avg + ".  You can do better than that.  Let's try again, okay.  :)");
            }
            queue_modal = function () { setTimeout(reset, 700); };


            if (autoplay_on) {
                clearInterval(autoplay_interval)
                $("#h_current_time").html("")
                $("#h_next_time").html("")
                autoplay_on = false;
                // close modal because it's a cleaner way of launching reset
                close_modal();
            }
            else if (handicapped_on) {
                clearInterval(handicapped_interval);
                $("#h_current_time").html("")
                $("#h_next_time").html("")
            }
            else {
                update_score(song_selected.Id, avg)
            }
        }
        $("#current_lyric").html(slides[next_slide].lyrics);
        next_slide++;
    }

    function reset() {
        $("#current_lyric").html("Rules:<br />Press space or right to advance lyrics<br />Try to keep time<br />Press space or right to start");
        $("#next_lyric").html("");

        song_selected = "";
        started = false;
        current_song = "";
        slides = "";
        start_time = "";
        next_slide = 0;
        song_title = "";
        song_running = false;
        scores = [];
        lock_modal = true;

        song_select();
    }

    function render_handicapped() {
        $("#h_current_time").html(msToTime((new Date() - start_time)))
        $("#h_next_time").html(msToTime(slides[next_slide].target_time))
    }
    function render_autoplay() {
        var time_cur = (new Date() - start_time)
        $("#h_current_time").html(msToTime(time_cur))
        $("#h_next_time").html(msToTime(slides[next_slide].target_time))

        if (time_cur >= slides[next_slide].target_time) {
            advance_slide();
        }
    }

    // tells the user their score for the slide
    function alert_score(target, guess) {
        direction = "early";
        if (target < guess) { direction = "late"; }

        gap = Math.round(Math.abs(target - guess) / 10);
        gap = gap / 100.0;

        $("#slide_score").html("");
        $("#slide_score").css("color", "lightgreen");
        if (gap > 0.60) { $("#slide_score").css("color", "red"); }

        $("#slide_score").html(gap + " seconds " + direction);
        setTimeout(function () { $("#slide_score").html(""); }, 3000);
    }

    // song select menu
    function song_select() {
        lock_modal = true;
        var output_html = '<label class="handicapped_area" for="handicapped_mode">Training mode&nbsp;<a id="handicapped_help">(<span style="border-bottom:0.063em dashed gray;">explanation</span>)</a>:&nbsp;&nbsp;&nbsp;&nbsp;<label><div class="onoffswitch"><input type="checkbox" name="onoffswitch" ' + (handicapped_on ? "checked" : "") + ' class="onoffswitch-checkbox" id="handicapped_mode"><label class="onoffswitch-label" for="handicapped_mode"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label></div></label></label>';
        
        output_html += '<label class="videoplay_area" for="videoplay_mode">Include video player:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><div class="onoffswitch"><input type="checkbox" name="onoffswitch" ' + (videoplay_on ? "checked" : "") + ' class="onoffswitch-checkbox" id="videoplay_mode"><label class="onoffswitch-label" for="videoplay_mode"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label></div></label></label>';
        
        $(songs).each(function (i, val) {
            var status = "<span class='glyphicon glyphicon-ok' aria-hidden='true'></span>";
            var color = "green"
            if (val.high_score == "") { status = ""; }
            else if (val.high_score > 1) { color = "red"; status = ""; }

            output_html += '<a class="song_select_button" data-id="' + val.Id + '">' + val.title + '<span data-id="' + val.Id + '" style="float:right;color:' + color + ';">' + val.high_score + "&nbsp;&nbsp;" + status + '</span></a><a class="auto_play" data-id="' + val.Id + '">auto-play</a>'
        });
        my_modal(output_html);

        $(songs).each(function (i, val) {
            if (!val.Active) {
                $(".song_select_button[data-id='" + val.Id + "']").addClass("song_not_found")
                $(".song_select_button[data-id='" + val.Id + "']").removeClass("song_select_button")
                $(".auto_play[data-id='" + val.Id + "']").addClass("song_not_found_auto")
                $(".auto_play[data-id='" + val.Id + "']").removeClass("auto_play")
            }
        });
    }

    $(".modal").on("change", "#handicapped_mode", function () {
        handicapped_on = $("#handicapped_mode").prop("checked");
    });
    $(".modal").on("change", "#videoplay_mode", function () {
        videoplay_on = $("#videoplay_mode").prop("checked");
    });
    $(".modal").on("click", "#handicapped_help", function () {
        alert("If you turn on Training Mode, you will see a timer that indicates when you should hit the next slide.\n\nNote: When in training mode, your score *will not* be saved.  You can't cheat your way onto the leaderboard.  Not on my watch.");
    });


    $(".modal").on("click", ".auto_play", function (e) {
        var id = $(e.target).data("id");
        song_selected = songs.filter(function (val2, i2) { return val2.Id == id; })[0];
        lock_modal = false;
        close_modal();

        autoplay_on = true;
        launch_training(song_selected);
        //timeout to stop the next button from being hit before setup
        
        setTimeout(function () {
            clearInterval(autoplay_interval);
            autoplay_interval = setInterval(render_autoplay, 10);
        }, 300);
    });

    $(".modal").on("click", ".song_select_button", function (e) {
        var id = $(e.target).data("id");
        song_selected = songs.filter(function (val2, i2) { return val2.Id == id; })[0];
        song_running = true;
        lock_modal = false;
        close_modal();
    });

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
          
          console.log($("#video_player").css("height").split("px")[0].split(".")[0])
          console.log($("#video_player").css("width").split("px")[0].split(".")[0])
          console.log(url.split("v=")[1].split("&")[0])
          
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

         start_time = new Date();

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

    //Save the average time for the song if it beats the previous record
    function update_score(songid, avgtime) {
        if (song_selected.high_score == "" || song_selected.high_score > avgtime) {
            song_selected.high_score = avgtime;
        }

        var db_song = firebase.database().ref('/user/' + user + '/songs/' + songid);
        return db_song.once('value').then(function (snapshot) {
            if (snapshot.val() == null || snapshot.val().score > avgtime) {
                db_song.set({
                    score: avgtime
                });
            }
        });
    }

    //Save the average time for the song if it beats the previous record
    function get_scores() {
        var db_songlist = firebase.database().ref('/user/' + user + '/songs/');
        return db_songlist.once('value');
    }

    //Fetch the song list from the database
    var song_list = [];
    function populate_song_list() {
        var songs = firebase.database().ref('/submissions');
        return songs.once("value").then(function (snapshot) {
            song_data = snapshot.val();
            for (var id in song_data) {
                song_list.push(song_data[id]);
            }
        });
    }
});