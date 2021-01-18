# brexitVisualization

Simple visualization about the relation between the brexit referendum results and the population age in each region of the UK.

# Model of the interaction

-	Can be found in the "click-widget-model.pdf" file. 
-	The red transition refers to a conditional one, with no event causing it.
-	"Rest" is a strange state; it's more a transitional one rather than a resting one, like "let's see what happens now, it could be everything, it could be nothing".
-	The behaviour of the widget is well captured, but we are missing one information: when the mouse is NOT on the map.

# State of the implementation

-	Implemented multiple selection on the regions' map (right-click on a region).
-	Improved performance: selecting an already selected region is no longer triggering computations and removed a useless iteration on all the dataset whenever a region is clicked.
-	Implemented deselection from multiple selection.
-	Implemented a button to select every region.
-	Implemented a button to deselect every region.
-	Modeled the interaction.
-	Removed every form of logging except for events generation.

# Todo 

-	Implement the SCXML statechart (relative to click-widget-model.pdf).
-	Check that the numbers in the right charts are updating correctly when a multiple selection occurs.
-	Add instructions about selections in the html.
-	Fix buttons' position.

# Bugs to fix

-	None known.

# Instructions

- 	Run a http server (e.g. python -m http.server from the folder containing the brexitVisualization.html file);
- 	Open on Firefox: 'localhost:8000/brexitVisualization.html';
- 	Play with the visualization.
