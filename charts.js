
/*----------- Brexit Data Visualization source code -------------------------------------------
------------- Developed by and property of Dario Benvenuti ------------------------------------
------------- 06-07-2018, La Sapienza, a.y. 2017/2018      ------------------------------------ 
------------- Developed for the Visual Analytics course    ------------------------------------ */

//vars

var sPHeight = 250,
	sPWidth = 700,
	sPOffsetX = 100,
	sPOffsetY = 100;

var firstTimePlot = 1;	
	
var mapMode = 0;

var margin = {top: 5, right: 5, bottom: 50, left: 100};

var	dataset = [];

var numbers = [ 0, 0 ];
var max;

var selectedRegionCode = "S12000017";
var selectedRegionName = "Highland";
var selectedRegionId = 174;

var currentMultipleSelection = new MultipleSelection(new Region(selectedRegionCode, selectedRegionName), null);

var selectedRegionAges = [];

var regionResult = [];

// here, we want the full chart to be 700x200, so we determine
// the width and height by subtracting the margins from those values

var mapWidth = document.getElementById("map").offsetWidth,
	mapHeight = 700;

var mapBarChartOffsetX = 80;
	
var detailsBarChartOffsetX = 50,
	detailsBarChartOffsetY = 50,
	detailsBarsHeight = 50,
	detailsLabelOffsetX = 5
	detailsLabelOffsetY = 25;

/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//fetching the dataset

console.log("Fetching data from Brexit_data");

