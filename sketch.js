let featureExtractor;
let classifier;
let video;
let status = "";
//検出された画像のラベル
let imageLabel = "";
let upImages = 0;
let downImages = 0;
// 最後の状態
let lastscene;
// 腕立てカウント
let pushupCount = 0;

// 音声読み上げ
let voice = new p5.Speech();

function setup() {
  //CanvasをHTML内の#canvasContainerに格納
  createCanvas(windowWidth, windowHeight);
  // video要素の生成
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();
  status = "モデル読み込み中…";
  // 既にMobileNetで学習させた特徴を展開
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);
  // ビデオを入力にして、既に展開させた特徴抽出でクラス分類機を生成する
  classifier = featureExtractor.classification(video, videoReady);
}

function draw() {
  background(0);
  // ビデオの描画
  image(video, 0, 0, width, height);
  // 操作説明表示
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(
    "キー操作: [a] うつ伏せ画像を追加, [s] 上体起こし画像を追加, [d] 訓練, [f] 予測を開始!!",
    20,
    30
  );
  text(status, 20, 60);
  // クラス分け結果の表示
  textAlign(CENTER);
  textSize(240);
  fill(255, 0, 0);
  text(imageLabel, width / 2, height / 2);
}

function keyTyped() {
  if (key === "a") {
    // aキーでpaper画像追加
    classifier.addImage("Down");
    downImages++;
    status = "うつ伏せ = " + downImages + ", 上体起こし = " + upImages;
  } else if (key === "s") {
    // sキーでrock画像追加
    classifier.addImage("Up");
    upImages++;
    status = "うつ伏せ = " + downImages + ", 上体起こし = " + upImages;
  } else if (key === "d") {
    // dキーで学習開始
    classifier.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        status = "損失: " + loss;
      } else {
        status = "トレーニング完了!! トータルの損失: " + loss;
      }
    });
  } else if (key === "f") {
    // fキーでクラス分け結果表示
    classify();
  }
}

// モデルが読み込まれたら、呼びだされる関数
function modelReady() {
  status = "モデル読み込み完了!";
}

// ビデオが読み込まれた際に呼び出される関数
function videoReady() {}

// カメラの現在のフレームの画像をクラス分類機に追加する
function addImage(label) {
  classifier.addImage(label);
}

// 現在のフレームの画像を分類する
function classify() {
  classifier.classify(gotResults);
  status = "クラス分け実行中…";
}

// 結果の表示
function gotResults(err, result) {
  if (err) {
    status = err;
  }
  status = "クラス分け完了!!";
  imageLabel = result;
  // 前回の
  if (lastscene != result) {
    lastscene = result;
    if (result == "Up") {
      if (pushupCount == 0) {
        // 結果を読み上げ
        voice.speak(`${"push push push"}`);
      } else if (pushupCount == 20) {
        voice.speak(`${"Finish!"}`);
      } else if (pushupCount > 15) {
        // 結果を読み上げ
        voice.speak(`${"last"}`);
        voice.speak(`${20 - pushupCount}`);
      } else {
        voice.speak(`${pushupCount}`);
      }
      pushupCount++;
    }
  }

  classify();
}
