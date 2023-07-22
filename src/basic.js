let game;

const gameOptions = {
    dudeGravity: 800,
    dudeSpeed: 300
    
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#ffffff",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 900,
            height: 1100,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 1
                }
            }
        },
        scene: [FirstLevel,SecondLevel,ThirdLevel],

    }
    game = new Phaser.Game(gameConfig)
    window.focus();
}

class FirstLevel extends Phaser.Scene {

    constructor() {
        super("FirstLevel")
        this.velocity = 100;
        this.score = 0;
    }


    preload() {
        this.load.image("ground", "assets/platform.png")
        this.load.image("star", "assets/star.png")
        this.load.image("sparklyStar", "assets/sparklyStar.png")
        this.load.image("bomb", "assets/bomb.png")
        this.load.image("bullet", "assets/bullet.png")
        this.load.image("skull", "assets/skull.png")
        this.load.image("hearth","assets/hearth.png")
        this.load.spritesheet("dude", "assets/dude.png", {frameWidth: 32, frameHeight:48})
        this.load.image("goal","assets/goal.png")
        this.load.audio("jump", "assets/680303__deltacode__jump.wav")
        this.load.audio("shoot","assets/344310__musiclegends__laser-shoot.wav")
        this.load.audio("gameMusic","assets/410574__yummie__game-background-music-loop-short.mp3")
        this.load.audio("damage","assets/506514__matrixxx__monster-aah.wav")
        this.load.audio("dying","assets/192187__audiorichter__im-poisoned-dying-sound.wav");
    }

