$(function () {
    var new_song =
        {
            "Active": false,
            "Id": "",
            "title": "",
            "song_file": "",
            "youtube_url": "",
            "high_score": "",
            "slides": [
              {
                  "lyrics": "",
                  "target_time": "",
                  "time_hit": ""
              }
            ]
        };

    var song_id = getParameterByName("id");
    if (song_id == null) {
        song_id = guid();
    }
    else {
        new_song.Active = true;
        populate_song();
    }



    $("#slide_area").on("blur", ".slide_time", function (e) {
        var thing = $(e.target);
        var no_format = thing.val().split('').filter(function (val, i) { return !isNaN(val); }).join("");

        thing.removeClass("input_error")

        // Good job, you don't suck
        if (thing.val().indexOf(':') != -1 && thing.val().indexOf('.') != -1) {
            return;
        }

        // double colon
        var small_bad = thing.val().split(':');
        if (small_bad.length == 3) {
            thing.val(small_bad[0] + ":" + small_bad[1] + "." + small_bad[2]);
            return;
        }

        // single colon, but no other special symbols
        if (small_bad.length == 2 && thing.val().length == (no_format.length + 1)) {
            thing.val(thing.val() + ".0");
        }

        if (no_format.length >= 6) {
            thing.val(no_format.substr(0, no_format.length - 5) + ":" + no_format.substr(no_format.length - 5, 2) + "." + no_format.substr(no_format.length - 3));
        }
        else if (no_format.length == 5) {
            thing.val(no_format.substr(0, no_format.length - 4) + ":" + no_format.substr(no_format.length - 4, 2) + "." + no_format.substr(no_format.length - 2));
        }
        else if (no_format.length == 4) {

            thing.val(no_format.substr(0, no_format.length - 3) + ":" + no_format.substr(no_format.length - 3, 2) + "." + no_format.substr(no_format.length - 1));
        }
        else if (no_format.length == 3) {
            thing.val(no_format.substr(0, no_format.length - 2) + ":" + no_format.substr(no_format.length - 2, 2) + ".0");
        }
        else if (no_format.length < 3) {
            thing.addClass("input_error")
        }
    });




    var slide_base_open = '<div><div class="staging_area"><span class="next_lyric">';
    var slide_base_mid = '</span></div><input type="text" class="slide_time" value="';
    var slide_base_close = '" placeholder="0:00.000" /></div>';
            
    var timeout = "";
    $("#lyrics").on("keydown", function () {
        clearTimeout(timeout);
        timeout = setTimeout(evaluate_lyrics, 2000);
    });
    function evaluate_lyrics() {
        times = $(".slide_time").map(function (i, val) { return $(val).val(); });
        $("#slide_area").html("");
        var next_slide = "";
        var list = $("#lyrics").val().split("\n");
        list.push("")
        count = 0
        list.forEach(function (val, i) {
            if (val == "") {
                if (next_slide != "") {
                    if(times[count] == undefined){
                        $("#slide_area").append(slide_base_open + next_slide + slide_base_mid  + slide_base_close);
                    }
                    else {
                        $("#slide_area").append(slide_base_open + next_slide + slide_base_mid + times[count] + slide_base_close);
                    }
                    next_slide = ""
                    count++;
                }
            }
            else {
                if (next_slide == "" && val == "[blank]") {
                    if(times[count] == undefined){
                        $("#slide_area").append(slide_base_open + next_slide + slide_base_mid  + slide_base_close);
                    }
                    else {
                        $("#slide_area").append(slide_base_open + next_slide + slide_base_mid + times[count] + slide_base_close);
                    }
                    count++;
                }
                else {
                    if(next_slide != "") {
                        next_slide += "<br />"
                    }
                    next_slide += val.trim();
                }
            }
        });
    }

    
    $("#lyrics_help").on("click", function () {
        console.log("hrre");
        alert(
            "Okay, this help dialog is in the works, so bear with me.\n" +

            "Hey, welcome to the song builder!  This is here so other people besides Tyler can build those obnoxious song JSONs.\n" +
            "So, let's talk about how this thing works. Some hints, tips, and tricks, as it were.\n" +
            "So, here's how this is gonna work, you fill in the fields, and when you hit \"Generate\", it will give you a JSON to send me.\n" +
            "(Note: these aren't saved anywhere, and will be lost on refresh, so don't be a fool and accidently refresh the page)\n" +
            "In the lyrics box, you can use [blank] for a blank slide, and 2 enters is a slide break.  The slides will appear on the right, and you can put a time in next to them.\n" +
            "Note: Please <strong>end your lyrics with a blank slide</strong>.  This is important because we do grade on if you are clearing the lyrics away at the right time.  Thanks!\n" +
            "Note: The time MUST be in the format <strong>minutes:seconds.milliseconds</strong>.  I.e. 3:24.521 (3 minutes, 24.521 seconds (no more than 3 digits after the dot please)).\n" +
            "Note: The time corresponds to <strong>when that slide should START displaying</strong>.  E.g. the first slide should have a 20 second time or so (whenever the vocals start).\n" +
            "Hit Generate at any time.  It won't break anything or anything.  Don't be nervous.  It's gonna just give you a JSON string to send to me, which I can add to the system.\n" +

            "Note: The page loads with an example already filled out, so if you have questions, it might help to open the page in another tab and look at the example.\n\n" +

            "1)  End your lyrics with a blank slide (by using [blank]).\n\n" +

            "2)  Try to format your times as MM:ss.mmm.  This isn't 100% necessary because it fixes it a little on the fly, but do try.\n\n" +

            "3)  All times should be the time that the slide should START displaying.  I'm trusting your times people, so don't screw it up.\n\n" +

            "Umm... as people ask more questions, I'll flesh this out more.  If you text/email me a question, " +
            "I'll let you know, then put the answer up here for other people, so please ask questions.  I want to make this better for everyone."
        );
    });

    $("#generate").on("click", function () {
        var unfilled = $("input,textarea").filter(function (i, val) { return $(val).val() == "" });
        if (unfilled.length > 0) {
            unfilled.each(function (i, val) { $(val).addClass("input_error") });
            alert("Please fill out the whole form.  Thanks.  Jerk.");
            return;
        }

        evaluate_lyrics();

        new_song.Id = song_id;
        new_song.song_file = $("#title").val().toLowerCase().replace(/[^a-z]/g, '') + ".mp3";
        new_song.title = $("#title").val();
        new_song.youtube_url = $("#url").val();
        new_song.slides = [];
        slides = $(".next_lyric").map(function (i, val) { return $(val).html(); });
        times = $(".slide_time").map(function (i, val) { return $(val).val(); });
        
        var err_count = 0;
        for (var i = 0; i < slides.length; i++) {
            try {
                fstime = times[i].split(':');
                sstime = fstime[1].split('.');
                min = parseInt(fstime[0])
                sec = parseInt(sstime[0])
                str_mil = sstime[1]
                if (str_mil.length > 3) {
                    str_mil = str_mil.substr(0, 3);
                }
                else {
                    str_mil = pad("000", str_mil, false);
                }
                mil = parseInt(str_mil);

                var time = (min*60*1000) + (sec*1000) + mil 

                new_song.slides.push({
                    "lyrics": slides[i],
                    "target_time": time.toString(),
                    "time_hit": ""
                });                
            }
            catch (err) {
                err_count++;
            }
        }
        
        if (err_count == 0)
        {

            var db_writer = firebase.database().ref('/submissions/' + song_id);
            db_writer.once('value').then(function (snapshot) {
                db_writer.set(new_song);
                $("#jsonificated").text(JSON.stringify(new_song))
                $("#success_modal").modal();
            });
        }
        else
        {
            alert(err_count + " of your times are formatted poorly.  Please double check those and make sure they all conform to mm:ss.mmm.\n\nNote: the first symbol is a colon, and the second is a period.  Make sure you didn't do colon-colon or something.  Note, you *have* to have both in your time (though you can just put a zero after the period (e.g. 1:00.0 is a valid time)).");
        }
    });

    function populate_song() {
        firebase.database().ref('/submissions/' + song_id).once("value").then(function (snapshot) {
            song_data = snapshot.val();
            
            $("#title").val(song_data.title);
            $("#url").val(song_data.youtube_url);

            newval = "";
            for (var item in song_data.slides) {
                if (song_data.slides[item].lyrics == "") {
                    newval += "[blank]"
                }
                newval += song_data.slides[item].lyrics.replace(new RegExp('<br />', 'g'), "\n").replace(new RegExp('<br>', 'g'), "\n") + "\n\n"
            }
            $("#lyrics").val(newval)

            evaluate_lyrics();

            times = $(".slide_time");
            var inc = 0;
            for (var item in song_data.slides) {
                $(times[inc]).val(msToTime(song_data.slides[item].target_time))
                inc++
            }


        });
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

    function pad(pad, str, padLeft) {
        if (typeof str === 'undefined') 
            return pad;
        if (padLeft) {
            return (pad + str).slice(-pad.length);
        } else {
            return (str + pad).substring(0, pad.length);
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    }

    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100)
            , seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60);

        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return minutes + ":" + seconds + "." + milliseconds;
    }

    var lyrics_placeholder = "";
    lyrics_placeholder += "Come on and speak against\n";
    lyrics_placeholder += "My borrowed innocence\n";
    lyrics_placeholder += "The judge is my defense\n";
    lyrics_placeholder += "I'm going free\n\n";
    lyrics_placeholder += "[blank]\n\n";
    lyrics_placeholder += "Glory, glory\n";
    lyrics_placeholder += "Hallelujah\n";
    lyrics_placeholder += "You threw my shackles in the sea\n\n";
    lyrics_placeholder += "[blank]";
    $("#lyrics").attr("placeholder", lyrics_placeholder);
});