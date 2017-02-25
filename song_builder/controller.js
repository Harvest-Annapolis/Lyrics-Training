$(function () {
    var new_song =
        {
            "Id": "",
            "title": "",
            "song_file": "",
            "high_score": "",
            "slides": [
              {
                  "lyrics": "",
                  "target_time": "",
                  "time_hit": ""
              }
            ]
        };
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


    $("#generate").on("click", function () {
        var unfilled = $("input,textarea").filter(function (i, val) { return $(val).val() == "" });
        if (unfilled.length > 0) {
            unfilled.each(function (i, val) { $(val).addClass("input_error") });
            alert("Please fill out the whole form.  Thanks.  Jerk.");
            return;
        }

        evaluate_lyrics();

        new_song.title = $("#title").val();
        new_song.song_file = $("#url").val();
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
            alert("Email the following to Tyler:\n\n" + JSON.stringify(new_song));
        else
            alert(err_count + " of your times are formatted poorly.  Please double check those and make sure they all conform to mm:ss.mmm.\n\nNote: the first symbol is a colon, and the second is a period.  Make sure you didn't do colon-colon or something.  Note, you *have* to have both in your time (though you can just put a zero after the period (e.g. 1:00.0 is a valid time)).");
    });


    function pad(pad, str, padLeft) {
        if (typeof str === 'undefined') 
            return pad;
        if (padLeft) {
            return (pad + str).slice(-pad.length);
        } else {
            return (str + pad).substring(0, pad.length);
        }
    }

    var lyrics_placeholder = "";
    lyrics_placeholder += "Come on and speak against\n";
    lyrics_placeholder += "My borrowed innocence\n";
    lyrics_placeholder += "The judge is my defense\n";
    lyrics_placeholder += "I'm going free\n\n";
    lyrics_placeholder += "[blank]\n\n";
    lyrics_placeholder += "Glory, glory\n";
    lyrics_placeholder += "Hallelujah\n";
    lyrics_placeholder += "You threw my shackles in the sea";
    $("#lyrics").attr("placeholder", lyrics_placeholder);
});