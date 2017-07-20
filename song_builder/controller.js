$(function () {
    populate_song_list().then(function () {
        new_html = '<table class="table table-hover"><thead><tr><th>Title</th><th>Id</th><th>URL</th><th></th></tr></thead><tbody>'
        for (var s in song_list) {
            i = song_list[s];
            newrl = window.location.href + "/trainer/index.html?id=" + i.Id
            newrl = newrl.replace(/\/\//g, "/").replace("p:/", "p://");
            new_html += "<tr class='edit_me' data-id='" + i.Id + "'><td>" + i.title + "</td><td>" + i.Id + "</td><td>" + i.youtube_url + "</td><td><a href='" + newrl + "' class='btn btn-primary'>Train this song</a></td></tr>"
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