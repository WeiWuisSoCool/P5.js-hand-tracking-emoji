let handpose;
let video;
let predictions = [];
let particles = [];
let emojiInput; // 用于存储用户输入框
let userEmoji = "🌸"; // 默认 emoji

function setup() {
  createCanvas(640, 480);

  // 初始化视频
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 Handpose 模型
  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  noStroke();

  // 创建一个输入框，用于输入 emoji
  emojiInput = createInput("🌸"); // 默认值为 "🌸"
  emojiInput.position(10, height + 10); // 设置输入框的位置
  emojiInput.size(100); // 输入框大小
  emojiInput.input(updateEmoji); // 当用户输入时调用 updateEmoji 函数
}

function modelReady() {
  console.log("Handpose model ready!");
}

function draw() {
  // 显示摄像头画面
  background(0);
  image(video, 0, 0, width, height);

  // 根据食指指尖生成粒子
  addParticlesFromIndexFinger();

  // 更新并绘制粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();

    // 删除消失的粒子
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

// 更新用户输入的 emoji
function updateEmoji() {
  userEmoji = emojiInput.value(); // 获取用户输入的值
}

// 仅根据食指指尖（landmarks[8]）生成粒子
function addParticlesFromIndexFinger() {
  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    const landmarks = prediction.landmarks;

    // 检查是否有足够的关键点
    if (landmarks && landmarks.length > 8) {
      const [x, y] = landmarks[8]; // 食指指尖的坐标
      particles.push(new Particle(x, y));
    }
  }
}

// 粒子类
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2); // 随机水平速度
    this.vy = random(-2, -5); // 随机垂直速度
    this.alpha = 255; // 透明度
    this.size = random(20, 40); // 粒子大小（文字大小）
    this.emoji = userEmoji; // 使用用户输入的 emoji
  }

  // 更新粒子属性
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // 随时间逐渐消失
  }

  // 检查粒子是否消失
  isFinished() {
    return this.alpha <= 0;
  }

  // 显示粒子
  show() {
    fill(255, this.alpha); // 设置透明度
    textSize(this.size); // 设置文字大小
    text(this.emoji, this.x, this.y); // 绘制 emoji
  }
}
