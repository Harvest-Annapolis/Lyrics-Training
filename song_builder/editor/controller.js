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
    
    $('[data-dismiss="modal"]').on("click", function() {
        $("#train_song").css("display", "none")
        $("#generate").css("margin-right", "0.5em")
    })

    
    $("#lyrics_help").on("click", function () {
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
        
    $("#song_train").attr("href", window.location.href.replace("editor", "trainer"))
    $("#train_song").on("click", function() {
        $(".slide_time").each(function(i, val){ $(val).val("0:00.0"); });
        $('#info_modal').modal('hide');
        $("#generate").click();
    });

    $("#import").on("click", function() {
        $("#info_modal .modal-title").html("Import");
        $("#info_modal .modal-body").html("<form><div class='form-group'><label for='prosix_file'>Select a .pro6 file: </label><input type='file' id='prosix_file' /></div></form>");
        $("#generate").css("margin-right", "1em")
        $("#info_modal").modal(); 
        
        $("#prosix_file").on("change", function(evt) {            
            var files = evt.target.files; // FileList object

            // use the 1st file from the list
            f = files[0];

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {
                    parseProSix(e.target.result)
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsText(f);
        });
    });
    
    $(".modal-body").on("click", ".arrangment_select_button", function(e) {
        var arr = arrangements.filter(function(i, val) { return val.id == $(e.target).data("id") })[0];
        var output = ""
        $(arr.groups).each(function(i,val){
            var test = $(groups).filter(function(i2, val2) { return val2.id == val })[0]
            if(test){
                output += test.slides + "\n\n"
            }
        });
        output += "[blank]"
        $("#lyrics").val(output)
        $("#title").val(title)
        
        $('#info_modal').modal('hide');
        $("#train_song").css("display", "none")
        $("#generate").css("margin-right", "0.5em")
        
        evaluate_lyrics();
    });
    
    $("#generate").on("click", function () {
        var unfilled = $("input,textarea").filter(function (i, val) { return $(val).val() == "" });
        if (unfilled.length > 0) {
            unfilled.each(function (i, val) { $(val).addClass("input_error") });
            
            var just_times = $("input:not(.slide_time),textarea").filter(function (i, val) { return $(val).val() == "" });
            if(just_times.length > 0){
                $("#info_modal .modal-title").html("Error");
                $("#info_modal .modal-body").html("Please fill out the whole form.  Thanks.  Jerk.");
                $("#generate").css("margin-right", "1em")
                $("#info_modal").modal();                
            }
            else {                
                $("#train_song").css("display", "inline")
                $("#info_modal .modal-title").html("Error");
                $("#info_modal .modal-body").html("I see you didn't fill in the slide times.  If you're really sure that everything matches up with your YouTube video (and if you're sure you have a [blank] at the end), you can go straight to training the song to populate those times.  Otherwise, hit the close button and fix your crap.");
                $("#generate").css("margin-right", "1em")
                $("#info_modal").modal();
            }
            
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
                $("#generate").css("margin-right", "1em")
                $("#success_modal").modal();
            });
        }
        else
        {
            $("#info_modal .modal-title").html("Error");
            $("#info_modal .modal-body").html(err_count + " of your times are formatted poorly.  Please double check those and make sure they all conform to mm:ss.mmm.\n\nNote: the first symbol is a colon, and the second is a period.  Make sure you didn't do colon-colon or something.  Note, you *have* to have both in your time (though you can just put a zero after the period (e.g. 1:00.0 is a valid time)).");
            $("#generate").css("margin-right", "1em")
            $("#info_modal").modal();
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
    
    var groups = {}
    var arrangements = {}
    var title = ""
    function parseProSix(data) {
        var xml = $($.parseXML(data));

        title = xml[0].documentElement.attributes["CCLISongTitle"].value
        
        var no_repeats = {};
        arrangements = $(xml.children().children()[2].children).map(function(i,val) { 
            return { 
                id: val.attributes.uuid.nodeValue, 
                name: val.attributes.name.nodeValue, 
                groups: $(val.children[0].children).map(function(inn, vnn) { 
                    return vnn.innerHTML }) 
            }
        }).filter(function(i, val){ var ret = no_repeats[val.name] == undefined; no_repeats[val.name] = i; return ret; });
        
        groups = $(xml.children().children()[1].children).map(function(i, val) {
            return {
                id: val.attributes.uuid.nodeValue,
                name: val.attributes.name.nodeValue,
                slides: $($(val).find("NSString")).map(function(i2, val2) {
                    var tes = Base64.decode(val2.innerHTML);
                    var test = tes.split(/\\strokec0/g)
                    return val.attributes.name.nodeValue == "Intro" ? "" : val.attributes.name.nodeValue == "Ending" ? "" : val.attributes.name.nodeValue == "Blank" ? "[blank]" : tes.indexOf("Double-click to edit") != -1 ? "" : test[test.length -1] 
                }).toArray().map(function(val2, i2) { return val2.replace(/\\/g, "").replace(/\}/g, "").trim(); }).join("\n\n")
            }
        })
        
        var output_html = ""
        $(arrangements).each(function (i, val) {
            output_html += '<a class="arrangment_select_button" data-id="' + val.id + '">' + val.name + '</a>'
        });
        
        $("#info_modal .modal-title").html("Select Arrangment");
        $("#info_modal .modal-body").html(output_html);
        $("#info_modal").modal();         
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