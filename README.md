# brexitVisualization

Simple visualization about the relation between the brexit referendum results and the population age in each region of the UK.

# State of the implementation

-	Implemented multiple selection on the regions' map.
-	Started implementing changes on the right chart for multiple selection: the first bar chart (the horizontal one) is now fully working, the second one is still WIP.
-	Improved performance: selecting an already selected region is no longer triggering computations.

# Todo 

-	Update the age intervals bar chart when a multiple selection occurs.
-	Implement removing from the multiple selection an already selected region.
-	Implement SCXML statecharts.

# Bugs to fix

-	None known right now.

# Instructions

- 	Run a http server (e.g. python -m http.server from the folder containing the brexitVisualization.html file);
- 	Open on Firefox: 'localhost:8000/brexitVisualization.html';
- 	Play with the visualization.