d3.csv("data/Brexit_data").then(function(data){


/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//starting the callback function

	console.log("Fetch completed");
	
	dataset = data;
	
	console.log("Dataset:");
	console.log(dataset);
		
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//building the regionResult Matrix to hold region code and result
		var i = 0;
			j = 0;
		var temp;
		
		console.log("Obtaining referendum and population info for each region");

		while ( i < dataset.length ) {
			
			temp = d3.values(dataset[i]);
			
			//regionResult is an array of array
			//RESULT is 0 or 1, 0 means remain, 1 means leave
			//AGE is 0 or 1, 0 means age<45, 1 means age>45
			//each element will have
			//-0:CODE-1:RESULT-2:#YOUNG-3:#OLD-4:#LEAVE-5:#REMAIN-6:COUNTRY
			//-7:VOTING PERCENTAGE-8:AGE
			regionResult[i] = [];
			regionResult[i][0] = temp[0];
			regionResult[i][2] = regionResult[i][3] = 0;
			//getting the result
			if ( parseInt(temp[22]) > parseInt(temp[30]) )
				regionResult[i][1] = 1;
			else
				regionResult[i][1] = 0;
			//getting total number of young and old people in the region
			
			j = 0;
			
			while ( j < temp.length ) {
				if ( j == 3 )
					regionResult[i][2] += Math.floor(parseInt(temp[j])*1/3);
				else if ( j >= 4 & j <= 9 )
					regionResult[i][2] += parseInt(temp[j]);
				else if ( j >= 10 && j <= 17)
					regionResult[i][3] += parseInt(temp[j]);
				j++;
			}
			//getting the number of leave and remain
			regionResult[i][4] = parseInt(temp[22]);
			regionResult[i][5] = parseInt(temp[30]);
			//getting the country
			if ( temp[0].charAt(0) == 'E' )
				regionResult[i][6] = "England";
			else if ( temp[0].charAt(0) == 'S' )
				regionResult[i][6] = "Scotland";
			else if ( temp[0].charAt(0) == 'W' )
				regionResult[i][6] = "Wales";
			else
				regionResult[i][6] = "Northern Ireland";
			//getting the percentage of people who voted
			regionResult[i][7] = 	Math.floor((regionResult[i][4] + regionResult[i][5])
									* 100
									/(regionResult[i][2] + regionResult[i][3]));
			//getting if the majority is adult or young
			if ( regionResult[i][2] > regionResult[i][3] )
				regionResult[i][8] = 0;
			else
				regionResult[i][8] = 1;
			//go to the next region
			i++;
		}
		
		console.log("Obtained results for each region:");
		console.log(regionResult);


/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//code for the map
// colors
//	unknown:#f7f7f7
//	leave: 	#fc8d59
//	remain: #91bfdb
//  young:	#bae4b3
//  old: 	#31a354
//	leave&young:	#f4a582
//	leave&old:		#ca0020
//	remain&young:	#92c5de
//	remain&old:		#0571b0

		//svg
		var svgMap = d3.select("#map")
			.append('svg')
			.attr('width', mapWidth)
			.attr('height', mapHeight);
				
		//g		
		var gb = svgMap.append('g');
			
		gb
			.append("rect")
   			.attr("class", "overlay")
    		.attr("width", mapWidth)
    		.attr("height", mapHeight);
	
		//vars for map
		var projection = d3.geoEquirectangular()
			.scale(2500)
			.center([0, 33.8])
			.translate([mapWidth*0.7, mapHeight*1.68]);
	
		var geoPath = d3.geoPath()
			.projection(projection);
		
		//drawing the map	
		gb.selectAll('path')
			.data(simplified_gb2_json.features)
			.enter()
			.append('path', 'graticule')
			.attr('id', function(d){
				var temp = d3.values(d.properties);
				return temp[0];
			})
			.attr('class', 'states')
			.attr('d', geoPath)
			.style('fill', function(d){
				var temp = d3.values((d.properties));
				var c = 0;
				while ( c < regionResult.length ){
					if ( regionResult[c][0] == temp[0] )
						if ( regionResult[c][1] == 1 ){
							c++;
							return "#fc8d59";
						}
						else {
							c++;
							return "#91bfdb";
						}
					else
						c++;
				}
				return "#f7f7f7";
			} )
			.on('click', function(d){
				
				var temp = d3.values(d.properties)[0];
				var tempName = d3.values(d.properties)[2];
				
				var currentRegion = new Region(temp, tempName);
				
				console.log("onClick on a region.\n" + currentRegion.toString());
				
				if (!currentMultipleSelection.contains(currentRegion)){
					
					console.log("Region not found in the current selection, started adding it.");
					
					d3.selectAll('path')
						.style('stroke-width', 1);
						
					selectedRegionCode = temp;
					selectedRegionName = tempName;
				
					currentMultipleSelection = new MultipleSelection(currentRegion, null);
					
					console.log("Current selection:\n" + currentMultipleSelection.toString());
					
					d3.select(this)
					.style('stroke-width', 2.5);
					
					console.log("updating details div");
					
					updateDetailsDiv();
				}
				else {
					console.log("Region already present in the selection.");
				}
			})
			.on("mouseover", function(d, i) {
				console.log("mouseover on: " + this);
        		d3.select(this).style('fill-opacity', 1);
			})
			.on('mouseout', function(d, i) {
				console.log("mouseout on: " + this);
				d3.select(this)
                .style('fill-opacity', 0.7);
                }
            )
			.on('contextmenu', function(d, i) {		 //-----------------------MULTIPLE SELECTION
				
				d3.event.preventDefault();
				
				var temp = d3.values(d.properties)[0];
				var tempName = d3.values(d.properties)[2];
				
				var currentRegion = new Region(temp, tempName);
				
				console.log("rightClick on a region.\n" + currentRegion.toString());
				
				// if the region is not already in the selection
				if (!currentMultipleSelection.contains(currentRegion)){
					
					currentMultipleSelection.add(currentRegion);
				
					console.log("Current selection:\n" + currentMultipleSelection.toString());
				
					d3.select(this)
					.style('stroke-width', 2.5);
					
					console.log("updating details div");
					updateDetailsDivMultiple();
				}
				else{
					console.log("Region already present in the selection.");
				}
			});
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/

			//make the default selection visible
			d3.select("#" + selectedRegionCode)
				.style("stroke-width", 2.5);
		
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/

			//map legend
			var legend = gb.append("g")
				  .attr("x", mapWidth - 65)
				  .attr("y", 25)
				  .attr("height", 200)
				  .attr("width", 100);
		
			legend.append("rect")
				  .attr("id", "firstRectMapLegend")
				  .attr("x", mapWidth - 100)
				  .attr("y", 25)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#fc8d59");
				  
			legend.append("text")
				  .attr("id", "firstTextMapLegend")			
				  .attr("x", mapWidth - 85)
				  .attr("y", 35)
				  .attr("font-size", "12px")
				  .text("Leave");
			
			legend.append("rect")
				  .attr("id", "secondRectMapLegend")			
				  .attr("x", mapWidth - 100)
				  .attr("y", 55)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#91bfdb");;
			
			legend.append("text")
				  .attr("id", "secondTextMapLegend")		
				  .attr("x", mapWidth - 85)
				  .attr("y", 65)
				  .attr("font-size", "12px")
				  .text("Remain");
			
			legend.append("rect")
				  .attr("id", "thirdRectMapLegend")
				  .attr("x", mapWidth - 100)
				  .attr("y", 85)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#f7f7f7");
			
			legend.append("text")
				  .attr("id", "thirdTextMapLegend")	
				  .attr("x", mapWidth - 85)
				  .attr("y", 95)
				  .attr("font-size", "12px")
				  .text("Unknown");
			
			//hidden rect that becomes visible when the map shows both data
			//used for remain & old
			legend.append("rect")
				.attr("id", "fourthRectMapLegend")
				.attr("x", mapWidth -160)
				.attr("y", 115)
				.attr("width", 0)
				.attr("height", 0)
				.attr("stroke", "#000")
				.attr("fill", "#0571b0");
			//hidden text that becomes visible when the map shows both data
			//used for remain & old
			legend.append("text")
			  .attr("id", "fourthTextMapLegend")	
			  .attr("x", mapWidth - 145)
			  .attr("y", 125)
			  .attr("font-size", "0px")
			  .text("age >= 50 & Remain");
			//hidden rect that becomes visible when the map shows both data
			//used for unknown	
			legend.append("rect")
				.attr("id", "fifthRectMapLegend")
				.attr("x", mapWidth -160)
				.attr("y", 145)
				.attr("width", 0)
				.attr("height", 0)
				.attr("fill", "#f7f7f7")
				.attr("stroke", "#000");
			//hidden text that becomes visible when the map shows both data
			//used for unknown
			legend.append("text")
			  .attr("id", "fifthTextMapLegend")	
			  .attr("x", mapWidth - 145)
			  .attr("y", 155)
			  .attr("font-size", "0px")
			  .text("Unknown");
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
		//code for bar chart in map div
		//get the amount of people for each interval, in all UK
		var ages = [];
		i = 0;
		j = 0;
		//prepare the array
		while ( i < 17 ){
			ages[i] = 0;
			i++;
		}
		i = 0;
		//iterate on the dataset
		while ( i < dataset.length ){
			temp = d3.values(dataset[i]);
			//save ages in the array
			if ( !isNaN(parseInt(temp[1])) )
				ages[0] += parseInt(temp[1]);
			else
				ages[0] += 0;
			//save manually the temp[10] to make selectedRegionAges ordered wrt ages intervals
			if ( !isNaN(parseInt(temp[10])) )
				ages[1] += parseInt(temp[10]);
			else
				ages[1] += 0;
			j = 2;
			//iterate on all the field temp containing an age
			while ( j <= 9 ) {
				if ( !isNaN(parseInt(temp[j])) )
					ages[j] += parseInt(temp[j]);
				else
					ages[j] += 0;
				j++;
			}
			j ++;
			while ( j <= 17 ) {
				if ( !isNaN(parseInt(temp[j])) )
					ages[j-1] += parseInt(temp[j]);
				else
					ages[j-1] += 0;
				j++;
			}
			// go to the next region
			i++;
		}
		console.log("Finished collecting amount of people for each interval of age in all UK:");
		console.log(ages);
		//g for labels 
		var mapTextLabelG = svgMap.append('g');
		//g for axis
		var mapBarChartYAxisG = svgMap.append("g")
			.attr("id", "mapBarChartY");
		var mapBarChartG = svgMap.append("g")
			.attr("id", "mapBarChartG")
			.attr('transform', 'translate(' + mapBarChartOffsetX + ',' + (mapHeight/1.45) + ')');
		//creating the Y scale
		var mapBarChartYScale = d3.scaleLinear()
			.domain([0, d3.max(ages)])
			.range([mapHeight/4, 0]);
		//creating the Y axis
		var mapBarChartYAxis = d3.axisLeft()
			.scale(mapBarChartYScale);
		//drawing the Y axis
		mapBarChartYAxisG
			.attr('transform', 'translate(' + mapBarChartOffsetX + ',' + (mapHeight/1.45) + ')')
			.call(mapBarChartYAxis);
		//creating and drawing the X axis
		mapBarChartG
			.append("line")
			.attr("x1", 0)
			.attr("y1", mapHeight/4 + 0.4 )
			.attr("x2", 10+(20*17) )
			.attr("y2", mapHeight/4 + 0.4 )
			.attr("stroke", "#000")
			.attr("stroke-width", 1);  
		//drawing bars and labels
		i = 0;
		j = 10;
		age = 0;
		while( i < ages.length ){
			mapBarChartG.append("rect")
				.attr("id", "mapBar_"+i)
				.attr("x", j)
				.attr("y", mapBarChartYScale(ages[i]))
				.attr("width", 10)
				.attr("stroke", "#000" )
				.attr("stroke-width", 0.5)
				.style("fill-opacity", 0.7)
				.attr("height", mapHeight/4 - mapBarChartYScale(ages[i]) )
				.attr("fill", function(d) {
						if ( i < 10 ) 
							return "#bae4b3";
						else
							return "#31a354";
					}
				)
				.on("mouseover", function(d){
						//get the circle on which the user has hovered the mouse
						var temp = d3.select(this);
						console.log("mouseover on: " + temp.attr("id"));
						//update style to highlight it
						temp
							.style('fill-opacity', 1)
							.attr("stroke-width", 2);
						//create lines for projecting it				
						d3.select("#mapBarChartG").append("line")
							.attr("class", "mapBarChartProjection")
							.attr("x1", temp.attr("x") )
							.attr("x2", 0 )
							.attr("y1", temp.attr("y") )
							.attr("y2", temp.attr("y") )
							.attr("stroke", "#000")
							.attr("stroke-width", 1.5)
							.attr("stroke-dasharray", "10,2");
					}
				)
				.on("mouseout", function(d){
						//get the rect from which the user has hovered out the mouse
						var temp = d3.select(this);
						console.log("mouseout on: " + temp.attr("id"));
						//remove the highlight from it
						temp
							.attr("stroke-width", 0.5)
							.style('fill-opacity', 0.7);
						//drop everything related to projection
						d3.selectAll(".mapBarChartProjection").remove();
					}
				);
			//draw tick on x axis
			mapBarChartG.append("line")
				.attr("x1", j + 5)
				.attr("x2", j + 5)
				.attr("y1", mapHeight/4)
				.attr("y2", mapHeight/4+5)
				.attr("stroke", "#000");
			
			//draw associated label
			mapTextLabelG.append("text")
				.attr("x", mapBarChartOffsetX + j - 5 )
				.attr("y", mapHeight/1.45 + mapHeight/4 + 10 )
				.attr("font-size", "10px")
				.text(function(d){
						var first = age;
						age +=5;
						return first+"-"+(first+4);
					}
				)
				.attr("transform", "rotate(-70,"+ (mapBarChartOffsetX + j +15) + "," + (mapHeight/1.45 + mapHeight/4 + 15) +")");
			//go to the next bar
			i++;
			j += 20;
		}
	//add label for Y axis
		mapTextLabelG.append("text")
			.attr("x", mapBarChartOffsetX - 20 )
			.attr("y", mapHeight/1.45 - 10 )
			.attr("font-size", "10px")
			.text("#People");
	//add label for X axis
		mapTextLabelG.append("text")
			.attr("x", mapBarChartOffsetX + 10+(20*17) + 10 )
			.attr("y", mapHeight/1.45 + mapHeight/4 + 3 )
			.attr("font-size", "10px")
			.text("Age intervals");
		
						  
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/

		//code for selected region div
		//Y scale
        var yScaleDetails = d3.scaleBand()
            .range([0, mapHeight/2])
            .domain(["Votes", "People"]);
        //Y axis
        var yAxisDetails = d3.axisLeft(yScaleDetails);
		//svg
		var detailSvg = d3.select("#details")
			.append('svg')
			.attr("id", "detailSvg")
			.attr('width', mapWidth)
			.attr('height', mapHeight);
		//drawing the y axis
		var gAxisDetails = detailSvg.append("g")
            .attr("class", "y axis")
            .attr('transform', 'translate(' + detailsBarChartOffsetX + ',' + detailsBarChartOffsetY + ')')
            .call(yAxisDetails);
        //g for texts on bars
        var textOnBarsG = detailSvg.append('g');
		//drawing texts on bars
		//text on remain bar
		textOnBarsG.append('text')
			.attr("id", "textOnRemainBar")
			.attr('x', detailsBarChartOffsetX+20)
			.attr('y', detailsBarChartOffsetY*2.23-5)
			.attr("font-size", "20px")
			.text(	Math.floor( 10*
						(regionResult[selectedRegionId][5]*100/(regionResult[selectedRegionId][4]+regionResult[selectedRegionId][5]))
					)/10 + "%"
			);
		//text on leave bar
		textOnBarsG.append('text')
			.attr("id", "textOnLeaveBar")
			.attr('x', 	detailsBarChartOffsetX + 
						detailsMapping(
							regionResult[selectedRegionId][5], 
							regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3] 
						) +
						detailsMapping(
							regionResult[selectedRegionId][4], 
							regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
						) - 
						75
			)
			.attr('y', detailsBarChartOffsetY*2.23-5)
			.attr("font-size", "20px")
			.text(	Math.round( 10*
						(regionResult[selectedRegionId][4]*100/(regionResult[selectedRegionId][4]+regionResult[selectedRegionId][5]))
					)/10 + "%"
			);
		//text on young bar
		textOnBarsG.append('text')
			.attr('id', "textOnYoungBar")
			.attr('x', detailsBarChartOffsetX+20)
			.attr('y', detailsBarChartOffsetY*5.73-5)
			.attr("font-size", "20px")
				.text(	Math.round( 10*
						(regionResult[selectedRegionId][2]*100/(regionResult[selectedRegionId][2]+regionResult[selectedRegionId][3]))
					)/10 + "%"
			);
		//text on old bar
		textOnBarsG.append('text')
			.attr('id', "textOnOldBar")
			.attr('x', mapWidth*0.7)
			.attr('y', detailsBarChartOffsetY*5.73-5)
			.attr("font-size", "20px")
			.text(	Math.round( 10*
						(regionResult[selectedRegionId][3]*100/(regionResult[selectedRegionId][2]+regionResult[selectedRegionId][3]))
					)/10 + "%"
			);
		//text of total for votes
		textOnBarsG.append("text")
			.attr("id", "textTotalVotes")
			.attr("x", 	detailsBarChartOffsetX )
			.attr("y", detailsBarChartOffsetY*2.23 + detailsBarsHeight + 25 )
			.attr("font-size", "20px")
			.text( 	"Total: " +
					( regionResult[selectedRegionId][4] + regionResult[selectedRegionId][5] )
			);
		//text of total for people
		textOnBarsG.append("text")
			.attr("id", "textTotalPeople")
			.attr("x", 	detailsBarChartOffsetX )
			.attr("y", detailsBarChartOffsetY*5.73 + detailsBarsHeight + 25 )
			.attr("font-size", "20px")
			.text(	"Total: " +
					( regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3] )
			);
		//g for bars
		var barG = detailSvg.append('g');
		//drawing bars
		//remain votes bar	
		barG.append('rect')
			.attr("id", "votesRemainBar")
			.attr('x', detailsBarChartOffsetX)
			.attr('y', detailsBarChartOffsetY*2.23)
			.attr('height', detailsBarsHeight)
			.attr('width', detailsMapping(
				regionResult[selectedRegionId][5], 
				regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
				))
			.attr('stroke', "#000")
			.attr('fill', "#91bfdb"); 
		//leave votes bar
		barG.append('rect')
			.attr("id", "votesLeaveBar")
			.attr('y', detailsBarChartOffsetY*2.23)
			.attr('height', detailsBarsHeight)
			.attr('x', 	detailsBarChartOffsetX + 
						detailsMapping(
							regionResult[selectedRegionId][5], 
							regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
						)
			)
			.attr('width', detailsMapping(
				regionResult[selectedRegionId][4], 
				regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
				))
			.attr('stroke', "#000")
			.attr('fill', "#fc8d59"); 
		//young number bar
		barG.append('rect')
		.attr('id', "youngPeopleBar")
		.attr('x', detailsBarChartOffsetX)
		.attr('y', detailsBarChartOffsetY*5.73)
		.attr('height', detailsBarsHeight)
		.attr('width', detailsMapping(
				regionResult[selectedRegionId][2],
				regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
		))
		.attr('stroke', '#000')
		.attr('fill', '#bae4b3');
		//old number bar
		barG.append('rect')
		.attr('id', "oldPeopleBar")
		.attr('y', detailsBarChartOffsetY*5.73)
		.attr('height', detailsBarsHeight)
		.attr('x', 	detailsBarChartOffsetX + 
					detailsMapping(
						regionResult[selectedRegionId][2],
						regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
					)			
		)
		.attr('width', detailsMapping(
				regionResult[selectedRegionId][3],
				regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
		))
		.attr('stroke', "#000")
		.attr('fill', "#31a354");
        //gs for label and overlay       
		var textLabelG = detailSvg.append('g');
		var rectOverlayG = detailSvg.append('g');
		//drawing label
		textLabelG.append('text')
			.attr("id", "selectedRegionLabel")
			.attr('x', detailsLabelOffsetX)
			.attr('y', detailsLabelOffsetY)
			.attr("font-size", "20px")
			.text("Name: " + selectedRegionName + ", country: " + regionResult[selectedRegionId][6]);
		//drawing overlay
		rectOverlayG.append('rect')
		   	.attr("class", "overlay")
    		.attr("width", mapWidth)
    		.attr("height", mapHeight);

