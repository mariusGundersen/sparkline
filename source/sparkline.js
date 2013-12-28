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
        root.Sparkline = factory();
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

        init: {
            this.element.innerHTML = "<canvas></canvas>";
            this.canvas = this.element.firstChild;
            this.context = this.canvas.getContext("2d");
        }
    }

    Sparkline.options = {
        width: 100,
        lineColor: "black",
        lineWidth: 1,
        startColor: "transparent",
        endColor: "red",
        maxColor: "transparent",
        minColor: "transparent",
        dotRadius: 2.5
    };

    Sparkline.init = function(element, options){
        return new Sparkline(element, options);
    };

    Sparkline.draw = function(element, points, options){
        var sparkline = new Sparkline(element, options);
        sparkline.draw(points);
        return sparkline;
    }

    function getY(minValue, maxValue, offsetY, height, index){
        var range = maxValue - minValue;
        if(range == 0){
          return offsetY + height/2;
        }else{
          return (offsetY + height) - ((this[index] - minValue) / range)*height;
        }
    }

    function drawDot(radius, color, x, y){
        this.beginPath();
        this.fillStyle = color;
        this.arc(x, y, radius, 0, Math.PI*2, false);
        this.fill();
    }

    Sparkline.prototype.draw = function(points){

        points = points || [];

        this.canvas.width = this.options.width;
        this.canvas.height = this.element.offsetHeight;

        var offsetX = this.options.dotRadius;
        var offsetY = this.options.dotRadius;
        var width = this.canvas.width - offsetX - this.options.dotRadius;
        var height = this.canvas.height - offsetY - this.options.dotRadius;

        var minValue = Math.min.apply(Math, points);
        var maxValue = Math.max.apply(Math, points);
        var minX = offsetX;
        var maxX = offsetX;

        var x = offsetX;
        var y = getY.bind(points, minValue, maxValue, offsetY, height);
        var delta = width / (points.length - 1);

        var dot = drawDot.bind(this.context, this.options.dotRadius);


        this.context.beginPath();
        this.context.strokeStyle = this.options.lineColor;
        this.context.lineWidth = this.options.lineWidth;

        this.context.moveTo(x, y(0));
        for(var i=1; i<points.length; i++){
            x += delta;
            this.context.lineTo(x, y(i));

            minX = points[i] == minValue ? x : minX;
            maxX = points[i] == maxValue ? x : maxX;
        }
        this.context.stroke();

        dot(this.options.startColor, offsetX + (points.length == 1 ? width/2 : 0), y(0));
        dot(this.options.endColor, offsetX + (points.length == 1 ? width/2 : width), y(i - 1));
        dot(this.options.minColor, minX + (points.length == 1 ? width/2 : 0), y(points.indexOf(minValue)));
        dot(this.options.maxColor, maxX + (points.length == 1 ? width/2 : 0), y(points.indexOf(maxValue)));


    }

    return Sparkline;
}));