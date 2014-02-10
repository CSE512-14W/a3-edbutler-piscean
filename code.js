
var a3 = function() {

    function compute_matrix(data) {
        var matrix = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];

        _.each(data, function(d) {
            var last = null;
            _.each(d.prog, function(curr) {
                if (last !== null && last !== curr) {
                    matrix[last-1][curr-1] += 1;
                }
                last = curr;
            });
        });

        // now normalize the matrix
        var total = _.reduce(matrix, function(sum, row) {
            return sum + _.reduce(row, function(rsum, val) {return rsum + val;});
        }, 0);
        _.each(matrix, function(row) { _.each(row, function(v,i) { row[i] = v / total; }); });

        return matrix;
    }

    function test_matrix() {
        // something with the correct shape and no zeroes just to initialize the viz
        return [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ];
    }

    // hand-picked subset of tableau 10 palette
    var t10_palette = [
        '#d62728',
        '#ff7f0e',
        '#bcbd22',
        '#2ca02c',
        '#1f77b4',
        '#9467bd',
        '#e377c2'
    ];

    // initially same as t10_palette (we animate this during transitions)
    var color_scale = d3.scale.ordinal()
                .range(t10_palette)
                .domain(d3.range(0,7));

    var renderer = function() {

        var self = {};

        // constants

        var width = 750;
        var height = 750;
        var chord_padding = .1;
        var outerRadius = Math.min(width, height) / 2 - 50;
        var labelRadius = outerRadius + 50;
        var innerRadius = outerRadius - 24;

        var current_matrix;
        var current_color;

        var labels = {
            num: ['1', '2', '3', '4', '5', '6', '7'],
            rel: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiº'],
            wrd: ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading']
        };

        var g_chords;
        var g_arcs;
        var g_labels;

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
        var label_arc = d3.svg.arc()
            .innerRadius(outerRadius)
            .outerRadius(labelRadius);
        var path = d3.svg.chord()
            .radius(innerRadius);
        var formatPercent = d3.format(".1%");

        var svg;

        // computes which chords should be mapped to which colors (used for color blending)
        self.target_color_mapping_of = function(matrix) {
            return _.map(matrix, function(row, ri) {
                return _.map(row, function(c, ci) {
                    return color_scale(matrix[ri][ci] > matrix[ci][ri] ? ri : ci);
                });
            })
        };

        self.init = function() {
            // grab the svg

            var matrix = test_matrix();

            svg = d3.select("#svg")
                .attr("width", width)
                .attr("height", height)
            .append("g")
                .attr("id", "circle")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // draw the edge arcs

            var chord = d3.layout.chord()
                .padding(chord_padding)
                .matrix(matrix);

            g_chords = svg.append("g")
                .attr("class", "chord");

            // draw the node arcs and labels


            g_arcs = svg.append("g");
            g_arcs.selectAll("path")
                .data(chord.groups)
            .enter().append("path")
                .style("fill", function(d) { return color_scale(d.index); })
                .style("stroke", function(d) { return color_scale(d.index); })
                .attr("d", arc)
                .on("mouseover", fade(0.1))
                .on("mouseout", fade(1.0))
            .append("title");

            function fade(opacity) {
                return function(g, i) {
                    svg.selectAll(".chord path")
                        .filter(function(d) { return d.source.index != i && d.target.index != i; })
                    .transition()
                        .style("opacity", opacity);
                };
            }

            g_labels = svg.append("g");
            g_labels.selectAll("text")
                .data(chord.groups)
            .enter().append("text")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function(d, i) { return labels.num[i]; });
        }

        self.hide = function() {
            svg.style('visibility', 'hidden');
        };

        self.is_hidden = function() {
            return svg.style('visibility') === 'hidden';
        };

        self.draw = function(matrix, color_mapping) {
            svg.style('visibility', '');
            current_matrix = matrix;
            current_color = color_mapping;

            var chord = d3.layout.chord()
                .padding(chord_padding)
                .matrix(matrix);

            var c = g_chords.selectAll("path")
                .data(chord.chords);

            c.enter().append("path").append("title");

            c
                .attr("d", path)
                .style("fill", function(d) {
                    return color_mapping[d.source.index][d.target.index];
                });

            c.select("title")
                .text(function(d) {
                    return labels.num[d.source.index]
                        + " → " + labels.num[d.target.index]
                        + ": " + formatPercent(d.source.value)
                        + "\n" + labels.num[d.target.index]
                        + " → " + labels.num[d.source.index]
                        + ": " + formatPercent(d.target.value);
                });

            c.exit().remove();

            // these should always have same number of elements, so only need to update

            g_arcs.selectAll("path")
                .data(chord.groups)
                .attr("d", arc)
            .select("title")
                .text(function(d) {
                    return "   " + labels.wrd[d.index]
                        + "\n" + formatPercent(d.value) + " of transition sources";
                });

            g_labels.selectAll("text")
                .data(chord.groups)
                .attr("transform", function(d) { return "translate(" + label_arc.centroid(d) + ")"; });
        };

        self.get_current_matrix = function() { return current_matrix; };
        self.get_current_color = function() { return current_color; };

        return self;

    }();

    var animator = function() {
        var self = {};

        var transition_time = 1000;
        var start_time = 0;
        var total_elapsed = 0;
        var tickfn = null;
        var is_running = false;

        function ontick(elapsed) {
            total_elapsed = elapsed;

            if (tickfn !== null) {
                var t = (elapsed - start_time) / transition_time;
                if (t < 1) {
                    tickfn(t);
                    return false;
                } else {
                    tickfn(1.0);
                }
            }

            is_running = false;
            return true;
        }

        self.start = function(new_tickfn) {
            tickfn = new_tickfn;
            if (is_running) {
                start_time = total_elapsed;
            } else {
                is_running = true;
                start_time = 0;
                d3.timer(ontick);
            }
        }

        self.stop = function() {
            tickfn = null;
        }

        return self;
    }();

    var animations = function() {
        var self = {};

        var ease = d3.ease('cubic-in-out');

        // matrix interpolation
        function interpolate_matrix(mA, mB, s) {
            var m3 = test_matrix();
            for (i = 0; i < mA.length; ++i) {
                rowA = mA[i];
                rowB = mB[i];
                for (j = 0; j < rowA.length; ++j) {
                    m3[i][j] = rowA[j]*(1-s) + rowB[j]*s;
                }
            }
            return m3;
        }

        function interpolate_color(mA, mB, s) {
            return _.map(mA, function(row, ri) {
                return _.map(row, function(c, ci) {
                    return d3.interpolate(mA[ri][ci], mB[ri][ci])(s);
                });
            });
        }

        // staged animation (first color->gray, then old->new value, then gray->color)
        self.animate = function(prev_matrix, cur_matrix, prev_color) {
            var end_color = renderer.target_color_mapping_of(cur_matrix);
            animator.start(function(t) {
                renderer.draw(
                    interpolate_matrix(prev_matrix, cur_matrix, ease(t)),
                    interpolate_color(prev_color, end_color, ease(t))
                );
            });
        }

        return self;
    }();

    var ui = function() {

        var json_data;
        var prev_matrix;
        var cur_matrix;
        var new_matrix;

        // matrix comparison (avoid transitions/animations if value is unchanged)
        function is_different(mA, mB) {
            for (i = 0; i < mA.length; i++) {
                rowA = mA[i];
                rowB = mB[i];
                for (j = 0; j < rowA.length; j++) {
                    if (rowA[j] !== rowB[j]) {
                        return true;
                    }
                }
            }
            return false;
        }

        // filtering (subsequence, not prefix search)
        function filterByAttr(attr, val, data) {
            if (val === "") {
                return data;
            }
            var matches = [];
            var value = String(val).toLowerCase();
            _.each(data, function(d) {
                var attrib = String(d[attr]).toLowerCase();
                if (attrib.indexOf(value) !== -1) {
                    matches.push(d);
                }
            });
            return matches;
        }

        function update_song_panel(matches) {
            // clean up matches so that a single song only ever shows up once. only show the first url
            var to_show = [];
            var added = {};

            _.each(matches, function(d) {
                var text = d.title + ', by ' + d.artist;
                if (!(text in added)) {
                    added[text] = true;
                    to_show.push({
                        text: text,
                        url: d.url
                    });
                }
            });

            var list = d3.select('#songs').selectAll('li')
                .data(to_show);
            list.enter().append('li');
            list.exit().remove();
            list.html(function(d) { return '<a target="blank" href="' + d.url + '">' + d.text + '</a>'; })

            var text = _.size(to_show) > 0 ? "Number of Songs: " + _.size(to_show) : "No songs matching search criteria.";
            $('#song-count').text(text);
        }

        // quick-and-dirty sample querying code
        // NOTE: must use songs2.json, because it is now a different format
        // (see README for details)
        function query(progVal, artistVal, titleval) {
            var mP = filterByAttr('prog', progVal, json_data.root);
            var mA = filterByAttr('artist', artistVal, mP);
            var matches = filterByAttr('title', titleval, mA);

            if (_.size(matches) > 0) {

                var new_matrix = compute_matrix(matches);

                if (renderer.is_hidden()) {
                    renderer.draw(new_matrix, renderer.target_color_mapping_of(new_matrix));
                } else if (is_different(new_matrix, cur_matrix)) {
                    cur_matrix = new_matrix;
                    animations.animate(renderer.get_current_matrix(), new_matrix, renderer.get_current_color());
                }

            } else {
                renderer.hide();
                animator.stop();
            }

            update_song_panel(matches);
        }


        $(function() {
            var queryAll = function() {
                query($('#progQ').val(),
                      $('#artistQ').val(),
                      $('#titleQ').val());
            };

            // add event listeners
            $('#progQ').change(queryAll);
            $('#progQ').keyup(queryAll);
            $('#artistQ').change(queryAll);
            $('#artistQ').keyup(queryAll);
            $('#titleQ').change(queryAll);
            $('#titleQ').keyup(queryAll);

            // download the data and create initial viz
            d3.json("songs.json", function(json) {
                json_data = json;
                renderer.init();
                cur_matrix = compute_matrix(json.root);
                renderer.draw(cur_matrix, renderer.target_color_mapping_of(cur_matrix));
                update_song_panel(json.root);
            });

        });
    }();
}();
