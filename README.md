quadtree-lookup
================
[![Build Status](https://travis-ci.org/jrhdoty/generic-quadtree.svg?branch=master)](https://travis-ci.org/jrhdoty/generic-quadtree)

### This fork adds support for inserting boxes.

## Description

Quadtree-lookup is a node module that implements a quadtree for storing key-value pairs where the keys are two dimensional values.

It is optimized for performing lookup of values in a specified range.

The module comes with implementations of a Point and a Box objects but will work with any objects that implement the methods on their prototypes.

For use in the browser or with node.

## Usage

``` javascript
//create bounding area of quadtree
var min = new Point(0,0);
var max = new Point(100, 100);
var totalArea = new Box(min, max);

//instantiate new quadtree
var tree = new Quadtree(totalArea);

//insert item
var box = new Box(new Point(20, 30), new Point(40, 60));
var item = 'value';
tree.insert(box, item);

//get array of all boxes contained within the range
var range = new Box(new Point(10, 10), new Point(40, 40));
var itemsInRange = tree.queryRange(range); //returns [{box: position; value: item}]

//get value if quadtree contains the box
tree.queryBox(box); //returns 'value'

//remove box from tree
tree.removeBox(box); //tree is now empty

//clear all internal nodes and values
tree.clear();

```
