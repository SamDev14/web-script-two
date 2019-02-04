// Author - UP877426
// Code for tests 1 - 19, unable to complete all tests. 

"use strict";

const express = require('express');
const app = express();
const imager = require('./imager/imager');

// Arrays for stats tests.
let pathData = [];
let texts = [];
let size = [];
let sizesTop = [];
let refTop = [];

app.use(express.static('./public'));

app.get('/', function(req, res) {
  res.send(200);
});

// Takes the users inputs and applys the necessary checks and functions.
app.get('/img/:width/:height', function(req, res) {
  let width = Number(req.params.width);
  let height = Number(req.params.height);
  let square = req.query.square;
  let text = req.query.text;
  let headers = req.headers.referer;

  // Checks that the width and height values meet the requirements specified and sends corresponding error codes depending on the values that are given.
  if(!Number.isInteger(width) || !Number.isInteger(height)) {
    res.sendStatus(400);
    return;
  } else if(width > 2000 || height > 2000) {
    res.sendStatus(403);
    return;
  } else if(width < 1 || height < 1) {
    res.sendStatus(404);
    return;
  }

  // Checks that suare is defined and is an integer.
  if(square !== undefined) {
    square = Number(req.query.square);
    if(!Number.isInteger(square) || square < 1) {
      res.sendStatus(400);
      return;
    }
  }

  // Calls the imager module to produce the image.
  imager.sendImage(res, width, height, square, text);

  // Checks if certain variables are defined and then calls the functions associated with them if they are.
  if(square !== undefined && text !== undefined) {
    recentPathData(pathData, '/img/' + width + '/' + height + '?square=' + square + '&text=' + encodeURIComponent(text));
    recentSizes(size, ({w:width, h:height}));
    recentPathData(texts, text);
    mostServedSizes(sizesTop, ({w:width, h:height}));
    if(headers !== undefined) {
    topReferrers(refTop, ({ref:headers}));
    }
  } else if(square !== undefined) {
    recentPathData(pathData, '/img/' + width + '/' + height + '?square=' + square);
    recentSizes(size, ({w:width, h:height}));
    mostServedSizes(sizesTop, ({w:width, h:height}));
    if(headers !== undefined) {
    topReferrers(refTop, ({ref:headers}));
    }
  } else if(text !== undefined) {
    recentPathData(pathData, '/img/' + width + '/' + height + '?text=' + encodeURIComponent(text));
    recentSizes(size, ({w:width, h:height}));
    recentPathData(texts, text);
    mostServedSizes(sizesTop, ({w:width, h:height}));
    if(headers !== undefined) {
    topReferrers(refTop, ({ref:headers}));
    }
  } else {
    recentPathData(pathData, '/img/' + width + '/' + height);
    recentSizes(size, ({w:width, h:height}));
    mostServedSizes(sizesTop, ({w:width, h:height}));
    if(headers !== undefined) {
    topReferrers(refTop, ({ref:headers}));
    }
  }
});


// Functions for array management.

function recentPathData(array, value) {
  for(let i = 0; i < array.length; i++) {
    if(array[i] == value) {
      array.splice(i,1);
    }
  }
  if(array.length >= 10) {
    array.splice(9,1);
  }
  array.unshift(value);
}

function recentSizes(array, value) {
  for(let i = 0; i < array.length; i++) {
    if(array[i].w == value.w && array[i].h == value.h) {
      array.splice(i,1);
    }
  }
  if(array.length >= 10) {
    array.splice(9,1);
  }
  array.unshift(value);
}

function mostServedSizes(array, value) {
  let sizeObject = {w:value.w, h:value.h, n:1};
  for(let i = 0; i < array.length; i++) {
    if(array[i].w == value.w && array[i].h == value.h) {
      sizeObject.n += array[i].n;
      array.splice(i,1);
    }
  }
  if(array.length >= 10) {
    array.splice(9,1);
  }
  array.unshift(sizeObject);
  array.sort(function(a, b) {
    return b.n - a.n;
  });
}

function topReferrers(array, value) {
  let refObject = {ref:value.ref, n:1};
  for (let i = 0; i < array.length; i++) {
    if(array[i].ref == value.ref) {
      refObject.n += array[i].n;
      array.splice(i, 1);
    }
  }
  if(array.length >= 10) {
    array.splice(9,1);
  }
  array.unshift(refObject);
  array.sort(function(a, b) {
    return b.n - a.n;
  });
}

function resetStats() {
  pathData = [];
  texts = [];
  size = [];
  sizesTop = [];
  refTop = [];
}

app.get('/stats/paths/recent', function(req, res) {
  res.send(pathData);
});
app.get('/stats/sizes/recent', function(req, res) {
  res.send(size);
});
app.get('/stats/texts/recent', function(req, res) {
  res.send(texts);
});
app.get('/stats/sizes/top', function(req, res) {
  res.send(sizesTop);
});
app.get('/stats/referrers/top', function(req, res) {
  res.send(refTop);
});
app.delete('/stats', function(req, res) {
  resetStats();
  res.sendStatus(200);
});

app.listen(process.env.PORT || 8080);
