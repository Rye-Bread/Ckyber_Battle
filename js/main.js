
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create,/*start: start,*/ update: update, render: render });//It'll run that list of functions in that order.

function preload() {

    game.load.image('bullet', 'assets/enemy-bullet.png');
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/invader_plane.png', 27, 21);
    game.load.image('ship', 'assets/players_plane.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/grassmap2.png');
    game.load.image('background', 'assets/background2.png');
    game.load.audio('explodey', 'assets/explosion.mp3');
    game.load.audio('shooty', 'assets/shotgun.wav');
    game.load.audio('music', 'assets/music.wav');

}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
var aliencount = 40;
var heat = 50;
var heatstring = '';
var heat_for_display = heat - 50;
var shooty;
var explodey;
var music;
var spawntime = 1000;
//var level = 1;
//var leveltext;
//var levelstring = '';
var tweenmade = false;
var aliengrouper = 0;
var aliengroups = [];
var liner;

//function start()
//{
    
//}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //Audio
    explodey = game.add.audio('explodey');
    shooty = game.add.audio('shooty');
    music = game.add.audio('music');
    music.loop = true;
    music.play();

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    //for (var i = 0; i <= 19; i++)
        //aliens[i] = game.add.group();
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
    aliens.setAll('outOfBoundsKill', true);
    aliens.setAll('checkWorldBounds', true);
    
    //Enemy type 2: line person.
    liner = game.add.group();
    liner.enableBody = true;
    liner.physicsBodyType = Phaser.Physics.ARCADE;
    liner.setAll('outOfBoundsKill', true);
    liner.setAll('checkWorldBounds', true);

    //createAliens();//This call spawns enemies.

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });
    
    //Heat display
    heatstring = 'Heat : ';
    heatText = game.add.text(350, 10, heatstring + heat_for_display, { font: '34px Arial', fill: '#fff' });
    
    //Level display
//    levelstring = 'Level : ';
//    leveltext = game.add.text(500, 10, levelstring + level, { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '32px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}
function alienswarm()
{
    /*for (var y = 0; y<4; y++)
        {
        var alien = aliens.create(x * 48, y * 50, 'invader');
        alien.anchor.setTo(0.5, 0.5);
        //alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);//Animations for alien sprite. [0,1,2,3 {sections}, 20 {ms between switches}, true {Something}]
        //alien.play('fly'); Play animation
        //alien.body.moves = false;//Stops it from being manipulated by physics.
        aliens.x = 100;
        aliens.y = 50;
        }*/
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.body.moves = false;
        }
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
   // tween.onLoop.add(descend, this);
}
function alienline()
{
    //var linemover = game.add.tween(liner).to( { x: 500, y: 100 }, 5000, Phaser.Easing.Linear.None, true, 0, 1000, false);//last one there "false" means don't loop.
    for (x = 0; x < 5; x++)
    {
        var linerX = liner.create( x * 50, 50, 'invader');
        linerX.anchor.setTo(0.5, 0.5);
        linerX.body.moves = false;
    }
    linerX.x = 100;
    linerX.y = 50;
    
    var linemover = game.add.tween(liner).to( { x: 500, y: 500 }, 10000, Phaser.Easing.Linear.None, true, 0, 1000/*, true*/);//One of the trues probably means loop.
}

function createAliens () {
        //spawntime = game.time.now + 30000/((score/2) + 1); //Spawn again thirty seconds later-ish.
    if (score >= 500)
        spawntime = game.time.now + 25000;
    else if (score >= 1000)
        spawntime = game.time.now + 20000;
    else if (score >= 1500)
        spawntime = game.time.now + 15000;
    else if (score >= 2000)
        spawntime = game.time.now + 10000;
    else if (score >= 2500)
        spawntime = game.time.now + 5000;
    else
        spawntime = game.time.now + 30000;
        //var whichalienkind = game.rnd.integerInRange(0, 1);//Chooses a type of enemy to spawn.
   /* whichalienkind = 0;
    switch (whichalienkind)
    {
        case 0://We have a function for each type.
            alien0();
            break;
    }*/
    //alienswarm();
    //alienline();

    /* Obsolete code, here for reference. 40 aliens in this.
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
        
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
*/
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {
    
    var rdm = game.rnd.integerInRange(0, 6);
    if (rdm <= 4)
        aliens.y += 10;
    if (rdm == 5 | rdm == 6)
        aliens.y -= 10;
}

function update() {
    if (aliengrouper >= 20)
        aliengrouper = 0;
    if (game.time.now > spawntime)//Spawns something every x seconds.   
        createAliens();//ERROR IN alien0() function
    //Cool down the gun when we don't fire.
    heat = heat -1.5;
    if (heat < 50)
        heat = 50;
    //heat.text = heat;
    heat_for_display = (heat - 50)/100;
    heatText.text = heatstring + heat_for_display;

    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }
        if (cursors.up.isDown)
        {
            player.body.velocity.y = -200;
        }
        else if (cursors.down.isDown)
        {
            player.body.velocity.y = 200;
        }

        //  Firing?
        if (fireButton.isDown)
        {
            fireBullet();
        }

        if (game.time.now > firingTimer)        //DETERMINES HOW OFTEN ALIENS FIRE.
        {
            enemyFires();
        }

        //  Run collision
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(bullets, liner, collisionHandler, null, this);
    }

}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();
//    aliencount = aliencount - 1; //When an alien dies, reduce aliencount by one.

    //  Increase the score
    score += 10;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);
    explodey.play();

    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " The day is won soldier, fly back home. \n Click to reverse time.";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyHitsPlayer (player,bullet) {
    
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);
    explodey.play();

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text="Our proud nation is surely lost... unless... \n Click to reverse time!";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });
    //Do it for liner enemies, too.
    liner.forEachAlive(function(liner){

        // put every living enemy in an array
        livingEnemies.push(liner);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);
        shooty.play();

        game.physics.arcade.moveToObject(enemyBullet,player,player);
        firingTimer = game.time.now + (1000/score);//The higher the score, the faster they shoot.
        //firingTimer = game.time.now; //In case we want something else.
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + heat;//Normal +200 flat
            heat = heat + 75;
            shooty.play();
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart () {
    score = 0;
    //  A new level starts
    aliencount = 40;
    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
//    tween.stop();
    createAliens();
    //level = level+ 1;
    //leveltext.text = levelstring + level;

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}