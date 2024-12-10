let rectangles = []; // Pole pro uchování všech obdélníků
let snowflakes = []; // Pole pro uchování vloček
let activeRectangle = null; // Odkaz na aktivní obdélník
let snowflakeImage; // Obrázek vločky
let collisionSound; // Zvuk pro kolizi
let backgroundImage; // Obrázek pozadí

// Třída pro reprezentaci obdélníku
class Rectangle {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  display(isActive) {
    fill(this.color);
    stroke(isActive ? 0 : 100);
    strokeWeight(isActive ? 4 : 1);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
  }

  contains(px, py) {
    return (
      px > this.x - this.w / 2 &&
      px < this.x + this.w / 2 &&
      py > this.y - this.h / 2 &&
      py < this.y + this.h / 2
    );
  }

  move(dx, dy) {
    this.x = constrain(this.x + dx, this.w / 2, width - this.w / 2);
    this.y = constrain(this.y + dy, this.h / 2, height - this.h / 2);
  }
  
  // Detekce kolize s vločkou pomocí knihovny p5.collide2D
  detectCollision(flake) {
    return collideRectCircle(
      this.x - this.w / 2, this.y - this.h / 2, this.w, this.h,
      flake.x, flake.y, flake.radius * 2
    );
  }
}

// Třída pro reprezentaci vločky
class Snowflake {
  constructor() {
    this.x = random(width); // Náhodná pozice na šířce plátna
    this.y = random(-50, -10); // Náhodná počáteční výška nad plátnem
    this.radius = random(5, 10); // Náhodná velikost vločky
    this.speed = random(1, 3); // Náhodná rychlost pádu
  }

  // Vykreslení vločky
  display() {
    if (this.y >= 0) {
      if (snowflakeImage) {
        imageMode(CENTER);
        image(snowflakeImage, this.x, this.y, this.radius * 2, this.radius * 2);
      } else {
        fill(255);
        noStroke();
        ellipse(this.x, this.y, this.radius * 2);
      }
    }  
  }

  // Aktualizace pozice vločky
  update() {
    this.y += this.speed; // Pád vločky směrem dolů
  }

  // Kontrola, zda vločka zmizela pod spodním okrajem
  isOffScreen() {
    return this.y - this.radius > height;
  }
}

function preload() {
  // Načtení obrázku a zvuku
  snowflakeImage = loadImage('vlocka.png'); // Nahraďte správnou URL nebo souborem
  collisionSound = loadSound('ding.wav'); // Nahraďte správnou URL nebo souborem
  backgroundImage = loadImage('les.jpg');
}


function setup() {
  createCanvas(800, 600); // Nastavení velikosti plátna  
}

function draw() {
  if (backgroundImage) {
    imageMode(CORNER); 
    image(backgroundImage, 0, 0, 800, 600); // Nastavení pozadí obrázku
  } else {
    background(240); // Náhradní pozadí, pokud obrázek není načten
  }
  
  // Přidání nové vločky s malou pravděpodobností
  if (random(1) < 0.1) {
    snowflakes.push(new Snowflake());
  }
  
  // Aktualizace a vykreslení všech vloček
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    let flake = snowflakes[i];
    flake.update();
    flake.display();

    for (let rect of rectangles) {
      if (rect.detectCollision(flake)) {
        snowflakes.splice(i, 1); // Odstranění vločky

        // Přehrání zvuku
        if (collisionSound && collisionSound.isLoaded()) {
          collisionSound.play();
        }
        
        break;
      }    
    }
    
    if (flake.isOffScreen()) {
      snowflakes.splice(i, 1);
    }
  }

  // Vykreslení všech obdélníků
  rectangles.forEach((rect, index, array) => {
    rect.display(rect === activeRectangle);
  }); 

  // Pohyb aktivního obdélníku při držení kláves
  if (activeRectangle) {
    if (keyIsDown(LEFT_ARROW)) {
      activeRectangle.move(-5, 0);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      activeRectangle.move(5, 0);
    }
    if (keyIsDown(UP_ARROW)) {
      activeRectangle.move(0, -5);
    }
    if (keyIsDown(DOWN_ARROW)) {
      activeRectangle.move(0, 5);
    }
  }
}

// Kliknutí myší
function mousePressed() {
  const clickedRectangle = rectangles.find(rect => rect.contains(mouseX, mouseY));

  if (clickedRectangle) {
    activeRectangle = clickedRectangle;
  } else {
    const col = color(random(255), random(255), random(255));
    activeRectangle = new Rectangle(mouseX, mouseY, 50, 50, col);
    rectangles.push(activeRectangle);
  }
}

