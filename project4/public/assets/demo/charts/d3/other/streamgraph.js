/* ------------------------------------------------------------------------------
 *
 *  # D3.js - streamgraph
 *
 *  Demo of streamgraph chart setup with tooltip and .csv data source
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

var D3Streamgraph = function() {


    //
    // Setup module components
    //

    // Chart
    var _streamgraph = function() {
        if (typeof d3 == 'undefined') {
            console.warn('Warning - d3.min.js is not loaded.');
            return;
        }

        // Main variables
        var element = document.getElementById('traffic-sources'),
            height = 340;


        // Initialize chart only if element exsists in the DOM
        if(element) {

            // Basic setup
            // ------------------------------

            // Define main variables
            var d3Container = d3.select(element),
                margin = {top: 5, right: 50, bottom: 40, left: 50},
                width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right,
                height = height - margin.top - margin.bottom,
                tooltipOffset = 30;


            // var colorrange2 = ['#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE'];

            //     // for (let i=0; i<a.length; i++) {
            //     //     if(colorrange2.indexOf(i) > -1) {
            //     //         a[i].classList.add(hello);
            //     //     }
            //     // }

            //     colorrange2.forEach(function(p) {
            //         elems[p] && elems[p].classList.add('hello2')
            //     })

            // // Colors
            // var color1 = '#03A9F4',
            //     color2 = '#29B6F6',
            //     color3 = '#4FC3F7',
            //     color4 = '#81D4FA',
            //     color5 = '#B3E5FC',
            //     color6 = '#E1F5FE';
            // var styleEl = document.createElement('style');
            // styleEl.innerHTML = `
            //     .d3-streamgraph {
            //         --stream-color-1: ${color1};
            //         --stream-color-2: ${color2};
            //         --stream-color-3: ${color3};
            //         --stream-color-4: ${color4};
            //         --stream-color-5: ${color5};
            //         --stream-color-6: ${color6};
            //     }
            //     [data-color-theme="dark"] .d3-streamgraph {

            //     }

            // `;
            // element.appendChild(styleEl);

            // Tooltip
            var tooltip = d3Container
                .append("div")
                .attr("class", "d3-tip e")
                .style("display", "none")

            // Format date
            var format = d3.time.format("%m/%d/%y %H:%M");
            var formatDate = d3.time.format("%H:%M");

            // Colors
            // var colorrange;
            // if(document.documentElement.getAttribute('data-color-theme') == 'dark') {
                const colorrangeDark = ['#225ea8', '#1e90c0', '#40b6c4', '#7fcdbb', '#c7e8b4', '#edf8b1'];
            // }
            // else {
                const colorrangeLight = ['#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE']
            // }

            // ['#225ea8', '#1e90c0', '#40b6c4', '#7fcdbb', '#c7e8b4', '#edf8b1']
            // var colorrange = ['var(--stream-color-1)', 'var(--stream-color-2)', 'var(--stream-color-3)', 'var(--stream-color-4)', 'var(--stream-color-5)', 'var(--stream-color-6)'];


            // Construct scales
            // ------------------------------

            // Horizontal
            var x = d3.time.scale().range([0, width]);

            // Vertical
            var y = d3.scale.linear().range([height, 0]);

            // Colors
            var z_light = d3.scale.ordinal().range(colorrangeLight);
            var z_dark = d3.scale.ordinal().range(colorrangeDark);



            // Create axes
            // ------------------------------

            // Horizontal
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.hours, 4)
                .innerTickSize(4)
                .tickPadding(8)
                .tickFormat(d3.time.format("%H:%M")); // Display hours and minutes in 24h format

            // Left vertical
            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(6)
                .innerTickSize(4)
                .outerTickSize(0)
                .tickPadding(8)
                .tickFormat(function (d) { return (d/1000) + "k"; });

            // Right vertical
            var yAxis2 = yAxis;

            // Dash lines
            var gridAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(6)
                .tickPadding(8)
                .tickFormat("")
                .tickSize(-width, 0, 0);



            // Create chart
            // ------------------------------

            // Container
            var container = d3Container.append("svg")

            // SVG element
            var svg = container
                .attr('width', width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "d3-streamgraph")
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



            // Construct chart layout
            // ------------------------------

            // Stack
            var stack = d3.layout.stack()
                .offset("silhouette")
                .values(function(d) { return d.values; })
                .x(function(d) { return d.date; })
                .y(function(d) { return d.value; });

            // Nest
            var nest = d3.nest()
                .key(function(d) { return d.key; });

            // Area
            var area = d3.svg.area()
                .interpolate("cardinal")
                .x(function(d) { return x(d.date); })
                .y0(function(d) { return y(d.y0); })
                .y1(function(d) { return y(d.y0 + d.y); });



            // Load data
            // ------------------------------

            d3.csv("./asset/demo/data/dashboard/traffic_sources.csv", function (error, data) {

                // Pull out values
                data.forEach(function (d) {
                    d.date = format.parse(d.date);
                    d.value = +d.value;
                });

                // Stack and nest layers
                var layers = stack(nest.entries(data));



                // Set input domains
                // ------------------------------

                // Horizontal
                x.domain(d3.extent(data, function(d, i) { return d.date; }));

                // Vertical
                y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);



                // Add grid
                // ------------------------------

                // Horizontal grid. Must be before the group
                svg.append("g")
                    .attr("class", "d3-grid-dashed")
                    .call(gridAxis);



                //
                // Append chart elements
                //

                // Stream layers
                // ------------------------------

                // Dynamic colors
                function theme(i) {
                    var value = d3.select('input[name="main-theme"]:checked').node().value
                    if(value =="dark" || (value == 'auto' && window.matchMedia('(prefers-color-scheme: dark').matches)){
                        return z_dark(i);
                    }
                    else {
                        return z_light(i);
                    }
                }


                // Create group
                var group = svg.append('g')
                    .attr('class', 'streamgraph-layers-group');

                // And append paths to this group
                var layer = group.selectAll(".streamgraph-layer")
                    .data(layers)
                    .enter()
                        .append("path")
                        .attr("class", "streamgraph-layer d3-slice-border")
                        .attr("d", function(d) { return area(d.values); })                    
                        .style('stroke-width', 1)
                        .style('box-shadow', '0 4px 8px rgba(0,0,0,0.5)')
                        .attr("fill", function(d, i) {
                            return theme(i);
                        });

                // Add transition
                var layerTransition = layer
                    .style('opacity', 0)
                    .transition()
                        .duration(750)
                        .delay(function(d, i) { return i * 50; })
                        .style('opacity', 1)

                // Update colors on color theme change
                d3.selectAll('[name="main-theme"]').on('change', function() {
                    layer.attr("fill", function(d, i) {
                        return theme(i);
                    });
                });

                // Append axes
                // ------------------------------

                //
                // Left vertical
                //

                svg.append("g")
                    .attr("class", "d3-axis d3-axis-left")
                    .call(yAxis.orient("left"));

                // Hide first tick
                d3.select(svg.selectAll('.d3-axis-left .tick text')[0][0])
                    .style("visibility", "hidden");


                //
                // Right vertical
                //

                svg.append("g")
                    .attr("class", "d3-axis d3-axis-right")
                    .attr("transform", "translate(" + width + ", 0)")
                    .call(yAxis2.orient("right"));

                // Hide first tick
                d3.select(svg.selectAll('.d3-axis-right .tick text')[0][0])
                    .style("visibility", "hidden");


                //
                // Horizontal
                //

                var xaxisg = svg.append("g")
                    .attr("class", "d3-axis d3-axis-horizontal")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                // Add extra subticks for hidden hours
                xaxisg.selectAll(".d3-axis-subticks")
                    .data(x.ticks(d3.time.hours), function(d) { return d; })
                    .enter()
                    .append("line")
                    .attr("class", "d3-axis-subticks")
                    .attr("y1", 0)
                    .attr("y2", 4)
                    .attr("x1", x)
                    .attr("x2", x);



                // Add hover line and pointer
                // ------------------------------

                // Append group to the group of paths to prevent appearance outside chart area
                var hoverLineGroup = group.append("g")
                    .attr("class", "hover-line");

                // Add line
                var hoverLine = hoverLineGroup
                    .append("line")
                    .attr("class", "d3-crosshair-line")
                    .attr("y1", 0)
                    .attr("y2", height)
                    .style("opacity", 0);

                // Add pointer
                var hoverPointer = hoverLineGroup
                    .append("rect")
                    .attr("class", "d3-crosshair-line")
                    .attr("x", 2)
                    .attr("y", 2)
                    .attr("width", 6)
                    .attr("height", 6)
                    .style('fill', '#03A9F4')
                    .style("opacity", 0);








                // Append events to the layers group
                // ------------------------------

                layerTransition.each("end", function() {
                    layer
                        .on("mouseover", function (d, i) {
                            svg.selectAll(".streamgraph-layer")
                                .transition()
                                .duration(250)
                                .style("opacity", function (d, j) {
                                    return j != i ? 0.75 : 1; // Mute all except hovered
                                });
                        })

                        .on("mousemove", function (d, i) {
                            mouse = d3.mouse(this);
                            mousex = mouse[0];
                            mousey = mouse[1];
                            datearray = [];
                            var invertedx = x.invert(mousex);
                            invertedx = invertedx.getHours();
                            var selected = (d.values);
                            for (var k = 0; k < selected.length; k++) {
                                datearray[k] = selected[k].date
                                datearray[k] = datearray[k].getHours();
                            }
                            mousedate = datearray.indexOf(invertedx);
                            pro = d.values[mousedate].value;


                            // Display mouse pointer
                            hoverPointer
                                .attr("x", mousex - 3)
                                .attr("y", mousey - 6)
                                .style("opacity", 1);

                            hoverLine
                                .attr("x1", mousex)
                                .attr("x2", mousex)
                                .style("opacity", 1);

                            //
                            // Tooltip
                            //

                            // Tooltip data
                            tooltip.html(
                                '<ul class="list-unstyled mb-1 p-0">' +
                                    '<li>' + '<div class="fs-base my-1"><i class="ph-arrow-circle-left"></i><span class="d-inline-block ms-2"></span>' + d.key + '</div>' + '</li>' +
                                    '<li>' + 'Visits: &nbsp;' + "<span class='fw-semibold float-end'>" + pro + '</span>' + '</li>' +
                                    '<li>' + 'Time: &nbsp; ' + '<span class="fw-semibold float-end">' + formatDate(d.values[mousedate].date) + '</span>' + '</li>' + 
                                '</ul>'
                            )
                            .style("display", "block");

                            // Tooltip arrow
                            tooltip.append('div').attr('class', 'd3-tip-arrow');
                        })

                        .on("mouseout", function (d, i) {

                            // Revert full opacity to all paths
                            svg.selectAll(".streamgraph-layer")
                                .transition()
                                .duration(250)
                                .style("opacity", 1);

                            // Hide cursor pointer
                            hoverPointer.style("opacity", 0);

                            // Hide tooltip
                            tooltip.style("display", "none");

                            hoverLine.style("opacity", 0);
                        });
                    });



                // Append events to the chart container
                // ------------------------------

                d3Container
                    .on("mousemove", function (d, i) {
                        mouse = d3.mouse(this);
                        mousex = mouse[0];
                        mousey = mouse[1];

                        // Move tooltip vertically
                        tooltip.style("top", (mousey - (document.querySelector('.d3-tip').getBoundingClientRect().height / 2)) - 2 + "px") // Half tooltip height - half arrow width

                        // Move tooltip horizontally
                        if(mousex >= (element.getBoundingClientRect().width - document.querySelector('.d3-tip').getBoundingClientRect().width - margin.right - (tooltipOffset * 2))) {
                            tooltip
                                .style("left", (mousex - document.querySelector('.d3-tip').getBoundingClientRect().width - tooltipOffset) + "px") // Change tooltip direction from right to left to keep it inside graph area
                                .attr("class", "d3-tip w");
                        }
                        else {
                            tooltip
                                .style("left", (mousex + tooltipOffset) + "px" )
                                .attr("class", "d3-tip e");
                        }
                    });
            });



            // Resize chart
            // ------------------------------

            // Call function on window resize
            var resizeStreamTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeStreamTimer);
                resizeStreamTimer = setTimeout(function () {
                    resizeStream();
                }, 200);
            });

            // Call function on sidebar width change
            var sidebarToggle = document.querySelectorAll('.sidebar-control');
            if (sidebarToggle) {
                sidebarToggle.forEach(function(togglers) {
                    togglers.addEventListener('click', resizeStream);
                });
            }

            // Resize function
            // 
            // Since D3 doesn't support SVG resize by default,
            // we need to manually specify parts of the graph that need to 
            // be updated on window resize
            function resizeStream() {

                // Layout
                // -------------------------

                // Define width
                width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;

                // Main svg width
                container.attr("width", width + margin.left + margin.right);

                // Width of appended group
                svg.attr("width", width + margin.left + margin.right);

                // Horizontal range
                x.range([0, width]);


                // Chart elements
                // -------------------------

                // Horizontal axis
                svg.selectAll('.d3-axis-horizontal').call(xAxis);

                // Horizontal axis subticks
                svg.selectAll('.d3-axis-subticks').attr("x1", x).attr("x2", x);

                // Grid lines width
                svg.selectAll(".d3-grid-dashed").call(gridAxis.tickSize(-width, 0, 0))

                // Right vertical axis
                svg.selectAll(".d3-axis-right").attr("transform", "translate(" + width + ", 0)");

                // Area paths
                svg.selectAll('.streamgraph-layer').attr("d", function(d) { return area(d.values); });
            }
        }
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _streamgraph();
        }
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    D3Streamgraph.init();
});