if (window.yoob === undefined) yoob = {};

function launch(scriptRoot, containerId) {
    var container = document.getElementById(containerId);

    var canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = canvas.width;
    container.appendChild(canvas);

    var game = /* The */ new GamerlyRealism();
    game.init(canvas);
    game.reset();
    canvas.onclick = function() {
        if (game.lives === 0) {
            game.reset();
        }
    };
}

yoob.Sprite = function() {

    /*
     * x and y always represent the CENTRE of the Sprite().
     * Chainable.
     */
    this.init = function(cfg) {
        this.x = cfg.x;
        this.y = cfg.y;
        this.width = cfg.width;
        this.height = cfg.height;
        this.dx = cfg.dx || 0;
        this.dy = cfg.dy || 0;
        this.isDraggable = cfg.isDraggable || false;
        this.isClickable = cfg.isClickable || false;
        this.fillStyle = cfg.fillStyle || "green";
        this.visible = (cfg.visible === undefined ? true : (!!cfg.visible));
        this._isBeingDragged = false;
        return this;
    };

    this.getX = function() {
        return this.x;
    };

    this.getLeftX = function() {
        return this.x - this.width / 2;
    };

    this.getRightX = function() {
        return this.x + this.width / 2;
    };

    this.getY = function() {
        return this.y;
    };

    this.getTopY = function() {
        return this.y - this.height / 2;
    };

    this.getBottomY = function() {
        return this.y + this.height / 2;
    };

    this.getWidth = function() {
        return this.width;
    };

    this.getHeight = function() {
        return this.height;
    };

    this.isBeingDragged = function() {
        return this._isBeingDragged;
    };

    /*
     * Chainable.
     */
    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    /*
     * Chainable.
     */
    this.setDimensions = function(width, height) {
        this.width = width;
        this.height = height;
        return this;
    };

    /*
     * Chainable.
     */
    this.setVelocity = function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        return this;
    };

    /*
     * Chainable.
     */
    this.setDestination = function(x, y, ticks) {
        this.destX = x;
        this.destY = y;
        this.setVelocity((this.destX - this.getX()) / ticks, (this.destY - this.getY()) / ticks);
        this.destCounter = ticks;
        return this;
    };

    this.move = function(x, y) {
        this.x += this.dx;
        this.y += this.dy;
        this.onmove();
        if (this.destCounter !== undefined) {
            this.destCounter--;
            if (this.destCounter <= 0) {
                this.destCounter = undefined;
                this.setPosition(this.destX, this.destY).setVelocity(0, 0);
                this.onreachdestination();
            }
        }
    };

    // override this if your shape is not a rectangle
    this.containsPoint = function(x, y) {
        return (x >= this.getLeftX() && x <= this.getRightX() &&
                y >= this.getTopY() && y <= this.getBottomY());
    };

    // you may need to override this in a sophisticated way if you
    // expect it to detect sprites of different shapes intersecting
    // assumes given sprite is LARGER THAN or EQUAL IN SIZE TO this.
    this.intersects = function(sprite) {
        var x1 = this.getLeftX();
        var x2 = this.getRightX();
        var y1 = this.getTopY();
        var y2 = this.getBottomY();
        return (sprite.containsPoint(x1, y1) || sprite.containsPoint(x2, y1) ||
                sprite.containsPoint(x1, y2) || sprite.containsPoint(x2, y2));
    };

    // you will probably want to override this
    // if you do, it's up to you to honour this.visible.
    this.draw = function(ctx) {
        if (!this.visible) return;
        ctx.fillStyle = this.fillStyle || "green";
        ctx.fillRect(this.getLeftX(), this.getTopY(), this.getWidth(), this.getHeight());
    };

    // event handlers.  override to detect these events.
    this.ongrab = function() {
    };
    this.ondrag = function() {
    };
    this.ondrop = function() {
    };
    this.onclick = function() {
    };
    this.onmove = function() {
    };
    this.onreachdestination = function() {
    };

};

/*
 * This still has a few shortcomings at the moment.
 */