/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
	//code for the bar chart for age distribution in that region
	
	//get the age in this region
	i =0;
	//iterate on the dataset
	while ( i < dataset.length ){
		temp = d3.values(dataset[i]);
		//check if this is the region
		if ( selectedRegionCode == temp[0] ){
			//save ages in the array
			if ( !isNaN(parseInt(temp[1])) )
				selectedRegionAges[0] = parseInt(temp[1]);
			else
				selectedRegionAges[0] = 0;
			//save manually the temp[10] to make selectedRegionAges ordered wrt ages intervals
			if ( !isNaN(parseInt(temp[10])) )
				selectedRegionAges[1] = parseInt(temp[10]);
			else
				selectedRegionAges[1] = 0;
			j = 2;
			//iterate on all the field temp containing an age
			while ( j <= 9 ) {
				if ( !isNaN(parseInt(temp[j])) )
					selectedRegionAges[j] = parseInt(temp[j]);
				else
					selectedRegionAges[j] = 0;
				j++;
			}
			j ++;
			while ( j <= 17 ) {
				if ( !isNaN(parseInt(temp[j])) )
					selectedRegionAges[j-1] = parseInt(temp[j]);
				else
					selectedRegionAges[j-1] = 0;
				j++;
			}
			//exit from the while
			break;
		}
		//if not, go to the next element
		else 
			i++;
	}
	console.log("Finished collecting amount of people for each interval of age for the initial selection");
	console.log(selectedRegionAges);
	//g for axis
	var barChartYAxisG = detailSvg.append("g")
		.attr("id", "barChartY");
	var barChartG = detailSvg.append("g")
		.attr("id", "barChartG")
		.attr('transform', 'translate(' + detailsBarChartOffsetX + ',' + (mapHeight/1.45) + ')');
	//creating the Y scale
	var ageYScale = d3.scaleLinear()
		.domain([0, d3.max(selectedRegionAges)])
		.range([mapHeight/4, 0]);
	//creating the Y axis
	var ageYAxis = d3.axisLeft()
		.scale(ageYScale);
	//drawing the Y axis
	barChartYAxisG
		.attr('transform', 'translate(' + detailsBarChartOffsetX + ',' + (mapHeight/1.45) + ')')
        .call(ageYAxis);
    //creating and drawing the X axis
    barChartG
    	.append("line")
    	.attr("x1", 0)
    	.attr("y1", mapHeight/4 + 0.4 )
    	.attr("x2", 10+(20*17) )
    	.attr("y2", mapHeight/4 + 0.4 )
    	.attr("stroke", "#000")
     	.attr("stroke-width", 1);  
    //drawing bars and labels
    i = 0;
    j = 10;
    age = 0;
    while( i < selectedRegionAges.length ){
		barChartG.append("rect")
			.attr("id", "bar_"+i)
			.attr("x", j)
			.attr("y", ageYScale(selectedRegionAges[i]))
			.attr("width", 10)
			.attr("stroke", "#000" )
			.attr("stroke-width", 0.5)
			.style("fill-opacity", 0.7)
			.attr("height", mapHeight/4 - ageYScale(selectedRegionAges[i]) )
			.attr("fill", function(d) {
					if ( i < 10 ) 
						return "#bae4b3";
					else
						return "#31a354";
				}
			)
			.on("mouseover", function(d){
					//get the circle on which the user has hovered the mouse
					var temp = d3.select(this);
					console.log("mouseover on: " + temp.attr("id"));
					//update style to highlight it
					temp
						.style('fill-opacity', 1)
						.attr("stroke-width", 2);
					//create lines for projecting it				
					d3.select("#barChartG").append("line")
						.attr("class", "barChartProjection")
						.attr("x1", temp.attr("x") )
						.attr("x2", 0 )
						.attr("y1", temp.attr("y") )
						.attr("y2", temp.attr("y") )
						.attr("stroke", "#000")
						.attr("stroke-width", 1.5)
						.attr("stroke-dasharray", "10,2");
				}
			)
			.on("mouseout", function(d){
					//get the rect from which the user has hovered out the mouse
					var temp = d3.select(this);
					console.log("mouseout on: " + temp.attr("id"));
					//remove the highlight from it
					temp
						.attr("stroke-width", 0.5)
						.style('fill-opacity', 0.7);
					//drop everything related to projection
					d3.selectAll(".barChartProjection").remove();
				}
			);
		//draw tick on x axis
		barChartG.append("line")
			.attr("x1", j + 5)
			.attr("x2", j + 5)
			.attr("y1", mapHeight/4)
			.attr("y2", mapHeight/4+5)
			.attr("stroke", "#000");
			
		//draw associated label
		textLabelG.append("text")
			.attr("x", detailsBarChartOffsetX + j - 5 )
			.attr("y", mapHeight/1.45 + mapHeight/4 + 10 )
			.attr("font-size", "10px")
			.text(function(d){
					var first = age;
					age +=5;
					return first+"-"+(first+4);
				}
			)
			.attr("transform", "rotate(-70,"+ (detailsBarChartOffsetX + j +15) + "," + (mapHeight/1.45 + mapHeight/4 + 15) +")");
		//go to the next bar
		i++;
		j += 20;
	}
