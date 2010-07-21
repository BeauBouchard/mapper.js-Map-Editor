window.console = window.console || {log:function(){}};

var Mapper = (function() {

    var DEFAULT_CONTEXT = '2d';
    var CANVAS_TARGET = 'canvas';
    var CANVAS_DIV = 'mapdiv';
    var HEIGHT = 500;
    var WIDTH = 500;

    var BLACK   = '#000000';
    var WHITE   = '#FFFFFF';
    var MAGENTA = '#FF00FF';

    var canvas = null;
    var ctx = null;

    var x_grid = 0;
    var y_grid = 0;
    
    var current_tile_img = null;
    var on_canvas = false;
    var tile_map = []; 

    var Tile = function(x, y, url) {
        if (this instanceof Tile) {
       
            this.x = x;
            this.y = y;
            this.img = new Image();
            this.img.src = url;

        } else {
            return new Tile(x, y, url);
        }
    };

    // This is the highlighted area in the mapper screen
    var Cursor = (function() {

        this.x = 0;
        this.y = 0;

        var that = this;

        return {
            x : function(x) {
                if (x === undefined) {
                    return that.x;
                } else {
                    that.x = x;
                }
            },
            y : function(y) {
                if (y === undefined) {
                    return that.y;
                } else {
                    that.y = y;
                }
            }
        };
    })();

    /* A utility function for walking the DOM tree and applying 
     * a given function on each node.
     */
    var walk = function(node, func) {
        func(node);
        node = node.firstChild;
        while (node) {
            walk(node, func);
            node = node.nextSibling;
        }
    }

    var refresh = function() {
        // redraw everything
        ctx.fillStyle = BLACK;
        ctx.fillRect(0,0,HEIGHT,WIDTH);

        // draw the tiles
        for (var i = 0; i < tile_map.length; i++) {
            ctx.drawImage(tile_map[i].img, tile_map[i].x, tile_map[i].y, 50, 50);
        }
                
        ctx.strokeStyle = MAGENTA;
        ctx.strokeRect(Cursor.x(), Cursor.y(), 50, 50);
    
        setTimeout(refresh, 30);
    };

    return {
   
        // TODO: I should use CSS classes instead of assuming I want all of the
        //       IMGs on a page to be tiles.

        mouseclick : function(e) {
            var e = e || window.event;
            var src = e.srcElement || e.target;

            if (src.nodeName === 'IMG') {
                console.log("you clicked an image");

                if (current_tile_img === null) {
                    current_tile_img = src;
                    current_tile_img.style.border = '3px solid ' + BLACK;
                } else {
                    current_tile_img.style.border = '0px solid #FFF';
                    current_tile_img = src;
                    current_tile_img.style.border = '3px solid ' + BLACK;
                }

            } else if (src.nodeName === 'CANVAS') {
                if (current_tile_img !== null) {
                    tile_map.push(Tile(x_grid, y_grid, current_tile_img.getAttribute('src')));
                    console.log('added image ' 
                            + current_tile_img.getAttribute('src') + ' to the map at (' 
                            + x_grid + ', ' + y_grid + ')'); 
                    /* TODO: This should really make sure that a tile with the
                     * same coordinates doesn't exist in the array, but since
                     * my draw method just goes through the array sequentially
                     * it will always use the latest one, and so it doesn't
                     * matter that much.  This should be changed though.
                     */
                }
            }
        },

        mouseover : function(e) {
            var e = e || window.event;
            var src = e.srcElement || e.target;

            if (src.nodeName === 'CANVAS') {
                console.log('entering canvas');
                on_canvas = true;
            } else if (src.nodeName === 'IMG') {
                src.style.border = '3px solid ' + MAGENTA;
            }
        },
        
        mouseout : function (e) {
            var e = e || window.event;
            var src = e.srcElement || e.target;

            if (src.nodeName === 'CANVAS') {
                console.log('leaving canvas');
                on_canvas = false;
            }
            else if (src.nodeName === 'IMG' && src != current_tile_img) {
                src.style.border = '0px solid #FFF';
            }
        },  

        load : function() {
            console.log('Mapper loaded.');
        
            // TODO: It will probably be more effective to use a transparent image here
            document.onselectstart = function(){return false;};
            document.ondragstart = function(){return false;};

            // get all of the tile images, and put them into the tile_map
            walk(document, 
                function(node) {
                    if (node.className !== undefined) {
                        console.log(node.className);
                    }
                }
            );

            canvas = document.getElementById(CANVAS_TARGET);

            if (canvas.getContext) {
                ctx = canvas.getContext(DEFAULT_CONTEXT);
            } else {
                // uh
            }

            // fill the background
            ctx.fillStyle = BLACK;
            ctx.fillRect(0,0,HEIGHT,WIDTH);


            // draw the cursor
            ctx.strokeStyle = MAGENTA;
            ctx.strokeRect(Cursor.x(), Cursor.y(), 50, 50);
           
            /*
             * NOTE: I am using event.layerX here, which I attach to the
             *       actual canvas.  Doing this lets me get the mouse pos
             *       relative to actual canvas, but only works if the canvas
             *       is given a position style.  If it doesn't have a position
             *       this doesn't work.  
             *
             * TODO: Give it a position if it doesn't
             * have one, without breaking the layout...
             */
            canvas.onmousemove = function(e) {
                var e = e || window.event;
                var posx, posy;
                
                
                if (e.offsetX) { // this is for Opera
                    
                    posx = e.offsetX;
                    posy = e.offsetY;

                } else if (e.layerX) { // this is for Firefox
                    
                    posx = e.layerX;
                    posy = e.layerY;
                
                }
                console.log('(' + posx + ', ' + posy + ')');
                
                /* This seems really dumb, but it works for now, and is
                 *  straightforward at least.
                 */
                x_grid = 0;
                y_grid = 0;
                if (posx < 50) {
                    x_grid = 0;
                } else if (posx >= 50 && posx < 100) {
                    x_grid = 49;
                } else if (posx >= 100 && posx < 150) {
                    x_grid = 99;
                } else if (posx >= 150 && posx < 200) {
                    x_grid = 149;
                } else if (posx >= 200 && posx < 250) {
                    x_grid = 199;
                } else if (posx >= 250 && posx < 300) {
                    x_grid = 249;
                } else if (posx >= 300 && posx < 350) {
                    x_grid = 299;
                } else if (posx >= 350 && posx < 400) {
                    x_grid = 349;
                } else if (posx >= 400 && posx < 450) {
                    x_grid = 399;
                } else if (posx >= 450 && posx < 500) {
                    x_grid = 449;
                }
                
                if (posy < 50) {
                    y_grid = 0;
                } else if (posy >= 50 && posy < 100) {
                    y_grid = 49;
                } else if (posy >= 100 && posy < 150) {
                    y_grid = 99;
                } else if (posy >= 150 && posy < 200) {
                    y_grid = 149;
                } else if (posy >= 200 && posy < 250) {
                    y_grid = 199;
                } else if (posy >= 250 && posy < 300) {
                    y_grid = 249;
                } else if (posy >= 300 && posy < 350) {
                    y_grid = 299;
                } else if (posy >= 350 && posy < 400) {
                    y_grid = 349;
                } else if (posy >= 400 && posy < 450) {
                    y_grid = 399;
                } else if (posy >= 450 && posy < 500) {
                    y_grid = 449;
                }
                
                Cursor.x(x_grid);
                Cursor.y(y_grid);
            }

            refresh();
        },
       
        /*--------------------------------
         * Don't edit below this comment.
         *-------------------------------*/
        last_function : {} // So I don't leave trailing commas for IE to choke on.
    };
})();

window.onmousedown = Mapper.mouseclick;
window.onmouseover = Mapper.mouseover;
window.onmouseout = Mapper.mouseout;
window.onload = Mapper.load;