yoob.SpriteManager = function() {
    /*
     * Attach this SpriteManager to a canvas.
     */
    this.init = function(cfg) {
        this.canvasX = undefined;
        this.canvasY = undefined;
        this.offsetX = undefined;
        this.offsetY = undefined;
        this.dragging = undefined;
        this.sprites = [];

        this.canvas = cfg.canvas;

        return this;
    };

    this.move = function() {
        this.foreach(function(sprite) {
            sprite.move();
        });
    };

    this.draw = function(ctx) {
        if (ctx === undefined) {
            ctx = this.canvas.getContext('2d');
        }
        this.foreach(function(sprite) {
            sprite.draw(ctx);
        });
    };

    this.addSprite = function(sprite) {
        this.sprites.push(sprite);
    };

    this.removeSprite = function(sprite) {
        var index = undefined;
        for (var i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i] === sprite) {
                index = i;
                break;
            }
        }
        if (index !== undefined) {
            this.sprites.splice(index, 1);
        }
    };

    this.clearSprites = function() {
        this.sprites = [];
    };

    this.moveToFront = function(sprite) {
        this.removeSprite(sprite);
        this.sprites.push(sprite);
    };

    this.moveToBack = function(sprite) {
        this.removeSprite(sprite);
        this.sprites.unshift(sprite);
    };
    
    this.getSpriteAt = function(x, y) {
        for (var i = this.sprites.length-1; i >= 0; i--) {
            var sprite = this.sprites[i];
            if (sprite.containsPoint(x, y)) {
                return sprite;
            }
        }
        return undefined;
    };

    this.foreach = function(fun) {
        for (var i = this.sprites.length-1; i >= 0; i--) {
            var sprite = this.sprites[i];
            var result = fun(sprite);
            if (result === 'remove') {
                this.removeSprite(sprite);
            }
            if (result === 'return') {
                return sprite;
            }
        }
    };

};

yoob.Joystick = function() {
    this.init = function() {
        this.dx = 0;
        this.dy = 0;
        this.leftPressed = false;
        this.rightPressed = false;
        this.upPressed = false;
        this.downPressed = false;
        this.buttonPressed = false;
        this.keyMap = {
            17: this.fire,
            37: this.left,
            38: this.up,
            39: this.right,
            40: this.down
        };
        this.onchange = undefined;
        return this;
    };

    this.fire = function(obj, pressed) {
        if (obj.buttonPressed === pressed) return;
        obj.buttonPressed = pressed;
        if (obj.onchange !== undefined) obj.onchange();
    };

    this.left = function(obj, pressed) {
        if (obj.leftPressed === pressed) return;
        obj.leftPressed = pressed;
        obj.dx = (obj.leftPressed ? -1 : 0) + (obj.rightPressed ? 1 : 0);
        if (obj.onchange !== undefined) obj.onchange();
    };

    this.up = function(obj, pressed) {
        if (obj.upPressed === pressed) return;
        obj.upPressed = pressed;
        obj.dy = (obj.upPressed ? -1 : 0) + (obj.downPressed ? 1 : 0);
        if (obj.onchange !== undefined) obj.onchange();
    };

    this.right = function(obj, pressed) {
        if (obj.rightPressed === pressed) return;
        obj.rightPressed = pressed;
        obj.dx = (obj.leftPressed ? -1 : 0) + (obj.rightPressed ? 1 : 0);
        if (obj.onchange !== undefined) obj.onchange();
    };

    this.down = function(obj, pressed) {
        if (obj.downPressed === pressed) return;
        obj.downPressed = pressed;
        obj.dy = (obj.upPressed ? -1 : 0) + (obj.downPressed ? 1 : 0);
        if (obj.onchange !== undefined) obj.onchange();
    };

    this.attach = function(element) {
        var $this = this;
        element.addEventListener('keydown', function(e) {
            var u = $this.keyMap[e.keyCode];
            if (u !== undefined) {
                u($this, true);
                e.cancelBubble = true;
                e.preventDefault();
            }
        }, true);
        element.addEventListener('keyup', function(e) {
            var u = $this.keyMap[e.keyCode];
            if (u !== undefined) {
                u($this, false);
                e.cancelBubble = true;
                e.preventDefault();
            }
        }, true);
    };
};


var HERO_COLOR = 'black';
var TREASURE_COLOR = 'black';
var PIT_COLOR = 'black';
var BACKGROUND_COLOR = 'black';
var SCORE_COLOR = 'black';


