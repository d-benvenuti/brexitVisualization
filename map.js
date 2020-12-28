var mapWidth = 700,
	mapHeight = 580;
//Matrix to hold region code and result
// colors
//	leave: 	#fc8d59
//	remain: 	#91bfdb

var regionResult;

var i = 0;
	j = 0;
var counter = 0;

console.log("Obtaining referendum info for each region");

while ( i < dataset.length ) {
	
	console.log(i);
	i++;
	
}

// make legend
var color = d3.scaleOrdinal().range(["#fc8d59", "#91bfdb"]);
color.domain(["Leave", "Remain"]);
		
//svgs
var svgMap = d3.select("#map")
	.append('svg')
	.attr('width', mapWidth)
	.attr('height', mapHeight);
	
//vars for map
var projection = d3.geoEquirectangular()
	.scale(3000)
	.center([0, 42.313])
	.translate([mapWidth*0.8, mapHeight*1.5]);
	
var geoPath = d3.geoPath()
	.projection(projection);
		
//gs		
var gb = svgMap.append('g');

//drawing the map	
gb.selectAll('path')
	.data(simplified_gb2_json.features)
	.enter()
	.append('path')
	.attr('fill', '#ccc')
	.attr('d', geoPath)
	.on('click', function(d){
		console.log(d3.values(d.properties)[0]);
		console.log(this);
	}
/*
gb.selectAll(".subunit")
    .data(geojson.feature(uk, uk.objects.subunits).features)
  	.enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id; })
    .attr("d", path);
*/	
);	