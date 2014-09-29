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
            this.ratio = window.devicePixelRatio || 1;
            
            if(this.options.tooltip){
                this.canvas.style.position = "relative";
                this.canvas.onmousemove = showTooltip.bind(this);
            }
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
  
    function showTooltip(e){
        var x = e.offsetX || e.layerX || 0;
        var delta = ((this.options.width - this.options.dotRadius*2) / (this.points.length - 1));
        var index = minmax(0, Math.round((x - this.options.dotRadius)/delta), this.points.length - 1);
        
        this.canvas.title = this.options.tooltip(this.points[index], index, this.points);
    }

    Sparkline.prototype.draw = function(points){

        points = points || [];
        this.points = points;
        
        this.canvas.width = this.options.width * this.ratio;
        this.canvas.height = this.element.offsetHeight * this.ratio;
        this.canvas.style.width = this.options.width + 'px';
        this.canvas.style.height = this.element.offsetHeight + 'px';

        var offsetX = this.options.dotRadius*this.ratio;
        var offsetY = this.options.dotRadius*this.ratio;
        var width = this.canvas.width - offsetX*2;
        var height = this.canvas.height - offsetY*2;

        var minValue = this.options.minValue || Math.min.apply(Math, points);
        var maxValue = this.options.maxValue || Math.max.apply(Math, points);
        var minX = offsetX;
        var maxX = offsetX;

        var x = offsetX;
        var y = getY.bind(points, minValue, maxValue, offsetY, height);
        var delta = width / (points.length - 1);

        var dot = drawDot.bind(this.context, this.options.dotRadius*this.ratio);


        this.context.beginPath();
        this.context.strokeStyle = this.options.lineColor;
        this.context.lineWidth = this.options.lineWidth*this.ratio;

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
    
    function minmax(a, b, c){
        return Math.max(a, Math.min(b, c));
    }

    return Sparkline;
}));