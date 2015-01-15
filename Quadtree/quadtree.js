'use strict';

var Quadtree = function(box, max) {
    this.box = box;
    this.children = null;
    this.value = [];
    this.max = max || 10; //max points per node
};

Quadtree.prototype.insert = function(box, object, flag) {
    //check if it overlaps
    if (!this.box.overlaps(box)) {
        return this;
    }

    //if it is a leaf node and is not full then insert
    var i = null;
    var len = this.value.length;
    if (this.children === null && len < this.max || flag) {
        this.value.push({
            box: box,
            value: object
        });
        return this;
    }

    //if it is a leaf node but full, call subdivide
    if (this.children === null) {
        this.subdivide();
    }

    //if it is not a leaf node, call insert on child nodes
    len = this.children.length;
    for (i = 0; i < len; i++) {
        this.children[i].insert(box, object, true);
    }

    // fastest clear array method
    while (this.value.length > 0) {
        this.value.pop();
    }

    return this;
};

Quadtree.prototype.subdivide = function() {
    //use box quadrant method to create 4 new equal child quadrants
    this.children = this.box.split();

    var len = this.children.length;
    for (var i = 0; i < len; i++) {
        this.children[i] = new Quadtree(this.children[i], this.max);
    }
    //try to insert each box into the new child nodes
    len = this.value.length;
    for (i = 0; i < len; i++) {
        for (var k = 0; k < this.children.length; k++) {
            this.children[k].insert(this.value[i].box, this.value[i].value);
        }
    }
};

Quadtree.prototype.queryRange = function(box) {
    //return all boxes in range
    var result = [];
    this._queryRangeRec(box, result);
    return result;
};

Quadtree.prototype._queryRangeRec = function(box, result) {
    //if query area doesn't overlap this box then return
    if (!this.box.overlaps(box)) {
        return null;
    }

    //if a leaf node contained value(s), then check against contained objects
    var i = null;
    var len = this.value.length;
    if (this.value.length > 0) {
        for (i = 0; i < len; i++) {
            if (box.overlaps(this.value[i].box)) {
                result.push(this.value[i]);
            }
        }
        return null;
    }
    //if it has children, then make recursive call on those
    if (this.children !== null) {
        len = this.children.length;
        for (i = 0; i < len; i++) {
            this.children[i]._queryRangeRec(box, result);
        }
        return null;
    }
};

Quadtree.prototype.queryBox = function(box) {
    if (!this.box.overlaps(box)) {
        return null;
    }

    var len = this.value.length;
    if (len > 0) {
        for (var i = 0; i < len; i++) {
            if (this.value[i].box.equals(box)) {
                return this.value[i].value;
            }
        }
    }

    if (this.children !== null) {
        var val = null;
        len = this.children.length;
        for (var i = 0; i < len; i++) {
            val = val || this.children[i].queryBox(box);
        }
        return val;
    }
    return null;
};

Quadtree.prototype.removeBox = function(box) {
    //return if tree doesn't contain the box
    if (!this.box.overlaps(box)) {
        return null;
    }
    var i = null;
    var len = this.value.length;
    if (len > 0) {
        for (i = 0; i < len; i++) {
            if (this.value[i].box.equals(box)) {
                this.value.splice(i, 1);
                return null;
            }
        }
        return null;
    }

    if (this.children !== null) {
        len = this.children.length;
        for (i = 0; i < len; i++) {
            this.children[i].removeBox(box);
        }
    }
    return null;
};

Quadtree.prototype.clear = function() {
    this.children = null;

    // fastest clear array method
    while (this.value.length > 0) {
        this.value.pop();
    }
};


//generalized box class, defined by two points with lessThan (lte) and greaterThan (gte) functions
var Box = function(least, greatest, shouldContain) {
    this.low = least;
    this.high = greatest;
    this.shouldContain = shouldContain;
};

Box.prototype.equals = function(box) {
    return (this.low.x === box.low.x && this.low.y === box.low.y && this.high.x === box.high.x && this.high.y === box.high.y);
};

//return true if overlap of boxes
Box.prototype.overlaps = function(box) {
    if (this.shouldContain) {
      if (this.high.x < box.low.x) return false
      if (this.high.x < box.high.x) return false

      if (this.low.x > box.low.x) return false
      if (this.low.x > box.high.x) return false

      if (this.high.y < box.low.y) return false
      if (this.high.y < box.high.y) return false

      if (this.low.y > box.high.y) return false
      if (this.low.y > box.low.y) return false

      return true
    } else {
      if (this.high.x < box.low.x) return false
      if (this.low.x > box.high.x) return false
      if (this.high.y < box.low.y) return false
      if (this.low.y > box.high.y) return false

      return true
    }
};

//return array of children
Box.prototype.split = function() {
    var result = [];
    result.push(new Box(this.low, new Point((this.low.x + this.high.x) / 2, (this.low.y + this.high.y) / 2)));
    result.push(new Box(new Point((this.low.x + this.high.x) / 2, this.low.y),
        new Point(this.high.x, (this.low.y + this.high.y) / 2)));
    result.push(new Box(new Point((this.low.x + this.high.x) / 2, (this.low.y + this.high.y) / 2), this.high));
    result.push(new Box(new Point(this.low.x, (this.low.y + this.high.y) / 2),
        new Point((this.low.x + this.high.x) / 2, this.high.y)));
    return result;
};

//two dimensional point
var Point = function(x, y) {
    this.x = x;
    this.y = y;
};

//make compatible with use in browser
if (typeof module !== 'undefined') {
    module.exports.Quadtree = Quadtree;
    module.exports.Box = Box;
    module.exports.Point = Point;
}
