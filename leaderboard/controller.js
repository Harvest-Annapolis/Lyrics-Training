$(function () {
    // Get users
    var db_users = firebase.database().ref('/user');
    db_users.once('value').then(function (snapshot) {
        // If it's not empty
        if (snapshot.val() != null) {
            // Get the song list
            var user_data = snapshot.val();
            populate_song_list().then(function () {
                data = song_list;
                count = 0;
                // Start the area
                var html_fill = '<div class="row">';
                // For each song
                $(data).each(function (i, val) {
                    var song_users = []
                    // Pull out the relevant users for sorting and display
                    for (var val2 in user_data) {
                        if (user_data[val2].songs[val.Id] != null) {
                            song_users.push({ name: val2, score: user_data[val2].songs[val.Id].score });
                        }
                    }
                    // Sort the users
                    var songs_sorted = $(song_users.sort(function (a, b) { if (a.score > b.score) { return 1; } else if (a.score < b.score) { return -1; } else { return 0 } }));


                    // Song Header
                    html_fill += '<div class="col-xs-3 song_score"><h3>' + val.title + '</h3><ul class="list-group">';

                    // Display the users
                    rank = 1;
                    songs_sorted.each(function (i2, val2) {
                        html_fill += '<li class="list-group-item"><span class="badge">' + val2.score + '</span>' + ordinal_suffix_of(rank) + ") " + val2.name + '</li>';
                        rank++;
                    });
                    if (rank == 1) {
                        html_fill += '<li class="list-group-item">No scores on record</li>';
                    }

                    html_fill += '</ul></div>'
                    count++;
                    if (count % 4 == 0) {
                        html_fill += '</div><div class="row">';
                    }
                });
                html_fill += "</div>"
                $("#board").html(html_fill);
            });
        }
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
                song_list.push($.parseJSON(song_data[id]));
            }
        });
    }
});