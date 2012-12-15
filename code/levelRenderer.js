/**
	Renders a playable level.
	Code by Rob Kleffner, 2011
*/

Mario.LevelRenderer = function(level, width, height) {
    this.Width = width;
    this.Height = height;
    this.Level = level;
    this.TilesY = ((height / 16) | 0) + 1;
    this.Delta = 0;
    this.Tick = 0;
    this.Bounce = 0;
    this.AnimTime = 0;
    
    this.Background = Mario.SpriteCuts.GetLevelSheet();
};

Mario.LevelRenderer.prototype = new Enjine.Drawable();

Mario.LevelRenderer.prototype.Update = function(delta) {
    this.AnimTime += delta;
    this.Tick = this.AnimTime | 0;
    this.Bounce += delta * 30;
    this.Delta = delta;
};

Mario.LevelRenderer.prototype.Draw = function(context, camera) {
    this.DrawStatic(context, camera);
    this.DrawDynamic(context, camera);
};

Mario.LevelRenderer.prototype.DrawStatic = function(context, camera) {
    var x = 0, y = 0, b = 0, frame = null, xTileStart = (camera.X / 16) | 0, xTileEnd = ((camera.X + this.Width) / 16) | 0;

    var pipeX = false,
        pipeY = false;
    for (x = xTileStart; x < xTileEnd + 1; x++) {
        for (y=0; y<this.TilesY; y++){
            if( (this.Level.GetBlock(x, y) & 0xff) === 10 ) {
                pipeX = x;
                pipeY = y;
                break;
            }
        }
    }
    if(pipeX && pipeY && Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.P2)){
        this.Level.SetSpriteTemplate(pipeX, pipeY, new Mario.SpriteTemplate(Mario.Enemy.Flower, false));
        st = this.Level.GetSpriteTemplate(pipeX,pipeY);
        st.Spawn(this, x, y, 0);
    }
    // scan for gaps
    var gapStart = false, 
        gapEnd = false, 
        gapYEnd = this.TilesY;
    for (x = xTileStart; x < xTileEnd + 1; x++) {
        b = this.Level.GetBlock(x, this.TilesY) & 0xff;

        if (b === 0) { // found empty block!

            if (gapStart === false)
                gapStart = x - 1;
        } 
        else if (gapStart !== false) {
            gapEnd = x;
            break; // only control first gap on teh screen
        }
    }
    if (gapEnd !== false) { // don't let them control gaps not completely on the screen
        
        // find gap height
        for (y = this.TilesY; y >= 0; y--) {        
            b = this.Level.GetBlock(x, y) & 0xff;
            
            if (b === 0) {
                break;
            }
            gapYEnd = y;
        }

        if (Enjine.KeyboardInput.IsKeyDown(Enjine.Keys.P2)) {

            // move the gap towards mario!
            for (x = gapStart; x < gapEnd + 2; x++) {
                var newX = x - 1;

                for (y = this.TilesY; y >= gapYEnd; y--) { 
                    
                    b = this.Level.GetBlock(x, y);
                    b = this.Level.SetBlock(newX, y, b);
                }
            }


            Enjine.Resources.PlaySound("breakblock");
        }
    }


    for (x = xTileStart; x < xTileEnd + 1; x++) {
        for (y = 0; y < this.TilesY; y++) {
            b = this.Level.GetBlock(x, y) & 0xff;
            if ((Mario.Tile.Behaviors[b] & Mario.Tile.Animated) === 0) {
                frame = this.Background[b % 16][(b / 16) | 0];
                context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, ((x << 4) - camera.X) | 0, (y << 4) | 0, frame.Width, frame.Height);
      
                if (Debug.drawTileTypes || Debug.drawTileCoords) {
                    context.font = '8px Arial';
                    context.globalAlpha = 0.5;
                    
                    var beh = Mario.Tile.Behaviors[b],
                        label = b;

                    if (Debug.drawTileCoords) label = x + ',' + y;
                  
                        if (beh & Mario.Tile.Special !== 0) 
                            context.fillStyle = 'pink';

                        if (beh & Mario.Tile.Bumpable !== 0) 
                            context.fillStyle = 'brown';

                        if (beh & Mario.Tile.Breakable !== 0) 
                            context.fillStyle = 'yellow';
                 
                        if (beh & Mario.Tile.PickUpable !== 0) 
                            context.fillStyle = 'silver';

                        //if (beh & Mario.Tile.Animated !== 0) 
                        //    context.fillStyle = 'black';

                        if (beh & Mario.Tile.BlockUpper !== 0) 
                            context.fillStyle = 'red';

                        else if (beh & Mario.Tile.BlockAll !== 0) 
                            context.fillStyle = 'blue';

                        else if (beh & Mario.Tile.BlockLower !== 0) 
                            context.fillStyle = 'green';

                    

                    context.fillText(label, ((x << 4) - camera.X) | 0, (y << 4) | 0);
                    //context.fillRect(((x << 4) - camera.X) | 0, (y << 4) | 0, frame.Width, frame.Height);
                    context.globalAlpha = 1.0;
                }

            }
        }
    }
};

