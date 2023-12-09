import { css, LitElement } from 'lit';

export class AnimationShootingstar extends LitElement {
  static styles = css`
    :host {
      padding: 0;
      margin: 0;
    }
  `;

  static properties = {
    everyTime: { type: Number, attribute: 'every-time' },
    direction: { type: Number, attribute: 'star-direction' },
  };

  constructor() {
    super();

    this.ramdomBeamId = Math.floor(Math.random() * 16777215).toString(16);
    this.referenceId = null;

    this.maxBeamSize = 700;
    this.minBeamSize = 400;
    this.maxVelocity = 10;
    this.minVelocity = 4;
    this.maxStarSize = 20;
    this.minStarSize = 8;
    this.maxLife = 400;
    this.minLife = 100;

    // STAR PROPERTIES
    this.velocity = 8;
    this.starSize = 10;
    this.life = 300;
    this.beamSize = 400;

    // BEAM PROPERTIES
    this.everyTimeCalc = (Math.floor(Math.random() * 5) + 5) * 1000;
    this.directionCalc = -1;
    this.beamPartToShowCounter = 0;
    this.beamPartToHideCounter = 0;
    this.options = {};
    this.layer = document.querySelector(this.referenceId) ?? document.body;
    this.wW = this.layer.clientWidth;
    this.hW = this.layer.clientHeight;
  }

  connectedCallback() {
    super.connectedCallback();
    this.launch();
  }

  static getStarColorForTime(elapsedTime, _totalDuration = 10) {
    const totalDuration = _totalDuration * 1000;

    const animationProgress = (elapsedTime % totalDuration) / totalDuration;

    const colors = [
      { time: 0, color: [255, 255, 255] }, // Blanco Brillante
      { time: 0.2, color: [255, 255, 204] }, // Amarillo Claro
      { time: 0.4, color: [173, 216, 230] }, // Azul Claro
      { time: 0.6, color: [255, 165, 0] },   // Naranja Suave
      { time: 0.8, color: [192, 192, 192] }, // Plateado o Gris Claro
      { time: 1, color: [255, 255, 255] }   // Blanco Brillante (final)
    ];

    let startColor;
    let endColor;
    for (let colorsCounter = 0; colorsCounter < colors.length - 1; colorsCounter += 1) {
      if (animationProgress >= colors[colorsCounter].time && animationProgress < colors[colorsCounter + 1].time) {
        startColor = colors[colorsCounter];
        endColor = colors[colorsCounter + 1];
        break;
      }
    }

    const colorMix = (endColor.time - startColor.time);
    const colorProgress = (animationProgress - startColor.time) / colorMix;
    const interpolatedColor = startColor.color.map((startVal, i) => {
      const endVal = endColor.color[i];
      return startVal + (endVal - startVal) * colorProgress;
    });

    return `rgba(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]}, 1)`;
  }

  addBeamPart(x, y) {
    this.beamPartToShowCounter += 1;
    const name = AnimationShootingstar.getRandom(100, 1);
    const oldStar = document.getElementById(`star${name}_${this.ramdomBeamId}`);
    oldStar?.remove();

    const starDiv = document.createElement("div");
    starDiv.id = `star${name}_${this.ramdomBeamId}`;
    this.layer.appendChild(starDiv);

    const randomChangeColorTime = AnimationShootingstar.getRandom(8, 3);
    const interpolatedColor = AnimationShootingstar.getStarColorForTime(this.beamPartToShowCounter * this.velocity, randomChangeColorTime);

    const beamDiv = document.createElement("div");
    beamDiv.id = `beam${this.beamPartToShowCounter}_${this.ramdomBeamId}`;
    beamDiv.className = 'beam';
    beamDiv.style = `position:absolute; color:${interpolatedColor}; width:10px; height:10px; font-weight:bold; font-size:${this.starSize}px;`;
    beamDiv.textContent = '·';
    starDiv.appendChild(beamDiv);

    if (this.beamPartToShowCounter > 1) {
      const prevHaz = document.getElementById(`beam${this.beamPartToShowCounter - 1}`);
      if (prevHaz) {
        prevHaz.style.color = 'rgba(255,255,255,0.5)';
      }
    }

    beamDiv.style.top = `${y + this.beamPartToShowCounter}px`;
    beamDiv.style.left = `${x + (this.beamPartToShowCounter * this.directionCalc)}px`;
  }

  delPeaceOfBeam() {
    this.beamPartToHideCounter += 1;
    const beam = document.getElementById(`beam${this.beamPartToHideCounter}_${this.ramdomBeamId}`);
    if (beam) {
      beam.style.opacity = '0';
    }
  }

  static getRandom(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  launchStar(options = { dir: this.directionCalc, life: this.life, starSize: this.starSize, beamSize: this.beamSize, velocity: this.velocity }) {
    const { dir, life, starSize, beamSize, velocity } = options;
    this.directionCalc = dir;
    this.velocity = velocity;
    this.starSize = starSize;
    this.life = life;
    this.beamSize = beamSize;

    this.beamPartToShowCounter = 0;
    this.beamPartToHideCounter = 0;
    const x = AnimationShootingstar.getRandom(this.wW - this.beamSize - 100, 100);
    const y = AnimationShootingstar.getRandom(this.hW - this.beamSize - 100, 100);

    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const timeElapsed = time - startTime;

      if (this.beamPartToShowCounter < this.beamSize) {
        if (timeElapsed > this.life + (this.beamPartToShowCounter * this.velocity)) {
          this.addBeamPart(x, y);
          this.beamPartToShowCounter += 1;
        }
      }

      if (this.beamPartToHideCounter < this.beamSize) {
        if (timeElapsed > this.beamSize + (this.beamPartToHideCounter * this.velocity)) {
          this.delPeaceOfBeam();
          this.beamPartToHideCounter += 1;
        }
      }

      if (this.beamPartToShowCounter < this.beamSize || this.beamPartToHideCounter < this.beamSize) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  recalculateNewStarOptions() {
    const directionVal = Math.floor(AnimationShootingstar.getRandom(150, 70)) / 100;
    const directionSign = Math.abs(AnimationShootingstar.getRandom(1, 0)) ? 1 : -1;
    const direction = this.direction ?? directionVal * directionSign;

    const options = {
      dir: direction,
      life: AnimationShootingstar.getRandom(this.maxLife, this.minLife),
      starSize: AnimationShootingstar.getRandom(this.maxStarSize, this.minStarSize),
      beamSize: AnimationShootingstar.getRandom(this.maxBeamSize, this.minBeamSize),
      velocity: AnimationShootingstar.getRandom(this.maxVelocity, this.minVelocity),
    };
    return options;
  }

  launch() {
    const options = this.recalculateNewStarOptions();
    this.launchStar(options);
    setTimeout(this.launch.bind(this), this.everyTimeCalc);
    this.everyTimeCalc = this.everyTime * 1000 ?? options.velocity * 1000;
  }

}
