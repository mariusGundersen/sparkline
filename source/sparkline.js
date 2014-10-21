(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.Sparkline2 = factory();
  }
}(this, function () {

    function extend(specific, general){
        var obj = {};
        for(var key in general){
            obj[key] = key in specific ? specific[key] : general[key];
        }
        return obj;
    }

    function Sparkline(element, options){
        this.element = element;
        this.options = extend(options || {}, Sparkline.options);

        this.element.innerHTML = "<canvas></canvas>";
        this.canvas = this.element.firstChild;
        this.ratio = window.devicePixelRatio || 1;
        this.pixelWidth = this.options.width * this.ratio;
        this.pixelHeight = this.options.height * this.ratio;
        this.canvas.style.width = this.options.width + 'px';
        this.canvas.style.height = this.options.height + 'px';
        this.canvas.width = this.pixelWidth;
        this.canvas.height = this.pixelHeight;
        this.context = this.canvas.getContext("2d");

        if(this.options.tooltip){
            this.canvas.style.position = "relative";
            this.canvas.onmousemove = showTooltip.bind(this);
        }
    }

    Sparkline.options = {
        width: 100,
        height: 18,
        lineColor: "black",
        lineWidth: 1,
        startColor: "transparent",
        endColor: "red",
        maxColor: "transparent",
        minColor: "transparent",
        minValue: null,
        maxValue: null,
        dotRadius: 2.5,
        tooltip: null
    };

    Sparkline.init = function(element, options){
        return new Sparkline(element, options);
    };

    Sparkline.draw = function(element, points, options){
        var sparkline = new Sparkline(element, options);
        sparkline.draw(points);
        return sparkline;
    };

    Sparkline.prototype.drawDot = function(radius, color, x, y){
        if (color !== 'transparent') {
            this.context.beginPath();
            this.context.fillStyle = color;
            this.context.arc(~~x, ~~y, radius, 0, Math.PI*2, false);
            this.context.fill();
        }
    };

    function showTooltip(e){
        var x = e.offsetX || e.layerX || 0;
        var delta = ((this.options.width - this.options.dotRadius*2) / (this.points.length - 1));
        var index = minmax(0, Math.round((x - this.options.dotRadius)/delta), this.points.length - 1);

        this.canvas.title = this.options.tooltip(this.points[index], index, this.points);
    }

    Sparkline.prototype.y = function(index) {
        var range = this.maxValue - this.minValue;
        if(range === 0){
          return this.offsetY + this._height/2;
        }else{
          return (this.offsetY + this._height) - ((this.points[index] - this.minValue) / range)*this._height;
        }
    };

    Sparkline.prototype.min = function(x) {
        var value, idx;
        for (var i = 0; i < x.length; i++) {
            if (x[i] < value || value === undefined) { value = x[i]; idx = i; }
        }
        return [value, idx];
    };

    Sparkline.prototype.max = function(x) {
        var value, idx;
        for (var i = 0; i < x.length; i++) {
            if (x[i] > value || value === undefined) { value = x[i]; idx = i; }
        }
        return [value, idx];
    };

    Sparkline.prototype.draw = function(points){

        points = points || [];
        this.points = points;

        // clear the canvas
        this.canvas.width = this.pixelWidth;
        var offsetX = this.options.dotRadius*this.ratio;
        var offsetY = this.options.dotRadius*this.ratio;
        var width = this.pixelWidth - offsetX*2;
        var height = this.pixelHeight - offsetY*2;

        var minValue = this.options.minValue !== null ? [this.options.minValue, -1] : this.min(points);
        var maxValue = this.options.maxValue !== null ? [this.options.maxValue, -1] : this.max(points);
        var minX = offsetX;
        var maxX = offsetX;

        var x = offsetX;
        this.offsetY = offsetY;
        this.minValue = minValue[0];
        this.maxValue = maxValue[0];
        this._height = height;
        var delta = width / (points.length - 1);

        this.context.beginPath();
        this.context.strokeStyle = this.options.lineColor;
        this.context.lineWidth = this.options.lineWidth*this.ratio;

        this.context.moveTo(~~x, ~~this.y(0));
        for(var i=1; i<points.length; i++){
            x += delta;
            this.context.lineTo(~~x, ~~this.y(i));
            minX = points[i] == minValue[0] ? x : minX;
            maxX = points[i] == maxValue[0] ? x : maxX;
        }
        this.context.stroke();
        var radius = this.options.dotRadius*this.ratio;
        this.drawDot(radius, this.options.startColor, offsetX + (points.length == 1 ? width/2 : 0), this.y(0));
        this.drawDot(radius, this.options.endColor, offsetX + (points.length == 1 ? width/2 : width), this.y(i - 1));
        this.drawDot(radius, this.options.minColor, minX + (points.length == 1 ? width/2 : 0), this.y(minValue[1]));
        this.drawDot(radius, this.options.maxColor, maxX + (points.length == 1 ? width/2 : 0), this.y(maxValue[1]));
    };

    function minmax(a, b, c){
        return Math.max(a, Math.min(b, c));
    }

    return Sparkline;
}));