    create() {
        this.health = 3;
  
        // Music and sound:
        this.jumpSound = this.sound.add("jump");
        this.shootSound = this.sound.add("shoot");
        this.damageSound = this.sound.add("damage");
        this.dyingSound = this.sound.add("dying");
        this.gameMusic = this.sound.add("gameMusic");
        this.gameMusic.play({loop : true});

        // Create one big piece of ground:
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        let groundWidth = 100; // esimerkiksi, riippuen ground spriten koosta
        let groundCount = Math.ceil(game.config.width / groundWidth);
        for(let i = 0; i < groundCount; i++) {
            let ground = this.physics.add.sprite(i * groundWidth + groundWidth / 2, game.config.height, "ground");
            ground.setImmovable(true);
            this.groundGroup.add(ground);
        }

        // Create stull platforms:
        this.stepGroundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            physics: 'arcade'
        });
        for (let i = 0; i <11; i++) {
            let stepGround = this.physics.add.sprite(
                (13-i)*60, 
                (13-i)*80, 
                "ground"
            );
            this.stepGroundGroup.add(stepGround);
        }

        // Create goal platform:
        let goalPlatform = this.physics.add.sprite(100,150,"ground");
        goalPlatform.setImmovable(true);
        this.groundGroup.add(goalPlatform);

        // Create goal flag:
        this.goal = this.physics.add.sprite(100,100,"goal");
        this.goal.setScale(0.2);
        // Collider for goal platform and goal flag to interact:
        this.physics.add.collider(this.goal,this.groundGroup);

        // Create character:
        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height/1.05, "dude");
        // Set gravity for the dude:
        this.dude.body.gravity.y = gameOptions.dudeGravity;
        // Collider for the character and ground, so they can interact:
        this.physics.add.collider(this.dude, this.groundGroup)
        this.physics.add.collider(this.dude, this.stepGroundGroup);

        


        // Adding star and hearth to the screen:
        this.add.image(16,16,"star");
        this.add.image(80,16,"hearth").setScale(0.08)

        // Adding the score text next to the star:
        this.scoreText = this.add.text(32,0,"0", {fontSize: "30px", fill: "#000000"})
        this.healthText = this.add.text(95,0,"3", {fontSize: "30px", fill:"#000000"})

        // Move method:
        this.cursors = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame: 4}],
            frameRate: 20,
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 9}),
            frameRate: 20,
            repeat: -1
        })

        // Create objects:
        this.stars = this.physics.add.group();
        this.sparklyStars = this.physics.add.group();
        this.skulls = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // Makes objects interact with the gorund:
        this.physics.add.collider(this.stars,this.groundGroup);
        this.physics.add.collider(this.sparklyStars,this.groundGroup);

        // Make objects collectable:
        this.physics.add.overlap(this.dude,this.stars, this.collectStar, null, this)
        this.physics.add.overlap(this.dude,this.sparklyStars,this.collectSparkly,null, this)
        this.physics.add.overlap(this.dude,this.skulls,this.collectSkull,null,this)
        this.physics.add.overlap(this.dude,this.goal,this.collectGoal,null,this)

        // When bullets collide with other objects:
        this.physics.add.collider(this.bullets, this.stars, this.bulletHit, null, this);
        this.physics.add.collider(this.bullets, this.sparklyStars, this.bulletHit, null, this);
        this.physics.add.collider(this.bullets, this.skulls, this.bulletHit, null, this);



        this.triggerTimer = this.time.addEvent({
            callback: this.addStar,
            callbackScope: this,
            delay: 200,
            loop: true
        })
    }




    addStar() {
        if (Phaser.Math.Between(0,10) < 5) {
            // Create normal star
            let star = this.stars.create(Phaser.Math.Between(0,game.config.width),0,"star");
            star.body.setVelocityY(gameOptions.dudeSpeed);

            let skull = this.skulls.create(Phaser.Math.Between(0,game.config.width),0,"skull");
            skull.setScale(0.2)
            skull.body.setVelocityY(gameOptions.dudeSpeed);
        }
        
        if (Phaser.Math.Between(0,10) < 2) {
            // Create sparkly star with a 10% chance
            let sparklyStar = this.sparklyStars.create(Phaser.Math.Between(0,game.config.width),0,"sparklyStar");
            sparklyStar.setScale(0.2);
            sparklyStar.body.setVelocityY(gameOptions.dudeSpeed/2);
        }
    }

    // When bullet hits objects:
    bulletHit(bullet, object) {
        bullet.disableBody(true,true);
        object.disableBody(true,true)
    }

    // What happens when star is collected:
    collectStar(dude, star) {
        star.disableBody(true, true)
        this.score += 1;
        this.scoreText.setText(this.score)
    }

    // What happens when sparkly star is collected:
    collectSparkly(dude,sparklyStar) {
        sparklyStar.disableBody(true,true);
        this.score += 2;
        this.scoreText.setText(this.score)
        
    }

    collectSkull(dude,start) {
        start.disableBody(true,true);
        if (this.health > 1) {
            this.damageSound.play();
            this.health--;
            this.health
            this.healthText.setText(this.health);
        }
        else {
            this.dyingSound.play();
        this.gameMusic.stop(0);
        this.scene.start("FirstLevel")
        }
    }
    
    // When goal is reached:
    collectGoal(dude,start) {
        this.registry.set("score", this.score);
        this.gameMusic.stop(0);
        this.scene.start("SecondLevel");
    }




    // Movement of the character:
    update() {
        if(this.cursors.left.isDown) {
            this.dude.body.velocity.x = -gameOptions.dudeSpeed
            this.dude.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            this.dude.anims.play("right", true)
        }
        else {
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if(this.cursors.up.isDown && this.dude.body.touching.down) {
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 2;
            this.jumpSound.play()
        }

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                const bullet = this.bullets.create(this.dude.x, this.dude.y, 'bullet');
                bullet.setScale(0.5)
                bullet.setVelocityY(-gameOptions.dudeSpeed);
                this.shootSound.play();
        }
    }
}


class SecondLevel extends Phaser.Scene {

    constructor() {
        super("SecondLevel")
        this.velocity = 100;
    }

    preload() {
        this.load.image("ground", "assets/platform.png")
        this.load.image("star", "assets/star.png")
        this.load.image("sparklyStar", "assets/sparklyStar.png")
        this.load.image("bomb", "assets/bomb.png")
        this.load.image("bullet", "assets/bullet.png")
        this.load.image("skull", "assets/skull.png")
        this.load.image("hearth","assets/hearth.png")
        this.load.spritesheet("dude", "assets/dude.png", {frameWidth: 32, frameHeight:48})
        this.load.image("goal","assets/goal.png")
        this.load.audio("jump", "assets/680303__deltacode__jump.wav")
        this.load.audio("shoot","assets/344310__musiclegends__laser-shoot.wav")
        this.load.audio("gameMusic","assets/410574__yummie__game-background-music-loop-short.mp3")
        this.load.audio("damage","assets/506514__matrixxx__monster-aah.wav")
        this.load.audio("dying","assets/192187__audiorichter__im-poisoned-dying-sound.wav");
    }

