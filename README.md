# brexitVisualization

Simple visualization about the relation between the brexit referendum results and the population age in each region of the UK.

# Model of the interaction

-	Can be found in the "click-widget-model.pdf" file. 
-	The red transition refers to a conditional one, with no event causing it.

# State of the implementation

-	Implemented multiple selection on the regions' map (right-click on a region).
-	Improved performance: selecting an already selected region is no longer triggering computations and removed a useless iteration on all the dataset whenever a region is clicked.
-	Implemented deselection from multiple selection.
-	Implemented a button to select every region.
-	Implemented a button to deselect every region.
-	Modeled the interaction.
-	Removed every form of logging except for events generation.
-	Implemented the SCXML statechart (file "click.scxml") relative to the model found in "click-widget-model.pdf".

# Todo 

-	Attach the SCXML statechart to the visualization.
-	Check that the numbers in the right charts are updating correctly when a multiple selection occurs.
-	Add instructions about selections in the html.

# Bugs to fix

-	When selecting a lot of regions, the numbers in the age-intervals-chart go out of the div.

# Instructions

- 	Run a http server (e.g. python -m http.server from the folder containing the brexitVisualization.html file);
- 	Open on Firefox: 'localhost:8000/brexitVisualization.html';
- 	Play with the visualization.
