//Author-Autodesk Inc.
//Description-Select a path to create a pipe.
/*globals adsk*/
(function () {

    "use strict";

    if (adsk.debug === true) {
        /*jslint debug: true*/
        debugger;
        /*jslint debug: false*/
    }
    
    var pipeRadius = 2.5;
    var pipeThickness = '5mm';
    
    var ui;
    try {
        var app = adsk.core.Application.get();
        ui = app.userInterface;
 
        var sel = ui.selectEntity('Select a path to create a pipe', 'Edges,SketchCurves');
        var selObj = sel.entity;
        
        var comp = app.activeProduct.rootComponent;
        
        // create path
        var feats = comp.features;
        var path = feats.createPath(selObj);
        
        // create profile
        var planes = comp.constructionPlanes;
        var planeInput = planes.createInput();
        //planeInput.setByDistanceOnPath(sel.entity, adsk.core.ValueInput.createByReal(0));//https://jira.autodesk.com/browse/UP-15040
        planeInput.setByDistanceOnPath(selObj, adsk.core.ValueInput.createByString('0'));
        var plane = planes.add(planeInput);
        
        var sketches = comp.sketches;
        var sketch = sketches.add(plane);
        
        var center = plane.geometry.origin;
        center = sketch.modelToSketchSpace(center);
        sketch.sketchCurves.sketchCircles.addByCenterRadius(center, pipeRadius);
        var profile = sketch.profiles.item(0);
        
        // create sweep
        var sweepFeats = feats.sweepFeatures;
        var sweepInput = sweepFeats.createInput(profile, path, adsk.fusion.FeatureOperations.NewBodyFeatureOperation);
        sweepInput.orientation = adsk.fusion.SweepOrientationTypes.ParallelOrientationType;
        var sweepFeat = sweepFeats.add(sweepInput);
        
        // create shell
        var startFaces = sweepFeat.startFaces;
        var endFaces = sweepFeat.endFaces;
        
        var objCol = adsk.core.ObjectCollection.create();
        for(var iS = 0; iS < startFaces.count; iS++){
            objCol.add(startFaces.item(iS));
        }
        for(var iE = 0; iE < endFaces.count; iE++){
            objCol.add(endFaces.item(iE));
        }
        
        var shellFeats = feats.shellFeatures;
        var shellInput = shellFeats.createInput(objCol, false);
        shellInput.insideThickness = adsk.core.ValueInput.createByString(pipeThickness);
        shellFeats.add(shellInput);
        
        app.activeViewport.refresh();
    } 
    catch (e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    } 
 
    adsk.terminate();
}());