    create() {
        this.health = 3;
        this.score = this.registry.get('score');
        // Music and sound:
        this.jumpSound = this.sound.add("jump");
        this.shootSound = this.sound.add("shoot");
        this.damageSound = this.sound.add("damage");
        this.dyingSound = this.sound.add("dying");
        this.gameMusic = this.sound.add("gameMusic");
        this.gameMusic.play({loop : true});

        // Create one big piece of ground:
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        let groundWidth = 100; // esimerkiksi, riippuen ground spriten koosta
        let groundCount = Math.ceil(game.config.width / groundWidth);
        for(let i = 0; i < groundCount; i++) {
            let ground = this.physics.add.sprite(i * groundWidth + groundWidth / 2, game.config.height, "ground");
            ground.setImmovable(true);
            this.groundGroup.add(ground);
        }

        // Create still platforms:
        this.stepGroundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            physics: 'arcade'
        });
        let stepGround1 = this.physics.add.sprite(500, 1000, "ground");
        this.stepGroundGroup.add(stepGround1);
        let stepGround2 = this.physics.add.sprite(200, 910, "ground");
        this.stepGroundGroup.add(stepGround2);
        let stepGround3 = this.physics.add.sprite(100, 820, "ground");
        this.stepGroundGroup.add(stepGround3);
        let stepGround4 = this.physics.add.sprite(300, 730, "ground");
        this.stepGroundGroup.add(stepGround4);
        let stepGround5 = this.physics.add.sprite(500, 640, "ground");
        this.stepGroundGroup.add(stepGround5);
        let stepGround6 = this.physics.add.sprite(700, 550, "ground");
        this.stepGroundGroup.add(stepGround6);
        let stepGround7 = this.physics.add.sprite(900, 460, "ground");
        this.stepGroundGroup.add(stepGround7);
        let stepGround8 = this.physics.add.sprite(700, 370, "ground");
        this.stepGroundGroup.add(stepGround8);
        let stepGround9 = this.physics.add.sprite(500, 280, "ground");
        this.stepGroundGroup.add(stepGround9);
        let stepGround10 = this.physics.add.sprite(300, 190, "ground");
        this.stepGroundGroup.add(stepGround10);


        // Create goal platform:
        let goalPlatform = this.physics.add.sprite(100,150,"ground");
        goalPlatform.setImmovable(true);
        this.groundGroup.add(goalPlatform);

        // Create goal flag:
        this.goal = this.physics.add.sprite(100,100,"goal");
        this.goal.setScale(0.2);
        // Collider for goal platform and goal flag to interact:
        this.physics.add.collider(this.goal,this.groundGroup);

        // Create character:
        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height/1.05, "dude");
        // Set gravity for the dude:
        this.dude.body.gravity.y = gameOptions.dudeGravity;
        // Collider for the character and ground, so they can interact:
        this.physics.add.collider(this.dude, this.groundGroup)
        this.physics.add.collider(this.dude, this.stepGroundGroup);

        


        // Adding star and hearth to the screen:
        this.add.image(16,16,"star");
        this.add.image(80,16,"hearth").setScale(0.08)

        // Adding the score text next to the star:
        this.scoreText = this.add.text(32,0,this.score, {fontSize: "30px", fill: "#000000"})
        this.healthText = this.add.text(95,0,"3", {fontSize: "30px", fill:"#000000"})

        // Move method:
        this.cursors = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame: 4}],
            frameRate: 20,
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 9}),
            frameRate: 20,
            repeat: -1
        })

        // Create objects:
        this.stars = this.physics.add.group();
        this.sparklyStars = this.physics.add.group();
        this.skulls = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // Makes objects interact with the gorund:
        this.physics.add.collider(this.stars,this.groundGroup);
        this.physics.add.collider(this.sparklyStars,this.groundGroup);

        // Make objects collectable:
        this.physics.add.overlap(this.dude,this.stars, this.collectStar, null, this)
        this.physics.add.overlap(this.dude,this.sparklyStars,this.collectSparkly,null, this)
        this.physics.add.overlap(this.dude,this.skulls,this.collectSkull,null,this)
        this.physics.add.overlap(this.dude,this.goal,this.collectGoal,null,this)

        // When bullets collide with other objects:
        this.physics.add.collider(this.bullets, this.stars, this.bulletHit, null, this);
        this.physics.add.collider(this.bullets, this.sparklyStars, this.bulletHit, null, this);
        this.physics.add.collider(this.bullets, this.skulls, this.bulletHit, null, this);



        this.triggerTimer = this.time.addEvent({
            callback: this.addStar,
            callbackScope: this,
            delay: 200,
            loop: true
        })
    }




    addStar() {
        if (Phaser.Math.Between(0,10) < 5) {
            // Create normal star
            let star = this.stars.create(Phaser.Math.Between(0,game.config.width),0,"star");
            star.body.setVelocityY(gameOptions.dudeSpeed);

            let skull = this.skulls.create(Phaser.Math.Between(0,game.config.width),0,"skull");
            skull.setScale(0.2)
            skull.body.setVelocityY(gameOptions.dudeSpeed);
        }
        
        if (Phaser.Math.Between(0,10) < 2) {
            // Create sparkly star with a 10% chance
            let sparklyStar = this.sparklyStars.create(Phaser.Math.Between(0,game.config.width),0,"sparklyStar");
            sparklyStar.setScale(0.2);
            sparklyStar.body.setVelocityY(gameOptions.dudeSpeed/2);
        }
    }

    // When bullet hits objects:
    bulletHit(bullet, object) {
        bullet.disableBody(true,true);
        object.disableBody(true,true)
    }

    // What happens when star is collected:
    collectStar(dude, star) {
        star.disableBody(true, true)
        this.score += 1;
        this.scoreText.setText(this.score)
    }

    // What happens when sparkly star is collected:
    collectSparkly(dude,sparklyStar) {
        sparklyStar.disableBody(true,true);
        this.score += 2;
        this.scoreText.setText(this.score)
        
    }

    collectSkull(dude,start) {
        start.disableBody(true,true);
        if (this.health > 1) {
            this.damageSound.play();
            this.health--;
            this.health
            this.healthText.setText(this.health);
        }
        else {
            this.dyingSound.play();
        this.gameMusic.stop(0);
        this.scene.start("SecondLevel")
        }
    }
    
    // When goal is reached:
    collectGoal(dude,start) {
        this.registry.set("score", this.score);
        this.gameMusic.stop(0);
        this.scene.start("ThirdLevel");
    }




    // Movement of the character:
    update() {
        if(this.cursors.left.isDown) {
            this.dude.body.velocity.x = -gameOptions.dudeSpeed
            this.dude.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            this.dude.anims.play("right", true)
        }
        else {
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if(this.cursors.up.isDown && this.dude.body.touching.down) {
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 2;
            this.jumpSound.play()
        }

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                const bullet = this.bullets.create(this.dude.x, this.dude.y, 'bullet');
                bullet.setScale(0.5)
                bullet.setVelocityY(-gameOptions.dudeSpeed);
                this.shootSound.play();
        }
    }





    // Movement of the character:
    update() {
        if(this.cursors.left.isDown) {
            this.dude.body.velocity.x = -gameOptions.dudeSpeed
            this.dude.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            this.dude.anims.play("right", true)
        }
        else {
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if(this.cursors.up.isDown && this.dude.body.touching.down) {
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 2;
            this.jumpSound.play()
        }

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                const bullet = this.bullets.create(this.dude.x, this.dude.y, 'bullet');
                bullet.setScale(0.5)
                bullet.setVelocityY(-gameOptions.dudeSpeed);
                this.shootSound.play();
        }
        

    }

}