Mario.LevelRenderer.prototype.DrawDynamic = function(context, camera) {
    var x = 0, y = 0, b = 0, animTime = 0, yo = 0, frame = null;
    for (x = (camera.X / 16) | 0; x <= ((camera.X + this.Width) / 16) | 0; x++) {
        for (y = (camera.Y / 16) | 0; y <= ((camera.Y + this.Height) / 16) | 0; y++) {
            b = this.Level.GetBlock(x, y);
            
            if (((Mario.Tile.Behaviors[b & 0xff]) & Mario.Tile.Animated) > 0) {
                animTime = ((this.Bounce / 3) | 0) % 4;
                if ((((b % 16) / 4) | 0) === 0 && ((b / 16) | 0) === 1) {
                    animTime = ((this.Bounce / 2 + (x + y) / 8) | 0) % 20;
                    if (animTime > 3) {
                        animTime = 0;
                    }
                }
                if ((((b % 16) / 4) | 0) === 3 && ((b / 16) | 0) === 0) {
                    animTime = 2;
                }
                yo = 0;
                if (x >= 0 && y >= 0 && x < this.Level.Width && y < this.Level.Height) {
                    yo = this.Level.Data[x][y];
                }
                if (yo > 0) {
                    yo = (Math.sin((yo - this.Delta) / 4 * Math.PI) * 8) | 0;
                }
                frame = this.Background[(((b % 16) / 4) | 0) * 4 + animTime][(b / 16) | 0];
                context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (x << 4) - camera.X, (y << 4) - camera.Y - yo, frame.Width, frame.Height);
            }
        }
    }
};

Mario.LevelRenderer.prototype.DrawExit0 = function(context, camera, bar) {
    var y = 0, yh = 0, frame = null;
    for (y = this.Level.ExitY - 8; y < this.Level.ExitY; y++) {
        frame = this.Background[12][y === this.Level.ExitY - 8 ? 4 : 5];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X - 16, (y << 4) - camera.Y, frame.Width, frame.Height);
    }
    
    if (bar) {
        yh = this.Level.ExitY * 16 - (3 * 16) - (Math.sin(this.AnimTime) * 3 * 16) - 8;// - ((Math.sin(((this.Bounce + this.Delta) / 20) * 0.5 + 0.5) * 7 * 16) | 0) - 8;
        frame = this.Background[12][3];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X - 16, yh - camera.Y, frame.Width, frame.Height);
        frame = this.Background[13][3];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X, yh - camera.Y, frame.Width, frame.Height);
    }
};

Mario.LevelRenderer.prototype.DrawExit1 = function(context, camera) {
    var y = 0, frame = null;
    for (y = this.Level.ExitY - 8; y < this.Level.ExitY; y++) {
        frame = this.Background[13][y === this.Level.ExitY - 8 ? 4 : 5];
        context.drawImage(Enjine.Resources.Images["map"], frame.X, frame.Y, frame.Width, frame.Height, (this.Level.ExitX << 4) - camera.X + 16, (y << 4) - camera.Y, frame.Width, frame.Height);
    }
};