$(function () {
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
    modal('<div class="user_block"><label class="user_label" for="username">Username: </label><input type="text" autofocus class="user_input" id="username" /></div><div class="user_button_wrapper"><input type="button" value="Log In" class="user_button" /></div>')
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
        $.getJSON("songs.json", function (data) {
            songs = data;
            get_scores().then(function (snapshot) {
                $(snapshot.val()).each(function (i, val) {
                    if (val != undefined) {
                        some_song = songs.filter(function (val2, i2) { return val2.Id == i; })[0];
                        some_song.high_score = val.score;
                    }
                });
                song_select();
            });
        });
    }

    // advance slide controls
    $(document).on("keydown", function (e) {
        if (song_running)
        {
            if (e.originalEvent.keyCode == 32 || e.originalEvent.keyCode == 39) {
                if (!started) {
                    launch_training(song_selected);
                }
                else {
                    advance_slide();
                }
            }        
            if (e.originalEvent.keyCode == 72) {
                modal(slides.map(function (val, i) { return val.time_hit; }).join("<br />"));
            }
        }
    });

    // Initializes the song and stuff
    function launch_training(song_json) {
        started = true;
        $("#current_lyric").html("");

        slides = song_json.slides;
        song.src = "songs/" + song_json.song_file;
        song.addEventListener("canplaythrough", function () {
            $("#next_lyric").html("Next<br />=======================<br />" + slides[0].lyrics);
            song.play();
            start_time = new Date();
        }, true);
        song.load();
    }

    // Progresses slides after load
    function advance_slide() {
        slides[next_slide].time_hit = (new Date() - start_time);
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
                modal("Congrats!  You had an average error of " + avg + ".  That's pretty good.  Proud of you.  :)");
            }
            else {
                modal("Aw, come on buddy.  You had an average error of " + avg + ".  You can do better than that.  Let's try again, okay.  :)");
            }
            queue_modal = reset;

            update_score(song_selected.Id, avg)
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
        var output_html = "";
        $(songs).each(function (i, val) {
            var status = "✓";
            var color = "green"
            if (val.high_score == "") { status = ""; }
            else if (val.high_score > 1) { color = "red"; status = ""; }

            output_html += '<a class="song_select_button" data-id="' + val.Id + '">' + val.title + '<span style="float:right;color:' + color + ';">' + val.high_score + "&nbsp;&nbsp;" + status + '</span></a>'
        });
        modal(output_html);
    }

    $(".modal").on("click", ".song_select_button", function (e) {
        var id = $(e.target).data("id");
        song_selected = songs.filter(function (val2, i2) { return val2.Id == id; })[0];
        song_running = true;
        lock_modal = false;
        close_modal();
    });

    // modal control
    function modal(text) {
        $(".modal_text").html(text);
        $(".fullscreen").css("display", "flex");
    }
    function close_modal() {
        if (!lock_modal) {
            $(".fullscreen").css("display", "none");
        }
        else {
            alert("The modal cannot be dismissed right now.")
        }

        queue_modal();
        queue_modal = function () { };
    }
    $(".x_button,.close_button,.fullscreen_background").on("click", function () {
        close_modal();
    });



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
});