class ThirdLevel extends Phaser.Scene {

    constructor() {
        super("ThirdLevel")
        this.velocity = 100;
    }


    preload() {
        this.load.image("ground", "assets/platform.png")
        this.load.image("star", "assets/star.png")
        this.load.image("sparklyStar", "assets/sparklyStar.png")
        this.load.image("bomb", "assets/bomb.png")
        this.load.image("bullet", "assets/bullet.png")
        this.load.image("skull", "assets/skull.png")
        this.load.image("hearth","assets/hearth.png")
        this.load.spritesheet("dude", "assets/dude.png", {frameWidth: 32, frameHeight:48})
        this.load.image("goal","assets/goal.png")
        this.load.audio("jump", "assets/680303__deltacode__jump.wav")
        this.load.audio("shoot","assets/344310__musiclegends__laser-shoot.wav")
        this.load.audio("gameMusic","assets/410574__yummie__game-background-music-loop-short.mp3")
        this.load.audio("damage","assets/506514__matrixxx__monster-aah.wav")
        this.load.audio("dying","assets/192187__audiorichter__im-poisoned-dying-sound.wav");
    }

    create() {
        this.score = this.registry.get('score');
        this.health = 3;
        // Music and sound:
        this.jumpSound = this.sound.add("jump");
        this.shootSound = this.sound.add("shoot");
        this.damageSound = this.sound.add("damage");
        this.dyingSound = this.sound.add("dying");
        this.gameMusic = this.sound.add("gameMusic");
        this.gameMusic.play({loop : true});

        // Create one big piece of ground:
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })
        let groundWidth = 100; // esimerkiksi, riippuen ground spriten koosta
        let groundCount = Math.ceil(game.config.width / groundWidth);
        for(let i = 0; i < groundCount; i++) {
            let ground = this.physics.add.sprite(i * groundWidth + groundWidth / 2, game.config.height, "ground");
            ground.setImmovable(true);
            this.groundGroup.add(ground);
        }

        // Create moving platforms:
        this.movingGroundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            physics: 'arcade'
        });
        for (let i = 0; i <11; i++) {
            let movingGround = this.physics.add.sprite(
                Phaser.Math.Between(groundWidth/2, game.config.width - groundWidth/2), 
                (13-i)*80, 
                "ground"
            );
            movingGround.body.setCollideWorldBounds(true); // Set moving platform to interact with the bounds of the wolrd
            this.movingGroundGroup.add(movingGround);
        }
        // Set a small delay to make moving platforms move:
        this.time.delayedCall(100, () => {
            this.movingGroundGroup.getChildren().forEach(movingGround => {
                movingGround.body.velocity.x = this.velocity;
            });
        });




        // Create goal platform:
        let goalPlatform = this.physics.add.sprite(100,150,"ground");
        goalPlatform.setImmovable(true);
        this.groundGroup.add(goalPlatform);

        // Create goal flag:
        this.goal = this.physics.add.sprite(100,100,"goal");
        this.goal.setScale(0.2);
        // Collider for goal platform and goal flag to interact:
        this.physics.add.collider(this.goal,this.groundGroup);

        // Create character:
        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height/1.05, "dude");
        // Set gravity for the dude:
        this.dude.body.gravity.y = gameOptions.dudeGravity;
        // Collider for the character and ground, so they can interact:
        this.physics.add.collider(this.dude, this.groundGroup)
        this.physics.add.collider(this.dude, this.movingGroundGroup);

        


        // Adding star and hearth to the screen:
        this.add.image(16,16,"star");
        this.add.image(80,16,"hearth").setScale(0.08)

        // Adding the score text next to the star:
        this.scoreText = this.add.text(32,0,this.score, {fontSize: "30px", fill: "#000000"})
        this.healthText = this.add.text(95,0,"3", {fontSize: "30px", fill:"#000000"})

        // Move method:
        this.cursors = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
            frameRate: 20,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame: 4}],
            frameRate: 20,
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 9}),
            frameRate: 20,
            repeat: -1
        })

        // Create objects:
        this.stars = this.physics.add.group();
        this.sparklyStars = this.physics.add.group();
        this.skulls = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // Makes objects interact with the gorund:
        this.physics.add.collider(this.stars,this.groundGroup);
        this.physics.add.collider(this.sparklyStars,this.groundGroup);

        // Make objects collectable:
        this.physics.add.overlap(this.dude,this.stars, this.collectStar, null, this)
        this.physics.add.overlap(this.dude,this.sparklyStars,this.collectSparkly,null, this)
        this.physics.add.overlap(this.dude,this.skulls,this.collectSkull,null,this)
        this.physics.add.overlap(this.dude,this.goal,this.collectGoal,null,this)

        // When bullets collide with other objects:
        this.physics.add.collider(this.bullets, this.stars, this.bulletHit, null, this);
        this.physics.add.collider(this.bullets, this.sparklyStars, this.bulletHit, null, this);
        this.physics.add.collider(this.bullets, this.skulls, this.bulletHit, null, this);



        this.triggerTimer = this.time.addEvent({
            callback: this.addStar,
            callbackScope: this,
            delay: 200,
            loop: true
        })
    }




    addStar() {
        if (Phaser.Math.Between(0,10) < 5) {
            // Create normal star
            let star = this.stars.create(Phaser.Math.Between(0,game.config.width),0,"star");
            star.body.setVelocityY(gameOptions.dudeSpeed);

            let skull = this.skulls.create(Phaser.Math.Between(0,game.config.width),0,"skull");
            skull.setScale(0.2)
            skull.body.setVelocityY(gameOptions.dudeSpeed);
        }
        
        if (Phaser.Math.Between(0,10) < 2) {
            // Create sparkly star with a 10% chance
            let sparklyStar = this.sparklyStars.create(Phaser.Math.Between(0,game.config.width),0,"sparklyStar");
            sparklyStar.setScale(0.2);
            sparklyStar.body.setVelocityY(gameOptions.dudeSpeed/2);
        }
    }

    // When bullet hits objects:
    bulletHit(bullet, object) {
        bullet.disableBody(true,true);
        object.disableBody(true,true)
    }

    // What happens when star is collected:
    collectStar(dude, start) {
        start.disableBody(true, true)
        this.score += 1
        this.scoreText.setText(this.score)
    }

    // What happens when sparkly star is collected:
    collectSparkly(dude,start) {
        start.disableBody(true,true);
        this.score += 2
        this.scoreText.setText(this.score)
        
    }

    collectSkull(dude,start) {
        start.disableBody(true,true);
        if (this.health > 1) {
            this.damageSound.play();
            this.health--;
            this.health
            this.healthText.setText(this.health);
        }
        else {
            this.dyingSound.play();
        this.gameMusic.stop(0);
        this.scene.start("ThirdLevel")
        }
    }
    
    // Scoreboard updates:
    static updateScoreBoard(playerName, score) {
        let scoreBoard = document.getElementById("scoreBoard");
        // Getting earlier scores from Local Storage:
        let scores = JSON.parse(localStorage.getItem("scores")) || [];
    
        scores.push({name: playerName, score: score});
    
        scores.sort((a, b) => b.score - a.score);
    
        // Save scores into Local Storage:
        localStorage.setItem("scores", JSON.stringify(scores));
    
        // Get the table:
        let table = document.getElementById("scoreTable");
    
        // Clear the table:
        table.innerHTML = "";
    
        // Add new rows to the table:
        for(let i = 0; i < scores.length && i < 5; i++) {
            let row = document.createElement("tr");
    
            let nameCell = document.createElement("td");
            nameCell.textContent = scores[i].name;
            row.appendChild(nameCell);
    
            let scoreCell = document.createElement("td");
            scoreCell.textContent = scores[i].score;
            row.appendChild(scoreCell);
    
            table.appendChild(row);
        }
        scoreBoard.style.display ="block"
    }

