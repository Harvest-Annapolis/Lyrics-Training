$(function () {
    populate_song_list().then(function () {
        new_html = '<table class="table table-hover"><thead><tr><th>Id</th><th>Title</th><th>URL</th></tr></thead><tbody>'
        for (var s in song_list) {
            i = song_list[s];
            new_html += "<tr class='edit_me' data-id='" + i.Id + "'><td>" + i.Id + "</td><td>" + i.title + "</td><td>" + i.youtube_url + "</td></tr>"
        }
        new_html += '</tbody></table>'
        $("#songs").html(new_html);
    });

    $("#songs").on("click", ".edit_me", function (e) {
        var tgt = $(e.target);
        var id = tgt.data("id");
        if (id == undefined) {
            id = tgt.parent().data("id");
        }
        newrl = window.location.href + "/editor/index.html?id=" + id
        newrl = newrl.replace(/\/\//g, "/").replace("p:/", "p://");
        window.location.href = newrl;
    });

    function ordinal_suffix_of(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

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