//add label for Y axis
	textLabelG.append("text")
		.attr("x", detailsBarChartOffsetX - 20 )
		.attr("y", mapHeight/1.45 - 10 )
		.attr("font-size", "10px")
		.text("#People");
//add label for X axis
	textLabelG.append("text")
		.attr("x", detailsBarChartOffsetX + 10+(20*17) + 10 )
		.attr("y", mapHeight/1.45 + mapHeight/4 + 3 )
		.attr("font-size", "10px")
		.text("Age intervals");
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/

			//bar chart legend
			var detailsLegend = detailSvg.append("g")
				  .attr("x", detailsLabelOffsetX)
				  .attr("y", detailsLabelOffsetY)
				  .attr("height", 100)
				  .attr("width", 100);
			// legend for remain
			//colored rect
			detailsLegend.append("rect")
				  .attr("x", mapWidth*0.2)
				  .attr("y", mapHeight/1.6)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#91bfdb");
			//text  
			detailsLegend.append("text")
				  .attr("x", mapWidth*0.2+15)
				  .attr("y", (mapHeight/1.6) + 10)
				  .attr("font-size", "12px")
				  .text("Remain");
			// legend for leave
			//colored rect
			detailsLegend.append("rect")
				  .attr("x", mapWidth*0.4)
				  .attr("y", mapHeight/1.6)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#fc8d59");
			//text  
			detailsLegend.append("text")
				  .attr("x", mapWidth*0.4+15)
				  .attr("y", (mapHeight/1.6) + 10)
				  .attr("font-size", "12px")
				  .text("Leave");
			// legend for young
			//colored rect
			detailsLegend.append("rect")
				  .attr("x", mapWidth*0.6)
				  .attr("y", mapHeight/1.6)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#bae4b3");
			//text  
			detailsLegend.append("text")
				  .attr("x", mapWidth*0.6+15)
				  .attr("y", (mapHeight/1.6) + 10)
				  .attr("font-size", "12px")
				  .text("18 <= age < 50");
			// legend for old
			//colored rect
			detailsLegend.append("rect")
				  .attr("x", mapWidth*0.8)
				  .attr("y", mapHeight/1.6)
				  .attr("width", 10)
				  .attr("height", 10)
				  .attr("stroke", "#000")
				  .attr("fill", "#31a354");
			//text  
			detailsLegend.append("text")
				  .attr("x", mapWidth*0.8+15)
				  .attr("y", (mapHeight/1.6) + 10)
				  .attr("font-size", "12px")
				  .text("age >= 50");

/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//code for the analytics div

	//svg
	var svgAnalytics = d3.select("#analytics").append("svg")
		.attr("width", mapWidth*2)
		.attr("height", mapHeight)
		.attr("id", "analyticsSvg");

	var overlayGAnalytics = svgAnalytics.append("g");
	var titleGAnalytics = svgAnalytics.append("g");

	var chartSvg = d3.select("#analyticsSvg").append("svg")
		.attr("id", "chartSvg");
	//g for lines
	var linesG = chartSvg.append("g")
		.attr("id", "linesG");
	var axisG = chartSvg.append("g")
		.attr("id", "axisG");
	var circlesG = chartSvg.append("g")
		.attr("id", "circlesG");
	
	//drawing overlay and title
	var overlayAnalitics = overlayGAnalytics.append("rect")
		.attr("width", mapWidth*2)
		.attr("height", mapHeight)
		.attr("stroke", "#000")
		.attr("fill", "#f7f7f7")
		.attr("stroke-width", 2);
	
	var titleAnalytics = titleGAnalytics.append("text")
		.attr("x", 30)
		.attr("y", 30)
		.attr("font-size", "20px")
		.text("Select an interval of age and press \"plot\" to see details about its distribution in England")
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/	
//end of the callback function		


});
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//mapping functions for details bars
	function detailsMapping(x, total){
			//simple proportion
			return x*(mapWidth*3/4)/total;
	}
	function detailsUnmapping(y, total){
			//inverse mapping
			return y/(mapWidth*3/4)*total;
	}
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//code to update bars in the details div  (SINGLE SELECTION) 
		function updateDetailsDiv(){   
		//obtaining the id of the selected region to look for its details in the array        
        	selectedRegionId = 0; 
        	while ( selectedRegionId < regionResult.length ){
        		if ( regionResult[selectedRegionId][0] == selectedRegionCode )
        			break;
        		selectedRegionId++;	
        	}
        //updating the text label
        	d3.select('#selectedRegionLabel')
				.text("Name: " + selectedRegionName + ", country: " + regionResult[selectedRegionId][6]);
			
		//updating bars
		// remain votes bar
			d3.select('#votesRemainBar')
				.transition()
				.duration(750)
				.delay(0,005)
			.attr('width', detailsMapping(
					regionResult[selectedRegionId][5], 
					regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
				)
			);
		// leave votes bar
			d3.select('#votesLeaveBar')
				.transition()
				.duration(750)
				.delay(0,005)
			.attr('x', 	detailsBarChartOffsetX + 
						detailsMapping(
							regionResult[selectedRegionId][5], 
							regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
						)
			)
			.attr('width', detailsMapping(
					regionResult[selectedRegionId][4], 
					regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
				)
			);
		// young people bar
			d3.select('#youngPeopleBar')
				.transition()
				.duration(750)
				.delay(0,005)
				.attr('width', detailsMapping(
						regionResult[selectedRegionId][2],
						regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
					)
				);
		// old people bar
			d3.select('#oldPeopleBar')
				.transition()
				.duration(750)
				.delay(0,005)
				.attr('x', 	detailsBarChartOffsetX + 
							detailsMapping(
								regionResult[selectedRegionId][2],
								regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
							)			
				)
				.attr('width', detailsMapping(
						regionResult[selectedRegionId][3],
						regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
					)
				);		
		//updating text on bars
		// text on leave bar
			d3.select('#textOnLeaveBar')
			.transition()
			.delay(0,005)
			.duration(750)
			.attr('x', 	detailsBarChartOffsetX + 
						detailsMapping(
							regionResult[selectedRegionId][5], 
							regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3] 
						) +
						detailsMapping(
							regionResult[selectedRegionId][4], 
							regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
						) - 
						75
			)			
			.text(	Math.floor( 10*
						(regionResult[selectedRegionId][4]*100/(regionResult[selectedRegionId][4]+regionResult[selectedRegionId][5]))
					)/10 + "%"
			);
		// text on remain bar
			d3.select('#textOnRemainBar')
			.text(	Math.floor( 10*
						(regionResult[selectedRegionId][5]*100/(regionResult[selectedRegionId][4]+regionResult[selectedRegionId][5]))
					)/10 + "%"
			);
		// text on young bar
			d3.select('#textOnYoungBar')
				.text(	Math.round( 10*
						(regionResult[selectedRegionId][2]*100/(regionResult[selectedRegionId][2]+regionResult[selectedRegionId][3]))
					)/10 + "%"
			);;
		// text on old bar
			d3.select('#textOnOldBar')
				.text(	Math.floor( 10*
						(regionResult[selectedRegionId][3]*100/(regionResult[selectedRegionId][2]+regionResult[selectedRegionId][3]))
					)/10 + "%"
			);
		//text of total for votes
		d3.select("#textTotalVotes")
			.text( 	"Total: " +
					( regionResult[selectedRegionId][4] + regionResult[selectedRegionId][5] )
			);
		//text of total for people
		d3.select("#textTotalPeople")
			.text(	"Total: " +
					( regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3] )
			);	