// When goal is reached on last map:
collectGoal(dude,start) {
    start.disableBody(true,true);
    this.scene.pause();
    let score = this.score;
    let form = document.getElementById("player-name-form");
    form.style.display = "flex";

    let content = document.getElementById('content');
    let message = document.createElement('p');
    message.textContent = 'You have completed the game!';
    message.style.textAlign = "center";
    message.style.fontSize = "50px";
    content.insertBefore(message, form);


    document.getElementById("player-name-submit").addEventListener("click", function() {
        let playerName = document.getElementById("player-name-input").value;
        form.style.display = "none"
        ThirdLevel.updateScoreBoard(playerName, score);  
    });
}





    // Movement of the character:
    update() {
        if(this.cursors.left.isDown) {
            this.dude.body.velocity.x = -gameOptions.dudeSpeed
            this.dude.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            this.dude.anims.play("right", true)
        }
        else {
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if(this.cursors.up.isDown && this.dude.body.touching.down) {
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 2;
            this.jumpSound.play()
        }

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if(Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                const bullet = this.bullets.create(this.dude.x, this.dude.y, 'bullet');
                bullet.setScale(0.5)
                bullet.setVelocityY(-gameOptions.dudeSpeed);
                this.shootSound.play();
        }

        this.movingGroundGroup.getChildren().forEach((movingGround) => {
            if (movingGround.x >= game.config.width - movingGround.width/2) {
                movingGround.body.velocity.x = -this.velocity;

            } else if (movingGround.x <= movingGround.width/2) {
                movingGround.body.velocity.x = this.velocity;

            }
        });
        

    }

}