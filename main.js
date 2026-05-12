// ==========================
// GeoFS Flare Addon
// Iキー版
// ==========================

(() => {

    console.log("GeoFS Flare Addon Loaded");

    // ==========================
    // 前回削除
    // ==========================

    if (window.smokeGunCleanup) {
        window.smokeGunCleanup();
    }

    let firing = false;
    let fireLoop = null;

    const smokeEntities = [];

    // flare画像
    const SMOKE_IMAGE =
        "https://oc135.github.io/test6/flare1.png.png";

    // 音
    const SOUND_URL =
        "https://oc135.github.io/test/gunsound1.mp3";

    // ==========================
    // flare設定
    // ==========================

    // flareサイズ
    const WORLD_SIZE = 2.5;

    // flare表示時間
    const FLARE_LIFETIME = 1500;

    // flare発射間隔
    const FIRE_INTERVAL = 200;

    // ==========================
    // XYZオフセット
    // X = 左右
    // Y = 前後
    // Z = 上下
    // ==========================

    const OFFSET_X = 0;
    const OFFSET_Y = 0;
    const OFFSET_Z = 0;

    // ==========================
    // 音
    // ==========================

    const gunSound = new Audio(SOUND_URL);

    gunSound.loop = true;
    gunSound.volume = 1.0;

    // ==========================
    // flare生成
    // ==========================

    function createSmoke() {

        if (!window.geofs?.aircraft?.instance) {
            return;
        }

        const aircraft =
            geofs.aircraft.instance;

        const pos =
            aircraft.llaLocation;

        const htr =
            aircraft.htr;

        const heading =
            Cesium.Math.toRadians(htr[0]);

        // XYZ → 緯度経度変換

        const forwardLat =
            Math.cos(heading) *
            OFFSET_Y *
            0.00001;

        const forwardLon =
            Math.sin(heading) *
            OFFSET_Y *
            0.00001;

        const sideLat =
            Math.cos(heading + Math.PI / 2) *
            OFFSET_X *
            0.00001;

        const sideLon =
            Math.sin(heading + Math.PI / 2) *
            OFFSET_X *
            0.00001;

        const lat =
            pos[0] +
            forwardLat +
            sideLat;

        const lon =
            pos[1] +
            forwardLon +
            sideLon;

        const alt =
            pos[2] + OFFSET_Z;

        // flare生成

        const entity =
            geofs.api.viewer.entities.add({

                position:
                    Cesium.Cartesian3.fromDegrees(
                        lon,
                        lat,
                        alt
                    ),

                billboard: {

                    image: SMOKE_IMAGE,

                    sizeInMeters: true,

                    width: WORLD_SIZE,
                    height: WORLD_SIZE,

                    scale: 1,

                    scaleByDistance: null,
                    translucencyByDistance: null,
                    pixelOffsetScaleByDistance: null,

                    // 機体に隠れる
                    disableDepthTestDistance: 0,

                    // 点滅なし
                    color:
                        Cesium.Color.WHITE.withAlpha(1),

                    verticalOrigin:
                        Cesium.VerticalOrigin.CENTER
                }
            });

        smokeEntities.push(entity);

        // 自動削除

        setTimeout(() => {

            geofs.api.viewer.entities.remove(
                entity
            );

        }, FLARE_LIFETIME);
    }

    // ==========================
    // 発射開始
    // ==========================

    function startFire() {

        if (firing) {
            return;
        }

        firing = true;

        gunSound.currentTime = 0;

        gunSound.play().catch(err => {

            console.log(err);

        });

        fireLoop = setInterval(() => {

            requestAnimationFrame(() => {

                createSmoke();

            });

        }, FIRE_INTERVAL);
    }

    // ==========================
    // 発射停止
    // ==========================

    function stopFire() {

        firing = false;

        clearInterval(fireLoop);

        gunSound.pause();
        gunSound.currentTime = 0;
    }

    // ==========================
    // Iキー操作
    // ==========================

    function keyDown(e) {

        if (
            e.key === "i" ||
            e.key === "I"
        ) {

            startFire();
        }
    }

    function keyUp(e) {

        if (
            e.key === "i" ||
            e.key === "I"
        ) {

            stopFire();
        }
    }

    document.addEventListener(
        "keydown",
        keyDown,
        true
    );

    document.addEventListener(
        "keyup",
        keyUp,
        true
    );

    // ==========================
    // cleanup
    // ==========================

    window.smokeGunCleanup = () => {

        stopFire();

        document.removeEventListener(
            "keydown",
            keyDown,
            true
        );

        document.removeEventListener(
            "keyup",
            keyUp,
            true
        );

        smokeEntities.forEach(entity => {

            geofs.api.viewer.entities.remove(
                entity
            );

        });
    };

})();