//UPDATE THE BAR CHART
//get the age in this region
		selectedRegionAges = [];
		i =0;
		//iterate on the dataset
		while ( i < dataset.length ){
			temp = d3.values(dataset[i]);
			//check if this is the region
			if ( selectedRegionCode == temp[0] ){
				//save ages in the array
				if ( !isNaN(parseInt(temp[1])) )
					selectedRegionAges[0] = parseInt(temp[1]);
				else
					selectedRegionAges[0] = 0;
				//save manually the temp[10] to make selectedRegionAges ordered wrt ages intervals
				if ( !isNaN(parseInt(temp[10])) )
					selectedRegionAges[1] = parseInt(temp[10]);
				else
					selectedRegionAges[1] = 0;
				j = 2;
				//iterate on all the field temp containing an age
				while ( j <= 9 ) {
					if ( !isNaN(parseInt(temp[j])) )
						selectedRegionAges[j] = parseInt(temp[j]);
					else
						selectedRegionAges[j] = 0;
					j++;
				}
				j ++;
				while ( j <= 17 ) {
					if ( !isNaN(parseInt(temp[j])) )
						selectedRegionAges[j-1] = parseInt(temp[j]);
					else
						selectedRegionAges[j-1] = 0;
					j++;
				}
				//exit from the while
				break;
			}
			//if not, go to the next element
			else 
				i++;
		}
		console.log("Finished collecting amount of people for each interval of age for the selected region");
		console.log(selectedRegionAges);
		//drop the Y scale
		d3.select("#barChartY").remove();
		//rebuild it with the new scale
		var barChartYAxisG = d3.select("#detailSvg").append("g")
			.attr("id", "barChartY");
		//creating the new Y scale
		var ageYScale = d3.scaleLinear()
			.domain([0, d3.max(selectedRegionAges)])
			.range([mapHeight/4, 0]);
		//creating the new Y axis
		var ageYAxis = d3.axisLeft()
			.scale(ageYScale);
		//drawing the new Y axis
		barChartYAxisG
			.attr('transform', 'translate(' + detailsBarChartOffsetX + ',' + (mapHeight/1.45) + ')')
        	.call(ageYAxis);
        //updating bars
        i=0;
        while( i < selectedRegionAges.length ){
        	d3.selectAll("#bar_"+i)
        		.transition()
        		.duration(750)
        		.delay(0,005)
        		.attr("y", ageYScale(selectedRegionAges[i]) )
        		.attr("height", mapHeight/4 - ageYScale(selectedRegionAges[i]) );
        	i++;
        }
}
//-------------------------------------------------------------------------------------------------------------
//code to update bars in the details div  (MULTIPLE SELECTION) || remember that we just need to ADD instead of repleacing values
		function updateDetailsDivMultiple(){   
		//obtaining the id of newly selected region to look for its details in the array 
		// selectedRegionId is a counter in this moment
			
		//updating the text label
        	d3.select('#selectedRegionLabel')
				.text("Multiple selection");
			
		//get current values of bars and texts
			var currentTotVotes = parseInt(d3.select("#textTotalVotes").text().substr(7));
			var currentTotPeople = parseInt(d3.select("#textTotalPeople").text().substr(7));
			
			var currentVotesRemain = detailsUnmapping(parseFloat(d3.select('#votesRemainBar').attr('width')), currentTotPeople);
			var currentVotesLeave = detailsUnmapping(parseFloat(d3.select('#votesLeaveBar').attr('width')), currentTotPeople);
			var currentYoungPeople = detailsUnmapping(parseFloat(d3.select('#youngPeopleBar').attr('width')), currentTotPeople);
			var currentOldPeople = detailsUnmapping(parseFloat(d3.select('#oldPeopleBar').attr('width')), currentTotPeople);
			
		//get last region selected	
			var lastRegion = currentMultipleSelection.getLast();
		//find its id 	
        	selectedRegionId = 0; 
        	while ( selectedRegionId < regionResult.length ){
        		if ( regionResult[selectedRegionId][0] == lastRegion.code )
        			break;
        		selectedRegionId++;	
        	}
			
			var selectedRegion = regionResult[selectedRegionId];
			console.log("Retrieving info on the last region selected: \n" + selectedRegion);
		
		//updating bars
		// remain votes bar
			d3.select('#votesRemainBar')
				.transition()
				.duration(750)
				.delay(0,005)
			.attr('width', detailsMapping(
					currentVotesRemain + regionResult[selectedRegionId][5], 
					currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
				)
			);
		// leave votes bar
			d3.select('#votesLeaveBar')
				.transition()
				.duration(750)
				.delay(0,005)
			.attr('x', 	detailsBarChartOffsetX + 
						detailsMapping(
							currentVotesRemain + regionResult[selectedRegionId][5], 
							currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
						)
			)
			.attr('width', detailsMapping(
					currentVotesLeave + regionResult[selectedRegionId][4], 
					currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
				)
			);
		// young people bar
			d3.select('#youngPeopleBar')
				.transition()
				.duration(750)
				.delay(0,005)
				.attr('width', detailsMapping(
						currentYoungPeople + regionResult[selectedRegionId][2],
						currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
					)
				);
		// old people bar
			d3.select('#oldPeopleBar')
				.transition()
				.duration(750)
				.delay(0,005)
				.attr('x', 	detailsBarChartOffsetX + 
							detailsMapping(
								currentYoungPeople + regionResult[selectedRegionId][2],
								currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
							)			
				)
				.attr('width', detailsMapping(
						currentOldPeople + regionResult[selectedRegionId][3],
						currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
					)
				);		
		//updating text on bars
		// text on leave bar
			d3.select('#textOnLeaveBar')
			.transition()
			.delay(0,005)
			.duration(750)
			.attr('x', 	detailsBarChartOffsetX + 
						detailsMapping(
							currentVotesRemain + regionResult[selectedRegionId][5], 
							currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3] 
						) +
						detailsMapping(
							currentVotesLeave + regionResult[selectedRegionId][4], 
							currentTotPeople + regionResult[selectedRegionId][2] + regionResult[selectedRegionId][3]
						) - 
						75
			)			
			.text(	Math.floor( 10*
						((currentVotesLeave + regionResult[selectedRegionId][4])*100/(currentTotVotes + regionResult[selectedRegionId][4]+regionResult[selectedRegionId][5]))
					)/10 + "%"
			);
		// text on remain bar
			d3.select('#textOnRemainBar')
			.text(	Math.floor( 10*
						((currentVotesRemain + regionResult[selectedRegionId][5])*100/(currentTotVotes + regionResult[selectedRegionId][4]+regionResult[selectedRegionId][5]))
					)/10 + "%"
			);
		// text on young bar
			d3.select('#textOnYoungBar')
				.text(	Math.round( 10*
						((currentYoungPeople + regionResult[selectedRegionId][2])*100/(currentTotPeople + regionResult[selectedRegionId][2]+regionResult[selectedRegionId][3]))
					)/10 + "%"
			);;
		// text on old bar
			d3.select('#textOnOldBar')
				.text(	Math.floor( 10*
						((currentOldPeople + regionResult[selectedRegionId][3])*100/(currentTotPeople + regionResult[selectedRegionId][2]+regionResult[selectedRegionId][3]))
					)/10 + "%"
			);
		//text of total for votes
		d3.select("#textTotalVotes")
			.text( 	"Total: " +
					( currentTotVotes + selectedRegion[4] + selectedRegion[5] )
			);
		//text of total for people
		d3.select("#textTotalPeople")
			.text(	"Total: " +
					( currentTotPeople + selectedRegion[2] + selectedRegion[3] )
			);	
//UPDATE THE BAR CHART
//get the age in this region
		
		temp = d3.values(dataset[selectedRegionId]);
		//save ages in the array
		if ( !isNaN(parseInt(temp[1])) )
			selectedRegionAges[0] = selectedRegionAges[0] + parseInt(temp[1]);
		else
			selectedRegionAges[0] = selectedRegionAges[0] + 0;
		//save manually the temp[10] to make selectedRegionAges ordered wrt ages intervals
		if ( !isNaN(parseInt(temp[10])) )
			selectedRegionAges[1] = selectedRegionAges[1] + parseInt(temp[10]);
		else
			selectedRegionAges[1] = selectedRegionAges[1] + 0;
			j = 2;
		//iterate on all the field temp containing an age
		while ( j <= 9 ) {
			if ( !isNaN(parseInt(temp[j])) )
				selectedRegionAges[j] = selectedRegionAges[j] + parseInt(temp[j]);
			else
				selectedRegionAges[j] = selectedRegionAges[j] + 0;
				j++;
		}
		j ++;
		while ( j <= 17 ) {
			if ( !isNaN(parseInt(temp[j])) )
				selectedRegionAges[j-1] = selectedRegionAges[j-1] + parseInt(temp[j]);
			else
				selectedRegionAges[j-1] = selectedRegionAges[j-1] + 0;
			j++;
		}
		console.log("Finished collecting amount of people for each interval of age for the selected region");
		console.log(selectedRegionAges);
		//drop the Y scale
		d3.select("#barChartY").remove();
		//rebuild it with the new scale
		var barChartYAxisG = d3.select("#detailSvg").append("g")
			.attr("id", "barChartY");
		//creating the new Y scale
		var ageYScale = d3.scaleLinear()
			.domain([0, d3.max(selectedRegionAges)])
			.range([mapHeight/4, 0]);
		//creating the new Y axis
		var ageYAxis = d3.axisLeft()
			.scale(ageYScale);
		//drawing the new Y axis
		barChartYAxisG
			.attr('transform', 'translate(' + detailsBarChartOffsetX + ',' + (mapHeight/1.45) + ')')
        	.call(ageYAxis);
        //updating bars
        i=0;
        while( i < selectedRegionAges.length ){
        	d3.selectAll("#bar_"+i)
        		.transition()
        		.duration(750)
        		.delay(0,005)
        		.attr("y", ageYScale(selectedRegionAges[i]) )
        		.attr("height", mapHeight/4 - ageYScale(selectedRegionAges[i]) );
        	i++;
        }
}	
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
//onclick functions for button

