;(function(exports) {

    var Glitcher = function () {
        this.effects = [this.Melt, this.ColorFuck];
    };

    Glitcher.prototype = {

        /***
            Adds a glitch effect to the queue of randomly chosen effects

            @param effect {Function} Function that accepts arguments canvas and amt.
        ***/
        addEffect : function (effect) {
            this.effects.push(effect);
        },


        // glitches out all sprite tiles.
        curGlitchAmount : 0,

        Glitch: function(canvas, amt) {
            var effectIdx = Math.floor(Math.random() * this.effects.length);

            amt = amt || this.curGlitchAmount++;

            this.effects[effectIdx].apply(this, arguments);
        },

        Melt : function (canvas, amt) {
            var ctx = canvas.getContext('2d');

            //var t = new Date().getTime();
            
            var rectSize = Math.min(16, amt * 4 + 2);
            
            var sourceWidth = canvas.width;
            var sourceHeight = canvas.height;
        
        
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
        
            ctx.globalAlpha = 0.6;
            //ctx.globalCompositeOperation = 'darker';
        
            // or iterate over all pixels based on x and y coordinates.
            // loop through each row
            for(var y = 0; y < sourceHeight; y++) {
              // loop through each column
              for(var x = 0; x < sourceWidth; x++) {
                var prob = (Math.random() * 300.0);
                if (prob < 1) {         
                    var pixIdx = ((sourceWidth * y) + x) * 4;
                    
                    // don't glitch transparent parts!
                    if (data[pixIdx + 3] === 0) continue; 

                    var red = data[pixIdx];
                    var green = data[pixIdx + 1];
                    var blue = data[pixIdx + 2];
                    
                    var w = Math.round(Math.random() * rectSize) + 1;
                    
                    ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
                    ctx.fillRect(x, y, w, w);
                }
              }
            }
        
            //console.log("took " + (new Date().getTime() - t) + " mseconds");
        },

        ColorFuck : function (canvas, amt) {
            var ctx = canvas.getContext('2d');

            //var t = new Date().getTime();
            
            var rectSize = Math.min(2, amt * 4 + 2);
            
            var sourceWidth = canvas.width;
            var sourceHeight = canvas.height;
        
        
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
        
            ctx.globalAlpha = 1.0;
            //ctx.globalCompositeOperation = 'darker';
        
            // or iterate over all pixels based on x and y coordinates.
            // loop through each row
            for(var y = 0; y < sourceHeight; y++) {
              // loop through each column
              for(var x = 0; x < sourceWidth; x++) {
                var prob = (Math.random() * 300.0);
                if (prob < 1) {         
                    var pixIdx = ((sourceWidth * y) + x) * 4;
                    
                    // don't glitch transparent parts!
                    if (data[pixIdx + 3] === 0) continue; 

                    var red = (Math.random() * 155 + 100) | 0;
                    var green = (Math.random() * 155 + 100) | 0;
                    var blue = (Math.random() * 155 + 100) | 0;
                    
                    var w = Math.round(Math.random() * rectSize) + 1;
                    
                    ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
                    ctx.fillRect(x, y, w, w);
                }
              }
            }
        
            //console.log("took " + (new Date().getTime() - t) + " mseconds");
        }
    };


    exports.Glitcher = new Glitcher();

}(window));