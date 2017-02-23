$(function () {
    var started = false;
    var current_song = "";
    var song = $("#song")[0];
    var slides = "";
    var start_time = "";
    var next_slide = 0;
    var user = "";

    $(document).on("keydown", function (e) {
        if (e.originalEvent.keyCode == 32 || e.originalEvent.keyCode == 39) {
            if (!started) {
                launch_training();
            }
            else {
                advance_slide();
            }
        }        
        if (e.originalEvent.keyCode == 72) {
            alert(slides.map(function (val, i) { return val.time_hit; }).join("\n"));
        }
    });

    function launch_training() {
        $.getJSON("jailbreak.json", function (data) {
            started = true;
            $("#current_lyric").html("");

            slides = data.slides;
            song.src = data.song_file;
            console.log(song);
            song.addEventListener("canplaythrough", function () {
                $("#next_lyric").html("Next<br />=======================<br />" + slides[0].lyrics);
                song.play();
                start_time = new Date();
            }, true);
            song.load();
        });
    }

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
            if (avg < 2) {
                alert("Congrats!  You had an average error of " + avg + ".  That's pretty good.  Proud of you.  :)");
            }
            else {
                alert("Aw, come on buddy.  You had an average error of " + avg + ".  You can do better than that.  Let's try again, okay.  :)");
            }
        }
        $("#current_lyric").html(slides[next_slide].lyrics);
        next_slide++;
    }

    function alert_score(target, guess) {
        direction = "early";
        if (target < guess) { direction = "late"; }

        gap = Math.round(Math.abs(target - guess) / 100);
        gap = gap / 10.0;

        $("#slide_score").html("");
        $("#slide_score").css("color", "lightgreen");
        if (gap > 1.5) { $("#slide_score").css("color", "red"); }

        $("#slide_score").html(gap + " seconds " + direction);
        setTimeout(function () { $("#slide_score").html(""); }, 3000);
    }

    //Save the average time for the song if it beats the previous record
    function setTime(song_id, avg_time) {
        var db_song = firebase.database().ref('/user/' + user + '/songs/' + song_id);
        return db_song.once('value').then(function (snapshot) {
            console.log(snapshot)
            if (snapshot.val() == null || snapshot.val().score > avg_time) {
                db_song.set({
                    score: avg_time
                });
            }
        });
    }
});