/** @constructor */
var HAniS = new function() {
  var userWindow, canH, canW, imgHeight, imgWidth, canXScale, canYScale,
  controls, bottomControls, firstlast, first, last,
  pointer, debug, popupWindow, debugWindow, debugText, buttcss,
  ptr, divall, divcan, divcanStyle, imgCan, ctx, ctx1, drwCan, ctxd,
  numFrames, backFiles, numOverlays, overlayFiles, overlayLabels,overlayOrder,
  overlayLinks, fofBase, imageBase, configImageBase, backImages, overlayImages, 
  overlayCheck, overlayAlpha, overlayStatic, showTip, tipText, tipX, tipY,
  overlayClear, xScreen, yScreen, xLoc, yLoc, xImage, yImage, 
  wImage, hImage, xMove,yMove,
  isRunning, isLooping, wasLooping, curFrame, direction, isRocking,
  fetchImages, needSizes, configValues, dwell, minDwell, maxDwell,
  stepDwell, lastDwell, delay, enableSmoothing,
  enhance, enhTab, isBaseEnh, isOverlayEnh, overlayEnhNum, 
  enhCan, origCan, ctxe, ctxo, origIDd, enhID,
  toggleFrames, wTog, hTog, spTog, divtog, togstart, togPointer,
  togColorOff, togColorOn, togColorSel,
  hotspots, numHotspots, isIconHotspot, backStatic,
  prevNumHotzones, numHotzones, hotzones, rgb, rgbpack,
  hoverzones, numHoverzones, doHoverzones, gotHoverzones, hoverCan, ctxh,
  hoverPick, showedHover, allowHoverzones, okToShowHoverzones,
  hiResZoomLevel, hiResZoomIndex, hiResBase, hiResBaseName, 
  hiResOlay, hiResOlayName, doingHiResZoom, frameLabels, frameLabelField,
  hiResOlayIndex, useToggle, toggleDefs, cantog, ctxtog, gotImages, doFOF,
  startstop, forward, backward, setSpeed, faster, slower, overlaySpacer,
  extrap, isExtrap, extrapMode, extrapX, extrapY, extrapT, extrapXbeg,
  extrapPrompts, extrapHbeg, extrapTB, extrapTimes, exsign, dxdt, dydt, dt,
  extrapTimesTemplate, minutes, doTime, xInc, yInc, tmin, nmin, exMsg,
  startingMinute, utcOffset, tzLabel, timeColor, timeBack, timeFont, 
  timeFontSize, extrapAMPM, toFromLock, toFrom, 
  show, showPrompt, zoom, keepZoom, activeZoom, isDown,
  zoomScale, zoomXFactor, zoomYFactor, zoomXBase, zoomYBase, 
  isInitialZoom, initialZoom, enableZooming, zoomFactorMax, isDragging,
  looprock, setframe, setframeLabel, setframeLabelSpan, isSetframe, distance, 
  doDistance, doDirection, x0Dist, y0Dist, distDigits, distShift, 
  xText, yText, wText, hText,
  x1Dist, y1Dist, distBox, distLineColor,
  showDistance, distXScale, distYScale, distUnit, tipBox,
  location, doLocation, showLocation, locDigits, locLatPrefix, locLonPrefix,
  locBox, locTran, locll, llstr, loc0, loc1, loc2, loc3,
  preserveBackPoints, olayZoomIndex, preserveIndex, preservePoints,
  refresh, autotoggle, popupDiv, popupWinWidth, popupWinHeight,
  overlayProbe, showProbe, doProbe, probe, tabGray, gotEnhTable,
  gotProbeTable, tabUnit, tabPrefix, tabDecimal, minx, minDiff, probeBox, 
  probeUndef, probeTest,
  dirspdBox, dirspdPrefix, dirspdSuffix, dirspdLabel, dirspdX, dirspdY,
  diffInx, diffPct, pct, m1, m2, drgb, tn, diff,
  tabVal, tabNum, tabDif, tabR, tabG, tabB, tabA, tabInx, tabMissing,
  lastFOF, isAutoRefresh, autoRefresh, refreshTimer, showProgress, 
  useProgress, progX, progY,imgGotCount, imgCount, hideBottom,
  hideBottomDef, hideTop, hideTopDef, divalign, overlayBase;
  
  var compass = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'];

  var requestAnimationFrame = window.requestAnimationFrame ||
     window.mozRequestAnimationFrame ||
     window.webkitRequestAnimationFrame ||
     window.msRequestAnimationFrame ||
     function(cb) {
       setTimeout(cb,10);
     };

  var make = function(t) {
    return document.createElement(t);
  };

  var beginsWith = function(strng, ltr) {
    return (strng.trim().toLowerCase().indexOf(ltr) == 0);
  }

  var nosel = "position:relative;border:0px;margin:0px;padding:0px;-webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; -webkit-tap-heightlight-color:transparent;";

  this.setup = function(confn,divnam) {

    if (divnam == undefined) divnam = "MORdivcan";

    divall = document.getElementById(divnam);
    divalign = "center";
    divall.align=divalign;

    divcan = make("div");
    divcan.setAttribute("style", nosel);

    var canpos = "position:absolute;top:0;left:0;z-index:";
    imgCan = make("canvas");
    imgCan.setAttribute("style",canpos+"1;");

    drwCan = make("canvas");
    drwCan.setAttribute("style",canpos+"2;");
    ctxd = drwCan.getContext("2d");
    ctxd.imageSmoothingEnabled = false;

    divcan.appendChild(imgCan);
    divcan.appendChild(drwCan);

    divall.appendChild(divcan);

    pointer = new PEvs(drwCan, HAniS.down, HAniS.up, 
         HAniS.move, HAniS.drag, null, HAniS.canTip);

    divall.setAttribute("tabindex",0);
    divall.addEventListener("keydown", function(e) {
      if (e.keyCode == 37) {  // arrowleft
          setIsLooping(false); 
          incCurrentFrame(-1);
          drawIt();
      } else if (e.keyCode == 39) {  // arrowright
          setIsLooping(false); 
          incCurrentFrame(+1);
          drawIt();
      } else if (e.keyCode == 82 && e.altKey) {  //alt+r
          HAniS.resetZoom(); 
      }
    }, true);

    curFrame = 0;
    isRocking = false;
    direction = +1;
    isLooping = true;
    wasLooping = true;
    numFrames = 0;
    numOverlays = 0;
    needSizes = true;
    overlayOrder = null;
    fetchImages = true;
    dwell = 500;
    minDwell = 100;
    maxDwell = 2000;
    stepDwell = 30;
    lastDwell = 0;
    autoRefresh = 60000;
    refreshTimer = null;
    isAutoRefresh = false;
    imageBase = null;
    overlayBase = null;
    fofBase = null;
    configImageBase = null;
    zoomXFactor = 1.0;
    zoomYFactor = 1.0;
    zoomXBase = 1.0;
    zoomYBase = 1.0;
    isDragging = false;
    xScreen = 0;
    yScreen = 0;
    xLoc = 0;
    yLoc = 0;
    xImage = 0;
    yImage = 0;
    wImage = 0;
    hImage = 0;
    xMove = 0;
    yMove = 0;
    isDown = false;
    useToggle = false;
    numHotzones = 0;
    isIconHotspot=false;
    frameLabelField = null;
    imgCount = 0;
    imgGotCount = 0;
    progX = 0;
    progY = 0;
    gotImages = false;
    backStatic = false;
    showTip = false;
    x0Dist = y0Dist = x1Dist = y1Dist = 0;
    doDistance = false;
    showDistance = false;
    doLocation = false;
    showLocation = false;
    locTran = null;
    locll = [0,0];
    distShift = false;
    isSetframe = false;
    doHoverzones = false;
    okToShowHoverzones = true;
    allowHoverzones = null;
    hoverPick = null;
    showedHover = false;
    doProbe = false;
    showProbe = false;
    gotProbeTable = false;
    gotEnhTable = false;
    m1 = [1,0,0];
    m2 = [2,2,1];
    drgb = [];
    overlayProbe = [];
    isExtrap = false;
    isBaseEnh = false;
    isOverlayEnh = false;
    enhTab = 0;
    exMsg = 0;
    utcOffset = 0;

    var can1 = make("canvas");
    can1.height=1;
    can1.width=1;
    ctx1 = can1.getContext("2d");
    ctx1.imageSmoothingEnabled=false;

    hoverCan = make("canvas");

    debug = false;
    if (typeof confn === "string") {
      if (confn.indexOf("\n") < 0) {
        getConfig(confn);
      } else {
        parseConfig(confn.split("\n"));
      }
    } else {
      parseConfig(confn);
    }

  }

  var parseConfig = function(txt) {
    var i,j, st, steq, sto;
    doFOF = true;
    if (txt instanceof Array) {
      configValues = {};
      for (i=0; i<txt.length; i++) {
        if (txt[i].length < 2) continue;
        st = txt[i].trim();
        if (st.indexOf("#") == 0) continue;

        steq = st.indexOf("=");
        if (steq < 1) continue;
        sto = st.substr(0,steq).trim().toLowerCase();
        configValues[sto] = st.substr(steq+1).trim();
      }
    } else {
      configValues = txt;
    }

    debug = false;
    if (configValues["debug"] != null) {
      if (configValues["debug"] == "true") {
        debugWindow = window.open("","HAniSDebugInfo","scrollbars=yes,width=400,height=200");
        debug = true;
        info("HAniS Version 3.0");
      } else {
        debug = false;
      } 
    }

    info("Is type of param an array = "+(txt instanceof Array));

    if (configValues["divalign"] != null) {
      divalign = configValues["divalign"].trim();
      divall.align = divalign;
    }

    if (configValues["coordinates"] != null) {
      parseCoordinates(configValues["coordinates"]);
    }
    var locBGColor = "green";
    var locFGColor = "white";
    var locFont = "12px Arial";
    var locScolor = null;
    var locSblur = 10;
    var locSxoff = 10;
    var locSyoff = 10;
    locDigits = 2;
    locLatPrefix = "Lat = ";
    locLonPrefix = " Lon = ";
    if (configValues["coordinates_display_style"] != null) {
      var a = configValues["coordinates_display_style"].split(",");
      locBGColor = a[0].trim();
      locFGColor = a[1].trim();
      locFont = a[2].trim();
      if (a.length > 3) {
        locLatPrefix = a[3];
        locLonPrefix = a[4];
        locDigits = parseInt(a[5],10);
        if (a.length > 6) {
          locScolor = a[6].trim();
          locSblur = parseInt(a[7], 10);
          locSxoff = parseInt(a[8], 10);
          locSyoff = parseInt(a[9], 10);
        }
      }
    }
    locBox = new TextBox(locBGColor, locFGColor, locFont, 
        locScolor, locSblur, locSxoff, locSyoff);

    distXScale = null;
    distYScale = null;
    if (configValues["map_scale"] != null) {
      doDistance = true;
      distShift = true;
      var a = configValues["map_scale"].split(",");
      distXScale = parseFloat(a[0]);
      if (a.length > 1) {
        distYScale = parseFloat(a[1]);
      } else {
        distYScale = distXScale;
      }
    }

    distUnit = " ";
    if (configValues["distance_unit"] != null) {
      distUnit = configValues["distance_unit"].trim();
    }

    divcanStyle = " ";
    if (configValues["divcan_style"] != null) {
      divcanStyle = configValues["divcan_style"].trim();
    }

    if (configValues["imagecan_style"] != null) {
      var a = configValues["imagecan_style"].trim()+";position:absolute;top:0;left:0;";
      imgCan.setAttribute("style",a+"z-index:1;");
      drwCan.setAttribute("style",a+"z-index:2;");

    }

    var distBGColor = "blue";
    var distFGColor = "white";
    var distFont = "12px Arial";
    var distScolor = null;
    var distSblur = 10;
    var distSxoff = 10;
    var distSyoff = 10;
    distDigits = 1;
    distLineColor = "white";
    if (configValues["distance_display_style"] != null) {
      var a = configValues["distance_display_style"].split(",");
      distBGColor = a[0].trim();
      distFGColor = a[1].trim();
      distLineColor = (a.length >= 5) ? a[4].trim() : distFGColor;
      distFont = a[2].trim();
      distDigits = parseInt(a[3],10);
      if (a.length > 5) {
        distScolor = a[5].trim();
        distSblur = parseInt(a[6], 10);
        distSxoff = parseInt(a[7], 10);
        distSyoff = parseInt(a[8], 10);
      }
    }

    distBox = new TextBox(distBGColor, distFGColor, distFont, 
        distScolor, distSblur, distSxoff, distSyoff);

    var probeBG= "black";
    var probeFG= "white";
    var probeFont = "12px Arial";
    var probeScolor = null;
    var probeSblur = 10;
    var probeSxoff = 10;
    var probeSyoff = 10;
    if (configValues["probe_display_style"] != null) {
      var a = configValues["probe_display_style"].split(",");
      probeBG = a[0].trim();
      probeFG = a[1].trim();
      probeFont = a[2].trim();
      if (a.length > 3) {
        probeScolor = a[3].trim();
        probeSblur = parseInt(a[4], 10);
        probeSxoff = parseInt(a[5], 10);
        probeSyoff = parseInt(a[6], 10);
      }
    }
    probeBox = new TextBox(probeBG, probeFG, probeFont, 
        probeScolor, probeSblur, probeSxoff, probeSyoff);

    if (configValues["pause"] != null) {
      lastDwell = parseInt(configValues["pause"],10);
    }

    if (configValues["auto_refresh"] != null) {
      autoRefresh= parseInt(configValues["auto_refresh"],10)*60000;
      refreshTimer = setInterval("HAniS.reloadFOF();",autoRefresh);
      isAutoRefresh = true;
    }

    enableSmoothing = false;
    if (configValues["enable_smoothing"] != null) {
      if (beginsWith(configValues["enable_smoothing"], "t")) enableSmoothing = true;
    }

    if (configValues["overlay_labels"] != null) {
      overlayLabels = configValues["overlay_labels"].split(",");
    }

    isOverlayEnh = false;
    overlayEnhNum = -1;
    if (configValues["overlay_enhance"] != null) {
      isOverlayEnh = true;
      overlayEnhNum = parseInt(configValues["overlay_enhance"],10)-1;
    }

    allowHoverzones = null;
    okToShowHoverzones = true;
    if (configValues["overlay_allow_hoverzones"] != null) {
      var a = configValues["overlay_allow_hoverzones"].split(",");
      allowHoverzones = new Array(a.length);
      for (i=0; i<a.length; i++) {
        allowHoverzones[i] = true;
        if (beginsWith(a[i], "n") || beginsWith(a[i], "f"))   {
          allowHoverzones[i] = false;
        }
      }
    }

    canH = null;
    canW = null;
    userWindow = false;
    if (configValues["window_size"] != null) {
      var a = configValues["window_size"].split(",");
      canW = parseInt(a[0], 10);
      canH = parseInt(a[1], 10);
      userWindow = true;
    }

    overlaySpacer = null;
    if (configValues["overlay_spacer"] != null) {
      var a = configValues["overlay_spacer"].split(",");
      overlaySpacer = new Array(a.length);
      for (i=0; i<a.length; i++){
        overlaySpacer[i] = parseInt(a[i],10);
      }
    }

    if (configValues["overlay_probe_table"] != null) {
      var a = configValues["overlay_probe_table"].split(",");
      for (i=0; i<a.length; i++){
        overlayProbe[i] = parseInt(a[i],10) - 1;
      }
    }


    overlayOrder = null;
    if (configValues["overlay_order"] != null) {
      var a = configValues["overlay_order"].split(",");
      overlayOrder = new Array(a.length);
      for (i=0; i<a.length; i++){
        overlayOrder[parseInt(a[i],10) - 1] = i;
      }
    }

    overlayLinks = null;
    if (configValues["overlay_links"] != null) {
      var a = configValues["overlay_links"].split(",");
      overlayLinks = new Array(a.length);
      for (i=0; i<a.length; i++) {
        overlayLinks[i] = parseInt(a[i],10);
      }
    }

    overlayClear = null; // 'n', 'z', 's', 'r'
    if (configValues["overlay_clear"] != null) {
      var a = configValues["overlay_clear"].split(",");
      overlayClear = new Array(a.length);
      for (i=0; i<a.length; i++) {
        overlayClear[i] = a[i].trim().toLowerCase();
      }
    }

    overlayAlpha = null;
    if (configValues["overlay_transparent_amount"] != null) {
      var a = configValues["overlay_transparent_amount"].split(",");
      overlayAlpha = new Array(a.length);
      for (i=0; i<a.length; i++){
        overlayAlpha[i] = parseFloat(a[i])/100.0;
      }
    }

    olayZoomIndex = null;
    if (overlayLabels != null && configValues["overlay_zoom"] != null) {
      var a = configValues["overlay_zoom"].split(",");
      olayZoomIndex = new Array(a.length);
      for (i=0; i<a.length; i++) {
        olayZoomIndex[i] = 1;
        if (beginsWith(a[i],"n") || beginsWith(a[i], "f")) {
          olayZoomIndex[i] = 0;
        } else if (beginsWith(a[i],"d") || beginsWith(a[i], "h")) {
          olayZoomIndex[i] = -1;
        }
      }
    }

    preserveIndex = null;
    if (overlayLabels != null && configValues["overlay_preserve_list"] != null) {
      var a = configValues["overlay_preserve_list"].split(",");
      preserveIndex = new Array(a.length);
      for (i=0; i<a.length; i++) {
        preserveIndex[i] = true;
        if (beginsWith(a[i],"n") || beginsWith(a[i],"f")) {
          preserveIndex[i] = false;
        }
      }
    }

    utcOffset = 0;
    tzLabel = " ";
    timeColor = "white";
    timeBack = "transparent";
    timeFont = "14pt arial";
    extrapAMPM = false;
    // = color, utc_offset, tzoneLabel, backgnd, font, AMPM (true/false)
    if (configValues["times_label_style"] != null) {
      var a = configValues["times_label_style"].split(",");
      timeColor = a[0].trim();
      if (a.length > 1) 
      utcOffset = Math.floor(60. * parseFloat(a[1]));
      if (a.length > 1) {
        if (a[1].trim() == "?" || a[1].trim().toLowerCase() == "auto") {
          var dt = new Date();
          utcOffset = -Math.floor(dt.getTimezoneOffset());
        } else {
          utcOffset = Math.floor(60.  *parseFloat(a[1]));
        }
      }
      if (a.length > 2) tzLabel = a[2].trim();
      if (a.length > 3) timeBack = a[3].trim();
      if (a.length > 4) timeFont = a[4].trim();
      if (a.length > 5 && a[5].trim().indexOf("t")!=-1) extrapAMPM = true;
    }
    if (timeColor.indexOf("0x") == 0) {
      timeColor = "#"+timeColor.substring(2);
    }
    if (timeBack.indexOf("0x") == 0) {
      timeBack = "#"+timeBack.substring(2);
    }
    timeFontSize = parseInt(timeFont,10);
    extrapTB = new TextBox("black","white",timeFont, "black",20,5,5);

    toFromLock = false;
    toFrom = false;
    if (configValues["to_from_lock"] != null) {
      if (beginsWith(configValues["to_from_lock"],"t")) {
        toFrom = true;
      } else {
        toFrom = false;
      }
    }

    var dsboxBG = "black";
    var dsboxFG = "white";
    var dsboxFont = "14px arial";
    var dsboxScolor = null;
    var dsboxSblur = 10;
    var dsboxSxoff = 10;
    var dsboxSyoff = 10;
    dirspdSuffix = " ";
    dirspdPrefix = " ";
    dirspdLabel = null;
    dirspdBox = null;

    if (configValues["dirspd_display_style"] != null) {
      var a = configValues["dirspd_display_style"].split(",");
      // bg, fg, font, prefix, suffix, shadow color, blur, xoff,  yoff
      dsboxBG = a[0].trim();
      dsboxFG = a[1].trim();
      dsboxFont = a[2].trim();
      dirspdPrefix = a[3];
      dirspdSuffix = a[4];
      if (a.length > 5) {
        dsboxScolor = a[5].trim();
        dsboxSblur = parseInt(a[6], 10);
        dsboxSxoff = parseInt(a[7], 10);
        dsboxSyoff = parseInt(a[8], 10);
      }

      dirspdBox = new TextBox(dsboxBG, dsboxFG, dsboxFont,
          dsboxScolor, dsboxSblur, dsboxSxoff, dsboxSyoff);
    }

    var tipboxBG = "black";
    var tipboxFG = "white";
    var tipboxFont = "14px arial";
    var tipboxScolor = null;
    var tipboxSblur = 10;
    var tipboxSxoff = 10;
    var tipboxSyoff = 10;

    if (configValues["tipbox_display_style"] != null) {
      var a = configValues["tipbox_display_style"].split(",");
      // bg, fg, font, shadow color, blur, xoff,  yoff
      tipboxBG = a[0].trim();
      tipboxFG = a[1].trim();
      tipboxFont = a[2].trim();
      if (a.length > 3) {
        tipboxScolor = a[3].trim();
        tipboxSblur = parseInt(a[4], 10);
        tipboxSxoff = parseInt(a[5], 10);
        tipboxSyoff = parseInt(a[6], 10);
      }
    }

    tipBox = new TextBox(tipboxBG, tipboxFG, tipboxFont,
        tipboxScolor, tipboxSblur, tipboxSxoff, tipboxSyoff);

    preservePoints = null;
    if (overlayLabels != null && preserveIndex != null) {
      var a = configValues["overlay_preserve"].split(",");
      preservePoints = new Array(preserveIndex.length);
      var p = 0;
      for (i=0; i<preserveIndex.length; i++) {
        if (preserveIndex[i]) {
          preservePoints[i] = new Array(4);
          for (j=0; j<4; j++) {
            preservePoints[i][j] = parseInt(a[p].trim(), 10);
            p = p + 1;
          }
          // convert to width and height...
          preservePoints[i][2] = preservePoints[i][2] - preservePoints[i][0] + 1;
          preservePoints[i][3] = preservePoints[i][3] - preservePoints[i][1] + 1;
        }
         
      }
    }

    fofBase = null;
    imageBase = configValues["image_base"];
    if (imageBase != null) {
      imageBase = imageBase.trim();
      fofBase = imageBase;
    } else if (configValues["image_only_base"] != null) {
      imageBase = configValues["image_only_base"].trim();
    } else {
      imageBase=null;
    }
    configImageBase = imageBase;

    overlayBase = configValues["overlay_base"];
    if (overlayBase != null) {
      overlayBase = configValues["overlay_base"].trim();
    }

    doFOF = true;
    if (configValues["filenames"] != null) {
      var bfn = configValues["filenames"].split(",");
      numFrames = bfn.length;
      backFiles = new Array(numFrames);
      for (i=0; i<numFrames; i++) {
        if (imageBase != null) {
          backFiles[i] = imageBase+bfn[i].trim();
        } else {
          backFiles[i] = bfn[i].trim();
        }
      }

      doFOF = false;
      numOverlays = 0;
    }

    if (configValues["basename"] != null) {
      // basename and get num_frames & compute filenames
      // allow for base_starting_number
      // also, wildcards!!  (* means all digits, ??? means 3 digits)
      var bn = configValues["basename"];
      if (imageBase != null) {
         bn = imageBase+configValues["basename"];
      } 
      var bsv = configValues["base_starting_number"];
      if (bsv == null) bsv = 0;
      numFrames = configValues["num_frames"];
      if (numFrames == null) {
        numFrames = configValues["num_images"];
      }
      numFrames = parseInt(numFrames,10);
      backFiles = new Array(numFrames);
      var val;
      for (i=0; i<numFrames; i++) {
        val = i + parseInt(bsv,10);
        if (bn.indexOf("*") >= 0) {
          backFiles[i] = bn.replace("*", val);

        } else if (bn.indexOf("?") >= 0) {
          var subbn = bn;
          while ( subbn.lastIndexOf("?") >= 0) {
            var li = subbn.lastIndexOf("?");
            var ts = subbn.substring(0,li)+(val % 10) +subbn.substring(li+1);
            subbn = ts;
            val = Math.floor(val / 10);
          }
          backFiles[i] = subbn;
        } else {
          backFiles[i] = bn + i;
        }
        
        info("image filename = "+backFiles[i]);
      }

      if (configValues["reverse_order"] != null && beginsWith(configValues["reverse_order"],"t")) backFiles.reverse();

      doFOF = false;
      numOverlays = 0;
    }

    backStatic = true;
    var bst = configValues["background_static"];
    if (bst != null) {
      if (beginsWith(bst,"f") || beginsWith(bst,"n")) { 
        backStatic = false;
      }
    }

    if (configValues["overlay_filenames"] != null) {
      // overlay_filenames = oA1 & oA2 & oA3, oB1 & oB2 & oB3....
      var a = configValues["overlay_filenames"].split(",");
      overlayFiles = new Array(numFrames);
      for (i=0; i<a.length; i++) {
        var b = a[i].split("&");
        numOverlays = a.length;
        for (j=0; j<numFrames; j++) {
        if (i == 0) overlayFiles[j] = new Array(numOverlays);

          overlayFiles[j][i] = b[j].trim();

          if (overlayBase != null) {
            overlayFiles[j][i] = (overlayBase+overlayFiles[j][i]).trim();
          } else if (imageBase != null) {
            overlayFiles[j][i] = (imageBase+overlayFiles[j][i]).trim();
          
          }

        }
        
      }

      doFOF = false;
    }

    preserveBackPoints = null;
    if (configValues["image_preserve"] != null) {
      var a = configValues["image_preserve"].split(",");
      preserveBackPoints = new Array();
        for (i=0; i<a.length; i++) {
            preserveBackPoints[i] = parseInt(a[i].trim(), 10);
            // convert to width and height...
            if (i % 4 > 1) {
              preserveBackPoints[i] = 
                 preserveBackPoints[i] - preserveBackPoints[i-2] + 1;
            }
        }
    }
         
    keepZoom = true;
    if (configValues["keep_zoom"] != null) {
      if (beginsWith(configValues["keep_zoom"],"f")) {
        keepZoom = false;
      }
    }

    hideBottomDef = 0;
    hideBottom = 0;
    if (configValues["hide_bottom"] != null) {
      hideBottomDef = parseInt(configValues["hide_bottom"].trim(),10);
    }

    hideTopDef = 0;
    hideTop = 0;
    if (configValues["hide_top"] != null) {
      hideTopDef = parseInt(configValues["hide_top"].trim(),10);
    }

    popupDiv = "<div>";
    popupWinHeight = 300;
    popupWinWidth = 500;
    if (configValues["popup_style"] != null) {
      var a = configValues["popup_style"];
      popupDiv = '<div style="'+configValues["popup_style"]+'">';
    }

    if (configValues["popup_window_size"] != null) {
      var a = configValues["popup_window_size"].split(",");
      popupWinWidth = a[0];
      popupWinHeight = a[1];
    }


    activeZoom = false;
    enableZooming = false;
    if (configValues["active_zoom"] != null) {
      if (beginsWith(configValues["active_zoom"], "t")) {
        activeZoom = true;
        enableZooming = true;
      }
    }

    zoomScale = 1.0;
    if (configValues["zoom_scale"] != null) {
      zoomScale = parseFloat(configValues["zoom_scale"]);
    }

    zoomFactorMax = 9999999.0;
    if (configValues["maximum_zoom"] != null) {
      zoomFactorMax = parseFloat(configValues["maximum_zoom"]);
    }

    showProgress = true;
    if (configValues["use_progress_bar"] != null) {
      if (beginsWith(configValues["use_progress_bar"],"f")) {
        showProgress = false;
      }
    }

    if (configValues["dwell"] != null) {
      var a = configValues["dwell"].split(",");
      dwell = parseInt(a[0].trim(), 10);
      if (a.length > 1) {
        minDwell = parseInt(a[1].trim(), 10);
        if (minDwell < 10) minDwell = 10;
        maxDwell = parseInt(a[2].trim(), 10);
        stepDwell = parseInt(a[3].trim(), 10);
      }

    } else if (configValues["rate"] != null) {
      var a = configValues["rate"].split(",");
      dwell = Math.round(10000./parseFloat(a[0].trim()));
      if (a.length > 1) {
        minDwell = Math.round(10000./parseFloat(a[2].trim()));
        if (minDwell < 10) minDwell = 10;
        maxDwell = Math.round(10000./parseFloat(a[1].trim()));
      }
    }


    extrapTimes = null;
    if (configValues["times"] != null) {
      var a = configValues["times"].split(",");
      extrapTimes = new Array(a.length);
      for (i=0; i<a.length; i++) {
        extrapTimes[i] = parseInt(a[i].trim(), 10);
      }
      makeTimes(extrapTimes);
    }

    extrapTimesTemplate = null;
    if (configValues["extrap_times_template"] != null) {
      extrapTimesTemplate = RegExp(configValues["extrap_times_template"]);
    }

    extrapPrompts = ["Click on target's initial position","Click on target's final position","Move pointer around or click here to select target"];

    if (configValues["extrap_prompts"] != null) {
      extrapPrompts = configValues["extrap_prompts"].split(",");
    }


    gotProbeTable = false;
    if (configValues["probe_table"] != null) {
      var reqpt = new XMLHttpRequest();
      tabVal = new Array();
      tabMissing = new Array();
      tabUnit = new Array();
      var tabPrevUnit = " ";
      tabPrefix = new Array();
      var tabPrevPrefix = "Value=";
      tabDecimal = new Array();
      var tabPrevDecimal = 1;
      tabDif = new Array(); // max diff in color 'tabInx', max of all
      tabInx = new Array();  // index (0=R, 1=G, 2=B) of max
      tabR = new Array(); // Red
      tabG = new Array(); // Green
      tabB = new Array(); // Blue
      var inx;
      var tabEnt = -1;
      tabNum = -1;
      var state = 0;

      reqpt.onload = function() {
        var txt = this.responseText.split("\n");
        for (var i=0; i<txt.length; i++) {
          if (txt[i].length < 2) continue;

          var sr = txt[i].replace(/\s+/g, ' ').trim();
          var st = sr.split(",");

          var sp = st[0].split(" ");

          if (sp[0].indexOf("*") == 0) {
            tabNum++;
            tabVal[tabNum] = new Array();
            tabPrefix[tabNum] = new Array();
            tabUnit[tabNum] = new Array();
            tabDecimal[tabNum] = new Array();
            tabR[tabNum] = new Array();
            tabG[tabNum] = new Array();
            tabB[tabNum] = new Array();
            tabInx[tabNum] = new Array();
            tabDif[tabNum] = new Array();
            tabEnt = -1;
            if (st.length > 1) {
              tabMissing[tabNum] = st[1].trim();
            } else {
              tabMissing[tabNum] = "None";
            }
            state = 1;
            continue;
          }
          if (state == 0) continue;

          tabEnt++;
          var dinx = new Array(3);
          tabVal[tabNum][tabEnt] = parseFloat(sp[0]);
          tabR[tabNum][tabEnt] = parseInt(sp[1].trim(),10);
          tabG[tabNum][tabEnt] = parseInt(sp[2].trim(),10);
          tabB[tabNum][tabEnt] = parseInt(sp[3].trim(),10);
          if (tabEnt != 0) {
            dinx[0] = tabR[tabNum][tabEnt] - tabR[tabNum][tabEnt-1];
            dinx[1] = tabG[tabNum][tabEnt] - tabG[tabNum][tabEnt-1];
            dinx[2] = tabB[tabNum][tabEnt] - tabB[tabNum][tabEnt-1];
            inx = 0;
            if (Math.abs(dinx[1]) > Math.abs(dinx[inx]) ) inx = 1;
            if (Math.abs(dinx[2]) > Math.abs(dinx[inx]) ) inx = 2;
            tabInx[tabNum][tabEnt-1] = inx;
            tabDif[tabNum][tabEnt-1] = dinx;
            if (tabDif[tabNum][tabEnt-1][inx] == 0) tabDif[tabNum][tabEnt-1][inx] = 1;
          }

          if (st.length > 1) {
            if (st[1].trim().indexOf('"') == 0) {
              tabPrevDecimal = -1;
              var ftb=st[1].trim();
              tabPrevPrefix = ftb.substr(1, ftb.length-2);
              tabPrevUnit = "";
            } else {
              tabPrevDecimal = parseInt(st[1],10);
              if (st.length > 2) tabPrevUnit = st[2].trim();
              if (st.length > 3) tabPrevPrefix = st[3].trim();
            }
          }
          tabPrefix[tabNum][tabEnt] = tabPrevPrefix;
          tabDecimal[tabNum][tabEnt] = tabPrevDecimal;
          tabUnit[tabNum][tabEnt] = tabPrevUnit;
        }

        gotProbeTable = true;

      }

      reqpt.open("get",configValues["probe_table"],true);
      reqpt.send();

    }

    controls = configValues["controls"];
    info("controls = "+configValues["controls"]);
    info("bottom_controls = "+configValues["bottom_controls"]);


    startstop = null;
    firstlast = null;
    forward = null;
    backward = null;
    faster = null;
    slower = null;
    refresh = null;
    autotoggle = null;

    if (controls != null) {
      doMakeControls(controls, true);
    }

    bottomControls = configValues["bottom_controls"];
    if (bottomControls != null) {
      doMakeControls(bottomControls, false);
    }

    if (doFOF) {
      HAniS.getFOF();
    } else {
      fetchImages = true;
      loadImages();
    }
  }

  var parseCoordinates = function(st) {
  
    var a = st.split(",");;
    if (a[0] === "PS") {
      locTran = new MORhanPolarStereoEllips();
      locTran.init(a);

    } else if (a[0] == "CE") {
      locTran = new MORhanCylEqualDist();
      locTran.init(a);

    } else if (a[0] == "LCC") {
      locTran = new MORhanLambConConEllips();
      locTran.init(a);
      
    } else {
      locTran = null;
      loc0 = parseFloat(a[0]);
      loc1 = parseFloat(a[1]);
      loc2 = parseFloat(a[2]);
      loc3 = parseFloat(a[3]);
    }
  }

  var getConfig = function(fn) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      parseConfig(this.responseText.split("\n"));
    }

    //req.open("get", fn, true);
    req.open("get", fn+"?"+Math.round(Math.random()*100000), true);
    req.send();
    
  }

  var clearOverlays = function(typ) {
    var i;
    if (overlayClear != null) {
      for (i=0; i<overlayClear.length; i++) {
        if (overlayClear[i].indexOf(typ) != -1) {
          overlayCheck[i].checked = false;
        }
      }
      for (i=0; i<overlayClear.length; i++) {
        resetLinks(i);
      }

    }
  }

  var makeTimes = function(s) {
    var ds = 0;
    minutes = new Array(s.length);
    for (var i=0; i<s.length; i++) {
      var mm = 60*Math.floor(s[i]/100) + Math.floor(s[i]) % 100;
      if (i == 0) startingMinute = mm;
      ds = mm - startingMinute;
      if (ds < 0) {  // test if gone over 00Z -- only allowed once!
        ds = mm + 24*60 - startingMinute;
      }
      minutes[i] = ds;
      info("times s="+mm+"  min="+minutes[i]);
    }
    startingMinute = startingMinute + utcOffset;
    if (startingMinute >= 1440) startingMinute = startingMinute - 1440;
    if (startingMinute < 0) startingMinute = startingMinute + 1440;
    info("Starting minute = "+startingMinute);
  }

  var setHotzoneVis = function(nz, vis) {
    if (nz != 0) {
      for (var i=0; i<nz; i++) {
        if (overlayCheck[hotzones[i].overlay].isGhost == false ) {
          overlayCheck[hotzones[i].overlay].parentNode.style.visibility=vis;
        }
      }
    }
  }

  this.reloadFOF = function() {
    info("reload FoF = "+refreshTimer);
    clearOverlays("r");
    if (doFOF) {
      HAniS.newFOF(lastFOF);
    } else {
      fetchImages = true;
      loadImages();
    }
  }

  this.getFOF = function() {
    var fn = configValues["file_of_filenames"].trim();
    var fofn =(fofBase != null ? fofBase+fn : fn);
    HAniS.newFOF(fofn);
  }

  this.newFOF = function(fn) {
    var i,j,k,m,n;
    var req = new XMLHttpRequest();
    var st, stt, sto, stx, hro, hro2;
    prevNumHotzones = numHotzones;
    var fofext = null;
    gotImages = false;
    wasLooping = isLooping;
    setIsLooping(false);
    numFrames = 0;
    numHotzones = 0;
    backFiles = new Array();
    hotspots = null;
    numHotspots = 0;
    hoverzones = null;
    numHoverzones = 0;
    gotHoverzones = false;
    doHoverzones = false
    hiResZoomLevel = null;
    doingHiResZoom = false;
    hiResZoomIndex = -1;
    hiResBase = null;
    hiResBaseName = null;
    hiResOlay = null;
    hiResOlayName = null;
    hiResOlayIndex = -1;
    overlayFiles = new Array();
    var doTimes = false;
    if (extrapTimes == null || extrapTimesTemplate != null) {
      extrapTimes = new Array();
    }
    info("new FOF="+fn);
    if (isExtrap) {
      if (extrap != null) {
        extrap.innerHTML = extrap.label_on;
        divall.style.cursor = "default";
        setIsLooping(wasLooping);
        extrapMode = -1;
      }
      isExtrap = false;
      drawLines();
    } 

    req.onload = function() {
      var txt = this.responseText.split("\n");
      for (i=0; i<txt.length; i++) {
        if (txt[i].length < 2) continue;
        st = txt[i].trim();

        info("FOF: "+st);
        if (st.indexOf("#") == 0) continue;

        if (st.indexOf("fof_extension") == 0) {
          hro = st.split("=");
          fofext = hro[1].trim();
          continue;
        }

        if (st.indexOf("image_base") == 0) {
          hro = st.split("=");
          imageBase = hro[1].trim();
          continue;
        }

        if (st.indexOf("overlay_base") == 0) {
          hro = st.split("=");
          overlayBase = hro[1].trim();
          continue;
        }

        if (st.indexOf("high_res_basemap") == 0) {
          hro = st.split("=");
          hro2 = hro[1].split(",");
          hiResBaseName = new Array();
          for (j=0; j<hro2.length; j++) {
            hiResBaseName[j] = hro2[j].trim();
            if (imageBase != null) {
              hiResBaseName[j] = imageBase+hiResBaseName[j]; 
            }
          }
          doingHiResZoom = true;
          continue;
        }

        if (st.indexOf("high_res_overlay") == 0) {
          hro = st.split("=");
          hro2 = hro[1].split(",");
          hiResOlayIndex = parseInt(hro2[0].trim(),10)-1;
          hiResOlayName = new Array();
          for (j=1; j<hro2.length; j++) {
            hiResOlayName[j-1] = hro2[j].trim();
            if (overlayBase != null) {
              hiResOlayName[j-1] = overlayBase+hiResOlayName[j-1]; 
            } else if (imageBase != null) {
              hiResOlayName[j-1] = imageBase+hiResOlayName[j-1]; 
            }
          }
          doingHiResZoom = true;
          continue;
        }

        if (st.indexOf("high_res_zoom") == 0) {
          hro = st.split("=");
          hro2 = hro[1].split(",");
          hiResZoomLevel = new Array();
          for (j=0; j<hro2.length; j++) {
            hiResZoomLevel[j] = parseFloat(hro2[j].trim());
          }
          setHiResZoomIndex();
          continue;
        }

        if (st.indexOf("hoverzone") == 0) {
          fetchHoverzone(st);
          continue;
        }

        if (st.indexOf("hotzone") == 0) {
          fetchHotzone(st);
          continue;
        }

        if (st.indexOf("hotspot") == 0) {
          fetchHotspot(st);
          continue;

        }

        if (st.indexOf("toggle_onoff") == 0) {
          hro = st.split("=");
          toggleDefs = hro[1].split(",");
          continue;
        }

        if (st.indexOf("coordinates") == 0) {
          hro = st.split("=");
          parseCoordinates(hro[1]);
          continue;
        }

        if (st.indexOf("map_scale") == 0) {
          hro = st.split("=");
          hro2 = hro[1].split(",");
          distXScale = parseFloat(hro2[0]);
          if (hro2.length > 1) {
            distYScale = parseFloat(hro2[1]);
          } else {
            distYScale = distXScale;
          }
          continue;
        }

        if (st.indexOf("times") == 0) {
          hro = st.split("=");
          hro2 = hro[1].split(",");
          for (i=0; i<hro2.length; i++) {
            extrapTimes[i] = parseInt(hro2[i].trim(), 10);
          }
          doTimes = true;
          continue;
        }

        if (extrapTimesTemplate != null) {
          var ptimes = st.match(extrapTimesTemplate);
          if (ptimes != null && ptimes.length == 2) {
            extrapTimes.push(parseInt(ptimes[1],10));
            info("+ + + Extrap time = "+ptimes[1]);
            doTimes = true;
          } else {
            info("+ + + Cannot parse times using "+extrapTimesTemplate+" from line: "+st);
          }

        }

        k = st.indexOf(" ");
        if (k < 0) k = st.length;
        backFiles[numFrames] = st.substring(0,k).trim();
        if (imageBase != null) {
          backFiles[numFrames] = imageBase+backFiles[numFrames]; 
        }

        st = st.substring(k+1);
        m = st.indexOf('"');
        if (m >= 0) {
          if (frameLabels == null) {
            frameLabels = new Array();
          }
          k = st.substring(m+1);
          m = k.indexOf('"');
          if (m >= 0) {
            frameLabels[numFrames] = k.substring(0,m);
            if (numFrames == 0) {
              frameLabelField.innerHTML = frameLabels[0];
            }
          }
        }

        overlayFiles[numFrames] = new Array();

        m = st.indexOf("overlay");
        if (m >= 0) {
          stt = st.substring(m);
          m = stt.indexOf("=");
          if (m < 0) {
            info("Cannot find a = sign in "+stt);
          }
          sto = stt.substring(m+1);
          stt = sto.trim();
          sto = stt.split(",");
          numOverlays = sto.length;
          info("numOverlays set to "+numOverlays);

          for (n=0; n<sto.length; n++) {
            overlayFiles[numFrames][n] = sto[n].trim();
            if (overlayBase != null) {
              overlayFiles[numFrames][n] = 
                   (overlayBase+overlayFiles[numFrames][n]).trim(); 
            } else if (imageBase != null) {
              overlayFiles[numFrames][n] = 
                   (imageBase+overlayFiles[numFrames][n]).trim(); 
            }
          }
        }

        numFrames = numFrames + 1;
      }

      if (doTimes) makeTimes(extrapTimes);

      if (fofext != null) {
        var reqx = new XMLHttpRequest();
        reqx.onload = function() {
          var txtx = this.responseText.split("\n");
          for (i=0; i<txtx.length; i++) {
            if (txtx[i].length < 2) continue;
            stx = txtx[i].trim();

            info("ext_FOF: "+stx);
            if (stx.indexOf("#") == 0) continue;

            if (stx.indexOf("hotzone") == 0) {
              fetchHotzone(stx);
              continue;
            }
          }

          readyToLoad();
        }

        reqx.onerror = function() {
          readyToLoad();
        }

        reqx.open("get", fofext+"?"+Math.round(Math.random()*100000), true);
        reqx.send();
        
      } else {
        readyToLoad();
      }
    }


    lastFOF = fn;
    req.open("get", fn+"?"+Math.round(Math.random()*100000), true);
    req.send();
    
  }

  var readyToLoad = function() {
    if (numHotzones != 0) {
      setHotzoneVis(numHotzones, "visible");
    } else if (prevNumHotzones != 0) {
      setHotzoneVis(prevNumHotzones, "hidden");
    }

    fetchImages = true;
    loadImages();
  }

  var loadImages = function() {
    var i,j,k;
    var olayNotStatic = "?"+Math.round(Math.random()*10000);
    backImages = new Array(numFrames); 
    imgCount = imgGotCount = 0;
    useProgress = showProgress;
    if (isSetframe) setframe.max = numFrames - 1;
    if (needSizes && (isBaseEnh || isOverlayEnh)) {
      origCan = new Array();
      enhCan = new Array();
      ctxe = new Array();
      origIDd = new Array();
      enhID = new Array();
    }
    if (enhance != null) enhance.selectedIndex = 0;

    for (i=0; i<numFrames; i++){
      if (needSizes && (isBaseEnh || isOverlayEnh)) {
        origCan[i] = make("canvas");
        enhCan[i] = make("canvas");
      }
      backImages[i] = new Image();
      backImages[i].gotit = false;
      backImages[i].frameNum = i;
      backImages[i].onerror = function() {
        imgGotCount++;
      }

      backImages[i].onload = function() {

        if (needSizes) {
          needSizes = false;
          imgHeight = this.height;
          imgWidth = this.width;
          hImage = imgHeight;
          wImage = imgWidth;
          if (!userWindow) {
            imgCan.height = hImage;
            imgCan.width = wImage;
            drwCan.height = hImage;
            drwCan.width = wImage;
            canW = wImage;
            canH = hImage;

          } else {
            imgCan.height = canH;
            imgCan.width = canW;
            drwCan.height = canH;
            drwCan.width = canW;
          }
          progX = canW/2 - 100;
          progY = canH/2 - 10;
          canXScale = 1.0 * wImage / canW;
          canYScale = 1.0 * hImage / canH;

          divcan.setAttribute("style",nosel+divcanStyle+"height:"+canH+"px;width:"+canW+"px;");
        }
        if (numHoverzones > 0 && !gotHoverzones) {
          hoverCan.height = imgHeight;
          hoverCan.width = imgWidth;
          ctxh = hoverCan.getContext("2d");
          ctxh.clearRect(0,0, canW, canH);
          for (var l=0; l<hoverzones.length; l++) {
            var hz = hoverzones[l].ctx.getImageData(0,0,
               hoverzones[l].width, hoverzones[l].height).data;
            var tar = ctxh.getImageData(
               hoverzones[l].xmin, hoverzones[l].ymin,
               hoverzones[l].width, hoverzones[l].height);
            for (var m=3; m<hz.length; m+=4) {
              if (hz[m] != 0) {
                tar.data[m] = (l+1);
              }
            }
            ctxh.putImageData(tar, hoverzones[l].xmin, hoverzones[l].ymin);
          }
          if (!enableZooming) doHoverzones = true;
          gotHoverzones = true;
        }

        if (fetchImages) {
          fetchImages = false;
          ctx = imgCan.getContext("2d");
          ctx.imageSmoothingEnabled = enableSmoothing;
          ctx.fillStyle="blue";
          ctx.font="bold 20px Arial";
          ctxd = drwCan.getContext("2d");
          ctxd.imageSmoothingEnabled = enableSmoothing;
          toggleFrames = new Array(numFrames);
          if (useToggle) makeToggles(numFrames);

          if (numOverlays > 0) {
            overlayImages = new Array(numFrames);
            for (k=0; k<numFrames; k++) {
              overlayImages[k] = new Array(numOverlays)
              for (j=0; j<numOverlays; j++) {
                overlayImages[k][j] = new Image();
                overlayImages[k][j].gotit = false;
                overlayImages[k][j].frameNum = k;
                overlayImages[k][j].overlayNum = j;
                overlayImages[k][j].onerror = function() {
                  imgGotCount++;
                }
                overlayImages[k][j].onload = function() {
                  this.gotit = true;

                  imgGotCount++;
                  drawProgress();
                  if (this.height != imgHeight || this.width != imgWidth) {
                    this.gotit = false;
                    info("Bad image size:"+this.src);
                  }

                  if (isOverlayEnh && this.gotit && this.overlayNum == overlayEnhNum) {
                    var f = this.frameNum;
                    origCan[f].height = this.height;
                    origCan[f].width = this.width;
                    ctxo = origCan[f].getContext("2d");
                    ctxo.drawImage(this, 0, 0);
                    origIDd[f] = ctxo.getImageData(0,0,this.width,this.height).data;

                    enhCan[f].height = this.height;
                    enhCan[f].width = this.width;
                    ctxe[f] = enhCan[f].getContext("2d");
                    ctxe[f].drawImage(this, 0, 0)
                    enhID[f] = ctxe[f].getImageData(0,0,this.width,this.height);

                    overlayImages[f][this.overlayNum] = null;
                    overlayImages[f][this.overlayNum] = enhCan[f];
                    overlayImages[f][this.overlayNum].gotit = true;
                  }
                }

                var ofn = overlayFiles[k][j];
                if (overlayStatic != undefined && !overlayStatic[j]) {
                  ofn = overlayFiles[k][j]+olayNotStatic;
                }
                overlayImages[k][j].src = ofn;
                imgCount++;
              }
            }
          }

          if (hiResBaseName != null) {
            hiResBase = new Array();
            for (j=0; j<hiResBaseName.length; j++) {
              hiResBase[j] = new Image();
              hiResBase[j].gotit = false;
              hiResBase[j].onerror = function(e) {
                imgGotCount++;
              }
              hiResBase[j].onload = function(e) {
                e.currentTarget.gotit = true;
                imgGotCount++;
                drawProgress();
              }

              hiResBase[j].src = hiResBaseName[j];
              imgCount++;
            }
          }

          if (hiResOlayName != null) {
            hiResOlay = new Array();
            for (j=0; j<hiResBaseName.length; j++) {
              hiResOlay[j] = new Image();
              hiResOlay[j].gotit = false;
              hiResOlay[j].onerror = function(e) {
                imgGotCount++;
              }
              hiResOlay[j].onload = function(e) {
                e.currentTarget.gotit = true;
                imgGotCount++;
                drawProgress();
              }

              hiResOlay[j].src = hiResOlayName[j];
              imgCount++;
            }
          }

        }

        if (this.height == imgHeight && this.width == imgWidth) {
        //if (this.height == canH && this.width == canW) {
          this.gotit = true;
        } else {
          this.gotit = false;
          info("Image has invalid size:"+this.src);
        }


        if (isBaseEnh && this.gotit) {
          var f = this.frameNum;
          origCan[f].height = this.height;
          origCan[f].width = this.width;
          ctxo = origCan[f].getContext("2d");
          ctxo.drawImage(this, 0, 0);
          origIDd[f] = ctxo.getImageData(0,0,this.width, this.height).data;

          enhCan[f].height = this.height;
          enhCan[f].width = this.width;
          ctxe[f] = enhCan[f].getContext("2d");
          ctxe[f].drawImage(this, 0, 0)
          enhID[f] = ctxe[f].getImageData(0,0,this.width, this.height);

          backImages[f] = null;
          backImages[f] = enhCan[f];
          backImages[f].gotit = true;
        }

        imgGotCount++;
        drawProgress();

        if (!keepZoom) HAniS.resetZoom();
        gotImages = true;

        if (!isRunning) {
          isRunning = true;
          isLooping = false;
          run();
        }

        setIsLooping(wasLooping);
      }

      var bfn = backFiles[i];
      if (!backStatic) bfn = backFiles[i]+olayNotStatic;
      backImages[i].src = bfn;
      imgCount++;
    }


    showTip = false;
    showDistance = false;
    drawLines();
  }

  var configButton = function(button, name, defOn, defOff, tip) {
    button.label_on = defOn;
    button.label_off = defOff;
    var wid = null;
    var lab = configValues[name+"_labels"];
    if (lab == null) lab = configValues[name+"_label"];
    if (lab != null) {
      var ssl = lab.split(",");
      button.label_on = ssl[0].trim();
      if (ssl.length > 1) button.label_off = ssl[1].trim();
      if (ssl.length > 2) wid = "width:"+ssl[2].trim()+"px;"
    }

    if (tip != null) button.title = tip;

    button.innerHTML = button.label_on;
    var sty = (wid!=null?wid:"")+buttcss+configValues[name+"_style"];
    if (sty != null) button.setAttribute("style", sty);
  }

  var doMakeControls = function(control, isTop) { 

    var i,k, tips, divcon;
    buttcss = configValues["buttons_style"];
    var tooltips = null, wid = null, sty = null;

    if (isTop) {
      tooltips = configValues["controls_tooltip"];
    } else {
      tooltips = configValues["bottom_controls_tooltip"];
    }

    var c = control.split(",");

    if (tooltips != null) {
      tips = tooltips.split(",");
      if (tips.length != c.length) {
        info("!!! Number of tooltips must equal number of controls!");
        tooltips = null;
        tips = null;
      }
    }

    var divolay = null, ssl;
    var mytip;
    for (i=0; i<c.length; i++) {
      if (tooltips != null) {
        mytip = tips[i];
      } else {
        mytip = null;
      }

      var cstr = c[i].trim();
      var cslash = cstr.indexOf("/");

      if (cslash === 0 || i === 0) {
        if (cslash === 0) cstr = cstr.substring(1);
        divcon = make("div");
        divcon.align=divalign;
        if (configValues["controls_style"] != null) {
          divcon.setAttribute("style",configValues["controls_style"]);
        } else {
          divcon.setAttribute("style","position:relative;padding:2px;width:100%;");
        }

        if (isTop) {
          divall.insertBefore(divcon, divcan); 

        } else {
          if (configValues["bottom_controls_style"] != null) {
            divcon.setAttribute("style",configValues["bottom_controls_style"]);
          }
          divall.appendChild(divcon); 
        }
      }

      var enhfile = configValues["enhance_filename"];
      if (enhfile == null) enhfile = configValues["enhance_table"];
      if (cstr.trim() == "enhance" && enhfile != null) {
        enhance = make("select");
        sty = configValues["enhance_style"];
        if (sty != null) enhance.setAttribute("style", sty);
        if (mytip != null) enhance.title = mytip;
        var opt = make("option");
        opt.innerHTML = "Pick Enhancement";
        opt.value = -1;
        enhance.add(opt);
        enhance.addEventListener("change",HAniS.doEnhance,false);
        isBaseEnh = !isOverlayEnh;
        if (isBaseEnh) {
          enhance.disabled = false;
        } else {
          enhance.disabled = true;
        }
        divcon.appendChild(enhance);
        gotEnhTable = false;

        var reqet = new XMLHttpRequest();
        tabVal = new Array();
        tabUnit = new Array();
        tabPrefix = new Array();
        tabDecimal = new Array();
        var tabPrevUnit, tabPrevPrefix, tabPrevDecimal;
        tabR = new Array();
        tabG = new Array();
        tabB = new Array();
        tabA = new Array();
        tabNum = -1;
        var gotValues = false;

        var inlo, inhi, indif, rlo, rhi, glo, ghi, blo, bhi, vlo, vhi, alo, ahi;

        reqet.onload = function() {
          var txt = this.responseText.split("\n");
          for (var i=0; i<txt.length; i++) {
            if (txt[i].length < 2) continue;

            var sr = txt[i].replace(/\s+/g,' ').trim();
            var m = sr.indexOf("#");
            if (m == 0) continue;
            if (m > 0) sr = sr.substring(0,m);

            if (sr.indexOf("*") == 0) {
              tabNum++;
              tabVal[tabNum] = new Array(256);
              tabPrefix[tabNum] = new Array(256);
              tabUnit[tabNum] = new Array(256);
              tabDecimal[tabNum] = new Array(256);
              tabR[tabNum] = new Array(256);
              tabG[tabNum] = new Array(256);
              tabB[tabNum] = new Array(256);
              tabA[tabNum] = new Array(256);
              tabVal[tabNum] = new Array(256);
              tabPrevUnit = " ";
              tabPrevPrefix = "Value =";
              tabPrevDecimal = 1;

              var opt = make("option");
              opt.innerHTML = sr.substring(1);
              opt.value = tabNum;
              enhance.add(opt);
              
            } else {

              var valInx = sr.indexOf("value");
              if (valInx < 0) valInx = sr.indexOf("probe");
              gotValues = false;
              vlo = vhi = 0;
              if (valInx > 0) {
                var valString = sr.substring(valInx+1);
                sr = sr.substring(0,valInx);
                var valEq = valString.indexOf("=");
                valString = valString.substring(valEq+1);
                var valItems = valString.split(",");
                if (valItems.length == 1) {
                  tabPrevPrefix = valItems[0].trim();
                  tabPrevDecimal = -1;
                  gotValues = false;
                } else {
                  vlo = parseFloat(valItems[0].trim());
                  vhi = parseFloat(valItems[1].trim());
                  if (valItems.length > 2) {
                    tabPrevDecimal = parseInt(valItems[2],10);
                  }
                  if (valItems.length > 3) {
                    tabPrevUnit = valItems[3].trim();
                  }
                  if (valItems.length > 4) {
                    tabPrevPrefix = valItems[4].trim();
                  }

                  gotValues = true;
                }
              }

              var sp = sr.split(" ");
              inlo = parseInt(sp[0].trim(), 10);
              inhi = parseInt(sp[1].trim(), 10);
              indif = inhi - inlo;
              rlo = parseFloat(sp[2].trim());
              rhi = parseFloat(sp[3].trim());
              glo = parseFloat(sp[4].trim());
              ghi = parseFloat(sp[5].trim());
              blo = parseFloat(sp[6].trim());
              bhi = parseFloat(sp[7].trim());
              alo = ahi = 255;
              if (sp.length > 9) {
                alo = parseFloat(sp[8].trim());
                ahi = parseFloat(sp[9].trim());
              }

              for (var k=inlo; k<=inhi; k++) {
                if (indif == 0) {
                  tabR[tabNum][inlo] = rlo;
                  tabG[tabNum][inlo] = glo;
                  tabB[tabNum][inlo] = blo;
                  tabA[tabNum][inlo] = alo;
                } else {
                  tabR[tabNum][k] = Math.round(rlo + (rhi - rlo) * (k - inlo) / indif);
                  tabG[tabNum][k] = Math.round(glo + (ghi - glo) * (k - inlo) / indif);
                  tabB[tabNum][k] = Math.round(blo + (bhi - blo) * (k - inlo) / indif);
                  tabA[tabNum][k] = Math.round(alo + (ahi - alo) * (k - inlo) / indif);
                }
                tabPrefix[tabNum][k] = tabPrevPrefix;
                tabUnit[tabNum][k] = tabPrevUnit;
                tabDecimal[tabNum][k] = tabPrevDecimal;
                if (gotValues) {
                  tabVal[tabNum][k] = vlo + (vhi - vlo) * (k - inlo) / indif;
                }
              }
            }
          }

          gotEnhTable = true;
        }

        reqet.open("get",enhfile,true);
        reqet.send();
      }

      if (cstr == "startstop") {
        startstop = make("button");
        startstop.className = "startstop start";
        configButton(startstop, "startstop", "Start", "Stop", mytip);
        startstop.addEventListener("click",HAniS.toggleIsLooping,false);
        divcon.appendChild(startstop);
      }

      wasLooping = true;
      if (configValues["start_looping"] != null) {
        if (beginsWith(configValues["start_looping"], "f")) wasLooping = false;
      }
      setIsLooping(wasLooping);

      if (cstr == "looprock") {
        looprock = make("button");
        looprock.className = "looprock rock";
        configButton(looprock, "looprock", "Rock", "Loop", mytip);
        direction = 1;
        looprock.addEventListener("click",HAniS.toggleLoopRock,false);
        divcon.appendChild(looprock);
      }

      if (cstr == "extrap") {
        extrap = make("button");
        extrap.className = "extrap";
        configButton(extrap, "extrap", "Enable Extrap", "Disable Extrap", mytip);
        extrap.addEventListener("click",HAniS.toggleExtrap,false);
        divcon.appendChild(extrap);
      }

      if (beginsWith(cstr,"location")) {
        location = make("button");
        location.className = "location";
        configButton(location, "location", "Show Loc", "Hide Loc", mytip);
        doLocation = true;

        if (cstr.indexOf("/on") > 0) {
          location.innerHTML = location.label_off;
          showLocation = true;
        } else {
          showLocation = false;
        }

        location.addEventListener("click", function() {
          showLocation = !showLocation; 
          if (showLocation) {
            location.innerHTML = location.label_off;
          } else {
            location.innerHTML = location.label_on;
          }

        }, false);
        divcon.appendChild(location);
      }

      if (cstr == "distance") {
        distance = make("button");
        distance.className = "distance";
        configButton(distance, "distance", "Show dist", "Hide dist", mytip);

        distShift = false;
        doDistance = false;

        distance.addEventListener("click", function() {
          doDistance = !doDistance;
          if (doDistance) {
            distance.innerHTML = distance.label_off;
          } else {
            distance.innerHTML = distance.label_on;
          }
        }, false);
        divcon.appendChild(distance);
      }

      if (cstr == "probe") {
        probe = make("button");
        probe.className = "probe";
        configButton(probe, "probe", "Show probe", "Hide probe", mytip);

        doProbe = false;
        showProbe = false;
        probeUndef = "Undefined";
        probeTest = 0;
        if (configValues["probe_undefined"] != null) {
          var a = configValues["probe_undefined"].split(",");
          probeUndef = a[0].trim();
          if (a.length > 1) probeTest = parseInt(a[1], 10) + 1;
        }

        probe.addEventListener("click", function() {
          doProbe = !doProbe;
          if (doProbe) {
            probe.innerHTML = probe.label_off;
            showProbe = true;
          } else {
            probe.innerHTML = probe.label_on;
            showProbe = false;
          }
        }, false);

        divcon.appendChild(probe);
      }


      if (cstr == "refresh") {
        refresh = make("button");
        refresh.className = "refresh";
        configButton(refresh, "refresh", "Refresh", null, mytip);

        refresh.addEventListener("click",HAniS.reloadFOF,false);
        divcon.appendChild(refresh);
      }

      if (cstr == "setframe" ) {
        setframe= make("input");
        setframe.className = "setframe";
        setframe.type = "range";
        setframe.min = 0;
        setframe.max = 99;
        setframe.value=0;
        setframeLabel = "Frame #*";
        if (configValues["setframe_label"] != null) {
          setframeLabel = configValues["setframe_label"];
        }

        setframeLabelSpan = make("span");
        setframeLabelSpan.innerHTML = setframeLabel.replace("*",1);

        sty ="display:block;vertical-align:middle;"+configValues["setframe_style"];
        setframe.setAttribute("style", sty);

        var dsf = make("span");
        dsf.setAttribute("style","display:inline-block;vertical-align:top;");
        setframeLabelSpan.setAttribute("style","display:block;vertical-align:middle;"+configValues["setframe_label_style"]);
        dsf.appendChild(setframeLabelSpan);
        dsf.appendChild(setframe);
        
        divcon.appendChild(dsf);
        setframe.addEventListener("input", function(e) {
          setIsLooping(false); 
          setCurrentFrame(parseInt(setframe.value, 10));
          setframeLabelSpan.innerHTML = setframeLabel.replace("*",(curFrame+1));
          drawIt();
        }, false);
        isSetframe = true;
      }

      if (cstr == "framelabel" ) {
        frameLabelField = make("button");
        frameLabelField.className = "framelabel";
        frameLabelField.innerHTML = "";
        frameLabels = null;
        if (configValues["frame_labels"] != null) {
          frameLabels = configValues["frame_labels"].split(",");
          frameLabelField.innerHTML = frameLabels[0];
        }
        sty = buttcss+configValues["framelabel_style"];
        if (sty != null) frameLabelField.setAttribute("style", sty);
        divcon.appendChild(frameLabelField);
      }

      if (cstr == "autorefresh" || cstr == 'autorefresh/off') {
        if (refreshTimer != null) clearInterval(refreshTimer);
        autotoggle = make("button");
        autotoggle.className = "autorefresh";
        configButton(autotoggle, "autorefresh","Disable Auto Refresh","Enable Auto Refresh", mytip);
        autotoggle.addEventListener("click",HAniS.toggleAutoRefresh,false);
        isAutoRefresh = false;
        divcon.appendChild(autotoggle);
        if (cstr == "autorefresh") {
          HAniS.toggleAutoRefresh();
        } else {
          autotoggle.innerHTML = autotoggle.label_off;
        }
      }

      if (cstr == "step") {
        var sl = configValues["step_labels"];
        var sl2 = (sl != null) ? sl.split(",") : ["<", ">"]; 
        backward = make("button");
        backward.className = "step back";
        backward.innerHTML = sl2[0];
        backward.addEventListener("click",function() {
          setIsLooping(false); 
          incCurrentFrame(-1);
          drawIt();
        }, false);

        sty = buttcss+configValues["step_style"];
        if (sty != null) backward.setAttribute("style", sty);
        if (mytip != null) backward.title = mytip;
        divcon.appendChild(backward);

        forward = make("button");
        forward.className = "step forward";
        forward.innerHTML = sl2[1];
        forward.addEventListener("click",function() {
          setIsLooping(false); 
          incCurrentFrame(+1);
          drawIt();
        }, false);

        if (sty != null) forward.setAttribute("style", sty);
        if (mytip != null) forward.title = mytip;
        divcon.appendChild(forward);
      }

      if (cstr == "firstlast") {
        var sl = configValues["firstlast_labels"];
        var sl2 = (sl != null) ? sl.split(",") : ["<<", ">>"]; 
        first = make("button");
        first.className = "firstlast";
        first.innerHTML = sl2[0];
        first.addEventListener("click",function() {
          setIsLooping(false); 
          setCurrentFrame(0);
          drawIt();
        }, false);

        sty = buttcss+configValues["firstlast_style"];
        if (sty != null) first.setAttribute("style", sty);
        if (mytip != null) first.title = mytip;
        divcon.appendChild(first);

        last = make("button");
        last.className = "firstlast";
        last.innerHTML = sl2[1];
        last.addEventListener("click",function() {
          setIsLooping(false); 
          setCurrentFrame(numFrames - 1);
          drawIt();
        }, false);

        if (sty != null) last.setAttribute("style", sty);
        if (mytip != null) last.title = mytip;
        divcon.appendChild(last);
      }

      if (cstr == "setspeed") {
        setSpeed = make("input");
        setSpeed.className = "setspeed";
        setSpeed.type = "range";
        setSpeed.min = minDwell;
        setSpeed.max = maxDwell; 
        setSpeed.value = maxDwell - dwell;
        if (mytip != null) setSpeed.title = mytip;
        sty ="vertical-align:middle;"+configValues["setspeed_style"];
        setSpeed.setAttribute("style", sty);
        setSpeed.addEventListener("input", function(e) {
          dwell = maxDwell - parseInt(setSpeed.value,10) + 30;
          setIsLooping(true);
          drawIt();
        }, false);
        divcon.appendChild(setSpeed);


      } else if (cstr == "speed") {
        var sl = configValues["speed_labels"];
        var sl2 = (sl != null) ? sl.split(",") : ["-","+"];
        slower = make("button");
        slower.className = "speed slower";
        slower.innerHTML = sl2[0];
        slower.addEventListener("click",function() {
          dwell = dwell + stepDwell;
          faster.disabled = false;
          if (dwell > maxDwell) {
            dwell = maxDwell;
            slower.disabled = true;
          }
        }, false);

        sty = buttcss+configValues["speed_style"];
        if (sty != null) slower.setAttribute("style", sty);
        if (mytip != null) slower.title = mytip;
        divcon.appendChild(slower);

        faster = make("button");
        faster.className = "speed faster";
        faster.innerHTML = sl2[1];
        faster.addEventListener("click",function() {
          dwell = dwell - stepDwell;
          slower.disabled = false;
          if (dwell < minDwell) {
            dwell = minDwell;
            faster.disabled = true;
          }   
        }, false);
        if (sty != null) faster.setAttribute("style", sty);
        if (mytip != null) faster.title = mytip;
        divcon.appendChild(faster);
      }

      if (cstr == "zoom") {
        zoom = make("button");
        zoom.className = "zoom off";
        configButton(zoom, "zoom", "Zoom", "Un-zoom", mytip);
        zoom.addEventListener("click",HAniS.toggleZooming,false);
        divcon.appendChild(zoom);
      }

      if (cstr == "show") {
        show = make("button");
        show.className = "show";
        configButton(show, "show", "Show", "Show", mytip);
        showPrompt = configValues["show_prompt"];
        if (showPrompt == null) {
          showPrompt = "Right-click to save or copy the image<br> <font size='-1'>(to save in some browsers, you may need to first 'Open in New Tab')</font> <p>";
        }
        show.addEventListener("click", function() {
          var candat = imgCan.toDataURL();
          var savwin = window.open();
          savwin.document.write(showPrompt+"<img src="+candat+"></img>");
        }, false);

        divcon.appendChild(show);
      }

      if(cstr == "toggle" ) {
        toggleFrames = new Array();
        var togs = configValues["toggle_size"];
        if (togs != null) {
          var togv = togs.split(",");
          wTog = parseInt(togv[0],10);
          hTog = parseInt(togv[1],10);
          spTog = parseInt(togv[2],10);
        } else {
          wTog = 10;
          hTog = 10;
          spTog = 3;
        }
        togColorOff = "red";
        togColorOn = "blue";
        togColorSel = "orange";
        var togc = configValues["toggle_colors"];
        if (togc != null) {
          var togcs = togc.split(",");
          togColorOn = togcs[0].trim();
          togColorOff = togcs[1].trim();
          togColorSel = togcs[2].trim();
        }

        divtog = make("div");
        divtog.setAttribute("style",nosel);
        divtog.style.backgroundColor = divcon.style.backgroundColor;
        divtog.align=divalign;
        togPointer = new PEvs(divtog, null, null, null, null, HAniS.togclick, null);
        cantog = make("canvas");
        cantog.height = 2*hTog;
        ctxtog = cantog.getContext("2d");
        divtog.appendChild(cantog);
        if (isTop) {
          divall.insertBefore(divtog, divcan); 
        } else {
          divall.appendChild(divtog); 
        }
        var a = configValues["toggle_onoff"];
        toggleDefs = null;
        if (a != null) toggleDefs = a.split(",");

        useToggle = true;

        if (mytip != null) divtog.title = mytip

      }


      if (cstr == "overlay") {

        overlayCheck = new Array();
        var olt = configValues["overlay_tooltip"];
        var oltips = null;
        if (olt != null) oltips = olt.split(",");
        var olr = configValues["overlay_radio"];
        var olrad = null;
        if (olr != null) {
          olrad = olr.split(",");
        }

        var olc = configValues["overlay_labels_color"];
        var olcolor = null;
        if (olc !=null) {
          olcolor = olc.split(",");
        }

        overlayStatic = new Array();
        var ols = configValues["overlay_caching"];
        var olstat = null;
        if (ols == null) ols = configValues["overlay_static"];
        if (ols != null) olstat = ols.split(",");

        var oldv = true;
        if (configValues["overlay_nonewdiv"] != null) oldv = false;

        for (k=0; k<overlayLabels.length; k++) {
          var olab = overlayLabels[k].trim();

          if (k == 0 || olab.indexOf("/") == 0) {
            if (olab.indexOf("/") == 0) olab = olab.substr(1);
            if (oldv) {
              divolay = make("div");
              divolay.align="center";
              if (isTop) {
                divall.insertBefore(divolay, divcan); 
              } else {
                divall.appendChild(divolay); 
              }
            } else {
              divolay = make("span");
              divcon.appendChild(divolay);
            }
            if (configValues["overlay_labels_style"] != null) {
              divolay.setAttribute("style",configValues["overlay_labels_style"]);
            }
          }

          var olon = false;
          var oll = olab.length;
          if (olab.indexOf("/on") > 0 && olab.indexOf("/on") == oll-3) {
            olon =true;
            olab = olab.substr(0,oll-3);
          }

          var isAlways = false;
          if (olab.indexOf("/always")> 0 && olab.indexOf("/always")  == oll-7) {
            olon = true;
            isAlways = true;
          } 

          var isHidden = false;
          if (olab.indexOf("/hidden") > 0 && olab.indexOf("/hidden") == oll-7) {
            isHidden = true;
          }

          if (olstat != null) {
            if (beginsWith(olstat[k],"y") || beginsWith(olstat[k],"t")) {
              overlayStatic[k] = true;
            } else {
              overlayStatic[k] = false;
            }
          } else {
            overlayStatic[k] = true;
          }


          overlayCheck[k] = make("input");
          overlayCheck[k].type = "checkbox";
          overlayCheck[k].value = olab;

          var cbsty = "vertical-align:middle;";
          if (configValues["checkbox_style"] != null) {
            cbsty = cbsty + configValues["checkbox_style"];
          }
          overlayCheck[k].setAttribute("style", cbsty);
          overlayCheck[k].checked = olon;
          overlayCheck[k].name = 0;
          if (enhance != null) {
            if ((k == overlayEnhNum) && overlayCheck[k].checked) {
              enhance.disabled = false;
            }
          }

          if (allowHoverzones != null && (!allowHoverzones[k] && olon)) okToShowHoverzones = false;
          overlayCheck[k].addEventListener("click",HAniS.overClick,false);
          if (olr != null) {
            var grp = olrad[k].indexOf("/");
            if (grp != -1) {
              overlayCheck[k].name = olrad[k].substr(grp+1).trim();
            }

            if (olrad[k].indexOf("true") != -1) {
              overlayCheck[k].type="radio";
              if (grp == -1) {
                overlayCheck[k].name="all";
              }
            }
          }

          overlayCheck[k].isGhost = true;
          if (!isAlways && !isHidden) {
            if (oltips != null) overlayCheck[k].title = oltips[k];
            var lab = make('label');
            lab.htmlFor = olab;
            if (oltips != null) lab.title = oltips[k];
            lab.appendChild(document.createTextNode(olab));
            var lsty = "vertical-align:middle;";
            if (olcolor != null) {
              lsty = lsty + "color:"+olcolor[k]+";";
            }

            lab.setAttribute("style",lsty);
            var spn = make("span");
            var space = "10"
            if (overlaySpacer != null) {
              space = 10 + overlaySpacer[k];
            }
            spn.setAttribute("style","margin-left:"+space+"px;");
            spn.appendChild(overlayCheck[k]);
            spn.appendChild(lab);
            divolay.appendChild(spn);
            overlayCheck[k].isGhost = false;
          }
        }


        // now fix up links, if there
        if (overlayLinks == null) {
          overlayLinks = new Array(overlayLabels.length);
          for (k=0; k<overlayLabels.length; k++) {
            overlayLinks[k] = 0;
          }

        } else {
          for (k=0; k<overlayLabels.length; k++) {
            resetLinks(k);
          }
        }
      }
    }
  }

  var resetLinks = function(i) {
    var k,state;
    
    if (overlayLinks[i] < 0) {
      state = false;
      for (k=0; k<overlayLabels.length; k++) {
        if (overlayLinks[k] == -overlayLinks[i]) {
          if (!state) state = overlayCheck[k].checked;
        }
      }
      overlayCheck[i].checked = state;
    }
  }


  var fetchHotspot = function(st) {

    var hro, hro2;
    if (numHotspots == 0) hotspots = new Array();
    hro = st.split("=");
    hro2 = hro[1].split(",");
    // hotspot=x,y,w,h,pan/olay#,action,value [,tip]
    // x,y,w,h,pan,action,value,overlay
    var pan = hro2[4].trim();
    var ps = hro2[4].indexOf("/");
    var polay = -1;
    if (ps != -1) {
      polay = parseInt(hro2[4].substring(ps+1), 10)-1;
      pan = pan.substring(0,ps);
    }

    hotspots[numHotspots] = new Hotspot(
      parseInt(hro2[0].trim(),10),
      parseInt(hro2[1].trim(),10),
      hro2[2].trim(), hro2[3].trim(),
      pan.toLowerCase(),
      hro2[5].trim().toLowerCase(),
      hro2[6].trim(), polay, 
      (hro2.length == 8 ? hro2[7].trim() : null) 
    );

    numHotspots = numHotspots + 1;
  }

  var fetchHoverzone = function(st) {
    // Hoverzone = color, action, value, tip, poly
    // Hoverzone = 0xfe00fe, fof, temp/fof.txt, Click me, (100, 200, 110, ...)
    var hro, hro2;
    if (numHoverzones == 0) {
      hoverzones = new Array();
      hoverPick = null;
    }
    hro = st.split("=");
    var hroq = hro[1].split("(");
    hro2 = hroq[0].split(",");
    var col = hro2[0].trim();
    if (col.indexOf("0x") == 0) {
      col = "#"+col.substring(2);
    }


    hoverzones[numHoverzones] = new Hoverzone(
        col, hro2[1].trim(), 
        hro2[2].trim(), hro2[3].trim(),hroq[1].trim()
    );
    numHoverzones = numHoverzones + 1;
  }
  
  var fetchHotzone = function(st) {
    var hro, hro2;
    if (numHotzones == 0) hotzones = new Array();
    hro = st.split("=");
    hro2 = hro[1].split(",");
    // hotzone = olay#, color, action, value [,tip]
    hotzones[numHotzones] = new Hotzone(
        parseInt(hro2[0],10)-1,
        parseInt(hro2[1],16),
        hro2[2].trim(), hro2[3].trim(), 
        (hro2.length == 5 ? hro2[4].trim():"Click for details")
    );
    numHotzones = numHotzones + 1;
  }

  /** @constructor */
  function Hoverzone(color, action, value, tip, poly) {
    this.color = color;
    this.alpha = 1.0
    if (this.color.length > 7) {
      this.alpha = parseInt(this.color.substring(7),16) / 255.;
      this.color = this.color.substring(0,7);
      if (this.alpha < .1) this.alpha = .1;
    }
    this.action = action;
    this.value = value;
    this.tip = tip;
    this.poly = poly;
    var xyc = poly.split(",");
    this.xy = [];
    this.xmin = 9999;
    this.ymin = 9999;
    this.xmax = 0;
    this.ymax = 0
    for (var i=0; i<xyc.length; i++) {
      this.xy[i] = parseInt(xyc[i].trim(), 10)
      if (i % 2 == 0) {
        if (this.xy[i] < this.xmin) this.xmin = this.xy[i];
        if (this.xy[i] > this.xmax) this.xmax = this.xy[i];
      } else {
        if (this.xy[i] < this.ymin) this.ymin = this.xy[i];
        if (this.xy[i] > this.ymax) this.ymax = this.xy[i];
      }
    }
    this.height = this.ymax - this.ymin + 1;
    this.width = this.xmax - this.xmin + 1;

    this.can = make("canvas");
    this.can.height = this.height;
    this.can.width = this.width;
    this.ctx = this.can.getContext("2d");
    this.ctx.imageSmoothingEnabled=false;
    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = this.alpha;

    this.ctx.beginPath();
    this.ctx.moveTo(this.xy[0]-this.xmin, this.xy[1]-this.ymin);
    for (var i=2; i<this.xy.length; i=i+2) {
      this.ctx.lineTo(this.xy[i]-this.xmin, this.xy[i+1]-this.ymin);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /** @constructor */
  function Hotzone(overlay, color, action, value, tip) {
    this.overlay = overlay;
    this.color = color;
    this.action = action;
    this.value = value;
    this.tip = tip;
  }


  /** @constructor */
  function Hotspot(x, y, w, h, pan, action, value, overlay, tip) {
    this.x0= x;
    this.y0= y;
    this.icon = null;
    this.isIcon = false;
    if (w == "icon") {
      this.icon = new Image();
      this.icon.hotspot = this;
      isIconHotspot = true;
      this.icon.onload = function(eimg) {
        this.gotit = true;
        this.hotspot.x1 = this.hotspot.x0+this.width;
        this.hotspot.y1 = this.hotspot.y0+this.height;
        this.hotspot.width = this.width;
        this.hotspot.height = this.height;
        this.hotspot.w2 = this.width / 2;
        this.hotspot.h2 = this.height / 2;
        this.hotspot.isIcon = true;
      }

      this.x1 = -1;
      this.y1 = -1;
      this.icon.gotit = false;
      this.icon.src = h.trim();

    } else {
      this.width = parseInt(w,10);
      this.height = parseInt(h,10);
      this.x1 = this.width+x;
      this.y1 = this.height+y;
      this.w2 = this.width/2; 
      this.h2 = this.height/2;
    }

    this.pan = pan;
    this.isPan = false;
    if (this.pan === "pan") this.isPan = true;
    this.action = action;
    this.value = value;
    this.overlay = overlay;
    this.tip = tip;
  }

  this.drag = function(e) {

    xScreen = pointer.getX();
    yScreen = pointer.getY();
    xLoc = xScreen * canXScale;
    yLoc = yScreen * canYScale;

    showTip = false;

    showDistance = false;
    if (doDistance && ( !distShift || (distShift && e.shiftKey) ) ) {
      x1Dist = xLoc;
      y1Dist = yLoc;
      showDistance = true;
      drawLines();
      return;
    }

    if (enableZooming && (zoomYFactor != zoomYBase)) {

      xMove = (xImage*zoomXFactor - xLoc)/zoomXFactor;
      yMove = (yImage*zoomYFactor - yLoc)/zoomYFactor;

      if (xMove < 0) xMove = 0;
      if (yMove < hideTop) yMove = hideTop;
      if (xMove + wImage > imgWidth) xMove = imgWidth - wImage;
      if (yMove + hImage > (imgHeight-hideBottom)) yMove = imgHeight - hideBottom- hImage;
      xMove = Math.round(xMove);
      yMove = Math.round(yMove);
      xImage = Math.round(xMove + xLoc/zoomXFactor);
      yImage = Math.round(yMove + yLoc/zoomYFactor);

    } else if (!isExtrap && doHoverzones) {
      hoverPick = null;
      if (okToShowHoverzones) {
        if (xLoc >= 0 && yLoc >= 0) {
          rgb = ctxh.getImageData(xLoc,yLoc,1,1).data;
          if (rgb[3] != 0) {
            hoverPick = hoverzones[rgb[3]-1];
          }
        }
      }
    }

    isDragging = true;
    drawIt();
    drawLines();
  }

  var setHiResZoomIndex = function() {
    if (!doingHiResZoom) return;
    hiResZoomIndex = -1;
    for (var i=0; i<hiResZoomLevel.length; i++) {
      if (zoomXFactor >= hiResZoomLevel[i]) {
        hiResZoomIndex = i;
      }
    }
  }

  var doAction = function(item, type) {
    if (item.action == "popup") {
      if (popupWindow != null) popupWindow.close();
        popupWindow =
        window.open("","HAniSPopup","scrollbars=yes,width="+popupWinWidth+",height="+popupWinHeight);
        popupWindow.document.write(popupDiv+item.value+"</div>");
        
      } else if (item.action == "link") {
        window.open(item.value,"_blank","");

      } else if (item.action == "fof") {
        imageBase = configImageBase;
        HAniS.resetZoom();
        HAniS.newFOF(item.value);
        clearOverlays(type);
      }
  }

  this.resetZoom = function() {

    zoomXFactor = zoomXBase;
    zoomYFactor = zoomYBase;

    if (zoom != null) {
      zoom.innerHTML = zoom.label_on;
      enableZooming = false;
    }

    xImage = xLoc;
    yImage = yLoc;
    xMove = 0;
    yMove = 0;
    hImage = imgHeight;
    wImage = imgWidth;
    setHiResZoomIndex();
    drawIt();

    if (gotHoverzones) {
      doHoverzones = true;
    }
  }

  this.canTip = function() {
    var i;
    showTip = false;
    xScreen = pointer.getX();
    xLoc = xScreen * canXScale;
    yScreen = pointer.getY();
    yLoc = yScreen * canYScale;

    if (isExtrap && yLoc < extrapHbeg && xLoc > extrapXbeg) {
      return;
    }

    xImage = Math.round(xMove + xLoc/zoomXFactor);
    yImage = Math.round(yMove + yLoc/zoomYFactor);

    if (numHotzones != 0) {
      for (i=0; i<numHotzones; i++) {
        if (hotzones[i].overlay >= numOverlays ) {
          info(" Error...hotzone overlay # "+hotzones[i].overlay+" > number of overlays = "+numOverlays);
          continue;
        }
        
        if (overlayCheck[hotzones[i].overlay].checked) {
          ctx1.clearRect(0,0,1,1);
          ctx1.drawImage(overlayImages[curFrame][hotzones[i].overlay],
                      xImage,yImage,1,1,0,0,1,1);
          rgb = ctx1.getImageData(0,0,1,1).data;
          rgbpack = (rgb[0]<<16) + (rgb[1]<<8) + rgb[2];

          if (rgbpack == hotzones[i].color) {
            showTip = true;
            tipX = xScreen;
            tipY = yScreen;
            tipText = hotzones[i].tip;
            break;
          }
        }
      }
    }

    if (numHotspots != 0) {
      var x,y, hit, hsi;
      for (i=0; i<numHotspots; i++) {
        hsi = hotspots[i];
        if (hsi.overlay != -1 &&
               !overlayCheck[hsi.overlay].checked) continue; 

        hit = false;
        if (hsi.isPan) {
          if (hsi.isIcon) {
            x = (hsi.x0 - xMove)*zoomXFactor - hsi.w2;
            y = (hsi.y0 - yMove)*zoomYFactor - hsi.h2;
            if (xLoc > x && xLoc < x+hsi.width &&
                yLoc > y && yLoc < y+hsi.height) {
                  hit = true;
            }
          } else {
            x = (hsi.x0 - xMove)*zoomXFactor;
            y = (hsi.y0 - yMove)*zoomYFactor;
            if (xLoc > x && xLoc < x+hsi.width*zoomXFactor &&
                yLoc > y && yLoc < y+hsi.height*zoomYFactor) {
              hit = true;
            }
          }
        } else {
          if (xLoc > hsi.x0 && xLoc < hsi.x1 &&
                yLoc > hsi.y0 && yLoc < hsi.y1) {
             hit = true;
          }
        }

        if (hit && hsi.tip != null) {
          showTip = true;
          tipX = xScreen;
          tipY = yScreen;
          tipText = hotspots[i].tip;
          break;
        }
      }
    }
    drawLines();
  }

  this.move = function() {
    if (!isExtrap && doHoverzones) {
      hoverPick = null;
      if (okToShowHoverzones) {
        var x = pointer.getX() * canXScale;
        var y = pointer.getY() * canYScale;
        if (x >= 0 && y >= 0) {
          rgb = ctxh.getImageData(x,y,1,1).data;
          if (rgb[3] != 0) {
            hoverPick = hoverzones[rgb[3] - 1];
          }
        }
      }
    }
    if (isExtrap && extrapMode >= 2) {
      xScreen = pointer.getX();
      xLoc = xScreen * canXScale;
      yScreen = pointer.getY();
      yLoc = yScreen * canYScale;
    }
    drawLines();
  }


  this.down = function() {
    if (showTip) {
      showTip = false;
      drawLines();
    }

    xScreen = pointer.getX();
    xLoc = xScreen * canXScale;
    yScreen = pointer.getY();
    yLoc = yScreen * canYScale;

    x0Dist = xLoc;
    y0Dist = yLoc;
    x1Dist = x0Dist;
    y1Dist = y0Dist;
    xImage = Math.round(xMove + xLoc/zoomXFactor);
    yImage = Math.round(yMove + yLoc/zoomYFactor);
    isDragging = false;
    isDown = true;
  }

  this.up = function(e) {
    showTip = false;
    isDown = false;

    if (isExtrap) {
      xScreen = pointer.getX();
      xLoc = xScreen * canXScale;
      yScreen = pointer.getY();
      yLoc = yScreen * canYScale;

      if (extrapMode < 3) {
        extrapX[extrapMode] = xLoc;
        extrapY[extrapMode] = yLoc;
        extrapT[extrapMode] = minutes[curFrame];
        if (extrapMode == 0) {
          extrapMode = 1;
          setCurrentFrame(numFrames - 1);
          exMsg = 1;
          dirspdLabel = null;

        } else {
          dt = extrapT[1] - extrapT[0];
          dxdt = (extrapX[1] - extrapX[0]) / dt;
          dydt = (extrapY[1] - extrapY[0]) / dt;

          if (dirspdBox != null && distXScale != null) {
            var ddx = dxdt * distXScale;
            var ddy = dydt * distYScale;
            var speed = Math.round(Math.sqrt(ddx*ddx + ddy*ddy) * 60.);
            var dir = Math.atan2(ddx, -ddy)/.0174533;
            if (dir < 0.0) dir = dir + 360.;
            dirspdLabel = dirspdPrefix+compass[Math.round(dir/22.5)]+" at "+speed+" "+dirspdSuffix;

            dirspdX = extrapX[0];
            dirspdY = (dydt > 0) ? extrapY[0] - 15 : extrapY[0] + 30;
          }


          var timeFontSize = parseInt(timeFont,10);

          nmin= Math.round(Math.abs((timeFontSize+4)*4/dxdt));  // ap rox 14pt x 4 digits
          tmin= Math.round(Math.abs((timeFontSize+4)*2/dydt));  // ap rox 14pt x 2 height
          if (tmin < nmin) nmin = tmin;

          if (nmin > 120) {
            nmin = 120*Math.floor(nmin/120)+60;
          } else if (nmin > 90) {
            nmin = 120;
          } else if (nmin > 60) {
            nmin = 90;
          } else if (nmin > 30) {
            nmin = 60;
          } else if (nmin > 15) {
            nmin = 30;
          } else if (nmin > 10) {
            nmin = 15;
          } else if (nmin > 5) {
            nmin = 10;
          } else if (nmin > 2) {
            nmin = 5;
          } else {
            if (nmin == 0) nmin = 1;
          }

          tmin = (extrapT[1]/nmin*nmin) + nmin;

          exsign = 1;
          if (toFrom) exsign = -1;
          xInc = dxdt * nmin;
          yInc = dydt * nmin;

          setCurrentFrame(numFrames - 1);
          extrapMode = 3; 
          exMsg = 2;
        }

      } else if (yLoc < extrapHbeg && xLoc > extrapXbeg) {

        if (extrapMode == 3) {
          initExtrap();
          drawLines();
          return;
        }

      }
      drawLines();

    }

    if (showDistance) {
      showDistance = false;
      drawLines();
      return;

    } else {
      if (distance != null && enableZooming) {
        doDistance = false;
        distance.innerHTML = distance.label_on;
      }

    }

    if (isDragging) {
      isDragging = false;
      return;
    }

    if (e.altKey) {
      HAniS.resetZoom();
      return;
    }

    if (doHoverzones && hoverPick != null && showedHover) {
      doAction(hoverPick, "z");
      return;
    }

    xScreen = pointer.getX();
    xLoc = xScreen * canXScale;
    yScreen = pointer.getY();
    yLoc = yScreen * canYScale;

    if (numHotzones != 0) {
      for (var i=0; i<numHotzones; i++) {
        if (hotzones[i].overlay >= numOverlays ) {
          info(" Error...hotzone overlay # "+hotzones[i].overlay+" > number of overlays = "+numOverlays);
          continue;
        }
        
        if (overlayCheck[hotzones[i].overlay].checked) {
          ctx1.clearRect(0,0,1,1);
          ctx1.drawImage(overlayImages[curFrame][hotzones[i].overlay],Math.floor(xImage),Math.floor(yImage),1,1,0,0,1,1);
          rgb = ctx1.getImageData(0,0,1,1).data;
          rgbpack = (rgb[0]<<16) + (rgb[1]<<8) + rgb[2];

          if (rgbpack == hotzones[i].color) {
            doAction(hotzones[i], "z");
            return;
          }
        }
      }

    } 
    
    if (numHotspots != 0) {
      var x,y, hit, hsi;
      for (var i=0; i<numHotspots; i++) {
        hsi = hotspots[i];
        if (hsi.overlay != -1 &&
               !overlayCheck[hsi.overlay].checked) continue; 

        hit = false;
        if (hsi.isPan) {
          if (hsi.isIcon) {
            x = (hsi.x0 - xMove)*zoomXFactor - hsi.w2;
            y = (hsi.y0 - yMove)*zoomYFactor - hsi.h2;
            if (xLoc > x && xLoc < x+hsi.width &&
                yLoc > y && yLoc < y+hsi.height) {
                  hit = true;
            }
          } else {
            x = (hsi.x0 - xMove)*zoomXFactor;
            y = (hsi.y0 - yMove)*zoomYFactor;
            if (xLoc > x && xLoc < x+hsi.width*zoomXFactor &&
                yLoc > y && yLoc < y+hsi.height*zoomYFactor) {
              hit = true;
            }
          }
        } else {
          if (xLoc > hsi.x0 && xLoc < hsi.x1 &&
                yLoc > hsi.y0 && yLoc < hsi.y1) {
             hit = true;
          }
        }
        if (hit) {
           doAction(hotspots[i], "s");
           return;
        }
      }
    }

    if (enableZooming) {
      doHoverzones = false;
      if (e.ctrlKey) {
        zoomXFactor = zoomXFactor - 0.1 * zoomScale;
        zoomYFactor = zoomYFactor - 0.1 * zoomScale;

      } else {
        zoomXFactor = zoomXFactor + 0.1 * zoomScale;
        zoomYFactor = zoomYFactor + 0.1 * zoomScale;
        if (zoomXFactor > zoomFactorMax) zoomXFactor = zoomFactorMax;
        if (zoomYFactor > zoomFactorMax) zoomYFactor = zoomFactorMax;
      }

      if (zoomXFactor < zoomXBase || zoomYFactor < zoomYBase) {
        zoomXFactor = zoomXBase;
        zoomYFactor = zoomYBase;
        xImage = xLoc;
        yImage = yLoc;
        xMove = 0;
        yMove = 0;
        hImage = imgHeight;
        wImage = imgWidth;
        hideBottom = 0;
        hideTop = 0;

      } else {
        xMove = (xImage*zoomXFactor - xLoc)/zoomXFactor;
        yMove = (yImage*zoomYFactor - yLoc)/zoomYFactor;
        hImage = Math.floor(imgHeight / zoomYFactor);
        if (yMove + hImage > (imgHeight-hideBottom)) yMove = imgHeight - hideBottom- hImage;
        wImage = Math.floor(imgWidth / zoomXFactor);
        yMove = Math.round(yMove);
        xMove = Math.round(xMove);
        hideBottom = hideBottomDef;
        hideTop = hideTopDef;
      }
      setHiResZoomIndex();
    }
    drawIt();
    drawLines();
  }

  this.toggleAutoRefresh = function() {
    if (isAutoRefresh) {
      autotoggle.innerHTML = autotoggle.label_off;
      if (refreshTimer != null) clearInterval(refreshTimer);
      isAutoRefresh = false;
    } else {
      autotoggle.innerHTML = autotoggle.label_on;
      refreshTimer = setInterval("HAniS.reloadFOF();",autoRefresh);
      isAutoRefresh = true;
    }
  }

  this.toggleLoopRock = function() {
    if (isRocking) {
      if (looprock != null) {
        looprock.innerHTML = looprock.label_on;
        looprock.className = "looprock rock";
      }
      isRocking = false;
    } else {
      if (looprock != null) {
        looprock.innerHTML = looprock.label_off;
        looprock.className = "looprock loop";
      }
      isRocking = true;
    }
  }

  this.toggleExtrap = function() {
    if (isExtrap) {
      if (extrap != null) {
        extrap.innerHTML = extrap.label_on;
        divall.style.cursor = "default";
        if (startstop != null) startstop.disabled = false;
        setIsLooping(wasLooping);
        extrapMode = -1;
      }
      isExtrap = false;
      drawLines();
    } else {
      if (extrap != null) {
        isExtrap = true;
        dirspdLabel = null;
        divall.style.cursor = "crosshair";
        extrap.innerHTML = extrap.label_off;
        wasLooping = isLooping;
        if (startstop != null) startstop.disabled = true;
        isLooping = false;
        HAniS.resetZoom();
        initExtrap();
        drawLines();
      }
      drawIt();
    }
  }

  var initExtrap = function() {
    exMsg = 0;
    extrapX = new Array(2);
    extrapY = new Array(2);
    extrapT = new Array(2);
    extrapMode = 0;
    dirspdLabel = null;
    setCurrentFrame(0);
  }

  var setIsLooping = function(r) {
    isLooping = !r;
    HAniS.toggleIsLooping();
  }

  this.doEnhance = function(e) {
    if (!isBaseEnh && !isOverlayEnh) return;
    var h = enhCan[0].height;
    var w = enhCan[0].width;
    var t = parseInt(enhance.value,10);
    var odk, tr, tg, tb, ta;
    if (t >= 0) {
      tr = tabR[t];
      tg = tabG[t];
      tb = tabB[t];
      ta = tabA[t];
      overlayProbe[overlayEnhNum] = t;
    }
    var sd = h * w * 4;
    for (var i=0; i<origCan.length; i++) {
      if (enhCan[i].gotit) {
        enhCan[i].gotit = false;
        var ed = enhID[i].data;
        var od = origIDd[i];
        if (t < 0) {
          for (var k=0; k<sd; k=k+4) {
            ed[k] = od[k]
            ed[k+1] = od[k+1];
            ed[k+2] = od[k+2];
            ed[k+3] = od[k+3];
          }
        } else {
          for (var k=0; k<sd; k=k+4) {
            odk = od[k];
            if (odk === od[k+1] && odk === od[k+2]) {
              ed[k] = tr[odk];
              ed[k+1] = tg[odk];
              ed[k+2] = tb[odk];
              ed[k+3] = ta[odk];
            }
          }
        }
        ctxe[i].putImageData(enhID[i],0,0);
        enhCan[i].gotit = true;
      }
    }
  }

  this.overClick = function(e) {
    var i;
    if (e.target.checked) {
      for (i=0; i<overlayCheck.length; i++) {
        if (e.target == overlayCheck[i]) continue;
        if (e.target.name != 0 && e.target.name == overlayCheck[i].name) {
          overlayCheck[i].checked = false;
        }
      }
    }

    okToShowHoverzones = true;
    for (i=0; i<overlayLinks.length; i++) {
      if (e.target != overlayCheck[i]) {
        resetLinks(i);
      }
      if (allowHoverzones != null && 
        (!allowHoverzones[i] && overlayCheck[i].checked)) okToShowHoverzones = false;

      if (enhance != null) {
        if (i == overlayEnhNum) {
          enhance.disabled = !overlayCheck[i].checked;
        }
      }
    }
    drawIt();
  }

  this.toggleIsLooping = function() {
    if (isLooping) {
      isLooping = false;
      if (startstop != null) {
        startstop.className = "startstop start";
        startstop.innerHTML = startstop.label_on;
      }
    } else {
      isLooping = true;
      if (startstop != null) {
        startstop.className = "startstop stop";
        startstop.innerHTML = startstop.label_off;
      }
    }
  }


  this.toggleZooming = function() {
    if (enableZooming) {
      HAniS.resetZoom();
      zoom.className = "zoom off";
    } else {
      zoom.innerHTML = zoom.label_off;
      zoom.className = "zoom on";
      enableZooming = true;
      if (distance != null) {
        doDistance = false;
        distance.innerHTML = distance.label_on;
      }
      doHoverzones = false;
      if (isExtrap) HAniS.toggleExtrap();
    }
  }

  var setToggleState = function(n,s) {
    toggleFrames[n] = s;
    if (!useToggle) return;
    var x = togstart + n*(wTog + spTog);
    var c = togColorSel;
    if (s == 0) {
      c = togColorOn;
    } else if (s == -1) {
      c = togColorOff;
    }
    ctxtog.fillStyle = c;
    ctxtog.fillRect(x,hTog/2, wTog, hTog);
  }

  this.togclick = function(e) {
    var x = togPointer.getX();
    var y = togPointer.getY();
    var xf = togstart;
    for (var i=0; i<toggleFrames.length; i++) {
      if (x > xf && x<xf + wTog) {
        // found it!
        var s = 0;
        if (toggleFrames[i] >= 0) s = -1;
        setToggleState(i, s);
        break;
      }
      xf = xf + wTog + spTog;
    }
  }

  var makeToggles = function(n) {
    if (useToggle) {
      cantog.width = canW;
      togstart = canW/2 - n*(wTog+spTog)/2;
    }
    for (var i=0; i<n; i++) {
      if (toggleDefs != null && toggleDefs[i].toLowerCase().trim() == "n") {
        setToggleState(i,-1);
      } else {
        setToggleState(i,0);

      }
    }

  }

  var setCurrentFrame = function(n) {
    setToggleState(curFrame,0);
    curFrame = n;
    setToggleState(curFrame,1);
    if (frameLabelField != null && frameLabels != null && 
                               frameLabels[curFrame] != null) {
      frameLabelField.innerHTML = frameLabels[curFrame];
    }
  }

  var incCurrentFrame = function(direct) {
    setToggleState(curFrame,0);
    var n = direct;
    do {
      if (n > 0) {
        curFrame = curFrame + 1;
        if (curFrame >= numFrames) {
          if (isRocking) {
            curFrame = numFrames - 1;
            direction = -direction;
          } else {
            curFrame = 0;
          }

        }
      } else {
        curFrame = curFrame - 1;
        if (curFrame < 0) {
          if (isRocking) {
            curFrame = 0;
            direction = -direction;
          } else {
            curFrame = numFrames - 1;
          }
        }
      }
      n = direction;
    } while (toggleFrames[curFrame] < 0);

    setToggleState(curFrame,1);
    if (frameLabelField != null && frameLabels != null && 
                               frameLabels[curFrame] != null) {
      frameLabelField.innerHTML = frameLabels[curFrame];
    }
  }

  /** @constructor */
  function TextBox(bg, fg, font, scolor, sblur, sx, sy) {
    this.bg = bg;
    if (bg != null && this.bg.indexOf("0x") == 0) {
      this.bg = "#"+this.bg.substring(2);
    }
    this.fg = fg;
    if (fg != null && this.fg.indexOf("0x") == 0) {
      this.fg = "#"+this.fg.substring(2);
    }
    this.font = font;
    this.fontHeight = Math.round(1.1 * parseInt(font,10));
    this.scolor = scolor;
    if (scolor != null && this.scolor.indexOf("0x") == 0) {
      this.scolor = "#"+this.scolor.substring(2);
    }
    this.sblur = sblur;
    this.sxoff = sx;
    this.syoff = sy;
  }

  var drawText = function(box, x, y, text, lcr) {
    ctxd.globalAlpha = 1.0;
    ctxd.font = box.font;
    var fh = box.fontHeight;
    var yp = y - fh - 6;
    var zp = ctxd.measureText(text).width;
    var xp = x;
    if (lcr == 1) xp = xp - zp;
    if (lcr == 0) xp = xp - zp/2;

    if (xp < 5) xp = 5;
    if (yp < 5) yp = 5;
    if (yp + fh + 3 > canH) 
             yp = canH - fh - 6;
    if (xp + 3 + zp > canW) xp = canW - zp - 6;

    ctxd.save();
    ctxd.beginPath();
    ctxd.fillStyle = box.bg;
    if (box.scolor != null) {
      ctxd.shadowColor = box.scolor;
      ctxd.shadowBlur = box.sblur;
      ctxd.shadowOffsetX = box.sxoff;
      ctxd.shadowOffsetY = box.syoff;
    }
    xText = xp - 3;
    yText = yp;
    wText = zp + 6;
    hText = fh + 6;

    ctxd.fillRect(xText,  yText, wText, hText);
    ctxd.closePath();
    ctxd.restore();

    ctxd.textBaseline = "bottom";
    ctxd.fillStyle = box.fg;
    ctxd.fillText(text, xp, yp + fh + 3);
  }

  var drawLines = function() {

    ctxd.clearRect(0,0,canW,canH);  // erase
    showedHover = false;

    if (isExtrap) {
      var pp = 15;
      ctxd.beginPath();
      ctxd.lineWidth = 2;
      ctxd.strokeStyle = "white";
      var ir = extrapMode;
      if (ir > 1) ir = 2;
      for (var i=0; i<ir; i++) {
        if (extrapMode > 1) {
          ctxd.moveTo(extrapX[0], extrapY[0]);
          ctxd.lineTo(extrapX[1], extrapY[1]);
        }
        ctxd.moveTo(extrapX[i] - pp, extrapY[i]);
        ctxd.lineTo(extrapX[i] + pp, extrapY[i]);
        ctxd.moveTo(extrapX[i], extrapY[i] - pp);
        ctxd.lineTo(extrapX[i], extrapY[i] + pp);
      }

      ctxd.closePath();
      ctxd.stroke();

      if (extrapMode == 3) {

        var x = xScreen;
        var y = yScreen;

        ctxd.moveTo(x,y);
        ctxd.fillStyle = timeColor;

        ctxd.fillRect(x-2, y-2, 5, 5);

        var accumTime = tmin;
        var endX = Math.round(x + exsign*(dxdt*(tmin - extrapT[1])));
        var endY = Math.round(y + exsign*(dydt*(tmin - extrapT[1])));

         // fillRect(x-2,y-2,5,5)

        for (var gasp=0; gasp < 300; gasp++) {

           ctxd.beginPath();
           ctxd.lineWidth = 1;
           ctxd.strokeStyle = timeColor;
           ctxd.moveTo(x,y);
           ctxd.lineTo(endX, endY);
           ctxd.stroke();
           ctxd.beginPath();
           ctxd.lineWidth = 3;
           ctxd.rect(endX-2, endY-2, 5,5);
           ctxd.stroke();

           if (endX < 3 || (endX+3) > canW ||
               endY < 3 || (endY+3) > canH) break;

           var hm = startingMinute + accumTime;
           hm = 100*Math.floor(hm/60) + (hm % 60);
           hm = hm % 2400;

           var shm;
           if (extrapAMPM) {

             var hampm= "AM";
             if (hm >= 1200) {
               if (hm >= 1300) hm = hm - 1200;
               hampm = "PM";
             } else if (hm < 100) {
               hm = hm + 1200;
             }
             shm = Math.floor(hm/100) +":"+ Math.floor(Math.floor(hm % 100)/10) + Math.floor(hm % 10) + " "+hampm;

           } else {
             shm = hm+" ";
             if (hm < 1000) shm = "0"+hm;
             if (hm < 100) shm = "00"+hm;
             if (hm < 10) shm = "000"+hm;
           }

           // here we draw the time label.....
           //background = timeBack
           // foreground = timeColor;
           // "timeFontSize" and timeFontWeight....
           // lab.text = StringUtil.trim(shm+" "+tzLabel);

           var rot = 0.0;
           if (Math.abs(yInc) < (timeFontSize+5)) {
             rot = 45.*.0174533;
           }

           var yb = endY;
           if (xInc * yInc < 0 && rot == 0) {
             yb = endY + timeFontSize;
           }
           ctxd.font = timeFont;
           shm = shm + " " + tzLabel;
           var zp = ctxd.measureText(shm).width;
           ctxd.fillStyle = timeBack;

           if (rot === 0.0) {
             ctxd.fillRect(endX+2, yb - timeFontSize-2 + rot, zp+4, timeFontSize+3);
             ctxd.fillStyle = timeColor;
             ctxd.textBaseline = "bottom";
             ctxd.fillText(shm, endX+5, yb);
           } else {

             ctxd.save();
             ctxd.translate(endX+5,endY);
             ctxd.rotate(rot);
             ctxd.fillRect(2, -2, zp+4, timeFontSize+3);
             ctxd.fillStyle = timeColor;
             ctxd.textBaseline = "bottom";
             ctxd.fillText(shm, 5, timeFontSize);
             ctxd.restore();
           }

           x = endX;
           y = endY;
           endX = Math.round(x + exsign*xInc);
           endY = Math.round(y + exsign*yInc);
           accumTime = accumTime + nmin;
         }

       }

       if (dirspdLabel != null) {
         drawText(dirspdBox, dirspdX, dirspdY, dirspdLabel, 0);
       }
       drawText(extrapTB, 999, 10, extrapPrompts[exMsg], 0);
       extrapXbeg = xText;
       extrapHbeg = hText;
    }

    if (showDistance) {
      
      var dx = distXScale *(x0Dist - x1Dist)/zoomXFactor;
      var dy = distYScale *(y0Dist - y1Dist)/zoomYFactor;
      var distVal = " "+(Math.sqrt(dx*dx + dy*dy)).toFixed(distDigits)+" "+distUnit+" ";

      drawText(distBox, x1Dist/canXScale, y1Dist/canYScale, distVal, -1);

      ctxd.beginPath();
      ctxd.strokeStyle = distLineColor;
      ctxd.lineWidth = 3;
      ctxd.moveTo(x0Dist/canXScale, y0Dist/canYScale);
      ctxd.lineTo(x1Dist/canXScale, y1Dist/canYScale);
      ctxd.stroke();
      ctxd.closePath();
    }

    if (showTip) {
      drawText(tipBox, tipX, tipY, tipText, -1);
    }

    if (showProbe || showLocation) {
      xScreen = pointer.getX();
      xLoc = xScreen * canXScale;
      yScreen = pointer.getY();
      yLoc = yScreen * canYScale;

      if (xLoc >= 0 && yLoc >= 0) {
        xImage = (xMove + xLoc/zoomXFactor);
        yImage = (yMove + yLoc/zoomYFactor);

        if (showLocation) {
          if (locTran != null) {
            locll = locTran.toLatLon(xImage, yImage);
          } else {
            locll[0] = loc0 + (loc2 - loc0)*yImage/imgHeight;
            locll[1] = loc1 + (loc3 - loc1)*xImage/imgWidth;
          }
          llstr = locLatPrefix + locll[0].toFixed(locDigits)+"  "+ locLonPrefix+locll[1].toFixed(locDigits);
          var ypos = yScreen;
          if (showDistance || showTip) ypos = yScreen + locBox.fontHeight+6;
          drawText(locBox, xScreen+10, ypos, llstr, -1);
        }

        if (showProbe) {
          xImage = Math.round(xImage);
          yImage = Math.round(yImage);
          for (var k=0; k<numOverlays; k++) {
            if (overlayImages[curFrame][k].gotit && 
                overlayCheck[k].checked && (k == overlayEnhNum ||
                (overlayProbe[k] != null && overlayProbe[k] >= 0))) {

              ctx1.clearRect(0,0,1,1);
              if (k == overlayEnhNum) {
                ctx1.drawImage(origCan[curFrame],xImage,yImage,1,1,0,0,1,1);
              } else {
                ctx1.drawImage(overlayImages[curFrame][k],xImage,yImage,1,1,0,0,1,1);
              }
              rgb = ctx1.getImageData(0,0,1,1).data;

              minDiff = 999;
              tn = overlayProbe[k];
              var value = probeUndef;

              if (rgb[3] == 0) {
                value = tabMissing[tn];
                
              } else {
                if (k == overlayEnhNum) {
                  diffPct = 0.0;
                  diffInx = rgb[0];
                  minDiff = 0;
                } else {

                  for (var i=0; i<tabVal[tn].length-1; i++) {

                    drgb[0] = (rgb[0] - tabR[tn][i]);
                    if (drgb[0]*(tabR[tn][i+1] - rgb[0]-1) < 0) continue;

                    drgb[1] = (rgb[1] - tabG[tn][i]);
                    if (drgb[1]*(tabG[tn][i+1] - rgb[1]-1) < 0) continue;

                    drgb[2] = (rgb[2] - tabB[tn][i])
                    if (drgb[2]*(tabB[tn][i+1] - rgb[2]-1) < 0) continue;

                    minx = tabInx[tn][i];
                    pct = drgb[minx]/tabDif[tn][i][minx];

                    diff = 
                     Math.abs(drgb[m1[minx]] - pct*tabDif[tn][i][m1[minx]])+ 
                     Math.abs(drgb[m2[minx]] - pct*tabDif[tn][i][m2[minx]]);

                     if (diff < minDiff) {
                       diffInx = i;
                       minDiff = diff;
                       diffPct = pct;
                     }

                  }
                }

                if (minDiff < 999) {
                  value = tabPrefix[tn][diffInx];
                  if (tabDecimal[tn][diffInx] != -1) {
                    var dbzz = tabVal[tn][diffInx] + 
                      diffPct*(tabVal[tn][diffInx+1] - tabVal[tn][diffInx]);
                    value = value+" "+ dbzz.toFixed(tabDecimal[tn][diffInx])+
                            " "+tabUnit[tn][diffInx];
                  }
                }  else if (probeTest > 1) {
                  for (var i=0; i<tabVal[tn].length-1; i++) {
                    if (Math.abs(rgb[0] - tabR[tn][i]) < probeTest &&
                        Math.abs(rgb[1] - tabG[tn][i]) < probeTest &&
                        Math.abs(rgb[2] - tabB[tn][i]) < probeTest) {
                          
                      value = tabPrefix[tn][i];
                      if (tabDecimal[tn][i] != -1) {
                        value = value+" "+ 
                          tabVal[tn][i].toFixed(tabDecimal[tn][i])+ " "+
                             tabUnit[tn][i];
                      }
                      break;
                    }
                  }
                  info("RGB err: R="+rgb[0]+" G="+rgb[1]+" B="+rgb[2]);
                }
              }

              drawText(probeBox, xScreen-10, yScreen, value, 1);
        
            }
          }
        }
      }
    }

    if (doHoverzones && !isExtrap && !doDistance && !showProbe) {
      if (hoverPick == null) return;
      ctxd.drawImage(hoverPick.can, 0, 0, hoverPick.width,
      hoverPick.height, hoverPick.xmin/canXScale,
      hoverPick.ymin/canYScale, hoverPick.width/canXScale,
      hoverPick.height/canYScale);

      var xx = (hoverPick.xmin + hoverPick.xmax)/2
      var yy = (hoverPick.ymin + hoverPick.ymax)/2
      drawText(tipBox, xx/canXScale, yy/canYScale, hoverPick.tip, 0);
      showedHover = true;
    }

  }

  var drawIt = function() {
    var i;
    if (!gotImages) return;
    try {
      ctx.clearRect(0,0,canW, canH);

      ctx.globalAlpha = 1.0;
      if (doingHiResZoom && hiResBase != null && hiResZoomIndex >= 0 && hiResBase[hiResZoomIndex].gotit) {
         ctx.drawImage(hiResBase[hiResZoomIndex],xMove*hiResZoomLevel[hiResZoomIndex],yMove*hiResZoomLevel[hiResZoomIndex],wImage*hiResZoomLevel[hiResZoomIndex],hImage*hiResZoomLevel[hiResZoomIndex],0,0,canW, canH);

      } else {
        if (backImages[curFrame].gotit) {
           ctx.drawImage(backImages[curFrame],xMove,yMove,wImage,hImage,0,0,canW, canH);
         }

        if (preserveBackPoints != null) {
          ctx.globalAlpha = 1.0;
          if (backImages[curFrame].gotit) {
            for (var ii = 0; ii < preserveBackPoints.length; ii=ii+4) {
              ctx.drawImage(backImages[curFrame],
                preserveBackPoints[ii], preserveBackPoints[ii+1], 
                  preserveBackPoints[ii+2], preserveBackPoints[ii+3],
                  preserveBackPoints[ii], preserveBackPoints[ii+1], 
                  preserveBackPoints[ii+2], preserveBackPoints[ii+3]);
            }
          }
        }
      }


      if (numOverlays > 0) {
        for (var ii=0; ii<numOverlays; ii++) {
          i = (overlayOrder != null) ? overlayOrder[ii] : ii;
          if (overlayCheck[i].checked) {
            if (doingHiResZoom && hiResOlay != null && hiResZoomIndex >= 0 &&
                    hiResOlay[hiResZoomIndex].gotit && hiResOlayIndex == i) {
                ctx.drawImage(hiResOlay[hiResZoomIndex],xMove*hiResZoomLevel[hiResZoomIndex],yMove*hiResZoomLevel[hiResZoomIndex],wImage*hiResZoomLevel[hiResZoomIndex],hImage*hiResZoomLevel[hiResZoomIndex],0,0,canW, canH); 

            } else {
              if (overlayImages[curFrame][i].gotit) {
                if (overlayAlpha != null) ctx.globalAlpha = overlayAlpha[i];
                if (olayZoomIndex == null || olayZoomIndex[i] === 1) {
                  ctx.drawImage(overlayImages[curFrame][i],xMove,yMove,wImage,hImage,0,0,canW, canH); 
                } else if (olayZoomIndex[i] === 0) {
                  ctx.drawImage(overlayImages[curFrame][i],0,0, imgWidth, imgHeight, 0, 0, canW, canH);
                }
              }
              
            }
          }
        }

        if (preserveIndex != null) {
          ctx.globalAlpha = 1.0;
          for (var ii=0; ii<numOverlays; ii++) {
            i = (overlayOrder != null) ? overlayOrder[ii] : ii;
            if (overlayImages[curFrame][i].gotit && 
                     overlayCheck[i].checked && preserveIndex[i]) {
                ctx.drawImage(overlayImages[curFrame][i],
                preservePoints[i][0], preservePoints[i][1], 
                preservePoints[i][2], preservePoints[i][3],
                preservePoints[i][0], preservePoints[i][1], 
                preservePoints[i][2], preservePoints[i][3]);
            }
          }
        }

        if (showProbe) drawLines();
      }

      if (useProgress) drawProgress();

      if (isIconHotspot) {
        ctx.globalAlpha = 1.0;
        var hsi;
        for (i=0; i<numHotspots; i++) {
          hsi = hotspots[i];
          if (hsi.icon != null) {
            if (hsi.icon.gotit) {
              if (hsi.isPan) {
              ctx.drawImage(hsi.icon,  
                   0,0, hsi.width, hsi.height,
                   ((hsi.x0 - xMove )*zoomXFactor - hsi.w2)/canXScale, 
                   ((hsi.y0 - yMove )*zoomYFactor - hsi.h2)/canYScale,
                   hsi.width/canXScale,
                   hsi.height/canYScale);
              } else {
              ctx.drawImage(hsi.icon, 0,0, hsi.width, hsi.height,
                   hsi.x0/canXScale, hsi.y0/canYScale, 
                   hsi.width/canXScale, hsi.height/canXScale);
              }
            }
          }
        }
        
      }

    } catch (errx) {
      info("Error:"+errx);
    }
  }

  var drawProgress = function() {
    if (showProgress && imgCount > imgGotCount) {
      ctx.save();
      ctx.fillStyle = "blue";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(progX,progY,200,14);
      ctx.fillRect(progX,progY,200*(imgGotCount / imgCount),14);
      var s = "Loading images";
      var w = ctx.measureText(s).width;
      ctx.fillStyle = "orange";
      ctx.font = "14px arial";
      ctx.fillText(s, progX + 100 - w/2, progY+11);
      ctx.restore();
    } else {
      useProgress = false;
    }
  }

  var info = function(s) {
    if (debug && debugWindow && !debugWindow.closed) {
      try {
      debugWindow.document.write(s+"<br>");
      } catch (err) {
      }
    }
  }


  var run = function() {
      if (isLooping) incCurrentFrame(direction);
      if (curFrame == numFrames-1) {
        delay = lastDwell+dwell;
      } else {
        delay = dwell;
      }
      drawIt();
      setTimeout( function() {
        requestAnimationFrame(run);
      }, delay);

  }

  // The following is for the map projections
  //

  var normalize = function(lon) {
    while (lon < -180) lon += 360;
    while (lon >  180) lon -= 360;
    return(lon);
  }


  /** @constructor */
  function MORhanCylEqualDist() {
    // code derived from NSIDC's mapx library

    var Rg, lon0, u, v, u0, v0, lat, lon, dlon;
    var RAD = Math.PI/180.0;

    // CE, refLon, origLat, origLon, EquatRad, Spacing, xoff, yoff

    this.init = function(st) {
      var a = [];
      for (var i=1; i<st.length; i++) {
        a[i] = parseFloat(st[i]);
      }

      lon0 = a[1];  // refLon;
      Rg = a[4] / a[5];  // EquatRad / Spacing;
      u0 = a[6];  //xoff;
      v0 = a[7];  //yoff;
      var z = this.toXY(a[2], a[3]);
      u0 = z[0];
      v0 = z[1];
    }

    this.toXY = function(lat, lon) {

      dlon = lon - lon0;
      if (lon*lon0 < 0) {  // cross 180
        dlon = lon < 0 ? lon+360.-lon0 : lon-lon0-360.;
      }
      u = Rg*normalize(lon-lon0)*RAD - u0;
      v = -Rg*lat*RAD - v0;
      return [u,v];

    }

    this.toLatLon = function(u, v) {
      lat = -(v+v0)/Rg/RAD;
      lon = normalize((u+u0)/Rg/RAD + lon0);
      return [lat,lon];
    }

  }

  /** @constructor */
  function MORhanPolarStereoEllips() {
    // code derived from NSIDC's mapx library

    var lat1, lon0, x, y, phi, lam, Rg, cos_phi1, sin_phi1,sin_phi0,
    u,v, lat, lon, u0, v0, t1, m1, t, fact, isNorth, e, e2,
    e4, e6, e8,rho, chi, sin2chi, sin4chi, sin6chi,scale; 

    var RAD = Math.PI/180.0;

    // PS, refLat, refLon, origLat, origLon, EquatRad, eccen, Spacing, np, xoff,  yoff

    this.init = function(st) {
      var a = [];
      for (var i=1; i<st.length; i++) {
        a[i] = parseFloat(st[i]);
      }
      lat1 = a[1];
      lon0 = a[2];
      isNorth = (a[8] == 0) ? false : true;

      e = a[6];
      e2 = e*e;
      e4 = e2*e2;
      e6 = e4*e2;
      e8 = e4*e4;

      Rg = a[5] / a[7];
      scale = a[7];

      if (isNorth) {
        cos_phi1 = Math.cos(RAD*lat1);
        sin_phi0 = 1.0; //sin_phi0 = Math.sin(radians(90));
        sin_phi1 = Math.sin(RAD*lat1);
      } else {
        cos_phi1 = Math.cos((-lat1)*RAD);
        sin_phi0 = 1.0; //sin_phi0 = Math.sin(radians(90));
        sin_phi1 = Math.sin((-lat1)*RAD);
      }
      m1 = ((cos_phi1) / Math.sqrt(1.0 - (e2 * sin_phi1 * sin_phi1)));
    
      fact = (1. - e * sin_phi1) / (1. + e * sin_phi1);

      if(isNorth) {
        t1 = Math.tan(Math.PI / 4. - lat1*RAD / 2.) 
            / Math.pow(fact, e / 2.);
      } else {
        t1 = Math.tan(Math.PI / 4. - (-lat1)*RAD / 2.) 
            / Math.pow(fact, e / 2.);
      }

      u0 = a[9];
      v0 = a[10];
      var z = this.toXY(a[3], a[4]);
      u0 = z[0];
      v0 = z[1];
    }

    this.toXY = function(lat, lon) {
      
      if (isNorth) {  
        phi = RAD*lat;
        lam = RAD*(lon - lon0);
      } else {  
        phi = RAD*(-lat);
        lam = RAD*(lon0 - lon);
      }

      fact = (1. - e * Math.sin(phi)) / (1. + e * Math.sin(phi));
      t = Math.tan(Math.PI / 4. - phi / 2.) / Math.pow(fact, e / 2.);

      if((90.0 != lat1) && (-90.0 != lat1)) {
        rho = Rg * m1 * t / t1; 
      } else { 
        rho = (2. * Rg * scale * t) / 
           (Math.sqrt(Math.pow(1. + e, 1. + e)
               * Math.pow(1. - e, 1. - e)));
      }

      x = rho * Math.sin(lam);
      y = rho * Math.cos(lam);

      if(!isNorth) {
        x = -x;
        y = -y;
      }

      u = x - u0;
      v = y - v0;
      return [u,v]
    }

    this.toLatLon = function(u, v) {

      x = u+u0;
      y = v+v0;
      
      rho = Math.sqrt(x*x + y*y);

      if(90.0 == lat1 || -90.0 == lat1) {
        t = (rho * Math.sqrt(Math.pow(1 + e, 1 + e) 
           * Math.pow(1 - e, 1 - e) )) / (2 * Rg * scale);
      } else {
        t = (rho * t1) / (Rg * m1);
      }
      chi = Math.PI / 2.0 - 2.0 * Math.atan(t);
      sin2chi = Math.sin(2.0 * chi);
      sin4chi = Math.sin(4.0 * chi);
      sin6chi = Math.sin(6.0 * chi);

      phi = chi + (sin2chi * e2 / 2.0) + (sin2chi * 5.0 * e4 / 24.0)
        + (sin2chi * e6 / 12.0) + (sin2chi * 13.0 * e8 / 360.0) 
        + (sin4chi * 7.0 * e4 / 48.0) + (sin4chi * 29.0 * e6 / 240.0)
        + (sin4chi * 811.0 * e8 / 11520.0)
        + (sin6chi * 7.0 * e6 / 120.0)
        + (sin6chi * 81.0 * e8 / 1120.0)
        + (Math.sin(8.0 * chi) * 4279.0 * e8 / 161280.0);
         
      if(isNorth) {  
        lat = phi/RAD;
        lon = Math.atan2(x, y)/RAD + lon0;

      } else {  
        lat = -phi/RAD;
        lon = -Math.atan2(-x, -y)/RAD + lon0;
      } 
      
      return [lat, normalize(lon)];
    }
  }

  /** @constructor */
  function MORhanLambConConEllips() {
    // code derived from NSIDC mapx library

    var lat0, lat1, lon0, x, y, phi, lam, Rg, cos_phi0,cos_phi1, sin_phi1,sin_phi0;
    var u,v,lat,lon,u0, v0, t0, t1, m0, m1, t, e, e2, e4, e6, e8;
    var chi, rho, n, F, theta, rho0, sin_phi; 
    var RAD = Math.PI/180.0;

    //LCC, refLat0, refLat1, refLon, origLat, origLon, EquatRad, eccen, Spacing, xoff,  yoff

    this.init = function(st) {

      var a = [];
      for (var i=1; i<st.length; i++) {
        a[i] = parseFloat(st[i]);
      }

      lat0 = a[1];
      lat1 = a[2];
      lon0 = a[3];
      e = a[7];
      e2 = e*e;
      e4 = e2*e2;
      e6 = e4*e2;
      e8 = e4*e4;

      Rg = a[6] / a[8];
      cos_phi0 = Math.cos(RAD*lat0);
      cos_phi1 = Math.cos(RAD*lat1);
      sin_phi0 = Math.sin((lat0)*RAD);
      sin_phi1 = Math.sin((lat1)*RAD);

      m0 = ((cos_phi0)/Math.sqrt(1 - (e2 * sin_phi0 * sin_phi0)));
      m1 = ((cos_phi1)/Math.sqrt(1 - (e2 * sin_phi1 * sin_phi1)));
      t0 = Math.sqrt( ((1.0 - sin_phi0)/(1.0 + sin_phi0)) *
        Math.pow(((1.0 + (e* sin_phi0))/(1.0 - (e* sin_phi0))),e) );
      t1 = Math.sqrt( ((1.0 - sin_phi1)/(1.0 + sin_phi1)) *
        Math.pow(((1.0 +(e* sin_phi1))/ (1.0 - (e* sin_phi1))), e) );
      n = (Math.log(m0) - Math.log(m1)) / (Math.log(t0) - Math.log(t1));
      F = m0/(n * Math.pow(t0,n));
      rho0 = Rg * F * Math.pow(t0, n);

      u0 = a[9];
      v0 = a[10];
      var z = this.toXY(a[4], a[5]);
      u0 = z[0];
      v0 = z[1];
    }

    this.toXY = function(lat, lon) {
      
      phi = RAD*lat;
      lam = RAD*normalize(lon - lon0);

      sin_phi = Math.sin(phi);

      t = Math.sqrt( ((1. - sin_phi)/(1. + sin_phi)) *
             Math.pow(((1. + (e* sin_phi))/ (1. - (e * sin_phi))), e) );

      rho = Rg * F * Math.pow(t, n);
      theta = n * lam;

      x = rho * Math.sin(theta);
      y = rho0 + (rho * Math.cos(theta));

      u = x - u0;
      v = y - v0;
      return [u,v]
    }

    this.toLatLon = function(u, v) {

      x = u+u0;
      y = v+v0;
      rho = (Math.abs(n) / n) * Math.sqrt((x*x) + ((rho0 - y) * (rho0 - y)));
      t = Math.pow((rho/(Rg * F)), (1/n));
      chi = Math.PI/2.0 - 2.0 * Math.atan(t);

      if (n < 0.0) {
        theta = Math.atan( -x / (y - rho0));
      } else {
        theta = Math.atan(x / (rho0 - y));
      }

      lam = (theta / n);
      phi = chi + (((e2 / 2.0) + ((5.0 / 24.0) * e4) +
            (e6 / 12.0) + ((13.0 / 360.0) * e8)) * Math.sin(2.0 * chi)) +
        ((((7.0 / 48.0) * e4) + ((29.0 / 240.0) * e6) +
          ((811.0 / 11520.0) * e8)) * Math.sin(6.0 * chi)) +
        ((((7.0 / 120.0) * e6) +
          ((81.0 / 1120.0) * e8)) * Math.sin(6.0 * chi)) +
        (((4279.0 / 161280.0) * e8) * Math.sin(8.0 * chi));

      lat = phi/RAD;
      lon = normalize(lon0 - lam/RAD );
      return [lat, lon];
    }
  }

}