//agebutton
document.getElementById("ageButton").onclick = function(){

	console.log("ageButton onClick");

	//updating the map
	if (mapMode != 1) {
		
		//remove highlight from other buttons
		d3.selectAll(".button")
			.style("border", "0.7px solid #000"); 
		//highlight ageButton
		d3.select("#ageButton")
			.style("border", "2px solid #000");
			
		mapMode = 1;
		
		d3.selectAll(".states")
			.transition()
			.duration(800)
			.style("fill", function(d){
					var temp = d3.values((d.properties));
					var c = 0;
					while ( c < regionResult.length ){
						if ( regionResult[c][0] == temp[0] )
							if ( regionResult[c][8] == 0 ){
								c++;
								return "#bae4b3";
							}
							else {
								c++;
								return "#31a354";
							}
						else
							c++;
					}
					return "#f7f7f7f";
				} 
		);
		//updating the legend
		//young rect
		d3.select("#firstRectMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 100)
			.attr("fill", "#bae4b3");
		//young text
		d3.select("#firstTextMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 85)
			.text("18 <= age < 50");
		//old rect
		d3.select("#secondRectMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 100)
			.attr("fill", "#31a354");
		//old text
		d3.select("#secondTextMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 85)
			.text("age >= 50");
		//unknown rect
		d3.select("#thirdRectMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 100)
			.attr("fill", "#f7f7f7");
		//unknown text
		d3.select("#thirdTextMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 85)
			.text("Unknown");	
		//hide other 2 rects and text
		d3.select("#fourthRectMapLegend")
			.transition()
			.duration(800)
			.attr("width", 0)
			.attr("height", 0);
			
		d3.select("#fifthRectMapLegend")
			.transition()
			.duration(800)
			.attr("width", 0)
			.attr("height", 0);	
			
		d3.select("#fourthTextMapLegend")
			.transition()
			.duration(800)
			.attr("font-size", "0px");

		d3.select("#fifthTextMapLegend")
			.transition()
			.duration(800)
			.attr("font-size", "0px");
	}
}
//bothbutton
document.getElementById("bothButton").onclick = function(){

	console.log("bothButtonOnClick");
	
	//updating the map
	if ( mapMode != 3 ){
		
		//remove highlight from other buttons
		d3.selectAll(".button")
			.style("border", "0.7px solid #000");
		//highlight bothButton
		d3.select("#bothButton")
			.style("border", "2px solid #000");
			
		mapMode = 3;
		
		d3.selectAll(".states")
			.transition()
			.duration(800)
			.style('fill', function(d){
				var temp = d3.values((d.properties));
				var c = 0;
				while ( c < regionResult.length ){
				//regionResult[c][1] == 1  means leave
				//regionResult[c][1] == 0  means remain
				//regionResult[c][8] == 1  means old
				//regionResult[c][8] == 0  means young
					if ( regionResult[c][0] == temp[0]){
						if ( regionResult[c][1] == 1 && regionResult[c][8] == 0 ){
							// leave & young
							c++;
							return "#f4a582";
						}
						else if (regionResult[c][1] == 1 && regionResult[c][8] == 1){
							// leave & old
							c++;
							return "#ca0020";
						}
						else if (regionResult[c][1] == 0 && regionResult[c][8] == 0){
							// remain & young
							c++;
							return "#92c5de";
						}
						else {
							// remain & old
							c++;
							return "#0571b0";
						}
					}
					else
						c++;
				}
				return "#f7f7f7";
			}
		);
	}
	//update legend
	//leave&young rect
	d3.select("#firstRectMapLegend")
		.transition()
		.duration(800)
		.attr("x", mapWidth - 160)
		.attr("fill", "#f4a582");
	//leave&young text
	d3.select("#firstTextMapLegend")
		.transition()
		.duration(800)
		.attr("x", mapWidth - 145)
		.text("18 <= age < 50 & Leave");
	//leave&old rect
	d3.select("#secondRectMapLegend")
		.transition()
		.duration(800)
		.attr("x", mapWidth - 160)
		.attr("fill", "#ca0020");
	//leave&old text
	d3.select("#secondTextMapLegend")
		.transition()
		.duration(800)
		.attr("x", mapWidth - 145)
		.text("age >= 50 & Leave");
	//remain&young rect
	d3.select("#thirdRectMapLegend")
		.transition()
		.duration(800)
		.attr("x", mapWidth - 160)
		.attr("fill", "#92c5de");
	//remain&young text
	d3.select("#thirdTextMapLegend")
		.transition()
		.duration(800)
		.attr("x", mapWidth - 145)
		.text("18 <= age < 50 & Remain");
	//remain&old rect
	d3.select("#fourthRectMapLegend")
		.transition()
		.duration(800)
		.attr("width", 10)
		.attr("height", 10);
	//remain&old text
	d3.select("#fourthTextMapLegend")
		.transition()
		.duration(800)
		.attr("font-size", "12px");
	//unknown rect
	d3.select("#fifthRectMapLegend")
		.transition()
		.duration(800)
		.attr("width", 10)
		.attr("height", 10);
	//unknown text
	d3.select("#fifthTextMapLegend")
		.transition()
		.duration(800)
		.attr("font-size", "12px");
	
}
//resultsbutton
document.getElementById("resultsButton").onclick = function(){

	console.log("resultsButtonOnClick");
	
	//updating the map
	if ( mapMode != 0 ){

		//remove highlight from other buttons
		d3.selectAll(".button")
			.style("border", "0.7px solid #000");
		//highlight resultsButton
		d3.select("#resultsButton")
			.style("border", "2px solid #000");
			
		mapMode = 0;
		
		d3.selectAll(".states")
			.transition()
			.duration(800)
			.style('fill', function(d){
				var temp = d3.values((d.properties));
				var c = 0;
				while ( c < regionResult.length ){
					if ( regionResult[c][0] == temp[0] )
						if ( regionResult[c][1] == 1 ){
							c++;
							return "#fc8d59";
						}
						else {
							c++;
							return "#91bfdb";
						}
					else
						c++;
				}
				return "#f7f7f7";
			}
		);
		//updating the legend	
		//leave rect
		d3.select("#firstRectMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 100)
			.attr("fill", "#fc8d59");
		//leave text
		d3.select("#firstTextMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 85)
			.text("Leave");
		//remain rect
		d3.select("#secondRectMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 100)
			.attr("fill", "#91bfdb");
		//remain text
		d3.select("#secondTextMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 85)
			.text("Remain");
		//unknown rect
		d3.select("#thirdRectMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 100)
			.attr("fill", "#f7f7f7");
		//unknown text
		d3.select("#thirdTextMapLegend")
			.transition()
			.duration(800)
			.attr("x", mapWidth - 85)
			.text("Unknown");
		//hide other 2 rects and text
		d3.select("#fourthRectMapLegend")
			.transition()
			.duration(800)
			.attr("width", 0)
			.attr("height", 0);
					
		d3.select("#fifthRectMapLegend")
			.transition()
			.duration(800)
			.attr("width", 0)
			.attr("height", 0);
					
		d3.select("#fourthTextMapLegend")
			.transition()
			.duration(800)
			.attr("font-size", "0px");

		d3.select("#fifthTextMapLegend")
			.transition()
			.duration(800)
			.attr("font-size", "0px");
	}
}

//plot button
document.getElementById("plotButton").onclick = function(){
	
	var i=0,
		j=0;
	var roundingStart;
	var roundingEnd;
	var ids = [];
	var totalSelected = 0,
		total = 0;
	var leaveOutliers = 0,
		remainOutliers = 0;
	// this arrays will hold in each element the total amount of people in a region, selected or all
	var selectedInEach = [];
	var totalInEach = [];
	
	var dataToPlot = [];
	
	var start = document.getElementById("start").value;
	var end = document.getElementById("end").value;
	
	console.log("plotOnClick: start: " + start + ", end: " + end);
	//check correctness of input
	//error conditions ( start >= end || start == "" || end == "" || start < 18)
	//we need to check even combination
	
	if ( isNaN(start) || isNaN(end) ){
		window.alert("Insert only numerical value!");
		return;
	}

	if (start >= end  && start >= 18 && end != 18 && end != ""){
		window.alert("Starting value can not be greater or equal than ending value!");
		return;
	}

	else if(start == "" && end >= 19){
		window.alert("Insert starting value!");
		return;
	}

	else if(start != "" && end == "" && start >= 18 ){
		window.alert("Insert ending value!");
		return;
	}

	else if(start < end && start != "" && end != "" && start < 18){
		window.alert("Starting value can not be less than 18!");
		return;
	}

	else if( start == "" && end == "" ){
		window.alert("Insert starting and ending value!");
		return;
	}
	else if( start < 18 && end == "" ){
		window.alert("Insert ending value!" +
						"\n" +
						"Starting value can not be less than 18!");
		return;
	}
	else if( start == "" && end < 19 ){
		window.alert(	"Insert starting value!" +
						"\n" +
						"Ending value can not be lett than 19!");
		return;
	}
	
	if (start == end && end == 18 ){
		window.alert(	"Starting value can not be greater or equal than ending value!" +
						"\n" +
						"Ending value can not be lesser than 18!");
		return;
	}
	
	else if( start >= end && start < 18 ){
		window.alert(	"Starting value can not be less than 18!" +
						"\n" +
						"Ending value can not be less than 19!" +
						"\n" +
						"Starting value can not be grater or equal than ending value!");
		return;
	}
	else if ( start > 84 || end > 84 ){
		window.alert( "Starting and ending value can not be greater than 84!");
		return;
	}
	//gathering ids from the user selected age range to be used to retrieve data from the dataset
	// divide start into first digit and second digit
	var fD = Math.floor(start/10); 
	var sD = start%10;
	//temporary vars vor the cicle
	var i = 0;
	//get ids
	while( i < 2 ){
		if ( fD >= 5 ) {
			if (sD >= 5)
				ids[i] = (fD*2)+2;
			else 
				ids[i] = (fD*2)+1;
		}
		else {
			if (sD >= 5 ) 
				ids[i] = (fD*2)+1;
			else 
				ids[i] = (fD*2);
		}
		i++;
		fD = Math.floor(end/10); 
		sD = end%10;
	}
	console.log("IDs of people to get from dataset: " + ids);
	//retrieving infos from the dataset
	//temporary vars for the cicle
	var temp;
	var c = 0;
	i = 0;
	j = 0;
	//iterate on all the dataset
	console.log("Iterating on all the dataset:");
	console.log(dataset);
	while ( i < dataset.length ){
		//prepare the array
		dataToPlot[c] = [];
		dataToPlot[c][2] = 0;
		dataToPlot[c][3] = 0;
		//get temp value	
		temp = d3.values(dataset[i]);
		//get area name
		dataToPlot[c][0] = temp[19];
		//get area code
		dataToPlot[c][4] = temp[0];
		//get referendum result
		if ( parseInt(temp[22]) > parseInt(temp[30]) ){
			//leave wins
			dataToPlot[c][1] = 1;
		}
		else {
			//remain wins
			dataToPlot[c][1] = 0;
		}
		// if the region inspected is in England, take it into consideration
		if ( temp[0].charAt(0) == "E" ){
			// iterate on each field of the dataset element
			while ( j < temp.length ){
				// for each j, take temp[j] into account only if it is between 3 and 17 and not 10
				if ( j >= 3 && j <= 17 && j != 10 ){
					//if j is in the selected interval
					if ( j >= ids[0] && j <= ids[1] && !isNaN(temp[j]) ) {
						//if j is the starting id, apply the formula to take only a portion of the interval
						if ( j == start ) {
							if ( sD < 5 ) {
								dataToPlot[c][2] += parseInt(temp[j])*((5-sD)/5);
								dataToPlot[c][3] += parseInt(temp[j])*((5-sD)/5);
							}
							else {
								dataToPlot[c][2] += parseInt(temp[j])*((10-sD)/5);
								dataToPlot[c][3] += parseInt(temp[j])*((5-sD)/5);
							}
						}
						if ( j == end ) {
							if ( sD < 5 ) {
								dataToPlot[c][2] += parseInt(temp[j])*((sD+1)/5);
								dataToPlot[c][3] += parseInt(temp[j])*((sD+1)/5);
							}
							else {
								dataToPlot[c][2] += parseInt(temp[j])*((sD-4)/5);
								dataToPlot[c][3] += parseInt(temp[j])*((sD-4)/5);
							}
						}
						else {
							dataToPlot[c][2] += parseInt(temp[j]);
							dataToPlot[c][3] += parseInt(temp[j]);
						}
					}
					// if j is not in the selected interval
					else {
						//save info for total if temp[j] !isNaN
						if ( !isNaN(parseInt(temp[j])) ){
							dataToPlot[c][3] += parseInt(temp[j]);
						}
					}
					// go to the next item of temp
					j++;
				}
				//if not just go to the next item
				else 
					j++;
			}	

			//save on the array total number of people with selected age in region i
			totalSelected += dataToPlot[c][2];
			selectedInEach[c] = dataToPlot[c][2];
			//save on the array total number of people in region i
			total += dataToPlot[c][3];
			totalInEach[c] = dataToPlot[c][3];
			//go to the next region
			i++;
			c++;
			j = 0;
		}
		else {
			//go to the next region without doing anything
			i++;
		}
	}
	//Now dataToPlot[i] has: 0-region name, 1-result, 2-#desired, 3-total, 4-region code
	var regionsNumber = c;
	console.log("Finished gathering data on: " + regionsNumber + " regions:");
	console.log(dataToPlot);
	
	//get UPPER_BOUND
	//sort array and compute first and third quartile
	var orderedSelectedInEach = selectedInEach.sort(function(a, b){return a - b});
	var firstQuartile = d3.quantile(orderedSelectedInEach, 0.25); 
	var thirdQuartile = d3.quantile(orderedSelectedInEach, 0.75);
	//compute IQR
	var iqr = thirdQuartile - firstQuartile;
	//computer UPPER_BOUND
	var upper_bound = thirdQuartile + (iqr * 1.5);
	
	console.log(" 1° quartile: " +
				firstQuartile +
				", 3° quartile: " +
				thirdQuartile +
				", IQR: " +
				iqr +
				", upper_bound: " +
				upper_bound);
	
	//GRAPHICAL ELEMENTS
	
	var chartSvg = d3.select("#chartSvg");
	var linesG = d3.select("#linesG");
	var circlesG = d3.select("#circlesG");
	var axisG;
	
	//drop the axis if it is not the first time we plot
	if ( firstTimePlot == 0 ){
		d3.select("#axisG").remove();
		axisG = chartSvg.append("g")
			.attr("id", "axisG");
	}
	// if it is the first time, just select it
	else {
		axisG = d3.select("#axisG");
	}
	//creating the Y scale
	var sPYScale = d3.scaleLinear()
		.domain([0, d3.max(selectedInEach)])
		.range([ sPOffsetY + sPHeight, sPOffsetY]);
	//creating the Y axis
	var sPYAxis = d3.axisLeft()
		.scale(sPYScale);
	//drawing the Y axis
	axisG
            .attr("class", "y axis")
            .attr('transform', 'translate(' + sPOffsetX + ', 0 )')
            .call(sPYAxis);
            
     //drawing the X axis
     axisG.append("line")
     	.attr("x1", 0 )
     	.attr("x2", sPWidth )
     	.attr("y1", sPHeight+0.4+sPOffsetY )
     	.attr("y2", sPHeight+0.4+sPOffsetY )
     	.attr("stroke", "#000")
     	.attr("stroke-width", 1);    
	
	//if it is the first time, draw circles
	if ( firstTimePlot == 1) {
		console.log("first time to plot, drawing all circles");
		var k = sPOffsetX + 5;
		i = 0;

		while ( i < dataToPlot.length ){
			circlesG.append("circle")
				.attr("id", dataToPlot[i][4])
				.attr("class", dataToPlot[i][0])
				.attr("r", 0)
				.attr("stroke", "#000")
				.attr("stroke-width", 0.5)
				.attr("cx", k)
				.attr("cy", sPYScale(dataToPlot[i][2]))
				.style('fill-opacity', 0.7)
				.attr("fill", function(){
					if ( dataToPlot[i][1] == 0 ){
						//remain wins
						// we can check here if the region is above the average 
						if ( dataToPlot[i][2] > upper_bound ){
							remainOutliers ++;
						}
						//return the color
						return "#91bfdb";
					}
					else if ( dataToPlot[i][1] == 1 ){
						//leave wins
						//we can check here if the region is above the average
						if ( dataToPlot[i][2] > upper_bound ){
							leaveOutliers ++;
						}
						//return the color
						return "#fc8d59";
					}
					else
						return "#f7f7f7";
				})
				.on("mouseover", function(d){
					//get the circle on which the user has hovered the mouse
					var temp = d3.select(this);
					console.log("mouseover on: " + temp.attr("id"));
					//update style to highlight it
					temp
						.style('fill-opacity', 1)
						.attr("stroke-width", 2);
					//create lines for projecting it
					linesG.append("line")
						.attr("id", "xProjection")
						.attr("class", "projection")
						.attr("x1", temp.attr("cx") )
						.attr("x2", temp.attr("cx") )
						.attr("y1", temp.attr("cy") )
						.attr("y2", sPHeight + sPOffsetY )
						.attr("stroke", "#000")
						.attr("stroke-width", 1.5)
						.attr("stroke-dasharray", "10,10");
				
					linesG.append("line")
						.attr("id", "yProjection")
						.attr("class", "projection")
						.attr("x1", temp.attr("cx") )
						.attr("x2", sPOffsetX )
						.attr("y1", temp.attr("cy") )
						.attr("y2", temp.attr("cy") )
						.attr("stroke", "#000")
						.attr("stroke-width", 1.5)
						.attr("stroke-dasharray", "10,10");
					//create label to show area name
				
					linesG.append("text")
						.attr("class", "projection")
						.attr("x", temp.attr("cx") - 35 )
						.attr("y", sPHeight + sPOffsetY + 20)
						.attr("font-size", "13px" )
						.text(temp.attr("class"));
				})
				.on("mouseout", function(d){
					//get the circle from which the user has hovered out the mouse
					var temp = d3.select(this);
					console.log("mouseout on: " + temp.attr("id"));
					//remove the highlight from it
					temp
						.attr("stroke-width", 0.5)
						.style('fill-opacity', 0.7);
					//drop everything related to projection
					d3.selectAll(".projection").remove();
				});
				// go to the next region and circle
				i++;
				//update cx for the next circle
				k += 2;
		}
		//enlarge the circles with a transition
		d3.selectAll("circle")
				.transition()
				.duration(750)
				.delay(0,005)
				.attr("r", 3);
		//draw line for upper_bound
		linesG.append("line")
			.attr("id", "upper-bound-line")
			.attr("x1", sPOffsetX)
			.attr("x2", sPOffsetX + sPWidth )
			.attr("y1", sPYScale(upper_bound) )
			.attr("y2", sPYScale(upper_bound) )    		
			.attr("stroke", "#000")
			.attr("stroke-width", 1.5)
			.attr("stroke-dasharray", "10,10");
		//draw label for upper_bound
		linesG.append("text")	
			.attr("id", "upper-bound-text")
			.attr("x", sPOffsetX + sPWidth )
			.attr("y", sPYScale(upper_bound) + 2)
			.attr("font-size", "9px" )
			.text("upper_bound");

		// writing textual info

		chartSvg.append("text")
			.attr("id", "totalPercentageText")
			.attr("x", sPOffsetX)
			.attr("y", sPOffsetY + sPHeight + 50)
			.attr("font-size", "15px")
			.text(	"People in this interval of age are the " +
					Math.round(totalSelected*100/total) +
					"% of the total population of England." );
				
		chartSvg.append("text")
			.attr("id", "remainPercentageText")
			.attr("x", sPOffsetX + sPWidth)
			.attr("y", sPOffsetY + sPHeight + 70)
			.attr("font-size", "15px")
			.text(	"Percentage of outliers in which \"remain\" won: " +
					Math.round(remainOutliers*100/(remainOutliers+leaveOutliers)) +
					"%" );
				
		chartSvg.append("text")
			.attr("id", "leavePercentageText")
			.attr("x", sPOffsetX + sPWidth)
			.attr("y", sPOffsetY + sPHeight + 50)
			.attr("font-size", "15px")
			.text("Percentage of outliers in which \"leave\" won: " +
					Math.round(leaveOutliers*100/(remainOutliers+leaveOutliers)) +
					"%" );

		chartSvg.append("text")
			.attr("id", "totalOutliersText")
			.attr("x", sPOffsetX + sPWidth)
			.attr("y", sPOffsetY + sPHeight + 90)
			.attr("font-size", "15px")
			.text("Total number of outliers: " +
					(remainOutliers+leaveOutliers) );

		//build the legend
		var sPLegend = d3.select("#analyticsSvg").append("g")
			  .attr("x", sPWidth*7/5)
			  .attr("y", sPOffsetY)
			  .attr("height", 100)
			  .attr("width", 100);
		
		sPLegend.append("rect")
			  .attr("x", sPWidth*7/5)
			  .attr("y", sPOffsetY)
			  .attr("width", 10)
			  .attr("height", 10)
			  .attr("stroke", "#000")
			  .attr("fill", "#fc8d59");
				  
		sPLegend.append("text")		
			  .attr("x", sPWidth*7/5+30)
			  .attr("y", sPOffsetY+10)
			  .attr("font-size", "12px")
			  .text("Leave");
			
		sPLegend.append("rect")			
			  .attr("x",sPWidth*7/5)
			  .attr("y", sPOffsetY+30)
			  .attr("width", 10)
			  .attr("height", 10)
			  .attr("stroke", "#000")
			  .attr("fill", "#91bfdb");;
			
		sPLegend.append("text")		
			  .attr("x", sPWidth*7/5+30)
			  .attr("y", sPOffsetY+40)
			  .attr("font-size", "12px")
			  .text("Remain");
			
		sPLegend.append("rect")
			  .attr("x", sPWidth*7/5)
			  .attr("y", sPOffsetY+60)
			  .attr("width", 10)
			  .attr("height", 10)
			  .attr("stroke", "#000")
			  .attr("fill", "#f7f7f7");
			
		sPLegend.append("text")	
			  .attr("x", sPWidth*7/5+30)
			  .attr("y", sPOffsetY+70)
			  .attr("font-size", "12px")
			  .text("Unknown");	

		//draw label for X axis
		linesG.append("text")
			.attr("x", sPOffsetX + sPWidth + 5)
			.attr("y", sPHeight + sPOffsetY + 2)
			.attr("font-size", "12px" )
			.text("Regions");

		//draw label for Y axis
		linesG.append("text")
			.attr("x", sPOffsetX - 30)
			.attr("y", sPOffsetY - 10)
			.attr("font-size", "12px" )
			.text("#People");		

	}
	
	// IF IT IS NOT THE FIRST TIME, select every circle and move it
	else {
		console.log("not the first time to plot, moving all circles");

		var i = 0;
		//move every circle (fill used only to count outliers)
		while ( i < dataToPlot.length ) {
		
			var circleId = "#" + dataToPlot[i][4];

			d3.selectAll(circleId)
				.transition()
				.duration(750)
				.delay(0,005)
				.attr("cy", sPYScale(dataToPlot[i][2]))
				.attr("fill", function(){
					if ( dataToPlot[i][1] == 0 ){
						//remain wins
						// we can check here if the region is above the average 
						if ( dataToPlot[i][2] > upper_bound ){
							remainOutliers ++;
						}
						//return the color
						return "#91bfdb";
					}
					else if ( dataToPlot[i][1] == 1 ){
						//leave wins
						//we can check here if the region is above the average
						if ( dataToPlot[i][2] > upper_bound ){
							leaveOutliers ++;
						}
						//return the color
						return "#fc8d59";
					}
					else
						return "#f7f7f7";
				});
				
			i++;
		}
		//move the upper-bound line
		d3.select("#upper-bound-line")
			.transition()
			.duration(750)
			.delay(0,005)
			.attr("y1", sPYScale(upper_bound))
			.attr("y2", sPYScale(upper_bound));
		//move the upper bound text
		d3.select("#upper-bound-text")
			.transition()	
			.duration(750)
			.delay(0,005)
			.attr("y", sPYScale(upper_bound) + 2)
			
		//update textual info
		
		d3.select("#totalPercentageText")
			.text(	"People in this interval of age are the " +
					Math.round(totalSelected*100/total) +
					"% of the total population of England." );
		
		d3.select("#remainPercentageText")
			.text(	"Percentage of outliers in which \"remain\" won: " +
					Math.round(remainOutliers*100/(remainOutliers+leaveOutliers)) +
					"%" );
		d3.select("#leavePercentageText")
			.text("Percentage of outliers in which \"leave\" won: " +
					Math.round(leaveOutliers*100/(remainOutliers+leaveOutliers)) +
					"%" );
		d3.select("#totalOutliersText")
			.text("Total number of outliers: " +
					(remainOutliers+leaveOutliers) );
	}	
    
/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/	
//now update the boolean
firstTimePlot = 0;
				
//ending the plot onclick	
}


/*----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------*/