var GamerlyRealism = function() {
    this.init = function(canvas) {
        this.canvas = canvas;

        this.manager = (new yoob.SpriteManager()).init({ canvas: this.canvas });

        this.joystick = (new yoob.Joystick()).init();
        this.joystick.attach(document.documentElement);

        return this;
    };

    this.reset = function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.manager.clearSprites();

        this.numTreasures = 0;

        this.hero = this.makeHero();
        for (var i = 0; i < 10; i++) {
            this.makePit();
        }
        this.makeTreasures();

        this.score = 0;
        this.lives = 3;

        this.paused = false;
        var $this = this;
        this.intervalId = setInterval(function() {
            $this.update();
            $this.draw();
        }, 1000 / 50);
    };

    this.makeHero = function() {
        var d;
        var done = false;
        while (!done) {
            d = new yoob.Sprite();
            d.init({
                x: Math.floor(Math.random() * this.canvas.width),
                y: Math.floor(Math.random() * this.canvas.height),
                width: 32,
                height: 32
            });
            var cols = this.getCollisions(d);
            if (cols.length === 0) {
                done = true;
            }
        }
        d.type = 'hero';
        d.draw = function(ctx) {
            ctx.fillStyle = HERO_COLOR;
            ctx.fillRect(this.getLeftX(), this.getTopY(), this.getWidth(), this.getHeight());
        };
        this.manager.addSprite(d);
        return d;
    };

    this.makePit = function() {
        var d;
        var done = false;
        while (!done) {
            d = new yoob.Sprite();
            d.init({
                x: Math.floor(Math.random() * this.canvas.width),
                y: Math.floor(Math.random() * this.canvas.height),
                width: 32,
                height: 32
            });
            var cols = this.getCollisions(d);
            if (cols.length === 0) {
                done = true;
            }
        }
        d.type = 'pit';
        d.draw = function(ctx) {
            ctx.fillStyle = PIT_COLOR;
            ctx.fillRect(this.getLeftX(), this.getTopY(), this.getWidth(), this.getHeight());
        };
        this.manager.addSprite(d);
        return d;
    };

    this.makeTreasure = function() {
        var d;
        var done = false;
        while (!done) {
            d = new yoob.Sprite();
            d.init({
                x: Math.floor(Math.random() * this.canvas.width),
                y: Math.floor(Math.random() * this.canvas.height),
                width: 16,
                height: 16
            });
            var cols = this.getCollisionsSmaller(d);
            if (cols.length === 0) {
                done = true;
            }
        }
        d.type = 'treasure';
        d.draw = function(ctx) {
            ctx.fillStyle = TREASURE_COLOR;
            ctx.fillRect(this.getLeftX(), this.getTopY(), this.getWidth(), this.getHeight());
        };
        this.manager.addSprite(d);
        this.numTreasures += 1;
        return d;
    };

    this.makeTreasures = function() {
        for (var i = 0; i < 10; i++) {
            this.makeTreasure();
        }
    };

    this.draw = function() {
        var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.manager.draw();

        ctx.textBaseline = "top";
        ctx.font = "32px Arial,Sans-serif";
        ctx.fillStyle = SCORE_COLOR;
        ctx.fillText('' + this.score, 0, 0);

        ctx.textBaseline = "bottom";
        var s = '';
        for (var i = 0; i < this.lives; i++) {
            s += 'O';
        }
        ctx.fillStyle = SCORE_COLOR;
        ctx.fillText(s, 0, this.canvas.height);

    };

    // assumes target is LARGER than all sprites
    this.getCollisions = function(target) {
        var collisions = [];
        this.manager.foreach(function(sprite) {
            if (sprite !== target && sprite.intersects(target)) {
                collisions.push(sprite);
            }
        });
        return collisions;
    };

    // assumes target is SMALLER than all sprites
    this.getCollisionsSmaller = function(target) {
        var collisions = [];
        this.manager.foreach(function(sprite) {
            if (sprite !== target && target.intersects(sprite)) {
                collisions.push(sprite);
            }
        });
        return collisions;
    };

    this.update = function() {
        if (this.paused || this.lives === 0) return;
        this.hero.dx = this.joystick.dx;
        this.hero.dy = this.joystick.dy;
        this.manager.move();

        var collisions = this.getCollisions(this.hero);
        for (var i = 0; i < collisions.length; i++) {
            var collided = collisions[i];
            if (collided.type === 'treasure') {
                this.manager.removeSprite(collided);
                this.numTreasures -= 1;
                this.score += 10;
                if (this.numTreasures === 0) {
                    this.makeTreasures();
                }
            } else if (collided.type === 'pit') {
                this.manager.removeSprite(collided);
                this.manager.removeSprite(this.hero);
                this.lives -= 1;
                if (this.lives > 0) {
                    this.hero = this.makeHero();
                }
            }
        }
    };
};
